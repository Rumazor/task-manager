import { Module, Global, Logger } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheService } from './cache.service';

const createRedisStore = async (
  redisHost: string,
  redisPort: number,
  redisPassword: string | undefined,
  ttl: number,
  logger: Logger,
): Promise<{ store?: any; ttl: number }> => {
  return new Promise(async (resolve) => {
    const timeout = setTimeout(() => {
      logger.warn('Redis connection timeout, using in-memory cache');
      resolve({ ttl });
    }, 5000);

    try {
      const store = await redisStore({
        socket: {
          host: redisHost,
          port: redisPort,
          connectTimeout: 4000,
          reconnectStrategy: () => false,
        },
        password: redisPassword || undefined,
        ttl,
      });
      clearTimeout(timeout);

      // Handle Redis client errors to prevent app crashes
      const client = (store as any).client;
      if (client && client.on) {
        client.on('error', (err: Error) => {
          logger.warn('Redis client error:', err.message);
        });
      }

      logger.log('Connected to Redis cache');
      resolve({ store, ttl });
    } catch (error) {
      clearTimeout(timeout);
      logger.warn('Redis not available, using in-memory cache');
      resolve({ ttl });
    }
  });
};

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = configService.get<number>('REDIS_PORT', 6379);
        const redisPassword = configService.get<string>('REDIS_PASSWORD');
        const ttl = configService.get<number>('REDIS_TTL', 300) * 1000;
        const logger = new Logger('CacheModule');

        return createRedisStore(redisHost, redisPort, redisPassword, ttl, logger);
      },
    }),
  ],
  providers: [CacheService],
  exports: [NestCacheModule, CacheService],
})
export class RedisCacheModule {}
