import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../../../db/client';

export default {
  data: new SlashCommandBuilder()
    .setName('gift')
    .setDescription('🎁 Give coins to another player')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to give coins to')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Amount of coins to give')
        .setMinValue(1)
        .setMaxValue(10000)
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);
    const guildId = interaction.guildId!;

    if (targetUser.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ You cannot gift coins to yourself!',
        ephemeral: true,
      });
    }

    if (targetUser.bot) {
      return interaction.reply({
        content: '❌ You cannot gift coins to bots!',
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      // Transfer coins via database transaction
      await prisma.$transaction(async (tx) => {
        // Get sender's profile
        const senderProfile = await tx.userGuildProfile.findUnique({
          where: { userId_guildId: { userId: interaction.user.id, guildId } },
        });

        if (!senderProfile || senderProfile.coins < amount) {
          throw new Error(`You don't have enough coins! You have ${senderProfile?.coins || 0} coins.`);
        }

        // Deduct from sender
        await tx.userGuildProfile.update({
          where: { userId_guildId: { userId: interaction.user.id, guildId } },
          data: { coins: { decrement: amount } },
        });

        // Add to receiver
        await tx.userGuildProfile.upsert({
          where: { userId_guildId: { userId: targetUser.id, guildId } },
          create: {
            userId: targetUser.id,
            guildId,
            xp: 0,
            level: 1,
            coins: amount,
          },
          update: {
            coins: { increment: amount },
          },
        });
      });

      const embed = new EmbedBuilder()
        .setTitle('🎁 Gift Sent!')
        .setDescription(`${interaction.user} gifted **${amount} coins** to ${targetUser}`)
        .setColor(0xFFD700)
        .setThumbnail(targetUser.displayAvatarURL())
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error: any) {
      await interaction.editReply({
        content: `❌ ${error.message || 'Failed to transfer coins.'}`,
      });
    }
  },
};
