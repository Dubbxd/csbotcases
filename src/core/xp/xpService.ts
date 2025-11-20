import prisma from '../../db/client';
import { XP_FORMULA } from '../../config/constants';
import { env } from '../../config/env';

export class XPService {
  /**
   * Add XP to a user in a guild
   */
  async addXP(userId: string, guildId: string, amount: number): Promise<{ 
    newXP: number; 
    oldLevel: number; 
    newLevel: number; 
    leveledUp: boolean 
  }> {
    const profile = await prisma.userGuildProfile.findUnique({
      where: { userId_guildId: { userId, guildId } },
    });

    if (!profile) {
      throw new Error('User profile not found');
    }

    const oldLevel = profile.level;
    const newXP = profile.xp + amount;
    const newLevel = this.calculateLevel(newXP);
    const leveledUp = newLevel > oldLevel;

    await prisma.userGuildProfile.update({
      where: { userId_guildId: { userId, guildId } },
      data: { 
        xp: newXP, 
        level: newLevel,
        totalMessages: { increment: 1 },
      },
    });

    return { newXP, oldLevel, newLevel, leveledUp };
  }

  /**
   * Calculate level from XP
   */
  calculateLevel(xp: number): number {
    return XP_FORMULA.calculateLevel(xp);
  }

  /**
   * Calculate XP needed for next level
   */
  calculateXPForLevel(level: number): number {
    return XP_FORMULA.calculateXPNeeded(level);
  }

  /**
   * Get progress to next level
   */
  getLevelProgress(currentXP: number, currentLevel: number): {
    current: number;
    needed: number;
    percentage: number;
  } {
    const xpForCurrentLevel = this.getTotalXPForLevel(currentLevel - 1);
    const xpForNextLevel = this.getTotalXPForLevel(currentLevel);
    
    const current = currentXP - xpForCurrentLevel;
    const needed = xpForNextLevel - xpForCurrentLevel;
    const percentage = Math.floor((current / needed) * 100);

    return { current, needed, percentage };
  }

  /**
   * Get total XP required to reach a level
   */
  private getTotalXPForLevel(level: number): number {
    let total = 0;
    for (let i = 1; i <= level; i++) {
      total += this.calculateXPForLevel(i);
    }
    return total;
  }

  /**
   * Get random XP amount for a message
   */
  getRandomMessageXP(): number {
    const min = env.XP_MIN_PER_MESSAGE;
    const max = env.XP_MAX_PER_MESSAGE;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Get leaderboard for a guild
   */
  async getLeaderboard(guildId: string, limit: number = 10, offset: number = 0) {
    return prisma.userGuildProfile.findMany({
      where: { guildId },
      orderBy: [
        { level: 'desc' },
        { xp: 'desc' },
      ],
      take: limit,
      skip: offset,
      include: {
        user: true,
      },
    });
  }

  /**
   * Get user rank in guild
   */
  async getUserRank(userId: string, guildId: string): Promise<number> {
    const profile = await prisma.userGuildProfile.findUnique({
      where: { userId_guildId: { userId, guildId } },
    });

    if (!profile) return 0;

    const rank = await prisma.userGuildProfile.count({
      where: {
        guildId,
        OR: [
          { level: { gt: profile.level } },
          {
            AND: [
              { level: profile.level },
              { xp: { gt: profile.xp } },
            ],
          },
        ],
      },
    });

    return rank + 1;
  }
}

export const xpService = new XPService();
