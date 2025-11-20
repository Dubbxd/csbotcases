import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { inventoryService } from '../../../core/inventory/inventoryService';
import { EmbedHelper } from '../../utils/embeds';
import { Pagination } from '../../utils/pagination';
import { RARITY_CONFIG } from '../../../config/constants';
import prisma from '../../../db/client';

export default {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('📦 View your inventory of cases, keys, and items')
    .addStringOption((option) =>
      option
        .setName('filter')
        .setDescription('Filter by rarity')
        .setRequired(false)
        .addChoices(
          { name: 'Common', value: 'COMMON' },
          { name: 'Uncommon', value: 'UNCOMMON' },
          { name: 'Rare', value: 'RARE' },
          { name: 'Epic', value: 'EPIC' },
          { name: 'Legendary', value: 'LEGENDARY' },
          { name: 'Exotic', value: 'EXOTIC' }
        )
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a server', ephemeral: true });
      return;
    }

    await interaction.deferReply();

    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    // Get all user's items
    const [cases, keys, items] = await Promise.all([
      prisma.userCase.findMany({
        where: { ownerId: userId },
        include: { case: true },
      }),
      prisma.userKey.findMany({
        where: { ownerId: userId },
        include: { keyDef: true },
      }),
      prisma.userItem.findMany({
        where: { 
          ownerId: userId,
          guildId,
          inMarket: false,
        },
        include: { itemDef: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    // Check if inventory is completely empty
    if (cases.length === 0 && keys.length === 0 && items.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle('📦 Your Inventory is Empty!')
        .setDescription('You don\'t have any cases, keys, or items yet.')
        .setColor(0xFF6B6B)
        .addFields({
          name: '🎁 Get Started',
          value: '• Use `/start` to get your starter pack\n• Use `/shop` to buy cases and keys\n• Use `/daily` to earn coins\n• Wait for random drops in chat!',
        });
      
      return interaction.editReply({ embeds: [embed] });
    }

    // Create inventory embed
    const embed = new EmbedBuilder()
      .setTitle(`📦 ${interaction.user.username}'s Inventory`)
      .setColor(0x5865F2)
      .setThumbnail(interaction.user.displayAvatarURL());

    // Add cases section
    if (cases.length > 0) {
      const caseCounts: { [key: string]: number } = {};
      cases.forEach(c => {
        const name = c.case.name;
        caseCounts[name] = (caseCounts[name] || 0) + 1;
      });
      
      const casesList = Object.entries(caseCounts)
        .map(([name, count]) => {
          const emoji = name.includes('Dreams') ? '🌙' : name.includes('Chroma') ? '🌈' : '📦';
          return `${emoji} **${name}** x${count}`;
        })
        .join('\n');
      
      embed.addFields({
        name: `📦 Cases (${cases.length} total)`,
        value: casesList,
        inline: false,
      });
    }

    // Add keys section
    if (keys.length > 0) {
      const keyCounts: { [key: string]: number } = {};
      keys.forEach(k => {
        const name = k.keyDef.name;
        keyCounts[name] = (keyCounts[name] || 0) + 1;
      });
      
      const keysList = Object.entries(keyCounts)
        .map(([name, count]) => `🔑 **${name}** x${count}`)
        .join('\n');
      
      embed.addFields({
        name: `🔑 Keys (${keys.length} total)`,
        value: keysList,
        inline: false,
      });
    }

    // Add items section
    if (items.length > 0) {
      const rarityFilter = interaction.options.getString('filter') as any;
      const filteredItems = rarityFilter 
        ? items.filter(i => i.itemDef.rarity === rarityFilter)
        : items;

      if (filteredItems.length > 0) {
        const itemsList = filteredItems
          .slice(0, 10) // Show first 10
          .map((item) => {
            const rarityEmojis: { [key: string]: string } = {
              COMMON: '⚪',
              UNCOMMON: '🔵',
              RARE: '🟣',
              EPIC: '🟣',
              LEGENDARY: '🟡',
              EXOTIC: '🔴',
            };
            return `${rarityEmojis[item.itemDef.rarity]} **${item.itemDef.name}**`;
          })
          .join('\n');

        embed.addFields({
          name: `✨ Items (${items.length} total${filteredItems.length !== items.length ? `, showing ${filteredItems.length}` : ''})`,
          value: itemsList + (filteredItems.length > 10 ? `\n\n*...and ${filteredItems.length - 10} more*` : ''),
          inline: false,
        });
      }
    }

    embed.setFooter({ 
      text: `💡 Use /open to open cases | Use /shop to buy more` 
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
