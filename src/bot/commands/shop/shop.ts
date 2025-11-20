import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../../../db/client';

export default {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('🛒 Browse the CS:GO cases and keys shop'),

  async execute(interaction: ChatInputCommandInteraction) {
    const items = await prisma.shopItem.findMany({
      orderBy: { price: 'asc' },
    });

    if (items.length === 0) {
      return interaction.reply({
        content: '❌ The shop is currently empty.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🛒 CS:GO Case Shop')
      .setDescription('Purchase cases and keys to start opening!\nUse `/buy <item>` to purchase.')
      .setColor(0xFFD700)
      .setThumbnail('https://i.imgur.com/5Zs3XZ5.png')
      .setFooter({ text: '💰 Use /balance to check your coins' });

    // Group items by type
    const cases = items.filter(item => item.type === 'case');
    const keys = items.filter(item => item.type === 'key');

    if (cases.length > 0) {
      embed.addFields({
        name: '📦 Available Cases',
        value: cases.map(item => {
          const emoji = item.caseDefId === 1 ? '🌙' : item.caseDefId === 2 ? '🌈' : '📦';
          return `${emoji} **${item.name}**\n💵 ${item.price} coins\n*${item.description}*`;
        }).join('\n\n'),
      });
    }

    if (keys.length > 0) {
      embed.addFields({
        name: '🔑 Available Keys',
        value: keys.map(item => 
          `🔑 **${item.name}**\n💵 ${item.price} coins\n*${item.description}*`
        ).join('\n\n'),
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
