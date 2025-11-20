import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../../../db/client';
import { currencyService } from '../../../core/economy/currencyService';

export default {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('💰 Purchase a case or key from the shop')
    .addStringOption(option =>
      option
        .setName('item')
        .setDescription('What to buy')
        .setRequired(true)
        .addChoices(
          { name: '🌙 Dreams & Nightmares Case (500 coins)', value: 'case_1' },
          { name: '🌈 Chroma 3 Case (750 coins)', value: 'case_2' },
          { name: '🔑 Universal Key (200 coins)', value: 'key_1' }
        )
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('How many to buy')
        .setMinValue(1)
        .setMaxValue(10)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const itemChoice = interaction.options.getString('item', true);
    const amount = interaction.options.getInteger('amount') || 1;
    const userId = interaction.user.id;
    const guildId = interaction.guildId!;

    try {
      // Parse item choice
      const [itemType, itemId] = itemChoice.split('_');
      const itemIdNum = parseInt(itemId);

      // Get shop item
      const shopItem = await prisma.shopItem.findFirst({
        where: {
          type: itemType,
          ...(itemType === 'case' ? { caseDefId: itemIdNum } : { keyDefId: itemIdNum }),
        },
      });

      if (!shopItem) {
        return interaction.editReply('❌ Item not found in shop.');
      }

      const totalCost = shopItem.price * amount;

      // Check balance
      const profile = await prisma.userGuildProfile.findUnique({
        where: {
          userId_guildId: { userId, guildId },
        },
      });

      if (!profile || profile.coins < totalCost) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('❌ Insufficient Funds')
              .setDescription(`You need **${totalCost} coins** but only have **${profile?.coins || 0} coins**.`)
              .setColor(0xFF0000)
              .addFields({
                name: '💡 How to get coins',
                value: '• Use `/daily` for daily rewards\n• Level up by chatting\n• Vote for the bot',
              }),
          ],
        });
      }

      // Process purchase
      await prisma.$transaction(async (tx) => {
        // Deduct coins
        await tx.userGuildProfile.update({
          where: { userId_guildId: { userId, guildId } },
          data: { coins: { decrement: totalCost } },
        });

        // Add items
        if (itemType === 'case') {
          for (let i = 0; i < amount; i++) {
            await tx.userCase.create({
              data: {
                ownerId: userId,
                guildId,
                caseId: itemIdNum,
              },
            });
          }
        } else {
          for (let i = 0; i < amount; i++) {
            await tx.userKey.create({
              data: {
                ownerId: userId,
                guildId,
                keyDefId: itemIdNum,
              },
            });
          }
        }

        // Log transaction
        await tx.transaction.create({
          data: {
            userId,
            guildId,
            type: 'SHOP_BUY',
            amount: -totalCost,
            metadata: { item: shopItem.name, quantity: amount },
          },
        });
      });

      const emoji = itemType === 'case' 
        ? (itemIdNum === 1 ? '🌙' : itemIdNum === 2 ? '🌈' : '📦')
        : '🔑';

      const embed = new EmbedBuilder()
        .setTitle('✅ Purchase Successful!')
        .setDescription(`You bought **${amount}x ${emoji} ${shopItem.name}**`)
        .setColor(0x00FF00)
        .addFields(
          { name: '💵 Total Cost', value: `${totalCost} coins`, inline: true },
          { name: '💰 Remaining Balance', value: `${profile.coins - totalCost} coins`, inline: true }
        )
        .setFooter({ text: itemType === 'case' ? 'Use /open to open your cases!' : 'Keys are used to open cases' });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error purchasing item:', error);
      await interaction.editReply('❌ An error occurred while processing your purchase.');
    }
  },
};
