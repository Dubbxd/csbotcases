import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { xpService } from '../../../core/xp/xpService';
import { EmbedHelper } from '../../utils/embeds';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the server leaderboard')
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a server', ephemeral: true });
      return;
    }

    await interaction.deferReply();

    const leaderboard = await xpService.getLeaderboard(interaction.guild.id, 10);

    const entries = await Promise.all(
      leaderboard.map(async (profile, index) => {
        const user = await interaction.client.users.fetch(profile.userId);
        return {
          rank: index + 1,
          name: user.username,
          value: `Level ${profile.level} • ${profile.xp.toLocaleString()} XP`,
        };
      })
    );

    const embed = EmbedHelper.leaderboard(`🏆 ${interaction.guild.name} Leaderboard`, entries);

    await interaction.editReply({ embeds: [embed] });
  },
};
