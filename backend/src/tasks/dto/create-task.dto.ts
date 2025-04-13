import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Mi nueva tarea' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Descripción de la tarea' })
  @IsString()
  @IsNotEmpty()
  description: string;
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
