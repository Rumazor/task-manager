import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class TaskFilterDto {
  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @ApiPropertyOptional({ description: 'Tag ID to filter by' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tagId?: number;

  @ApiPropertyOptional({ description: 'Filter tasks due before this date' })
  @IsOptional()
  @IsDateString()
  dueBefore?: string;

  @ApiPropertyOptional({ description: 'Filter tasks due after this date' })
  @IsOptional()
  @IsDateString()
  dueAfter?: string;

  @ApiPropertyOptional({ description: 'Filter by completion status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  completed?: boolean;

  @ApiPropertyOptional({ description: 'Search in title and description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by assigned user ID' })
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Filter by creator user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
