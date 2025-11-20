import axios from 'axios';
import * as cheerio from 'cheerio';
import prisma from '../../db/client';

/**
 * Quick fetcher for individual item images from Steam Market
 * Used during case opening to get images on-the-fly
 */
export class SteamImageFetcher {
  private static readonly BASE_URL = 'https://steamcommunity.com/market/search/render/';
  private static readonly APP_ID = 730; // CS:GO
  private static cache = new Map<string, string>();

  /**
   * Fetch image URL for a specific item
   * @param itemName Full item name (e.g., "AK-47 | Redline")
   * @returns Image URL or null
   */
  static async fetchItemImage(itemName: string): Promise<string | null> {
    // Check cache first
    if (this.cache.has(itemName)) {
      return this.cache.get(itemName)!;
    }

    try {
      const response = await axios.get(this.BASE_URL, {
        params: {
          query: itemName,
          start: 0,
          count: 1,
          search_descriptions: 0,
          sort_column: 'popular',
          sort_dir: 'desc',
          appid: this.APP_ID,
          norender: 1,
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 5000, // 5 second timeout
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        const item = response.data.results[0];
        
        // Extract image URL - Steam returns different sizes
        let imageUrl = item.asset_description?.icon_url;
        
        if (imageUrl) {
          // Build full CDN URL
          imageUrl = `https://community.cloudflare.steamstatic.com/economy/image/${imageUrl}/256fx256f`;
          
          // Cache it
          this.cache.set(itemName, imageUrl);
          
          // Also update database for future use
          this.updateDatabaseImage(itemName, imageUrl).catch(console.error);
          
          return imageUrl;
        }
      }

      return null;
    } catch (error) {
      console.error(`Error fetching Steam image for ${itemName}:`, error);
      return null;
    }
  }

  /**
   * Fetch image by weapon and skin separately
   * @param weapon Weapon name (e.g., "AK-47")
   * @param skin Skin name (e.g., "Redline")
   * @returns Image URL or null
   */
  static async fetchByWeaponSkin(weapon: string, skin: string): Promise<string | null> {
    const fullName = `${weapon} | ${skin}`;
    return this.fetchItemImage(fullName);
  }

  /**
   * Update database with fetched image
   */
  private static async updateDatabaseImage(itemName: string, imageUrl: string): Promise<void> {
    try {
      // Try to parse weapon and skin from full name
      const parts = itemName.split('|').map(p => p.trim());
      const weapon = parts[0] || '';
      const skin = parts[1] || '';

      if (weapon && skin) {
        await prisma.itemDefinition.updateMany({
          where: {
            weapon,
            skin,
          },
          data: {
            iconUrl: imageUrl,
          },
        });
      } else {
        // Try by name if can't parse
        await prisma.itemDefinition.updateMany({
          where: {
            name: itemName,
          },
          data: {
            iconUrl: imageUrl,
          },
        });
      }
    } catch (error) {
      console.error('Error updating database with Steam image:', error);
    }
  }

  /**
   * Clear the cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  static getCacheSize(): number {
    return this.cache.size;
  }
}
