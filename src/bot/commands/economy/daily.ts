import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dailyService } from '../../../core/economy/dailyService';
import { EmbedHelper } from '../../utils/embeds';
import { cooldownManager } from '../../middleware/cooldownManager';

export default {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward')
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a server', ephemeral: true });
      return;
    }

    await interaction.deferReply();

    try {
      const result = await dailyService.claimDaily(
        interaction.user.id,
        interaction.guild.id
      );

      const embed = EmbedHelper.success('Daily reward claimed!')
        .addFields(
          { name: '💰 Coins', value: `+${result.coins}`, inline: true },
          { name: '⭐ XP', value: `+${result.xp}`, inline: true }
        )
        .setFooter({ text: 'Come back in 24 hours for your next reward!' });

      await interaction.editReply({ embeds: [embed] });
    } catch (error: any) {
      const embed = EmbedHelper.error(error.message || 'Failed to claim daily reward');
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
