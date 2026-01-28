import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');
  private connectedUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

      if (token) {
        const decoded = this.jwtService.verify(token);
        client.userId = decoded.id;
        client.userEmail = decoded.email;

        // Track connected user
        if (!this.connectedUsers.has(decoded.id)) {
          this.connectedUsers.set(decoded.id, new Set());
        }
        this.connectedUsers.get(decoded.id)?.add(client.id);

        // Join user's personal room for targeted notifications
        client.join(`user:${decoded.id}`);

        this.logger.log(`Client connected: ${client.id} (User: ${decoded.email})`);

        // Emit updated online count to all clients
        this.emitOnlineCount();
      } else {
        this.logger.warn(`Client connected without auth: ${client.id}`);
      }
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.get(client.userId)?.delete(client.id);
      if (this.connectedUsers.get(client.userId)?.size === 0) {
        this.connectedUsers.delete(client.userId);
      }
      // Emit updated online count to all clients
      this.emitOnlineCount();
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Emit online users count to all clients
  emitOnlineCount() {
    this.server.emit('users:online', {
      count: this.connectedUsers.size,
      timestamp: new Date(),
    });
  }

  // Emit task events to all connected clients
  emitTaskCreated(task: any, creatorId: string) {
    this.server.emit('task:created', { task, creatorId });
    this.logger.debug(`Emitted task:created for task ${task.id}`);
  }

  emitTaskUpdated(task: any, updaterId: string) {
    this.server.emit('task:updated', { task, updaterId });
    this.logger.debug(`Emitted task:updated for task ${task.id}`);
  }

  emitTaskDeleted(taskId: number, deleterId: string) {
    this.server.emit('task:deleted', { taskId, deleterId });
    this.logger.debug(`Emitted task:deleted for task ${taskId}`);
  }

  // Send notification to specific user
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
    this.logger.debug(`Sent notification to user ${userId}`);
  }

  // Broadcast notification to all users
  broadcastNotification(notification: any) {
    this.server.emit('notification:broadcast', notification);
  }

  // Subscribe to task updates (client can call this)
  @SubscribeMessage('subscribe:tasks')
  handleSubscribeTasks(@ConnectedSocket() client: AuthenticatedSocket) {
    client.join('tasks');
    return { event: 'subscribed', data: 'tasks' };
  }

  // Ping/pong for connection health
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    return { event: 'pong', data: Date.now() };
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.connectedUsers.size;
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
