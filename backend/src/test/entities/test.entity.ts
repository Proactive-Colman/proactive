import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

@Entity('tests')
export class Test {
  @ApiProperty({
    description: 'Unique identifier of the test',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @ApiProperty({
    description: 'Name of the test',
    example: 'Test Document',
  })
  @Column()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Description of the test',
    example: 'This is a test document',
  })
  @Column()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    description: 'Filename of the uploaded test file',
    example: 'test_script.py',
  })
  @Column({ nullable: true })
  @IsString()
  filename: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-03-11T18:30:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-03-11T18:30:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
