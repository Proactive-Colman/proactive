import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Test, TestDocument } from '../models/test.model';
import { OpenAI } from 'openai';

interface Step {
  name: string;
  commands: string[];
}

@Injectable()
export class TestService {
  private readonly logger = new Logger(TestService.name);
  private openai: OpenAI;

  constructor(@InjectModel(Test.name) private testModel: Model<TestDocument>) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private async analyzeAndCombineSteps(commands: string[]): Promise<Step[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that analyzes sequences of Selenium commands and combines them into logical steps.
For each step, provide:
1. A clear, concise name describing the specific action
2. The list of commands that make up this step

- Group all initialization commands (like driver.get, driver.set_window_size) into an "Initialization" step.
- Group all cleanup commands (like driver.close, driver.quit) into a "Cleanup" or "Teardown" step.
- For main test actions, use specific, natural language descriptions that include the exact values being used.

Example input:
[
  "driver.get('https://www.youtube.com/')",
  "driver.set_window_size(974, 1032)",
  "driver.find_element(By.NAME, 'search_query').click()",
  "driver.find_element(By.NAME, 'search_query').send_keys('nba')",
  "driver.find_element(By.NAME, 'search_query').send_keys(Keys.ENTER)",
  "WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'ytd-video-renderer')))",
  "driver.find_element(By.CSS_SELECTOR, 'ytd-video-renderer').click()",
  "driver.close()"
]

Example output:
[
  {
    "name": "Initialization",
    "commands": [
      "driver.get('https://www.youtube.com/')",
      "driver.set_window_size(974, 1032)"
    ]
  },
  {
    "name": "Search for 'nba'",
    "commands": [
      "driver.find_element(By.NAME, 'search_query').click()",
      "driver.find_element(By.NAME, 'search_query').send_keys('nba')",
      "driver.find_element(By.NAME, 'search_query').send_keys(Keys.ENTER)"
    ]
  },
  {
    "name": "Click first video",
    "commands": [
      "WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'ytd-video-renderer')))",
      "driver.find_element(By.CSS_SELECTOR, 'ytd-video-renderer').click()"
    ]
  },
  {
    "name": "Cleanup",
    "commands": [
      "driver.close()"
    ]
  }
]
`,
          },
          {
            role: 'user',
            content: `Analyze and combine these Selenium commands into logical steps: ${JSON.stringify(commands)}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      if (!response.choices?.[0]?.message?.content) {
        this.logger.warn(
          'OpenAI response was empty, falling back to individual steps',
        );
        return commands.map((cmd) => ({ name: cmd, commands: [cmd] }));
      }

      try {
        const steps = JSON.parse(response.choices[0].message.content);
        return steps;
      } catch (parseError) {
        this.logger.error(
          `Failed to parse OpenAI response: ${parseError.message}`,
        );
        return commands.map((cmd) => ({ name: cmd, commands: [cmd] }));
      }
    } catch (error) {
      this.logger.error(`Failed to analyze steps: ${error.message}`);
      return commands.map((cmd) => ({ name: cmd, commands: [cmd] }));
    }
  }

  async processPythonFile(fileContent: string): Promise<Test> {
    try {
      // Extract the URL from the Python file
      const urlMatch = fileContent.match(/self\.driver\.get\("([^"]+)"\)/);
      if (!urlMatch) {
        throw new Error('Could not find start URL in Python file');
      }
      const startUrl = urlMatch[1];

      // Extract all commands from the Python file
      const commands: string[] = [];
      const lines = fileContent.split('\n');
      let isInTestMethod = false;

      for (const line of lines) {
        // Check if we're entering or leaving a test method
        if (line.includes('def test_')) {
          isInTestMethod = true;
          continue;
        } else if (
          line.includes('def setup_method') ||
          line.includes('def teardown_method')
        ) {
          isInTestMethod = false;
          continue;
        }

        // Only process driver commands if we're in a test method
        if (isInTestMethod) {
          const commandMatch = line.match(/self\.driver\.(.*)/);
          if (commandMatch) {
            // Remove 'self.' prefix and add to commands
            const command = `driver.${commandMatch[1]}`;
            commands.push(command);
          }
        }
      }

      // Add wait for search results after the search
      const searchIndex = commands.findIndex((cmd) =>
        cmd.includes('send_keys(Keys.ENTER)'),
      );
      if (searchIndex !== -1) {
        commands.splice(
          searchIndex + 1,
          0,
          'WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "ytd-video-renderer")))',
        );
      }

      // Replace the specific video selector with a more reliable one
      const videoIndex = commands.findIndex((cmd) =>
        cmd.includes('ytd-item-section-renderer'),
      );
      if (videoIndex !== -1) {
        commands[videoIndex] =
          'driver.find_element(By.CSS_SELECTOR, "ytd-video-renderer").click()';
      }

      // Analyze and combine commands into logical steps
      const steps = await this.analyzeAndCombineSteps(commands);

      const test = new this.testModel({
        startUrl,
        steps,
      });

      const savedTest = await test.save();
      this.logger.log(`Created test with ID: ${savedTest._id}`);
      return savedTest;
    } catch (error) {
      throw new Error(`Failed to process Python file: ${error.message}`);
    }
  }

  async getAllTests(): Promise<Test[]> {
    const tests = await this.testModel.find().exec();
    this.logger.log(`Found ${tests.length} tests`);
    return tests;
  }

  async getTestById(id: string): Promise<Test> {
    this.logger.log(`Looking for test with ID: ${id}`);
    const test = await this.testModel.findOne({ _id: id }).exec();
    if (!test) {
      this.logger.error(`Test not found with ID: ${id}`);
      throw new NotFoundException(`Test with ID ${id} not found`);
    }
    this.logger.log(`Found test: ${JSON.stringify(test)}`);
    return test;
  }

  async updateTestStatus(
    id: string,
    status: string,
    executionTime?: number,
    error?: string,
  ): Promise<Test | null> {
    return this.testModel
      .findByIdAndUpdate(
        id,
        {
          status,
          executionTime,
          error,
          lastRunAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  async deleteTest(id: string): Promise<boolean> {
    const result = await this.testModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async updateTestNameAndDescription(id: string, name: string, description: string): Promise<Test | null> {
    return this.testModel.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    ).exec();
  }
}
