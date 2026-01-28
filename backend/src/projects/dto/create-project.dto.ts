import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Mi Proyecto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Descripcion del proyecto' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'color must be a valid hex color',
  })
  color?: string;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'Mi Proyecto Actualizado' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Descripcion actualizada' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '#EF4444' })
  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'color must be a valid hex color',
  })
  color?: string;
}

export class ProjectResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Mi Proyecto' })
  name: string;

  @ApiPropertyOptional({ example: 'Descripcion del proyecto' })
  description?: string;

  @ApiProperty({ example: '#3B82F6' })
  color: string;

  @ApiProperty({ example: 5 })
  taskCount?: number;

  @ApiProperty({ example: 2 })
  completedTaskCount?: number;
}
