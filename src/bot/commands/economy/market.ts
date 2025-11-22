import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { marketService } from '../../../core/market/marketService';
import { RARITY_CONFIG, getRarityDisplayName } from '../../../config/constants';
import prisma from '../../../db/client';

export default {
  data: new SlashCommandBuilder()
    .setName('market')
    .setDescription('🏪 Access the item marketplace')
    .addSubcommand((sub) =>
      sub
        .setName('list')
        .setDescription('📤 List an item for sale')
        .addIntegerOption((opt) =>
          opt
            .setName('item_id')
            .setDescription('The ID of the item to sell')
            .setRequired(true)
        )
        .addIntegerOption((opt) =>
          opt
            .setName('price')
            .setDescription('Price in coins')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(1000000)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('browse')
        .setDescription('🔍 Browse items for sale')
        .addStringOption((opt) =>
          opt
            .setName('rarity')
            .setDescription('Filter by rarity')
            .setRequired(false)
            .addChoices(
              { name: 'Mil-Spec', value: 'UNCOMMON' },
              { name: 'Restricted', value: 'RARE' },
              { name: 'Classified', value: 'VERY_RARE' },
              { name: 'Covert', value: 'LEGENDARY' },
              { name: 'Exceedingly Rare', value: 'EXOTIC' }
            )
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('buy')
        .setDescription('💸 Buy an item from the market')
        .addIntegerOption((opt) =>
          opt
            .setName('listing_id')
            .setDescription('The ID of the listing')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName('mylistings').setDescription('📋 View your active listings')
    )
    .addSubcommand((sub) =>
      sub.setName('cancel').setDescription('❌ Cancel a listing').addIntegerOption((opt) =>
        opt
          .setName('listing_id')
          .setDescription('The ID of the listing to cancel')
          .setRequired(true)
      )
    )
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used in a server',
        ephemeral: true,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') {
      await handleList(interaction);
    } else if (subcommand === 'browse') {
      await handleBrowse(interaction);
    } else if (subcommand === 'buy') {
      await handleBuy(interaction);
    } else if (subcommand === 'mylistings') {
      await handleMyListings(interaction);
    } else if (subcommand === 'cancel') {
      await handleCancel(interaction);
    }
  },
};

async function handleList(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const itemId = interaction.options.getInteger('item_id', true);
  const price = interaction.options.getInteger('price', true);
  const userId = interaction.user.id;
  const guildId = interaction.guild!.id;

  try {
    const listingId = await marketService.listItem(userId, guildId, itemId, price);

    const embed = new EmbedBuilder()
      .setTitle('✅ Item Listed on Market!')
      .setDescription(`Your item is now listed for sale.`)
      .setColor(0x57F287)
      .addFields(
        { name: '💰 Price', value: `${price} coins`, inline: true },
        { name: '🆔 Listing ID', value: `\`${listingId}\``, inline: true }
      )
      .setFooter({ text: '💡 Use /market mylistings to view all your listings' });

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ Error: ${error.message}`,
    });
  }
}

async function handleBrowse(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const rarity = interaction.options.getString('rarity');
  const guildId = interaction.guild!.id;

  try {
    const result = await marketService.browseMarket(
      {
        guildId,
        rarity: rarity || undefined,
      },
      1
    );

    if (result.listings.length === 0) {
      await interaction.editReply({
        content: '🏪 No items currently listed on the market.',
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('🏪 Market Listings')
      .setColor(0x5865F2)
      .setDescription(
        result.listings
          .map((listing, i) => {
            const config =
              RARITY_CONFIG[listing.userItem.itemDef.rarity as keyof typeof RARITY_CONFIG];
            const rarityName = getRarityDisplayName(listing.userItem.itemDef.rarity);
            return `${i + 1}. ${config?.emoji || '⚪'} **${listing.userItem.itemDef.name}**\n   ${rarityName} • 💰 ${listing.price} coins • ID: \`${listing.id}\``;
          })
          .join('\n\n')
      )
      .setFooter({
        text: `Page ${result.page}/${result.totalPages} • ${result.total} total listings • Use /market buy listing_id:X to purchase`,
      });

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ Error: ${error.message}`,
    });
  }
}

async function handleBuy(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const listingId = interaction.options.getInteger('listing_id', true);
  const userId = interaction.user.id;
  const guildId = interaction.guild!.id;

  try {
    await marketService.buyItem(userId, guildId, listingId);

    const embed = new EmbedBuilder()
      .setTitle('✅ Purchase Successful!')
      .setDescription('The item has been added to your inventory.')
      .setColor(0x57F287)
      .setFooter({ text: '💡 Use /inventory to view your items' });

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ Error: ${error.message}`,
    });
  }
}

async function handleMyListings(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const userId = interaction.user.id;

  try {
    const listings = await marketService.getUserListings(userId);

    if (listings.length === 0) {
      await interaction.editReply({
        content: '📋 You have no active listings.',
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('📋 Your Active Listings')
      .setColor(0x5865F2)
      .setDescription(
        listings
          .map((listing, i) => {
            const config =
              RARITY_CONFIG[listing.userItem.itemDef.rarity as keyof typeof RARITY_CONFIG];
            const rarityName = getRarityDisplayName(listing.userItem.itemDef.rarity);
            return `${i + 1}. ${config?.emoji || '⚪'} **${listing.userItem.itemDef.name}**\n   ${rarityName} • 💰 ${listing.price} coins • ID: \`${listing.id}\``;
          })
          .join('\n\n')
      )
      .setFooter({ text: '💡 Use /market cancel listing_id:X to cancel a listing' });

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ Error: ${error.message}`,
    });
  }
}

async function handleCancel(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const listingId = interaction.options.getInteger('listing_id', true);
  const userId = interaction.user.id;

  try {
    await marketService.cancelListing(userId, listingId);

    const embed = new EmbedBuilder()
      .setTitle('✅ Listing Cancelled')
      .setDescription('The item has been returned to your inventory.')
      .setColor(0x57F287)
      .setFooter({ text: '💡 Use /inventory to view your items' });

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({
      content: `❌ Error: ${error.message}`,
    });
  }
}
