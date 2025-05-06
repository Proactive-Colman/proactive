import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from './test.entity';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(Test)
    private testRepository: Repository<Test>,
  ) {}

  async create(test: Partial<Test>): Promise<Test> {
    const newTest = this.testRepository.create(test);
    return this.testRepository.save(newTest);
  }

  async findAll(): Promise<Test[]> {
    return this.testRepository.find();
  }
  async findOne(id: number): Promise<Test> {
    const test = await this.testRepository.findOne({ where: { id } });
    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }
    return test;
  }

  async update(id: number, test: Partial<Test>): Promise<Test> {
    const existingTest = await this.findOne(id);
    await this.testRepository.update(id, test);
    const updatedTest = await this.testRepository.findOne({ where: { id } });
    if (!updatedTest) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }
    return updatedTest;
  }

  async remove(id: number): Promise<void> {
    await this.testRepository.delete(id);
  }
} 