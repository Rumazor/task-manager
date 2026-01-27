import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { NotificationResponseDto } from './dto/notification.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/user.entity';

@Controller('notifications')
@ApiTags('Notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @ApiResponse({ status: 200, description: 'List of notifications', type: [NotificationResponseDto] })
  async findAll(@GetUser() user: User) {
    const notifications = await this.notificationService.findAllForUser(user);
    return notifications.map((n) => this.notificationService.sanitizeNotification(n));
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications for current user' })
  @ApiResponse({ status: 200, description: 'List of unread notifications', type: [NotificationResponseDto] })
  async findUnread(@GetUser() user: User) {
    const notifications = await this.notificationService.findUnreadForUser(user);
    return notifications.map((n) => this.notificationService.sanitizeNotification(n));
  }

  @Get('count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(@GetUser() user: User) {
    const count = await this.notificationService.getUnreadCount(user);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read', type: NotificationResponseDto })
  async markAsRead(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    const notification = await this.notificationService.markAsRead(id, user);
    return this.notificationService.sanitizeNotification(notification);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@GetUser() user: User) {
    await this.notificationService.markAllAsRead(user);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async delete(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    await this.notificationService.delete(id, user);
    return { message: 'Notification deleted successfully' };
  }
}
