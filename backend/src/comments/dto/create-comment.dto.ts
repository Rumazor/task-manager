import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommentDto {
  @ApiProperty({ example: 'Este es un comentario' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Type(() => Number)
  taskId: number;
}

export class UpdateCommentDto {
  @ApiProperty({ example: 'Comentario actualizado' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CommentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Este es un comentario' })
  content: string;

  @ApiProperty()
  author: {
    id: string;
    email: string;
  };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
