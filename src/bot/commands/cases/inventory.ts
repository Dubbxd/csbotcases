import { 
  ChatInputCommandInteraction, 
  SlashCommandBuilder, 
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';
import { inventoryService } from '../../../core/inventory/inventoryService';
import { EmbedHelper } from '../../utils/embeds';
import { Pagination } from '../../utils/pagination';
import { RARITY_CONFIG, getRarityDisplayName } from '../../../config/constants';
import prisma from '../../../db/client';
import { getSteamImageProxyUrl } from '../../../core/utils/imageProxy';

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
    const rarityFilter = interaction.options.getString('filter') as any;

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
          ...(rarityFilter && { itemDef: { rarity: rarityFilter } }),
        },
        include: { itemDef: true },
        orderBy: { createdAt: 'desc' },
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

    // Pagination setup for items
    const ITEMS_PER_PAGE = 5;
    let currentPage = 0;
    const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));

    const generateEmbed = (page: number) => {
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

      // Add items section with pagination
      if (items.length > 0) {
        const start = page * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageItems = items.slice(start, end);

        // Use the first item's image as the embed thumbnail (if any)
        if (pageItems.length > 0 && pageItems[0].itemDef.iconUrl) {
          const proxiedUrl = getSteamImageProxyUrl(pageItems[0].itemDef.iconUrl);
          if (proxiedUrl) {
            embed.setImage(proxiedUrl);
          }
        }

        const itemsList = pageItems
          .map((item, index) => {
            const config = RARITY_CONFIG[item.itemDef.rarity as keyof typeof RARITY_CONFIG];
            const rarityName = getRarityDisplayName(item.itemDef.rarity);
            return `${config?.emoji || '⚪'} **${item.itemDef.name}**\n└ ${rarityName} • ID: \`${item.id}\``;
          })
          .join('\n\n');

        embed.addFields({
          name: `✨ Items (${items.length} total${rarityFilter ? ` - Filtered: ${rarityFilter}` : ''})`,
          value: itemsList || 'No items',
          inline: false,
        });

        embed.setFooter({ 
          text: `Page ${page + 1}/${totalPages} | 💡 Use buttons to navigate` 
        });
      } else {
        embed.setFooter({ 
          text: `💡 Use /open to open cases | Use /shop to buy more` 
        });
      }

      return embed;
    };

    const generateButtons = (page: number) => {
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('first')
            .setLabel('⏮️ First')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('◀️ Previous')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId('page')
            .setLabel(`${page + 1}/${totalPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next ▶️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page >= totalPages - 1),
          new ButtonBuilder()
            .setCustomId('last')
            .setLabel('Last ⏭️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page >= totalPages - 1)
        );
      return row;
    };

    // Send initial message
    const initialEmbed = generateEmbed(currentPage);
    const components = items.length > ITEMS_PER_PAGE ? [generateButtons(currentPage)] : [];
    
    const message = await interaction.editReply({ 
      embeds: [initialEmbed],
      components,
    });

    // Only create collector if there are multiple pages
    if (items.length <= ITEMS_PER_PAGE) return;

    // Create button collector
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60 * 1000, // 5 minutes
      filter: (i) => i.user.id === userId,
    });

    collector.on('collect', async (buttonInteraction) => {
      switch (buttonInteraction.customId) {
        case 'first':
          currentPage = 0;
          break;
        case 'prev':
          currentPage = Math.max(0, currentPage - 1);
          break;
        case 'next':
          currentPage = Math.min(totalPages - 1, currentPage + 1);
          break;
        case 'last':
          currentPage = totalPages - 1;
          break;
      }

      await buttonInteraction.update({
        embeds: [generateEmbed(currentPage)],
        components: [generateButtons(currentPage)],
      });
    });

    collector.on('end', async () => {
      try {
        await interaction.editReply({ components: [] });
      } catch (error) {
        // Ignore errors if message was deleted
      }
    });
  },
};
