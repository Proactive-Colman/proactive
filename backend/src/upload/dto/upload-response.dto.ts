import { ApiProperty } from '@nestjs/swagger';
import { Test } from '../../test/test.entity';

export class FileInfoDto {
  @ApiProperty({
    description: 'Generated filename',
    example: '550e8400-e29b-41d4-a716-446655440000.jpg',
  })
  filename: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'document.jpg',
  })
  originalname: string;

  @ApiProperty({
    description: 'File MIME type',
    example: 'image/jpeg',
  })
  mimetype: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024,
  })
  size: number;

  @ApiProperty({
    description: 'File access path',
    example: '/uploads/550e8400-e29b-41d4-a716-446655440000.jpg',
  })
  path: string;
}

export class UploadResponseDto {
  @ApiProperty({
    description: 'Created test record',
    type: Test,
  })
  test: Test;

  @ApiProperty({
    description: 'Uploaded file information',
    type: FileInfoDto,
  })
  file: FileInfoDto;
}
