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
    const ITEMS_PER_PAGE = 3;
    let currentPage = 0;
    const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));

    const generateEmbeds = (page: number) => {
      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const pageItems = items.slice(start, end);
      
      // Single main embed with everything
      const mainEmbed = new EmbedBuilder()
        .setTitle(`📦 ${interaction.user.username}'s Inventory`)
        .setColor(0x5865F2)
        .setThumbnail(interaction.user.displayAvatarURL());

      // Compact cases and keys in one line each
      let summaryLines: string[] = [];
      
      if (cases.length > 0) {
        const caseCounts: { [key: string]: number } = {};
        cases.forEach(c => {
          const name = c.case.name;
          caseCounts[name] = (caseCounts[name] || 0) + 1;
        });
        const casesText = Object.entries(caseCounts)
          .map(([name, count]) => {
            const emoji = name.includes('Dreams') ? '🌙' : '🌈';
            const shortName = name.replace(' Case', '');
            return `${emoji} ${shortName} x${count}`;
          })
          .join(' • ');
        summaryLines.push(`📦 **Cases:** ${casesText}`);
      }

      if (keys.length > 0) {
        summaryLines.push(`🔑 **Keys:** ${keys.length}x Universal`);
      }

      if (summaryLines.length > 0) {
        mainEmbed.setDescription(summaryLines.join('\n'));
      }

      // Add items with images
      if (items.length > 0 && pageItems.length > 0) {
        pageItems.forEach((item, index) => {
          const config = RARITY_CONFIG[item.itemDef.rarity as keyof typeof RARITY_CONFIG];
          const rarityName = getRarityDisplayName(item.itemDef.rarity);
          const itemNumber = start + index + 1;
          const statusEmoji = item.inMarket ? '🏪' : '✅';
          
          mainEmbed.addFields({
            name: `${config?.emoji || '⚪'} ${itemNumber}. ${item.itemDef.name}`,
            value: `${rarityName} • ID: \`${item.id}\` • ${statusEmoji}`,
            inline: false,
          });
        });

        // Show image of the first item on the page
        if (pageItems[0]?.itemDef.iconUrl) {
          const proxiedUrl = getSteamImageProxyUrl(pageItems[0].itemDef.iconUrl);
          if (proxiedUrl) {
            mainEmbed.setImage(proxiedUrl);
          }
        }

        mainEmbed.setFooter({ 
          text: `Page ${page + 1}/${totalPages} • ${items.length} items total • Click 🔍 to inspect` 
        });
      } else if (items.length === 0) {
        mainEmbed.setFooter({ 
          text: `💡 Use /open to open cases | Use /shop to buy more` 
        });
      }

      return [mainEmbed];
    };

    const generateButtons = (page: number) => {
      const navigationRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('first')
            .setLabel('⏮️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('◀️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId('page')
            .setLabel(`${page + 1}/${totalPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('▶️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page >= totalPages - 1),
          new ButtonBuilder()
            .setCustomId('last')
            .setLabel('⏭️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page >= totalPages - 1)
        );

      // Add action buttons for items on current page
      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const pageItems = items.slice(start, end);

      const actionRows: ActionRowBuilder<ButtonBuilder>[] = [navigationRow];

      if (pageItems.length > 0) {
        const actionRow = new ActionRowBuilder<ButtonBuilder>();
        
        pageItems.forEach((item, index) => {
          const itemNumber = start + index + 1;
          actionRow.addComponents(
            new ButtonBuilder()
              .setCustomId(`inspect_${item.id}`)
              .setLabel(`🔍 #${itemNumber}`)
              .setStyle(ButtonStyle.Secondary)
          );
        });

        actionRows.push(actionRow);
      }

      return actionRows;
    };

    // Send initial message
    const initialEmbeds = generateEmbeds(currentPage);
    const components = items.length > 0 ? generateButtons(currentPage) : [];
    
    const message = await interaction.editReply({ 
      embeds: initialEmbeds,
      components,
    });

    // Only create collector if there are items
    if (items.length === 0) return;

    // Create button collector
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60 * 1000, // 5 minutes
      filter: (i) => i.user.id === userId,
    });

    collector.on('collect', async (buttonInteraction) => {
      // Handle navigation buttons
      if (buttonInteraction.customId === 'first') {
        currentPage = 0;
        await buttonInteraction.update({
          embeds: generateEmbeds(currentPage),
          components: generateButtons(currentPage),
        });
      } else if (buttonInteraction.customId === 'prev') {
        currentPage = Math.max(0, currentPage - 1);
        await buttonInteraction.update({
          embeds: generateEmbeds(currentPage),
          components: generateButtons(currentPage),
        });
      } else if (buttonInteraction.customId === 'next') {
        currentPage = Math.min(totalPages - 1, currentPage + 1);
        await buttonInteraction.update({
          embeds: generateEmbeds(currentPage),
          components: generateButtons(currentPage),
        });
      } else if (buttonInteraction.customId === 'last') {
        currentPage = totalPages - 1;
        await buttonInteraction.update({
          embeds: generateEmbeds(currentPage),
          components: generateButtons(currentPage),
        });
      } 
      // Handle inspect button
      else if (buttonInteraction.customId.startsWith('inspect_')) {
        const itemId = parseInt(buttonInteraction.customId.replace('inspect_', ''));
        const item = items.find(i => i.id === itemId);
        
        if (item) {
          const config = RARITY_CONFIG[item.itemDef.rarity as keyof typeof RARITY_CONFIG];
          const rarityName = getRarityDisplayName(item.itemDef.rarity);
          const proxiedUrl = getSteamImageProxyUrl(item.itemDef.iconUrl);
          
          const inspectEmbed = new EmbedBuilder()
            .setTitle(`${config?.emoji || '⚪'} ${item.itemDef.name}`)
            .setColor(config?.color || 0x5865F2)
            .setDescription(item.itemDef.description || 'A weapon skin from a case opening.')
            .addFields(
              { name: '🎨 Rarity', value: rarityName, inline: true },
              { name: '🔫 Weapon', value: item.itemDef.weapon || 'Unknown', inline: true },
              { name: '🎭 Skin', value: item.itemDef.skin || 'Default', inline: true },
              { name: '📦 Item ID', value: `\`${item.id}\``, inline: true },
              { name: '📅 Obtained', value: `<t:${Math.floor(item.createdAt.getTime() / 1000)}:R>`, inline: true },
              { name: '💼 Status', value: item.inMarket ? '🏪 Listed on Market' : '✅ In Inventory', inline: true }
            );
          
          if (proxiedUrl) {
            inspectEmbed.setImage(proxiedUrl);
          }

          // Create Sell button
          const sellButton = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`sell_${item.id}`)
                .setLabel(item.inMarket ? '🏪 Already Listed' : '💰 Sell on Market')
                .setStyle(item.inMarket ? ButtonStyle.Danger : ButtonStyle.Success)
                .setDisabled(item.inMarket)
            );
          
          await buttonInteraction.reply({ 
            embeds: [inspectEmbed], 
            components: [sellButton],
            ephemeral: true 
          });

          // Create collector for sell button in inspect
          const inspectMessage = await buttonInteraction.fetchReply();
          const sellCollector = inspectMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 2 * 60 * 1000, // 2 minutes
            filter: (i) => i.user.id === userId && i.customId.startsWith('sell_'),
          });

          sellCollector.on('collect', async (sellInteraction) => {
            const sellItemId = parseInt(sellInteraction.customId.replace('sell_', ''));
            const sellItem = items.find(i => i.id === sellItemId);
            
            if (!sellItem) {
              await sellInteraction.reply({ content: '❌ Item not found!', ephemeral: true });
              return;
            }

            if (sellItem.inMarket) {
              await sellInteraction.reply({ content: '❌ This item is already listed on the market!', ephemeral: true });
              return;
            }

            // Show price input instructions
            await sellInteraction.reply({
              content: `💰 To list **${sellItem.itemDef.name}** on the market, use:\n\`\`\`/market list item_id:${sellItem.id} price:YOUR_PRICE\`\`\`\n\n💡 Recommended prices:\n• Mil-Spec: 50-200 coins\n• Restricted: 200-500 coins\n• Classified: 500-1500 coins\n• Covert: 1500-5000 coins\n• Knives: 5000+ coins`,
              ephemeral: true
            });
          });
        }
      }
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
