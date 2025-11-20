import prisma from '../../db/client';
import { env } from '../../config/env';
import { currencyService } from './currencyService';
import { xpService } from '../xp/xpService';

export class DailyService {
  /**
   * Claim daily reward
   */
  async claimDaily(userId: string, guildId: string): Promise<{
    coins: number;
    xp: number;
    streak: number;
  }> {
    const profile = await prisma.userGuildProfile.findUnique({
      where: { userId_guildId: { userId, guildId } },
    });

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Check if already claimed today
    if (profile.lastDailyAt) {
      const lastDaily = new Date(profile.lastDailyAt);
      const now = new Date();
      const hoursSince = (now.getTime() - lastDaily.getTime()) / (1000 * 60 * 60);

      if (hoursSince < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSince);
        throw new Error(`Daily already claimed. Try again in ${hoursRemaining} hours.`);
      }
    }

    const coins = env.DAILY_REWARD_COINS;
    const xp = env.DAILY_REWARD_XP;

    // Add rewards
    await currencyService.addCoins(userId, guildId, coins, 'DAILY', { xp });
    await xpService.addXP(userId, guildId, xp);

    // Update last daily timestamp
    await prisma.userGuildProfile.update({
      where: { userId_guildId: { userId, guildId } },
      data: { lastDailyAt: new Date() },
    });

    return { coins, xp, streak: 1 }; // TODO: Implement streak system
  }

  /**
   * Check if daily is available
   */
  async isDailyAvailable(userId: string, guildId: string): Promise<{
    available: boolean;
    nextAvailableAt?: Date;
  }> {
    const profile = await prisma.userGuildProfile.findUnique({
      where: { userId_guildId: { userId, guildId } },
      select: { lastDailyAt: true },
    });

    if (!profile?.lastDailyAt) {
      return { available: true };
    }

    const lastDaily = new Date(profile.lastDailyAt);
    const nextAvailable = new Date(lastDaily.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();

    return {
      available: now >= nextAvailable,
      nextAvailableAt: nextAvailable,
    };
  }

  /**
   * Get time until next daily
   */
  async getTimeUntilDaily(userId: string, guildId: string): Promise<number | null> {
    const { available, nextAvailableAt } = await this.isDailyAvailable(userId, guildId);
    
    if (available || !nextAvailableAt) {
      return null;
    }

    return nextAvailableAt.getTime() - Date.now();
  }
}

export const dailyService = new DailyService();
