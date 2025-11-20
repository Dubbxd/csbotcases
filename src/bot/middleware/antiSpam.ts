import { Message } from 'discord.js';
import { cooldownManager } from './cooldownManager';

interface SpamConfig {
  maxMessages: number;
  timeWindow: number; // in seconds
  cooldownDuration: number; // in seconds
}

const DEFAULT_CONFIG: SpamConfig = {
  maxMessages: 5,
  timeWindow: 10,
  cooldownDuration: 30,
};

class AntiSpam {
  private messageCache: Map<string, number[]> = new Map();

  /**
   * Check if message is spam
   */
  async isSpam(
    message: Message,
    config: SpamConfig = DEFAULT_CONFIG
  ): Promise<{ isSpam: boolean; reason?: string }> {
    const userId = message.author.id;
    const guildId = message.guild?.id;

    if (!guildId) return { isSpam: false };

    // Check if user is already on spam cooldown
    const onCooldown = await cooldownManager.isOnCooldown(userId, 'spam', guildId);
    if (onCooldown) {
      return { isSpam: true, reason: 'On spam cooldown' };
    }

    const key = `${userId}:${guildId}`;
    const now = Date.now();
    const timestamps = this.messageCache.get(key) || [];

    // Remove old timestamps
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < config.timeWindow * 1000
    );

    // Add current timestamp
    validTimestamps.push(now);
    this.messageCache.set(key, validTimestamps);

    // Check if spam threshold reached
    if (validTimestamps.length > config.maxMessages) {
      await cooldownManager.setCooldown(userId, 'spam', config.cooldownDuration, guildId);
      this.messageCache.delete(key); // Clear cache for this user
      return { isSpam: true, reason: 'Too many messages' };
    }

    return { isSpam: false };
  }

  /**
   * Check if message content is repetitive
   */
  isRepetitive(message: Message, threshold: number = 0.8): boolean {
    const content = message.content.toLowerCase().trim();
    
    // Check for repeated characters
    const charCounts = new Map<string, number>();
    for (const char of content) {
      charCounts.set(char, (charCounts.get(char) || 0) + 1);
    }

    for (const count of charCounts.values()) {
      if (count / content.length > threshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if message is too short
   */
  isTooShort(message: Message, minLength: number = 3): boolean {
    const content = message.content.trim();
    return content.length < minLength && content.length > 0;
  }

  /**
   * Clear cache for a user
   */
  clearUserCache(userId: string, guildId: string) {
    const key = `${userId}:${guildId}`;
    this.messageCache.delete(key);
  }

  /**
   * Clean up old entries from cache
   */
  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.messageCache.entries()) {
      const valid = timestamps.filter((ts) => now - ts < 60000); // 1 minute
      if (valid.length === 0) {
        this.messageCache.delete(key);
      } else {
        this.messageCache.set(key, valid);
      }
    }
  }
}

export const antiSpam = new AntiSpam();

// Cleanup old entries every minute
setInterval(() => antiSpam.cleanup(), 60000);
