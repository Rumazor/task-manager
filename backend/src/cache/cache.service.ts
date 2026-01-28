import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Cache keys patterns
  static readonly KEYS = {
    TASKS_LIST: 'tasks:list',
    TASK_DETAIL: (id: number | string) => `tasks:${id}`,
    USER_TASKS: (userId: number | string) => `tasks:user:${userId}`,
    PROJECTS_LIST: 'projects:list',
    PROJECT_DETAIL: (id: number | string) => `projects:${id}`,
    TAGS_LIST: (userId: number | string) => `tags:user:${userId}`,
    STATS: (userId: number | string) => `stats:user:${userId}`,
    NOTIFICATIONS: (userId: number | string) => `notifications:user:${userId}`,
  };

  async get<T>(key: string): Promise<T | undefined> {
    const result = await this.cacheManager.get<T>(key);
    return result ?? undefined;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    // cache-manager v6 uses clear() instead of reset()
    const stores = (this.cacheManager as any).stores;
    if (stores && stores[0] && stores[0].clear) {
      await stores[0].clear();
    }
  }

  /**
   * Invalidate all cache keys matching a pattern
   * Useful for invalidating related caches (e.g., all task caches)
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const stores = (this.cacheManager as any).stores;
    if (stores && stores[0]) {
      const store = stores[0];
      if (store.keys) {
        const keys = await store.keys(pattern);
        for (const key of keys) {
          await this.cacheManager.del(key);
        }
      }
    }
  }

  /**
   * Invalidate all task-related caches
   */
  async invalidateTaskCaches(): Promise<void> {
    await this.invalidatePattern('tasks:*');
  }

  /**
   * Invalidate caches for a specific user
   */
  async invalidateUserCaches(userId: number | string): Promise<void> {
    await this.del(CacheService.KEYS.USER_TASKS(userId));
    await this.del(CacheService.KEYS.STATS(userId));
  }

  /**
   * Get or set cache with a factory function
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined && cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }
}
