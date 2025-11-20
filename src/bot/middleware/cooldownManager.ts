import { Redis } from 'ioredis';
import { env } from '../../config/env';

class CooldownManager {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
    });

    this.redis.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
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
    await this.redis.setex(key, durationSeconds, Date.now().toString());
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
    const exists = await this.redis.exists(key);
    return exists === 1;
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
    const ttl = await this.redis.ttl(key);
    return ttl > 0 ? ttl : 0;
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
    await this.redis.del(key);
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
    await this.redis.quit();
  }
}

export const cooldownManager = new CooldownManager();
