import prisma from '../../db/client';
import { Rarity } from '@prisma/client';

/**
 * Base burn values for each rarity tier (in coins)
 * These are the baseline values that can be modified by wear/float
 */
const BURN_VALUES: Record<Rarity, number> = {
  COMMON: 10,          // Consumer Grade
  UNCOMMON: 50,        // Mil-Spec
  RARE: 150,           // Restricted
  VERY_RARE: 400,      // Classified
  LEGENDARY: 1000,     // Covert
  EXOTIC: 5000,        // Exceedingly Rare (Knives/Gloves)
};

/**
 * Calculate the burn value for an item based on rarity and wear
 * Wear ranges: 0.00-1.00
 * - Factory New: 0.00-0.07 (+50% bonus)
 * - Minimal Wear: 0.07-0.15 (+25% bonus)
 * - Field-Tested: 0.15-0.38 (base value)
 * - Well-Worn: 0.38-0.45 (-25% penalty)
 * - Battle-Scarred: 0.45-1.00 (-50% penalty)
 */
export function calculateBurnValue(rarity: Rarity, wear?: number): number {
  const baseValue = BURN_VALUES[rarity] || 10;
  
  // If no wear value, return base value
  if (wear === undefined || wear === null) {
    return baseValue;
  }

  // Apply wear multiplier
  let multiplier = 1.0;
  
  if (wear <= 0.07) {
    // Factory New: +50%
    multiplier = 1.5;
  } else if (wear <= 0.15) {
    // Minimal Wear: +25%
    multiplier = 1.25;
  } else if (wear <= 0.38) {
    // Field-Tested: base value
    multiplier = 1.0;
  } else if (wear <= 0.45) {
    // Well-Worn: -25%
    multiplier = 0.75;
  } else {
    // Battle-Scarred: -50%
    multiplier = 0.5;
  }

  return Math.floor(baseValue * multiplier);
}

/**
 * Get wear condition name from float value
 */
export function getWearCondition(wear?: number): string {
  if (wear === undefined || wear === null) return 'Unknown';
  
  if (wear <= 0.07) return 'Factory New';
  if (wear <= 0.15) return 'Minimal Wear';
  if (wear <= 0.38) return 'Field-Tested';
  if (wear <= 0.45) return 'Well-Worn';
  return 'Battle-Scarred';
}

/**
 * Burn (recycle) an item for coins
 * Returns the coins earned
 */
export async function burnItem(
  userId: string,
  guildId: string,
  itemId: number
): Promise<{ success: boolean; coins?: number; error?: string }> {
  try {
    // Get the item with transaction
    const item = await prisma.userItem.findUnique({
      where: { id: itemId },
      include: { itemDef: true },
    });

    // Validate item exists and belongs to user
    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    if (item.ownerId !== userId) {
      return { success: false, error: 'You do not own this item' };
    }

    if (item.inMarket) {
      return { success: false, error: 'Cannot burn items listed on the market' };
    }

    if (item.locked) {
      return { success: false, error: 'This item is locked' };
    }

    // Calculate burn value
    const burnValue = calculateBurnValue(item.itemDef.rarity);

    // Perform transaction
    await prisma.$transaction(async (tx) => {
      // Delete the item
      await tx.userItem.delete({
        where: { id: itemId },
      });

      // Add coins to user
      await tx.userGuildProfile.upsert({
        where: {
          userId_guildId: {
            userId,
            guildId,
          },
        },
        update: {
          coins: { increment: burnValue },
          updatedAt: new Date(),
        },
        create: {
          userId,
          guildId,
          coins: burnValue,
          xp: 0,
          level: 1,
          totalMessages: 0,
        },
      });

      // Log transaction
      await tx.transaction.create({
        data: {
          userId,
          guildId,
          type: 'RECYCLE',
          amount: burnValue,
          metadata: {
            itemId,
            itemName: item.itemDef.name,
            rarity: item.itemDef.rarity,
          },
        },
      });
    });

    return { success: true, coins: burnValue };
  } catch (error) {
    console.error('Error burning item:', error);
    return { success: false, error: 'Failed to burn item' };
  }
}

/**
 * Get burn value preview without actually burning the item
 */
export async function getBurnValuePreview(itemId: number): Promise<number | null> {
  try {
    const item = await prisma.userItem.findUnique({
      where: { id: itemId },
      include: { itemDef: true },
    });

    if (!item) return null;

    return calculateBurnValue(item.itemDef.rarity);
  } catch (error) {
    console.error('Error getting burn value preview:', error);
    return null;
  }
}
