import { Redis } from 'ioredis';
import { env } from '../../config/env';

interface CooldownData {
  expiresAt: number;
}

class CooldownManager {
  private redis: Redis | null = null;
  private memoryCache: Map<string, CooldownData> = new Map();
  private useRedis: boolean = false;

  constructor() {
    // Only use Redis if explicitly configured and not a Railway internal URL
    const isRedisConfigured = env.REDIS_HOST && 
                              env.REDIS_HOST !== 'localhost' && 
                              !env.REDIS_HOST.includes('railway.internal');
    
    if (isRedisConfigured) {
      try {
        this.redis = new Redis({
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
          password: env.REDIS_PASSWORD || undefined,
          retryStrategy: () => null, // Don't retry on failure
          maxRetriesPerRequest: 1,
        });

        this.redis.on('connect', () => {
          this.useRedis = true;
          console.log('✅ Redis connected for cooldowns');
        });

        this.redis.on('error', (err) => {
          this.useRedis = false;
          console.warn('⚠️ Redis unavailable, using memory cache for cooldowns');
        });
      } catch (error) {
        console.warn('⚠️ Redis initialization failed, using memory cache');
        this.redis = null;
      }
    } else {
      console.log('ℹ️ Using memory cache for cooldowns (Redis not configured)');
    }

    // Clean up expired memory cache entries every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.memoryCache.entries()) {
        if (data.expiresAt < now) {
          this.memoryCache.delete(key);
        }
      }
    }, 60000);
  }

  /**
   * Set a cooldown
   */
  async setCooldown(
    userId: string,
    type: string,
    durationSeconds: number,
    guildId?: string
  ): Promise<void> {
    const key = this.getKey(userId, type, guildId);
    
    if (this.useRedis && this.redis) {
      await this.redis.setex(key, durationSeconds, Date.now().toString());
    } else {
      const expiresAt = Date.now() + (durationSeconds * 1000);
      this.memoryCache.set(key, { expiresAt });
    }
  }

  /**
   * Check if user is on cooldown
   */
  async isOnCooldown(
    userId: string,
    type: string,
    guildId?: string
  ): Promise<boolean> {
    const key = this.getKey(userId, type, guildId);
    
    if (this.useRedis && this.redis) {
      const exists = await this.redis.exists(key);
      return exists === 1;
    } else {
      const data = this.memoryCache.get(key);
      if (!data) return false;
      if (data.expiresAt < Date.now()) {
        this.memoryCache.delete(key);
        return false;
      }
      return true;
    }
  }

  /**
   * Get remaining cooldown time in seconds
   */
  async getRemainingTime(
    userId: string,
    type: string,
    guildId?: string
  ): Promise<number> {
    const key = this.getKey(userId, type, guildId);
    
    if (this.useRedis && this.redis) {
      const ttl = await this.redis.ttl(key);
      return ttl > 0 ? ttl : 0;
    } else {
      const data = this.memoryCache.get(key);
      if (!data) return 0;
      const remaining = Math.ceil((data.expiresAt - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
  }

  /**
   * Clear a cooldown
   */
  async clearCooldown(
    userId: string,
    type: string,
    guildId?: string
  ): Promise<void> {
    const key = this.getKey(userId, type, guildId);
    
    if (this.useRedis && this.redis) {
      await this.redis.del(key);
    } else {
      this.memoryCache.delete(key);
    }
  }

  /**
   * Generate cooldown key
   */
  private getKey(userId: string, type: string, guildId?: string): string {
    return guildId ? `cooldown:${userId}:${guildId}:${type}` : `cooldown:${userId}:${type}`;
  }

  /**
   * Format remaining time
   */
  formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes < 60) {
      return remainingSeconds > 0
        ? `${minutes} minute${minutes !== 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`
        : `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes > 0
      ? `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`
      : `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    if (this.redis) {
      await this.redis.quit();
    }
    this.memoryCache.clear();
  }
}

export const cooldownManager = new CooldownManager();
