import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { userService } from '../../../core/user/userService';
import { xpService } from '../../../core/xp/xpService';
import { inventoryService } from '../../../core/inventory/inventoryService';
import { EmbedHelper } from '../../utils/embeds';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your profile or another user\'s profile')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to view')
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;

    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a server', ephemeral: true });
      return;
    }

    await interaction.deferReply();

    const { profile, stats } = await userService.getUserStats(
      targetUser.id,
      interaction.guild.id
    );

    if (!profile) {
      await interaction.editReply({ content: 'Profile not found' });
      return;
    }

    const rank = await xpService.getUserRank(targetUser.id, interaction.guild.id);
    const xpNeeded = xpService.calculateXPForLevel(profile.level + 1);
    const progress = xpService.getLevelProgress(profile.xp, profile.level);

    const embed = EmbedHelper.profile({
      username: targetUser.username,
      avatar: targetUser.displayAvatarURL(),
      level: profile.level,
      xp: progress.current,
      xpNeeded: progress.needed,
      coins: profile.coins,
      rank,
      totalItems: stats.totalItems,
    });

    embed.addFields(
      { name: '📦 Cases Opened', value: `${stats.casesOpened}`, inline: true },
      { name: '💳 Transactions', value: `${stats.totalTransactions}`, inline: true }
    );

    await interaction.editReply({ embeds: [embed] });
  },
};
