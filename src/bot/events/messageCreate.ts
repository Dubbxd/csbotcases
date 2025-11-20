import { Events, Message } from 'discord.js';
import { xpService } from '../../core/xp/xpService';
import { userService } from '../../core/user/userService';
import { guildConfigService } from '../../core/guild/guildConfigService';
import { caseService } from '../../core/loot/caseService';
import { currencyService } from '../../core/economy/currencyService';
import { cooldownManager } from '../middleware/cooldownManager';
import { antiSpam } from '../middleware/antiSpam';
import logger from '../utils/logger';
import { EmbedHelper } from '../utils/embeds';
import { env } from '../../config/env';

export default {
  name: Events.MessageCreate,
  async execute(message: Message) {
    // Ignore bots and DMs
    if (message.author.bot || !message.guild) return;

    try {
      // Check if user is banned
      const isBanned = await userService.isBanned(message.author.id);
      if (isBanned) return;

      // Get guild config
      const config = await guildConfigService.getConfig(message.guild.id);

      // Check if channel is ignored
      if (config.ignoredChannels.includes(message.channel.id)) return;

      // Check if XP is enabled in this channel
      const xpEnabled = await guildConfigService.isXPEnabledInChannel(
        message.guild.id,
        message.channel.id
      );
      if (!xpEnabled) return;

      // Anti-spam check
      if (config.antiSpamEnabled) {
        const spamCheck = await antiSpam.isSpam(message);
        if (spamCheck.isSpam) {
          logger.debug(`Spam detected from ${message.author.tag}: ${spamCheck.reason}`);
          return;
        }

        // Check for repetitive content
        if (antiSpam.isRepetitive(message)) {
          logger.debug(`Repetitive message from ${message.author.tag}`);
          return;
        }

        // Check minimum message length
        if (antiSpam.isTooShort(message, config.xpMinMessageLength)) {
          return;
        }
      }

      // Check XP cooldown
      const onCooldown = await cooldownManager.isOnCooldown(
        message.author.id,
        'xp',
        message.guild.id
      );
      if (onCooldown) return;

      // Give XP
      const xpAmount = xpService.getRandomMessageXP();
      const result = await xpService.addXP(
        message.author.id,
        message.guild.id,
        xpAmount
      );

      // Set cooldown
      await cooldownManager.setCooldown(
        message.author.id,
        'xp',
        config.xpCooldownSeconds,
        message.guild.id
      );

      // Update last message time
      await userService.updateLastMessage(message.author.id, message.guild.id);

      // Handle level up
      if (result.leveledUp) {
        logger.info(
          `${message.author.tag} leveled up to ${result.newLevel} in ${message.guild.name}`
        );

        // Give rewards
        const rewards: string[] = [];

        // Coins
        if (config.levelUpRewardType === 'coins' || config.levelUpRewardType === 'both') {
          await currencyService.addCoins(
            message.author.id,
            message.guild.id,
            config.levelUpRewardCoins,
            'LEVEL_UP',
            { level: result.newLevel }
          );
          rewards.push(`💰 **${config.levelUpRewardCoins}** coins`);
        }

        // Case
        if (config.levelUpRewardType === 'case' || config.levelUpRewardType === 'both') {
          // Give classic case (ID 1)
          await caseService.grantCase(message.author.id, message.guild.id, 1);
          rewards.push('📦 **Classic Case**');
        }

        // Send level up message
        const levelUpChannel = config.levelUpChannelId
          ? message.guild.channels.cache.get(config.levelUpChannelId)
          : message.channel;

        if (levelUpChannel && levelUpChannel.isTextBased()) {
          const embed = EmbedHelper.basic(
            '🎉 Level Up!',
            `Congratulations ${message.author}! You reached **Level ${result.newLevel}**!`,
            0xffd700
          );

          if (rewards.length > 0) {
            embed.addFields({
              name: 'Rewards',
              value: rewards.join('\n'),
            });
          }

          await levelUpChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      logger.error('Error in messageCreate event:', error);
    }
  },
};
