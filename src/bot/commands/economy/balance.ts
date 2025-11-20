import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { userService } from '../../../core/user/userService';
import { EmbedHelper } from '../../utils/embeds';

export default {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your coin balance')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to check')
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;

    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a server', ephemeral: true });
      return;
    }

    const profile = await userService.getProfile(targetUser.id, interaction.guild.id);

    if (!profile) {
      await interaction.reply({ content: 'Profile not found', ephemeral: true });
      return;
    }

    const embed = EmbedHelper.basic(
      '💰 Balance',
      `${targetUser.username} has **${profile.coins.toLocaleString()}** coins`,
      0xffd700
    );

    await interaction.reply({ embeds: [embed] });
  },
};
