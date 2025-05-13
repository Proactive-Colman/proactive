import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    description: 'Name of the file',
    example: 'My Document',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Description of the file',
    example: 'This is a test document',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;
}
