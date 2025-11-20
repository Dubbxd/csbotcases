import prisma from '../../db/client';

export class GuildConfigService {
  /**
   * Get or create guild config
   */
  async getConfig(guildId: string) {
    let config = await prisma.guildConfig.findUnique({
      where: { guildId },
    });

    if (!config) {
      config = await prisma.guildConfig.create({
        data: { guildId },
      });
    }

    return config;
  }

  /**
   * Update guild config
   */
  async updateConfig(guildId: string, updates: any) {
    return prisma.guildConfig.upsert({
      where: { guildId },
      update: updates,
      create: { guildId, ...updates },
    });
  }

  /**
   * Check if channel is ignored for XP
   */
  async isChannelIgnored(guildId: string, channelId: string): Promise<boolean> {
    const config = await this.getConfig(guildId);
    return config.ignoredChannels.includes(channelId);
  }

  /**
   * Check if XP is enabled in channel
   */
  async isXPEnabledInChannel(guildId: string, channelId: string): Promise<boolean> {
    const config = await this.getConfig(guildId);
    
    // If no specific channels are set, XP is enabled everywhere
    if (config.xpEnabledChannels.length === 0) {
      return true;
    }

    return config.xpEnabledChannels.includes(channelId);
  }

  /**
   * Add ignored channel
   */
  async addIgnoredChannel(guildId: string, channelId: string): Promise<void> {
    const config = await this.getConfig(guildId);
    
    if (!config.ignoredChannels.includes(channelId)) {
      await prisma.guildConfig.update({
        where: { guildId },
        data: {
          ignoredChannels: [...config.ignoredChannels, channelId],
        },
      });
    }
  }

  /**
   * Remove ignored channel
   */
  async removeIgnoredChannel(guildId: string, channelId: string): Promise<void> {
    const config = await this.getConfig(guildId);
    
    await prisma.guildConfig.update({
      where: { guildId },
      data: {
        ignoredChannels: config.ignoredChannels.filter((id) => id !== channelId),
      },
    });
  }

  /**
   * Update guild info
   */
  async updateGuildInfo(guildId: string, name: string, ownerId: string) {
    await prisma.guild.upsert({
      where: { id: guildId },
      update: { name, ownerId },
      create: { id: guildId, name, ownerId },
    });
  }
}

export const guildConfigService = new GuildConfigService();
