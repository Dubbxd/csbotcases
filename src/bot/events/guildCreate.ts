import { Events, Guild } from 'discord.js';
import { guildConfigService } from '../../core/guild/guildConfigService';
import logger from '../utils/logger';

export default {
  name: Events.GuildCreate,
  async execute(guild: Guild) {
    logger.info(`Joined new guild: ${guild.name} (${guild.id})`);

    // Create guild config
    await guildConfigService.updateGuildInfo(
      guild.id,
      guild.name,
      guild.ownerId
    );

    logger.info(`Initialized configuration for ${guild.name}`);
  },
};
