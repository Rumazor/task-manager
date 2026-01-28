import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'Urgente' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '#EF4444' })
  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'color must be a valid hex color',
  })
  color?: string;
}

export class UpdateTagDto {
  @ApiPropertyOptional({ example: 'Urgente' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '#EF4444' })
  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'color must be a valid hex color',
  })
  color?: string;
}

export class TagResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Urgente' })
  name: string;

  @ApiProperty({ example: '#EF4444' })
  color: string;
}
