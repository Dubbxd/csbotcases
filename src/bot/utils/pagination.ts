import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
  ButtonInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';

interface PaginationOptions {
  embeds: EmbedBuilder[];
  time?: number;
  ephemeral?: boolean;
}

export class Pagination {
  /**
   * Create paginated message with buttons
   */
  static async create(
    interaction: ChatInputCommandInteraction,
    options: PaginationOptions
  ) {
    const { embeds, time = 120000, ephemeral = false } = options;

    if (embeds.length === 0) {
      await interaction.reply({ content: 'No data to display', ephemeral: true });
      return;
    }

    if (embeds.length === 1) {
      await interaction.reply({ embeds: [embeds[0]], ephemeral });
      return;
    }

    let currentPage = 0;

    const getButtons = (disabled: boolean = false) => {
      return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('first')
          .setLabel('⏮️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(disabled || currentPage === 0),
        new ButtonBuilder()
          .setCustomId('previous')
          .setLabel('◀️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(disabled || currentPage === 0),
        new ButtonBuilder()
          .setCustomId('page')
          .setLabel(`${currentPage + 1} / ${embeds.length}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('▶️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(disabled || currentPage === embeds.length - 1),
        new ButtonBuilder()
          .setCustomId('last')
          .setLabel('⏭️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(disabled || currentPage === embeds.length - 1)
      );
    };

    const message = await interaction.reply({
      embeds: [embeds[currentPage]],
      components: [getButtons()],
      ephemeral,
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time,
    });

    collector.on('collect', async (i: ButtonInteraction) => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({
          content: 'These buttons are not for you!',
          ephemeral: true,
        });
        return;
      }

      switch (i.customId) {
        case 'first':
          currentPage = 0;
          break;
        case 'previous':
          currentPage = Math.max(0, currentPage - 1);
          break;
        case 'next':
          currentPage = Math.min(embeds.length - 1, currentPage + 1);
          break;
        case 'last':
          currentPage = embeds.length - 1;
          break;
      }

      await i.update({
        embeds: [embeds[currentPage]],
        components: [getButtons()],
      });
    });

    collector.on('end', async () => {
      try {
        await interaction.editReply({ components: [getButtons(true)] });
      } catch (error) {
        // Message might have been deleted
      }
    });
  }

  /**
   * Create simple page footer
   */
  static createFooter(currentPage: number, totalPages: number): string {
    return `Page ${currentPage} of ${totalPages}`;
  }
}
