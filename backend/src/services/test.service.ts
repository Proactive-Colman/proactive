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
            1. A clear, concise name describing the action
            2. The list of commands that make up this step
            
            Example input:
            [
              "find_element(By.NAME, 'search_query').click()",
              "find_element(By.NAME, 'search_query').send_keys('nba')",
              "find_element(By.NAME, 'search_query').send_keys('Keys.ENTER')"
            ]
            
            Example output:
            [
              {
                "name": "Search for 'nba'",
                "commands": [
                  "find_element(By.NAME, 'search_query').click()",
                  "find_element(By.NAME, 'search_query').send_keys('nba')",
                  "find_element(By.NAME, 'search_query').send_keys('Keys.ENTER')"
                ]
              }
            ]`,
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

      for (const line of lines) {
        // Look for click actions
        const clickMatch = line.match(
          /self\.driver\.find_element\(By\.([^,]+),\s*"([^"]+)"\)\.click\(\)/,
        );
        if (clickMatch) {
          const [_, byType, selector] = clickMatch;
          commands.push(`find_element(By.${byType}, "${selector}").click()`);
          continue;
        }

        // Look for type/send_keys actions
        const typeMatch = line.match(
          /self\.driver\.find_element\(By\.([^,]+),\s*"([^"]+)"\)\.send_keys\(([^)]+)\)/,
        );
        if (typeMatch) {
          const [_, byType, selector, text] = typeMatch;
          const cleanText = text.replace(/['"]/g, ''); // Remove quotes
          commands.push(
            `find_element(By.${byType}, "${selector}").send_keys("${cleanText}")`,
          );
          continue;
        }
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
}
