import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '../notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ example: 'Te han asignado una nueva tarea' })
  @IsString()
  message: string;

  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  taskId?: number;

  @ApiPropertyOptional({ example: 'actor-uuid' })
  @IsOptional()
  @IsString()
  actorId?: string;
}

export class NotificationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ example: 'Te han asignado una nueva tarea' })
  message: string;

  @ApiProperty({ example: false })
  read: boolean;

  @ApiPropertyOptional()
  task?: {
    id: number;
    title: string;
  };

  @ApiProperty()
  createdAt: Date;
}
