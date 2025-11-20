import { Events } from 'discord.js';
import { ExtendedClient } from '../client';
import logger from '../utils/logger';
import { guildConfigService } from '../../core/guild/guildConfigService';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: ExtendedClient) {
    logger.info(`Logged in as ${client.user?.tag}`);
    logger.info(`Serving ${client.guilds.cache.size} guilds`);

    // Set bot status
    client.user?.setPresence({
      activities: [{ name: '/help | CS:GO Cases', type: 0 }],
      status: 'online',
    });

    // Update guild information and start drops
    for (const [, guild] of client.guilds.cache) {
      await guildConfigService.updateGuildInfo(
        guild.id,
        guild.name,
        guild.ownerId
      );

      // Start random drops for this guild
      await client.dropService.startDrops(guild.id);
      logger.info(`Started random drops for guild: ${guild.name}`);
    }

    logger.info('Bot is ready!');
  },
};
