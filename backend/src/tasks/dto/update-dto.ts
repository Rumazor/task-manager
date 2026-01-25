import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Título actualizado' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Descripción actualizada' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  completed: boolean;

  @ApiPropertyOptional({
    example: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
