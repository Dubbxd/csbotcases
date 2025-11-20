import axios from 'axios';
import * as cheerio from 'cheerio';
import prisma from '../../db/client';
import { Rarity, ItemType } from '@prisma/client';

interface SteamMarketItem {
  name: string;
  price: string;
  type: ItemType;
  rarity: Rarity;
  imageUrl: string;
}

/**
 * Scraper for CS:GO items from Steam Community Market
 */
export class SteamMarketScraper {
  private readonly BASE_URL = 'https://steamcommunity.com/market/search';
  private readonly APP_ID = 730; // CS:GO

  /**
   * Fetch items from Steam Market
   */
  async fetchItems(query: string = '', start: number = 0, count: number = 100): Promise<SteamMarketItem[]> {
    try {
      const response = await axios.get(this.BASE_URL, {
        params: {
          appid: this.APP_ID,
          q: query,
          start,
          count,
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);
      const items: SteamMarketItem[] = [];

      $('.market_listing_row').each((_, element) => {
        const $el = $(element);
        const name = $el.find('.market_listing_item_name').text().trim();
        const price = $el.find('.market_listing_price').text().trim();
        const imageUrl = $el.find('.market_listing_item_img').attr('src') || '';

        // Determine type and rarity based on name
        const type = this.determineType(name);
        const rarity = this.determineRarity(name);

        if (name && type && rarity) {
          items.push({
            name,
            price,
            type,
            rarity,
            imageUrl,
          });
        }
      });

      return items;
    } catch (error) {
      console.error('Error fetching Steam Market items:', error);
      return [];
    }
  }

  /**
   * Fetch cases specifically
   */
  async fetchCases(): Promise<SteamMarketItem[]> {
    return this.fetchItems('case', 0, 200);
  }

  /**
   * Fetch weapons/skins
   */
  async fetchWeapons(): Promise<SteamMarketItem[]> {
    const weapons = ['AK-47', 'M4A4', 'M4A1-S', 'AWP', 'Desert Eagle', 'Glock-18', 'USP-S'];
    const allItems: SteamMarketItem[] = [];

    for (const weapon of weapons) {
      const items = await this.fetchItems(weapon, 0, 50);
      allItems.push(...items);
      await this.delay(1000); // Rate limiting
    }

    return allItems;
  }

  /**
   * Fetch agents
   */
  async fetchAgents(): Promise<SteamMarketItem[]> {
    return this.fetchItems('agent', 0, 100);
  }

  /**
   * Determine item type from name
   */
  private determineType(name: string): ItemType {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('case') || lowerName.includes('capsule')) {
      return 'CASE';
    }
    if (lowerName.includes('knife') || lowerName.includes('★')) {
      return 'KNIFE';
    }
    if (lowerName.includes('gloves') || lowerName.includes('★')) {
      return 'GLOVES';
    }
    if (lowerName.includes('agent') || lowerName.includes('operator')) {
      return 'AGENT';
    }
    if (lowerName.includes('sticker')) {
      return 'STICKER';
    }
    if (lowerName.includes('music kit')) {
      return 'MUSIC_KIT';
    }
    if (lowerName.includes('graffiti')) {
      return 'GRAFFITI';
    }
    
    return 'SKIN';
  }

  /**
   * Determine rarity from name
   */
  private determineRarity(name: string): Rarity {
    const lowerName = name.toLowerCase();
    
    // Knives and special items
    if (lowerName.includes('★') || lowerName.includes('knife') || lowerName.includes('gloves')) {
      return 'EXOTIC';
    }
    
    // By wear/quality indicators
    if (lowerName.includes('factory new') || lowerName.includes('fn')) {
      return 'LEGENDARY';
    }
    if (lowerName.includes('minimal wear') || lowerName.includes('mw')) {
      return 'EPIC';
    }
    if (lowerName.includes('field-tested') || lowerName.includes('ft')) {
      return 'RARE';
    }
    if (lowerName.includes('well-worn') || lowerName.includes('ww')) {
      return 'UNCOMMON';
    }
    if (lowerName.includes('battle-scarred') || lowerName.includes('bs')) {
      return 'COMMON';
    }
    
    // By skin tier
    if (lowerName.includes('covert') || lowerName.includes('classified')) {
      return 'LEGENDARY';
    }
    if (lowerName.includes('restricted')) {
      return 'EPIC';
    }
    if (lowerName.includes('mil-spec')) {
      return 'RARE';
    }
    
    // Default to UNCOMMON
    return 'UNCOMMON';
  }

  /**
   * Sync items to database
   */
  async syncToDatabase(items: SteamMarketItem[]): Promise<void> {
    console.log(`Syncing ${items.length} items to database...`);
    
    for (const item of items) {
      try {
        await prisma.itemDefinition.upsert({
          where: { name: item.name },
          update: {
            iconUrl: item.imageUrl,
          },
          create: {
            name: item.name,
            description: `A ${item.rarity.toLowerCase()} ${item.type.toLowerCase()} from CS:GO`,
            type: item.type,
            rarity: item.rarity,
            iconUrl: item.imageUrl,
            tradable: true,
            marketable: true,
          },
        });
      } catch (error) {
        console.error(`Error syncing item ${item.name}:`, error);
      }
    }
    
    console.log('Sync complete!');
  }

  /**
   * Helper to delay requests
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI usage
if (require.main === module) {
  const scraper = new SteamMarketScraper();
  
  (async () => {
    console.log('Fetching CS:GO items from Steam Market...');
    
    const cases = await scraper.fetchCases();
    console.log(`Found ${cases.length} cases`);
    
    const weapons = await scraper.fetchWeapons();
    console.log(`Found ${weapons.length} weapons`);
    
    const agents = await scraper.fetchAgents();
    console.log(`Found ${agents.length} agents`);
    
    const allItems = [...cases, ...weapons, ...agents];
    await scraper.syncToDatabase(allItems);
  })();
}
