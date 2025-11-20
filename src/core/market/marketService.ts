import prisma from '../../db/client';
import { inventoryService } from '../inventory/inventoryService';
import { currencyService } from '../economy/currencyService';
import { env } from '../../config/env';
import { LIMITS } from '../../config/constants';

export class MarketService {
  /**
   * List an item for sale
   */
  async listItem(
    userId: string,
    guildId: string,
    itemId: number,
    price: number
  ): Promise<number> {
    // Validate price
    if (price < LIMITS.MIN_MARKET_PRICE || price > LIMITS.MAX_MARKET_PRICE) {
      throw new Error(
        `Price must be between ${LIMITS.MIN_MARKET_PRICE} and ${LIMITS.MAX_MARKET_PRICE} coins`
      );
    }

    // Verify ownership
    const item = await prisma.userItem.findFirst({
      where: { id: itemId, ownerId: userId, guildId },
    });

    if (!item) {
      throw new Error('Item not found or not owned by user');
    }

    if (item.inMarket || item.locked) {
      throw new Error('Item is already listed or locked');
    }

    // Check listing limit
    const activeListings = await prisma.marketListing.count({
      where: { sellerId: userId, isActive: true },
    });

    if (activeListings >= LIMITS.MAX_LISTINGS_PER_USER) {
      throw new Error(`Maximum ${LIMITS.MAX_LISTINGS_PER_USER} active listings reached`);
    }

    // Create listing
    const listing = await prisma.$transaction(async (tx: any) => {
      // Mark item as in market
      await tx.userItem.update({
        where: { id: itemId },
        data: { inMarket: true },
      });

      // Create listing
      return tx.marketListing.create({
        data: {
          sellerId: userId,
          guildId,
          userItemId: itemId,
          price,
          feePercent: env.MARKET_FEE_PERCENT,
        },
      });
    });

    return listing.id;
  }

  /**
   * Cancel a listing
   */
  async cancelListing(userId: string, listingId: number): Promise<void> {
    const listing = await prisma.marketListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    if (listing.sellerId !== userId) {
      throw new Error('You do not own this listing');
    }

    if (!listing.isActive) {
      throw new Error('Listing is not active');
    }

    await prisma.$transaction(async (tx: any) => {
      // Mark listing as inactive
      await tx.marketListing.update({
        where: { id: listingId },
        data: { isActive: false },
      });

      // Mark item as not in market
      await tx.userItem.update({
        where: { id: listing.userItemId },
        data: { inMarket: false },
      });
    });
  }

  /**
   * Buy an item from the market
   */
  async buyItem(userId: string, guildId: string, listingId: number): Promise<void> {
    const listing = await prisma.marketListing.findUnique({
      where: { id: listingId },
      include: { userItem: { include: { itemDef: true } } },
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    if (!listing.isActive) {
      throw new Error('Listing is no longer available');
    }

    if (listing.sellerId === userId) {
      throw new Error('You cannot buy your own listing');
    }

    // Check buyer has enough coins
    const hasEnough = await currencyService.hasCoins(userId, guildId, listing.price);
    if (!hasEnough) {
      throw new Error('Insufficient funds');
    }

    // Calculate seller proceeds (after fee)
    const fee = Math.floor(listing.price * (listing.feePercent / 100));
    const sellerProceeds = listing.price - fee;

    // Execute purchase
    await prisma.$transaction(async (tx: any) => {
      // Transfer coins from buyer to seller
      await tx.userGuildProfile.update({
        where: { userId_guildId: { userId, guildId } },
        data: { coins: { decrement: listing.price } },
      });

      await tx.userGuildProfile.update({
        where: { userId_guildId: { userId: listing.sellerId, guildId: listing.guildId! } },
        data: { coins: { increment: sellerProceeds } },
      });

      // Transfer item ownership
      await tx.userItem.update({
        where: { id: listing.userItemId },
        data: {
          ownerId: userId,
          guildId,
          inMarket: false,
        },
      });

      // Update listing
      await tx.marketListing.update({
        where: { id: listingId },
        data: {
          isActive: false,
          buyerId: userId,
          soldAt: new Date(),
        },
      });

      // Log transactions
      await tx.transaction.create({
        data: {
          userId,
          guildId,
          type: 'MARKET_BUY',
          amount: -listing.price,
          metadata: {
            listingId,
            itemId: listing.userItemId,
            itemName: listing.userItem.itemDef.name,
            sellerId: listing.sellerId,
          },
        },
      });

      await tx.transaction.create({
        data: {
          userId: listing.sellerId,
          guildId: listing.guildId!,
          type: 'MARKET_SELL',
          amount: sellerProceeds,
          metadata: {
            listingId,
            itemId: listing.userItemId,
            itemName: listing.userItem.itemDef.name,
            buyerId: userId,
            fee,
          },
        },
      });
    });
  }

  /**
   * Browse market listings
   */
  async browseMarket(
    filters?: {
      guildId?: string;
      minPrice?: number;
      maxPrice?: number;
      rarity?: string;
      type?: string;
      search?: string;
    },
    page: number = 1
  ) {
    const where: any = {
      isActive: true,
    };

    if (filters?.guildId) {
      where.guildId = filters.guildId;
    }

    if (filters?.minPrice !== undefined) {
      where.price = { ...where.price, gte: filters.minPrice };
    }

    if (filters?.maxPrice !== undefined) {
      where.price = { ...where.price, lte: filters.maxPrice };
    }

    if (filters?.rarity || filters?.type || filters?.search) {
      where.userItem = {
        itemDef: {},
      };

      if (filters.rarity) {
        where.userItem.itemDef.rarity = filters.rarity;
      }

      if (filters.type) {
        where.userItem.itemDef.type = filters.type;
      }

      if (filters.search) {
        where.userItem.itemDef.name = {
          contains: filters.search,
          mode: 'insensitive',
        };
      }
    }

    const [listings, total] = await Promise.all([
      prisma.marketListing.findMany({
        where,
        include: {
          userItem: { include: { itemDef: true } },
          seller: true,
        },
        skip: (page - 1) * LIMITS.MARKET_PAGE_SIZE,
        take: LIMITS.MARKET_PAGE_SIZE,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.marketListing.count({ where }),
    ]);

    return {
      listings,
      total,
      page,
      totalPages: Math.ceil(total / LIMITS.MARKET_PAGE_SIZE),
    };
  }

  /**
   * Get user's active listings
   */
  async getUserListings(userId: string) {
    return prisma.marketListing.findMany({
      where: { sellerId: userId, isActive: true },
      include: {
        userItem: { include: { itemDef: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get market statistics
   */
  async getMarketStats(guildId?: string) {
    const where: any = { isActive: true };
    if (guildId) where.guildId = guildId;

    const [totalListings, avgPrice, recentSales] = await Promise.all([
      prisma.marketListing.count({ where }),
      prisma.marketListing.aggregate({
        where,
        _avg: { price: true },
      }),
      prisma.marketListing.count({
        where: {
          isActive: false,
          soldAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      totalListings,
      averagePrice: Math.floor(avgPrice._avg.price || 0),
      recentSales24h: recentSales,
    };
  }
}

export const marketService = new MarketService();
