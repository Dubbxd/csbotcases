import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../../../db/client';

export default {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('🎁 Get your starter pack! (One-time only)')
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a server', ephemeral: true });
      return;
    }

    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    await interaction.deferReply();

    try {
      // Check if user already claimed starter pack
      const profile = await prisma.userGuildProfile.findUnique({
        where: {
          userId_guildId: { userId, guildId },
        },
      });

      // Check if user has starter items already
      const [existingCases, existingKeys] = await Promise.all([
        prisma.userCase.count({
          where: { 
            ownerId: userId,
          },
        }),
        prisma.userKey.count({
          where: { 
            ownerId: userId,
          },
        }),
      ]);

      // If user has more than 2 cases or 2 keys, they already claimed
      if (existingCases > 0 || existingKeys > 0) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('❌ Already Claimed')
              .setDescription('You have already claimed your starter pack!')
              .setColor(0xFF0000)
              .addFields(
                {
                  name: '📦 Your Current Items',
                  value: `**Cases:** ${existingCases}\n**Keys:** ${existingKeys}`,
                  inline: true,
                },
                {
                  name: '💡 How to get more',
                  value: '• Use `/daily` for daily rewards\n• Use `/shop` to buy cases\n• Level up by chatting',
                  inline: true,
                }
              ),
          ],
        });
      }

      // Give starter pack
      await prisma.$transaction(async (tx) => {
        // Ensure user and profile exist
        await tx.user.upsert({
          where: { id: userId },
          create: { id: userId },
          update: {},
        });

        await tx.userGuildProfile.upsert({
          where: { userId_guildId: { userId, guildId } },
          create: {
            userId,
            guildId,
            xp: 0,
            level: 1,
            coins: 1000, // Starting coins
          },
          update: {
            coins: { increment: 1000 },
          },
        });

        // Give 2 Cases (1 of each type)
        await tx.userCase.createMany({
          data: [
            { ownerId: userId, guildId, caseId: 1 }, // Dreams & Nightmares
            { ownerId: userId, guildId, caseId: 2 }, // Chroma 3
          ],
        });

        // Give 2 Keys
        await tx.userKey.createMany({
          data: [
            { ownerId: userId, guildId, keyDefId: 1 },
            { ownerId: userId, guildId, keyDefId: 1 },
          ],
        });
      });

      const embed = new EmbedBuilder()
        .setTitle('🎉 Welcome to CS:GO Bot!')
        .setDescription(`${interaction.user}, here's your **Starter Pack**:`)
        .setColor(0x00FF00)
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: '💰 Coins', value: '1000 coins', inline: true },
          { name: '📦 Cases', value: '1x 🌙 Dreams & Nightmares\n1x 🌈 Chroma 3', inline: true },
          { name: '🔑 Keys', value: '2x Universal Key', inline: true }
        )
        .addFields({
          name: '🚀 Get Started',
          value: '• Use `/open` to open your cases\n• Use `/daily` for daily rewards\n• Chat to gain XP and level up\n• Use `/shop` to buy more cases',
        })
        .setFooter({ text: 'Good luck with your unboxing!' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error giving starter pack:', error);
      await interaction.editReply('❌ An error occurred while giving you the starter pack.');
    }
  },
};
