import prisma from '../../db/client';
import { dropTableService } from './dropTableService';
import { currencyService } from '../economy/currencyService';
import { xpService } from '../xp/xpService';
import { env } from '../../config/env';

export class CaseService {
  /**
   * Open a case
   */
  async openCase(
    userId: string,
    guildId: string,
    caseId: number,
    keyId: number
  ): Promise<{
    item: {
      id: number;
      name: string;
      rarity: string;
      weapon: string;
      skin: string;
      iconUrl: string | null;
    };
    bonusCoins: number;
    bonusXP: number;
  }> {
    // Verify user has the case
    const userCase = await prisma.userCase.findFirst({
      where: {
        ownerId: userId,
        caseId,
      },
    });

    if (!userCase) {
      throw new Error('You do not have this case');
    }

    // Verify user has the key
    const userKey = await prisma.userKey.findFirst({
      where: {
        ownerId: userId,
        keyDefId: keyId,
      },
    });

    if (!userKey) {
      throw new Error('You do not have this key');
    }

    // Check daily limit
    const profile = await prisma.userGuildProfile.findUnique({
      where: { userId_guildId: { userId, guildId } },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    // Simplified daily limit check (you could add a proper cooldown table)
    if (profile.casesOpened >= env.CASE_OPEN_DAILY_LIMIT) {
      throw new Error('Daily case opening limit reached');
    }

    // Perform the drop
    const drop = await dropTableService.performDrop(caseId);

    // Fetch item definition for icon URL
    const itemDef = await prisma.itemDefinition.findUnique({
      where: { id: drop.itemDefId },
      select: { iconUrl: true },
    });

    // Give bonus rewards
    const bonusCoins = this.calculateBonusCoins(drop.rarity);
    const bonusXP = this.calculateBonusXP(drop.rarity);

    // Execute transaction
    await prisma.$transaction(async (tx) => {
      // Consume case
      await tx.userCase.delete({
        where: { id: userCase.id },
      });

      // Consume key
      await tx.userKey.delete({
        where: { id: userKey.id },
      });

      // Create item in inventory
      await tx.userItem.create({
        data: {
          ownerId: userId,
          guildId,
          itemDefId: drop.itemDefId,
          obtainedVia: 'case',
        },
      });

      // Add bonus coins
      await tx.userGuildProfile.update({
        where: { userId_guildId: { userId, guildId } },
        data: {
          coins: { increment: bonusCoins },
          casesOpened: { increment: 1 },
        },
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          userId,
          guildId,
          type: 'CASE_OPEN',
          amount: bonusCoins,
          xpAmount: bonusXP,
          metadata: {
            caseId,
            itemDefId: drop.itemDefId,
            rarity: drop.rarity,
          },
        },
      });
    });

    // Add XP (outside transaction for simplicity)
    await xpService.addXP(userId, guildId, bonusXP);

    return {
      item: {
        id: drop.itemDefId,
        name: `${drop.weapon} | ${drop.skin}`,
        rarity: drop.rarity,
        weapon: drop.weapon,
        skin: drop.skin,
        iconUrl: itemDef?.iconUrl || null,
      },
      bonusCoins,
      bonusXP,
    };
  }

  /**
   * Grant a case to a user
   */
  async grantCase(userId: string, guildId: string, caseId: number): Promise<void> {
    await prisma.userCase.create({
      data: {
        ownerId: userId,
        guildId,
        caseId,
      },
    });
  }

  /**
   * Grant a key to a user
   */
  async grantKey(userId: string, guildId: string, keyId: number): Promise<void> {
    await prisma.userKey.create({
      data: {
        ownerId: userId,
        guildId,
        keyDefId: keyId,
      },
    });
  }

  /**
   * Get user's cases
   */
  async getUserCases(userId: string, guildId: string) {
    return prisma.userCase.findMany({
      where: { ownerId: userId, guildId },
      include: { case: true },
    });
  }

  /**
   * Get user's keys
   */
  async getUserKeys(userId: string, guildId: string) {
    return prisma.userKey.findMany({
      where: { ownerId: userId, guildId },
      include: { keyDef: true },
    });
  }

  /**
   * Get available case types
   */
  async getAvailableCases() {
    return prisma.caseDefinition.findMany({
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Calculate bonus coins based on rarity
   */
  private calculateBonusCoins(rarity: string): number {
    const bonuses: { [key: string]: number } = {
      COMMON: 10,
      UNCOMMON: 25,
      RARE: 50,
      VERY_RARE: 100,
      LEGENDARY: 250,
      EXOTIC: 500,
    };
    return bonuses[rarity] ?? 10;
  }

  /**
   * Calculate bonus XP based on rarity
   */
  private calculateBonusXP(rarity: string): number {
    const bonuses: { [key: string]: number } = {
      COMMON: 5,
      UNCOMMON: 15,
      RARE: 30,
      VERY_RARE: 60,
      LEGENDARY: 150,
      EXOTIC: 300,
    };
    return bonuses[rarity] ?? 5;
  }
}

export const caseService = new CaseService();
