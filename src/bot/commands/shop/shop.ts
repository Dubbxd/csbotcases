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

    // Case images from Steam Community
    const caseImages: Record<number, string> = {
      1: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_NfTJQ-uO-mb-GkuP1P7fYlVRd4cJ5nqeQpIjz2la1-xI-NWvzdtSSdA42aVHU-1foxO3u1sC-v57KyHU2uCFwsH3VmkexgUpOcKUx0qdM19rY/256fx256f', // Dreams & Nightmares
      2: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_NfTJQ5di7hIWZh_b6NrXuk39Q5sJ0teXI8oThxlKx-kQ4a2Cn0IPpJkXfww/256fx256f', // Chroma 3
    };

    const embed = new EmbedBuilder()
      .setTitle('🛒 CS:GO Case Shop')
      .setDescription('Purchase cases and keys to start opening!\nUse `/buy <item>` to purchase.')
      .setColor(0xFFD700)
      .setFooter({ text: '💰 Use /balance to check your coins' });

    // Group items by type
    const cases = items.filter(item => item.type === 'case');
    const keys = items.filter(item => item.type === 'key');

    // Set first case image as thumbnail (Dreams & Nightmares by default)
    if (cases.length > 0 && cases[0].caseDefId && caseImages[cases[0].caseDefId]) {
      embed.setImage(caseImages[cases[0].caseDefId]);
    }

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
