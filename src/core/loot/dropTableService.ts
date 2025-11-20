import { Rarity } from '@prisma/client';
import prisma from '../../db/client';
import path from 'path';
import { readFileSync } from 'fs';

interface DropTable {
  [key: string]: number; // rarity -> probability
}

interface DropItem {
  weapon: string;
  skin: string;
  weight: number;
}

interface CaseData {
  id: number;
  name: string;
  description: string;
  collection: string;
  iconUrl: string;
  dropTable: DropTable;
  items: {
    [rarity: string]: DropItem[];
  };
}

export class DropTableService {
  private caseDataCache: Map<number, CaseData> = new Map();

  /**
   * Load case data from JSON files
   */
  async loadCaseData(caseId: number): Promise<CaseData> {
    // Check cache
    if (this.caseDataCache.has(caseId)) {
      return this.caseDataCache.get(caseId)!;
    }

    // Try to load from file
    try {
      const caseFiles: { [key: number]: string } = {
        1: 'classic.json',
        2: 'knives.json',
        3: 'agents.json',
      };

      const fileName = caseFiles[caseId];
      if (!fileName) {
        throw new Error(`No drop table file for case ${caseId}`);
      }

      // Build absolute path from project root
      const filePath = path.join(process.cwd(), 'src', 'config', 'drop-tables', fileName);
      const fileContent = readFileSync(filePath, 'utf-8');
      const caseData = JSON.parse(fileContent) as CaseData;
      
      this.caseDataCache.set(caseId, caseData);
      return caseData;
    } catch (error) {
      throw new Error(`Failed to load case data: ${error}`);
    }
  }

  /**
   * Select a random rarity based on probabilities
   */
  selectRarity(dropTable: DropTable): string {
    const random = Math.random();
    let cumulative = 0;

    for (const [rarity, probability] of Object.entries(dropTable)) {
      cumulative += probability;
      if (random <= cumulative) {
        return rarity;
      }
    }

    // Fallback to first rarity
    return Object.keys(dropTable)[0];
  }

  /**
   * Select a random item from a rarity tier using weights
   */
  selectItemFromRarity(items: DropItem[]): DropItem {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const random = Math.random() * totalWeight;
    let cumulative = 0;

    for (const item of items) {
      cumulative += item.weight;
      if (random <= cumulative) {
        return item;
      }
    }

    // Fallback to first item
    return items[0];
  }

  /**
   * Perform a complete drop from a case using database drop tables
   */
  async performDrop(caseId: number): Promise<{
    rarity: string;
    weapon: string;
    skin: string;
    itemDefId: number;
  }> {
    // Get drop table from database (CS2 accurate probabilities!)
    const dropTables = await prisma.caseDropTable.findMany({
      where: { caseId },
      orderBy: { probability: 'desc' },
    });

    if (dropTables.length === 0) {
      throw new Error(`No drop table found for case ${caseId}`);
    }

    // Select rarity based on CS2 probabilities
    const random = Math.random();
    let cumulative = 0;
    let selectedRarity: Rarity = 'COMMON';

    for (const table of dropTables) {
      cumulative += table.probability;
      if (random <= cumulative) {
        selectedRarity = table.rarity;
        break;
      }
    }

    // Get all items of selected rarity from this case
    const availableItems = await prisma.caseDropItem.findMany({
      where: {
        caseId: caseId,
        rarity: selectedRarity,
      },
      include: {
        itemDef: true,
      },
    });

    if (availableItems.length === 0) {
      throw new Error(`No items found for rarity ${selectedRarity} in case ${caseId}`);
    }

    // Select random item from this rarity (weighted)
    const totalWeight = availableItems.reduce((sum, item) => sum + item.weight, 0);
    const itemRandom = Math.random() * totalWeight;
    let itemCumulative = 0;
    let selectedItem = availableItems[0];

    for (const item of availableItems) {
      itemCumulative += item.weight;
      if (itemRandom <= itemCumulative) {
        selectedItem = item;
        break;
      }
    }

    return {
      rarity: selectedRarity,
      weapon: selectedItem.itemDef.weapon || '',
      skin: selectedItem.itemDef.skin || '',
      itemDefId: selectedItem.itemDef.id,
    };
  }

  /**
   * Get or create an ItemDefinition
   */
  private async getOrCreateItemDefinition(
    weapon: string,
    skin: string,
    rarity: Rarity,
    collection: string
  ) {
    const name = `${weapon} | ${skin}`;
    
    let itemDef = await prisma.itemDefinition.findFirst({
      where: { name, type: 'WEAPON' },
    });

    if (!itemDef) {
      itemDef = await prisma.itemDefinition.create({
        data: {
          name,
          type: 'WEAPON',
          rarity,
          collection,
          weapon,
          skin,
        },
      });
    }

    return itemDef;
  }

  /**
   * Sync database drop tables with JSON files
   */
  async syncDropTables() {
    const caseFiles = [1, 2, 3]; // IDs of cases to sync

    for (const caseId of caseFiles) {
      const caseData = await this.loadCaseData(caseId);

      // Ensure case exists
      let caseDef = await prisma.caseDefinition.findUnique({
        where: { id: caseId },
      });

      if (!caseDef) {
        caseDef = await prisma.caseDefinition.create({
          data: {
            id: caseData.id,
            name: caseData.name,
            description: caseData.description,
            iconUrl: caseData.iconUrl,
            collection: caseData.collection,
          },
        });
      }

      // Delete existing drop tables
      await prisma.caseDropTable.deleteMany({
        where: { caseId },
      });

      // Create new drop tables
      for (const [rarity, probability] of Object.entries(caseData.dropTable)) {
        await prisma.caseDropTable.create({
          data: {
            caseId,
            rarity: rarity as Rarity,
            probability,
          },
        });
      }

      console.log(`Synced drop tables for case ${caseData.name}`);
    }
  }
}

export const dropTableService = new DropTableService();
