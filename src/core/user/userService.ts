import prisma from '../../db/client';

export class UserService {
  /**
   * Get or create a user
   */
  async getOrCreateUser(userId: string) {
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { id: userId },
      });
    }

    return user;
  }

  /**
   * Get or create user guild profile
   */
  async getOrCreateProfile(userId: string, guildId: string) {
    // Ensure user exists
    await this.getOrCreateUser(userId);

    // Ensure guild exists
    let guild = await prisma.guild.findUnique({
      where: { id: guildId },
    });

    if (!guild) {
      guild = await prisma.guild.create({
        data: {
          id: guildId,
          name: 'Unknown', // Will be updated by bot
          ownerId: 'unknown',
        },
      });
    }

    // Get or create profile
    let profile = await prisma.userGuildProfile.findUnique({
      where: { userId_guildId: { userId, guildId } },
    });

    if (!profile) {
      profile = await prisma.userGuildProfile.create({
        data: {
          userId,
          guildId,
          xp: 0,
          level: 1,
          coins: 100, // Starting coins
        },
      });
    }

    return profile;
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string, guildId: string) {
    return prisma.userGuildProfile.findUnique({
      where: { userId_guildId: { userId, guildId } },
      include: { user: true },
    });
  }

  /**
   * Check if user is banned
   */
  async isBanned(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { banned: true },
    });
    return user?.banned ?? false;
  }

  /**
   * Ban a user
   */
  async banUser(userId: string, reason?: string): Promise<void> {
    await prisma.user.upsert({
      where: { id: userId },
      update: { banned: true, banReason: reason },
      create: { id: userId, banned: true, banReason: reason },
    });
  }

  /**
   * Unban a user
   */
  async unbanUser(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { banned: false, banReason: null },
    });
  }

  /**
   * Update last message time
   */
  async updateLastMessage(userId: string, guildId: string): Promise<void> {
    await prisma.userGuildProfile.updateMany({
      where: { userId, guildId },
      data: { lastMessageAt: new Date() },
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string, guildId: string) {
    const [profile, itemCount, casesOpened, transactions] = await Promise.all([
      this.getProfile(userId, guildId),
      prisma.userItem.count({
        where: { ownerId: userId, guildId },
      }),
      prisma.userGuildProfile.findUnique({
        where: { userId_guildId: { userId, guildId } },
        select: { casesOpened: true },
      }),
      prisma.transaction.count({
        where: { userId, guildId },
      }),
    ]);

    return {
      profile,
      stats: {
        totalItems: itemCount,
        casesOpened: casesOpened?.casesOpened ?? 0,
        totalTransactions: transactions,
      },
    };
  }
}

export const userService = new UserService();
