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
  @ApiProperty({ example: 'Task created successfully' })
  message: string;

  @ApiProperty({
    example: {
      id: 1,
      created_by: 'email@domain.com',
      title: 'Mi nueva tarea',
      description: 'Descripción de la tarea',
      completed: false,
      created_at: '2023-01-01T12:00:00.000Z',
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
