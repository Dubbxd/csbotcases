import { Events, Interaction, EmbedBuilder } from 'discord.js';
import { ExtendedClient } from '../client';
import logger from '../utils/logger';
import { userService } from '../../core/user/userService';
import { EmbedHelper } from '../utils/embeds';
import { cooldownManager } from '../middleware/cooldownManager';

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    // Handle button interactions (for drop claims)
    if (interaction.isButton()) {
      if (interaction.customId.startsWith('claim_drop_')) {
        const client = interaction.client as ExtendedClient;
        const dropService = client.dropService;

        if (!dropService) {
          return interaction.reply({
            content: '❌ Drop system is not initialized.',
            ephemeral: true,
          });
        }

        const result = await dropService.claimDrop(interaction.message.id, interaction.user.id);

        if (result.success) {
          const rarityEmojis: { [key: string]: string } = {
            COMMON: '⚪',
            UNCOMMON: '🔵',
            RARE: '🟣',
            EPIC: '🟣',
            LEGENDARY: '🟡',
            EXOTIC: '🔴',
          };

          // Update original message
          const claimedEmbed = new EmbedBuilder()
            .setTitle('✅ Drop Claimed!')
            .setDescription(`${interaction.user} claimed ${rarityEmojis[result.item?.rarity || 'COMMON']} **${result.item?.name}**!`)
            .setColor(0x00FF00)
            .setFooter({ text: 'Better luck next time!' })
            .setTimestamp();

          await interaction.message.edit({
            embeds: [claimedEmbed],
            components: [],
          });

          await interaction.reply({
            content: `🎉 ${result.message}`,
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: `❌ ${result.message}`,
            ephemeral: true,
          });
        }

        return;
      }
    }

    if (!interaction.isChatInputCommand()) return;

    const client = interaction.client as ExtendedClient;
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      logger.warn(`Command not found: ${interaction.commandName}`);
      return;
    }

    try {
      // Check if user is banned
      const isBanned = await userService.isBanned(interaction.user.id);
      if (isBanned) {
        await interaction.reply({
          embeds: [EmbedHelper.error('You are banned from using this bot.')],
          ephemeral: true,
        });
        return;
      }

      // Check cooldown
      if (command.cooldown) {
        const onCooldown = await cooldownManager.isOnCooldown(
          interaction.user.id,
          `command:${interaction.commandName}`
        );

        if (onCooldown) {
          const remaining = await cooldownManager.getRemainingTime(
            interaction.user.id,
            `command:${interaction.commandName}`
          );

          await interaction.reply({
            embeds: [
              EmbedHelper.warning(
                `Please wait ${cooldownManager.formatTime(remaining)} before using this command again.`
              ),
            ],
            ephemeral: true,
          });
          return;
        }
      }

      // Ensure user profile exists
      if (interaction.guild) {
        await userService.getOrCreateProfile(interaction.user.id, interaction.guild.id);
      }

      // Execute command
      await command.execute(interaction);

      // Set cooldown
      if (command.cooldown) {
        await cooldownManager.setCooldown(
          interaction.user.id,
          `command:${interaction.commandName}`,
          command.cooldown
        );
      }

      logger.info(
        `${interaction.user.tag} used /${interaction.commandName} in ${interaction.guild?.name || 'DM'}`
      );
    } catch (error) {
      logger.error(`Error executing command ${interaction.commandName}:`, error);

      const errorEmbed = EmbedHelper.error(
        'An error occurred while executing this command.'
      );

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },
};
