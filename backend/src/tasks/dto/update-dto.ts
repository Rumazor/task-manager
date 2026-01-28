import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  IsEnum,
  IsDateString,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Título actualizado' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Descripción actualizada' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

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

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'] })
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

  @ApiPropertyOptional({ example: 0, description: 'Position for ordering' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  position?: number;

  @ApiPropertyOptional({ example: 1, description: 'Project ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  projectId?: number;
}
