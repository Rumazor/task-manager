import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/user.module';

import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/task.module';
import { TagModule } from './tags/tag.module';
import { ProjectModule } from './projects/project.module';
import { CommentModule } from './comments/comment.module';
import { NotificationModule } from './notifications/notification.module';
import { ActivityModule } from './activity/activity.module';
import { StatsModule } from './stats/stats.module';
import { RedisCacheModule } from './cache/cache.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // no usaremos esto en producion
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLE_TTL', 60000),
            limit: config.get<number>('THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),
    RedisCacheModule,
    WebsocketsModule,
    HealthModule,
    AuthModule,
    UsersModule,
    TasksModule,
    TagModule,
    ProjectModule,
    CommentModule,
    NotificationModule,
    ActivityModule,
    StatsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
