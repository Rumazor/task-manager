import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @ApiProperty({ example: 'Mi nueva tarea' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Descripción de la tarea' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    example: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
  })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'], default: 'medium' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @ApiPropertyOptional({ example: [1, 2, 3], description: 'Array of tag IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  tagIds?: number[];

  @ApiPropertyOptional({ example: 1, description: 'Parent task ID for subtasks' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentTaskId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Project ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  projectId?: number;
}

export class TaskCreatedResponseDto {
  @ApiProperty({ example: 'Tarea creada exitosamente' })
  message: string;

  @ApiProperty({
    example: {
      id: 1,
      created_by: 'email@domain.com',
      title: 'Mi nueva tarea',
      description: 'Descripción de la tarea',
      completed: false,
      created_at: '2023-01-01T12:00:00.000Z',
      user_id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
    },
  })
  data: {
    id: number;
    created_by: string;
    title: string;
    description?: string;
    completed: boolean;
    created_at: Date;
    user_id: string;
  };
}
