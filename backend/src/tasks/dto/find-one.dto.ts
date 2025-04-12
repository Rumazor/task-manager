import { ApiProperty } from '@nestjs/swagger';

export class TaskResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Título de la tarea' })
  title: string;

  @ApiProperty({ example: 'Descripción de la tarea' })
  description: string;

  @ApiProperty({ example: false })
  completed: boolean;

  @ApiProperty({ example: '2023-01-01T12:00:00.000Z' })
  created_at: Date;

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@domain.com',
    },
  })
  user: {
    id: string;
    email: string;
  };
}
