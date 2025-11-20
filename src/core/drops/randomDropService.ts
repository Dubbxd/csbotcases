import { Client, TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import prisma from '../../db/client';
import { Rarity } from '@prisma/client';

interface DropConfig {
  minInterval: number; // Minutos mínimos entre drops
  maxInterval: number; // Minutos máximos entre drops
  claimTimeout: number; // Segundos para reclamar
  rarityWeights: { [key in Rarity]: number };
}

const DEFAULT_CONFIG: DropConfig = {
  minInterval: 30, // 30 minutos
  maxInterval: 120, // 2 horas
  claimTimeout: 60, // 60 segundos
  rarityWeights: {
    COMMON: 0.40,      // 40%
    UNCOMMON: 0.30,    // 30%
    RARE: 0.15,        // 15%
    EPIC: 0.10,        // 10%
    LEGENDARY: 0.04,   // 4%
    EXOTIC: 0.01,      // 1%
  },
};

/**
 * Random drop system - Cases appear in chat and users can claim them
 */
export class RandomDropService {
  private client: Client;
  private config: DropConfig;
  private activeDrops: Map<string, { itemId: number; timeout: NodeJS.Timeout }> = new Map();
  private dropTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(client: Client, config: Partial<DropConfig> = {}) {
    this.client = client;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the drop system for a guild
   */
  async startDrops(guildId: string): Promise<void> {
    console.log(`Starting random drops for guild ${guildId}`);
    this.scheduleNextDrop(guildId);
  }

  /**
   * Stop drops for a guild
   */
  stopDrops(guildId: string): void {
    const timer = this.dropTimers.get(guildId);
    if (timer) {
      clearTimeout(timer);
      this.dropTimers.delete(guildId);
    }
    
    const activeDrop = this.activeDrops.get(guildId);
    if (activeDrop) {
      clearTimeout(activeDrop.timeout);
      this.activeDrops.delete(guildId);
    }
  }

  /**
   * Schedule the next random drop
   */
  private scheduleNextDrop(guildId: string): void {
    const minMs = this.config.minInterval * 60 * 1000;
    const maxMs = this.config.maxInterval * 60 * 1000;
    const delay = Math.random() * (maxMs - minMs) + minMs;

    const timer = setTimeout(() => {
      this.spawnDrop(guildId);
    }, delay);

    this.dropTimers.set(guildId, timer);
    console.log(`Next drop in ${Math.floor(delay / 60000)} minutes for guild ${guildId}`);
  }

  /**
   * Spawn a random drop in a random channel
   */
  private async spawnDrop(guildId: string): Promise<void> {
    try {
      // Get guild config to find drop channel
      const guildConfig = await prisma.guildConfig.findUnique({
        where: { guildId },
      });

      if (!guildConfig) {
        console.log(`No config found for guild ${guildId}`);
        this.scheduleNextDrop(guildId);
        return;
      }

      // Get the guild
      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) {
        console.log(`Guild ${guildId} not found`);
        return;
      }

      // Find a random text channel (or use configured channel)
      const channels = guild.channels.cache.filter(
        (ch) => ch.isTextBased() && !ch.isThread() && !ch.isDMBased()
      );
      
      const channel = channels.random() as TextChannel;
      if (!channel) {
        console.log(`No suitable channel found in guild ${guildId}`);
        this.scheduleNextDrop(guildId);
        return;
      }

      // Select random item based on rarity weights
      const rarity = this.selectRandomRarity();
      const item = await this.getRandomItemByRarity(rarity);

      if (!item) {
        console.log(`No item found for rarity ${rarity}`);
        this.scheduleNextDrop(guildId);
        return;
      }

      // Create drop embed
      const rarityEmojis: { [key: string]: string } = {
        COMMON: '⚪',
        UNCOMMON: '🔵',
        RARE: '🟣',
        EPIC: '🟣',
        LEGENDARY: '🟡',
        EXOTIC: '🔴',
      };

      const embed = new EmbedBuilder()
        .setTitle('📦 A Case Has Appeared!')
        .setDescription(`${rarityEmojis[item.rarity]} **${item.name}**\n\nClick the button below to claim it!\nFirst come, first served!`)
        .setColor(this.getRarityColor(item.rarity))
        .setImage(item.iconUrl || undefined)
        .setFooter({ text: `Rarity: ${item.rarity} | ${this.config.claimTimeout}s to claim` })
        .setTimestamp();

      const button = new ButtonBuilder()
        .setCustomId(`claim_drop_${item.id}`)
        .setLabel('🎁 Claim Drop')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

      const message = await channel.send({
        content: '🚨 **ITEM DROP!** 🚨',
        embeds: [embed],
        components: [row],
      });

      // Set timeout to expire the drop
      const timeout = setTimeout(() => {
        this.expireDrop(guildId, message.id);
      }, this.config.claimTimeout * 1000);

      this.activeDrops.set(message.id, { itemId: item.id, timeout });

      // Schedule next drop
      this.scheduleNextDrop(guildId);
    } catch (error) {
      console.error('Error spawning drop:', error);
      this.scheduleNextDrop(guildId);
    }
  }

  /**
   * Handle drop claim
   */
  async claimDrop(messageId: string, userId: string): Promise<{ success: boolean; message: string; item?: any }> {
    const drop = this.activeDrops.get(messageId);
    
    if (!drop) {
      return { success: false, message: 'This drop has already been claimed or expired!' };
    }

    try {
      // Get the item
      const item = await prisma.itemDefinition.findUnique({
        where: { id: drop.itemId },
      });

      if (!item) {
        return { success: false, message: 'Item not found!' };
      }

      // Give item to user based on type
      if (item.type === 'CASE') {
        // Find or create case definition
        const caseDef = await prisma.caseDefinition.findFirst({
          where: { name: item.name },
        });

        if (caseDef) {
          await prisma.userCase.create({
            data: {
              user: { connect: { id: userId } },
              caseDef: { connect: { id: caseDef.id } },
            },
          });
        }
      } else {
        // Give as regular item
        await prisma.userItem.create({
          data: {
            user: { connect: { id: userId } },
            itemDef: { connect: { id: item.id } },
          },
        });
      }

      // Clear the drop
      clearTimeout(drop.timeout);
      this.activeDrops.delete(messageId);

      return { 
        success: true, 
        message: `You claimed **${item.name}**!`,
        item 
      };
    } catch (error) {
      console.error('Error claiming drop:', error);
      return { success: false, message: 'An error occurred while claiming the drop.' };
    }
  }

  /**
   * Expire a drop
   */
  private async expireDrop(guildId: string, messageId: string): Promise<void> {
    this.activeDrops.delete(messageId);
    console.log(`Drop expired in guild ${guildId}`);
  }

  /**
   * Select random rarity based on weights
   */
  private selectRandomRarity(): Rarity {
    const random = Math.random();
    let cumulative = 0;

    for (const [rarity, weight] of Object.entries(this.config.rarityWeights)) {
      cumulative += weight;
      if (random <= cumulative) {
        return rarity as Rarity;
      }
    }

    return 'COMMON';
  }

  /**
   * Get random item by rarity
   */
  private async getRandomItemByRarity(rarity: Rarity): Promise<any> {
    const items = await prisma.itemDefinition.findMany({
      where: { rarity },
    });

    if (items.length === 0) return null;
    return items[Math.floor(Math.random() * items.length)];
  }

  /**
   * Get color for rarity
   */
  private getRarityColor(rarity: Rarity): number {
    const colors: { [key in Rarity]: number } = {
      COMMON: 0xB0C3D9,
      UNCOMMON: 0x5E98D9,
      RARE: 0x4B69FF,
      EPIC: 0x8847FF,
      LEGENDARY: 0xD32CE6,
      EXOTIC: 0xEB4B4B,
    };
    return colors[rarity];
  }
}
