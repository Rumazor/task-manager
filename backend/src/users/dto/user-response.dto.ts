import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'correo@ejemplo.com' })
  email: string;

  @ApiProperty({ example: '2025-04-11T09:00:00.000Z' })
  createdAt: Date;
}
