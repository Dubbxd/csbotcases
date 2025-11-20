import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { COLORS, RARITY_CONFIG } from '../../config/constants';
import { Rarity } from '@prisma/client';

export class EmbedHelper {
  /**
   * Create basic embed
   */
  static basic(title: string, description: string, color?: ColorResolvable) {
    return new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color ?? COLORS.PRIMARY)
      .setTimestamp();
  }

  /**
   * Create success embed
   */
  static success(description: string) {
    return new EmbedBuilder()
      .setDescription(`✅ ${description}`)
      .setColor(COLORS.SUCCESS)
      .setTimestamp();
  }

  /**
   * Create error embed
   */
  static error(description: string) {
    return new EmbedBuilder()
      .setDescription(`❌ ${description}`)
      .setColor(COLORS.ERROR)
      .setTimestamp();
  }

  /**
   * Create warning embed
   */
  static warning(description: string) {
    return new EmbedBuilder()
      .setDescription(`⚠️ ${description}`)
      .setColor(COLORS.WARNING)
      .setTimestamp();
  }

  /**
   * Create info embed
   */
  static info(description: string) {
    return new EmbedBuilder()
      .setDescription(`ℹ️ ${description}`)
      .setColor(COLORS.INFO)
      .setTimestamp();
  }

  /**
   * Create profile embed
   */
  static profile(data: {
    username: string;
    avatar: string;
    level: number;
    xp: number;
    xpNeeded: number;
    coins: number;
    rank: number;
    totalItems: number;
  }) {
    const progress = Math.floor((data.xp / data.xpNeeded) * 100);
    const progressBar = this.createProgressBar(progress);

    return new EmbedBuilder()
      .setTitle(`${data.username}'s Profile`)
      .setThumbnail(data.avatar)
      .setColor(COLORS.PRIMARY)
      .addFields(
        { name: '⭐ Level', value: `${data.level}`, inline: true },
        { name: '🏆 Rank', value: `#${data.rank}`, inline: true },
        { name: '💰 Coins', value: `${data.coins.toLocaleString()}`, inline: true },
        { name: '📊 XP Progress', value: `${progressBar}\n${data.xp.toLocaleString()} / ${data.xpNeeded.toLocaleString()} (${progress}%)` },
        { name: '🎒 Inventory', value: `${data.totalItems} items`, inline: true }
      )
      .setTimestamp();
  }

  /**
   * Create item embed
   */
  static item(data: {
    name: string;
    rarity: Rarity;
    type: string;
    collection?: string;
    iconUrl?: string;
  }) {
    const rarityInfo = RARITY_CONFIG[data.rarity];
    
    const embed = new EmbedBuilder()
      .setTitle(`${rarityInfo.emoji} ${data.name}`)
      .setColor(rarityInfo.color)
      .addFields(
        { name: 'Rarity', value: rarityInfo.name, inline: true },
        { name: 'Type', value: data.type, inline: true }
      );

    if (data.collection) {
      embed.addFields({ name: 'Collection', value: data.collection, inline: true });
    }

    if (data.iconUrl) {
      embed.setThumbnail(data.iconUrl);
    }

    return embed.setTimestamp();
  }

  /**
   * Create case opening embed
   */
  static caseOpening(data: {
    caseName: string;
    itemName: string;
    rarity: string;
    bonusCoins: number;
    bonusXP: number;
    iconUrl?: string;
  }) {
    const rarityInfo = RARITY_CONFIG[data.rarity as Rarity] ?? RARITY_CONFIG.COMMON;
    
    const embed = new EmbedBuilder()
      .setTitle('📦 Case Opened!')
      .setDescription(`**${data.caseName}**`)
      .setColor(rarityInfo.color)
      .addFields(
        { name: '🎁 You got', value: `${rarityInfo.emoji} **${data.itemName}**` },
        { name: 'Rarity', value: rarityInfo.name, inline: true },
        { name: '💰 Bonus Coins', value: `+${data.bonusCoins}`, inline: true },
        { name: '⭐ Bonus XP', value: `+${data.bonusXP}`, inline: true }
      );

    if (data.iconUrl) {
      embed.setThumbnail(data.iconUrl);
    }

    return embed.setTimestamp();
  }

  /**
   * Create leaderboard embed
   */
  static leaderboard(title: string, entries: Array<{ rank: number; name: string; value: string }>) {
    const description = entries
      .map((e) => `**${e.rank}.** ${e.name} - ${e.value}`)
      .join('\n');

    return new EmbedBuilder()
      .setTitle(title)
      .setDescription(description || 'No entries yet')
      .setColor(COLORS.PRIMARY)
      .setTimestamp();
  }

  /**
   * Create progress bar
   */
  private static createProgressBar(percentage: number, length: number = 10): string {
    const filled = Math.floor((percentage / 100) * length);
    const empty = length - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  }
}
