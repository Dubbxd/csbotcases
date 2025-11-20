import prisma from '../../db/client';
import { TransactionType } from '@prisma/client';
import { env } from '../../config/env';

export class CurrencyService {
  /**
   * Add coins to a user
   */
  async addCoins(
    userId: string,
    guildId: string,
    amount: number,
    type: TransactionType,
    metadata?: any
  ): Promise<number> {
    const profile = await prisma.userGuildProfile.findUnique({
      where: { userId_guildId: { userId, guildId } },
    });

    if (!profile) {
      throw new Error('User profile not found');
    }

    const newBalance = profile.coins + amount;

    await prisma.$transaction([
      prisma.userGuildProfile.update({
        where: { userId_guildId: { userId, guildId } },
        data: { coins: newBalance },
      }),
      prisma.transaction.create({
        data: {
          userId,
          guildId,
          type,
          amount,
          metadata,
        },
      }),
    ]);

    return newBalance;
  }

  /**
   * Remove coins from a user
   */
  async removeCoins(
    userId: string,
    guildId: string,
    amount: number,
    type: TransactionType,
    metadata?: any
  ): Promise<number> {
    return this.addCoins(userId, guildId, -amount, type, metadata);
  }

  /**
   * Check if user has enough coins
   */
  async hasCoins(userId: string, guildId: string, amount: number): Promise<boolean> {
    const profile = await prisma.userGuildProfile.findUnique({
      where: { userId_guildId: { userId, guildId } },
      select: { coins: true },
    });

    return profile ? profile.coins >= amount : false;
  }

  /**
   * Get user balance
   */
  async getBalance(userId: string, guildId: string): Promise<number> {
    const profile = await prisma.userGuildProfile.findUnique({
      where: { userId_guildId: { userId, guildId } },
      select: { coins: true },
    });

    return profile?.coins ?? 0;
  }

  /**
   * Transfer coins between users
   */
  async transfer(
    fromUserId: string,
    toUserId: string,
    guildId: string,
    amount: number
  ): Promise<void> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const hasEnough = await this.hasCoins(fromUserId, guildId, amount);
    if (!hasEnough) {
      throw new Error('Insufficient funds');
    }

    await prisma.$transaction([
      prisma.userGuildProfile.update({
        where: { userId_guildId: { userId: fromUserId, guildId } },
        data: { coins: { decrement: amount } },
      }),
      prisma.userGuildProfile.update({
        where: { userId_guildId: { userId: toUserId, guildId } },
        data: { coins: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          userId: fromUserId,
          guildId,
          type: 'MARKET_BUY',
          amount: -amount,
          metadata: { toUserId },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: toUserId,
          guildId,
          type: 'MARKET_SELL',
          amount,
          metadata: { fromUserId },
        },
      }),
    ]);
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    userId: string,
    guildId: string,
    limit: number = 20,
    offset: number = 0
  ) {
    return prisma.transaction.findMany({
      where: { userId, guildId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }
}

export const currencyService = new CurrencyService();
