import prisma from '../../db/client';
import { ItemType, Rarity } from '@prisma/client';
import { LIMITS } from '../../config/constants';

export class InventoryService {
  /**
   * Get user's inventory
   */
  async getUserInventory(
    userId: string,
    guildId: string,
    filters?: {
      type?: ItemType;
      rarity?: Rarity;
      search?: string;
    },
    page: number = 1
  ) {
    const where: any = {
      ownerId: userId,
      guildId,
      inMarket: false,
    };

    if (filters?.type) {
      where.itemDef = { type: filters.type };
    }

    if (filters?.rarity) {
      where.itemDef = { ...where.itemDef, rarity: filters.rarity };
    }

    if (filters?.search) {
      where.itemDef = {
        ...where.itemDef,
        name: { contains: filters.search, mode: 'insensitive' },
      };
    }

    const [items, total] = await Promise.all([
      prisma.userItem.findMany({
        where,
        include: { itemDef: true },
        skip: (page - 1) * LIMITS.INVENTORY_PAGE_SIZE,
        take: LIMITS.INVENTORY_PAGE_SIZE,
        orderBy: [
          { itemDef: { rarity: 'desc' } },
          { createdAt: 'desc' },
        ],
      }),
      prisma.userItem.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / LIMITS.INVENTORY_PAGE_SIZE),
    };
  }

  /**
   * Get inventory stats
   */
  async getInventoryStats(userId: string, guildId: string) {
    const items = await prisma.userItem.findMany({
      where: { ownerId: userId, guildId },
      include: { itemDef: true },
    });

    const stats = {
      total: items.length,
      byRarity: {} as { [key: string]: number },
      byType: {} as { [key: string]: number },
      mostValuable: null as any,
    };

    for (const item of items) {
      // Count by rarity
      stats.byRarity[item.itemDef.rarity] = (stats.byRarity[item.itemDef.rarity] || 0) + 1;
      
      // Count by type
      stats.byType[item.itemDef.type] = (stats.byType[item.itemDef.type] || 0) + 1;
    }

    // Find most valuable (legendary/exotic items)
    const valuable = items.filter(
      (i) => i.itemDef.rarity === 'LEGENDARY' || i.itemDef.rarity === 'EXOTIC'
    );
    if (valuable.length > 0) {
      stats.mostValuable = valuable[0].itemDef;
    }

    return stats;
  }

  /**
   * Get a specific item
   */
  async getItem(itemId: number) {
    return prisma.userItem.findUnique({
      where: { id: itemId },
      include: { itemDef: true },
    });
  }

  /**
   * Check if user owns an item
   */
  async userOwnsItem(userId: string, itemId: number): Promise<boolean> {
    const item = await prisma.userItem.findFirst({
      where: { id: itemId, ownerId: userId },
    });
    return !!item;
  }

  /**
   * Transfer item to another user
   */
  async transferItem(itemId: number, newOwnerId: string): Promise<void> {
    await prisma.userItem.update({
      where: { id: itemId },
      data: { ownerId: newOwnerId },
    });
  }

  /**
   * Recycle item for coins
   */
  async recycleItem(userId: string, guildId: string, itemId: number): Promise<number> {
    const item = await prisma.userItem.findFirst({
      where: { id: itemId, ownerId: userId, guildId },
      include: { itemDef: true },
    });

    if (!item) {
      throw new Error('Item not found or not owned by user');
    }

    if (item.inMarket || item.locked) {
      throw new Error('Cannot recycle item that is in market or locked');
    }

    // Calculate recycle value based on rarity
    const recycleValue = this.calculateRecycleValue(item.itemDef.rarity);

    await prisma.$transaction(async (tx: any) => {
      // Delete item
      await tx.userItem.delete({
        where: { id: itemId },
      });

      // Add coins
      await tx.userGuildProfile.update({
        where: { userId_guildId: { userId, guildId } },
        data: { coins: { increment: recycleValue } },
      });

      // Log transaction
      await tx.transaction.create({
        data: {
          userId,
          guildId,
          type: 'RECYCLE',
          amount: recycleValue,
          metadata: { itemId, itemName: item.itemDef.name },
        },
      });
    });

    return recycleValue;
  }

  /**
   * Calculate recycle value
   */
  private calculateRecycleValue(rarity: Rarity): number {
    const values: { [key in Rarity]: number } = {
      COMMON: 5,
      UNCOMMON: 15,
      RARE: 40,
      VERY_RARE: 100,
      LEGENDARY: 300,
      EXOTIC: 750,
    };
    return values[rarity];
  }
}

export const inventoryService = new InventoryService();
