import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { caseService } from '../../../core/loot/caseService';
import { RARITY_CONFIG, COLORS, getRarityDisplayName } from '../../../config/constants';
import { EmbedHelper } from '../../utils/embeds';
import { SteamImageFetcher } from '../../../core/scraper/steamImageFetcher';
import { getSteamImageProxyUrl } from '../../../core/utils/imageProxy';
import { searchSteamItem } from '../../../core/scraper/steamMarketClient';
import prisma from '../../../db/client';

export default {
  data: new SlashCommandBuilder()
    .setName('open')
    .setDescription('🎰 Open a CS:GO case to get random skins!')
    .addIntegerOption((option) =>
      option
        .setName('case')
        .setDescription('Which case to open')
        .setRequired(true)
        .addChoices(
          { name: '🌙 Dreams & Nightmares Case', value: 1 },
          { name: '🌈 Chroma 3 Case', value: 2 }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName('key')
        .setDescription('Which key to use')
        .setRequired(true)
        .addChoices({ name: '🔑 Universal Key', value: 1 })
    ),
  cooldown: 5,
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a server', ephemeral: true });
      return;
    }

    const caseId = interaction.options.getInteger('case', true);
    const keyId = interaction.options.getInteger('key', true);

      // Don't defer - we'll reply immediately with animation
      
    try {
      // Get case definition to show proper name
      const caseDefinition = await prisma.caseDefinition.findUnique({
        where: { id: caseId },
      });

      if (!caseDefinition) {
        const embed = new EmbedBuilder()
          .setTitle('❌ Case Not Found')
          .setDescription('This case does not exist!')
          .setColor(0xFF0000);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Check if user has the case (with guild context)
      const userCase = await prisma.userCase.findFirst({
        where: {
          ownerId: interaction.user.id,
          caseId: caseId,
        },
      });

      if (!userCase) {
        const embed = new EmbedBuilder()
          .setTitle('❌ No Case Found')
          .setDescription(`You don't have a **${caseDefinition.name}** to open!`)
          .setColor(0xFF0000)
          .addFields(
            { name: '🛒 How to get cases', value: '• Use `/shop` to view available cases\n• Use `/buy item:case_${caseId}` to purchase this case\n• Use `/daily` to earn coins' }
          )
          .setFooter({ text: '💡 Tip: You need both a case and a key to open!' });
        
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Check if user has a key
      const userKey = await prisma.userKey.findFirst({
        where: {
          ownerId: interaction.user.id,
          keyDefId: keyId,
        },
      });

      if (!userKey) {
        const embed = new EmbedBuilder()
          .setTitle('❌ No Key Found')
          .setDescription(`You don't have a **🔑 Universal Key** to open this case!`)
          .setColor(0xFF0000)
          .addFields(
            { name: '🛒 How to get keys', value: '• Use `/shop` to view keys\n• Use `/buy item:key_1` to purchase a key (200 coins)\n• Use `/daily` to earn coins' }
          )
          .setFooter({ text: '💡 Keys are consumed when opening cases' });
        
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Initial "Opening case..." message with animation
      const caseEmoji = caseDefinition.name.includes('Dreams') ? '🌙' : '🌈';
      
      const openingEmbed = new EmbedBuilder()
        .setTitle(`${caseEmoji} Opening ${caseDefinition.name}...`)
        .setDescription('🔄 **Spinning...**\n\n⚪⚪⚪⚪⚪⚪⚪')
        .setColor(0x808080)
        .setFooter({ text: '🎰 Good luck!' });

      await interaction.reply({ embeds: [openingEmbed] });

      // FIRST: Determine what item the user will get (do the roll)
      const result = await caseService.openCase(
        interaction.user.id,
        interaction.guild.id,
        caseId,
        keyId
      );

      // SECOND: While animating, fetch the image from Steam if not already cached
      let itemImageUrl = result.item.iconUrl;
      let itemPriceUSD: number | null = null;
      
      // Define rarity colors for animation
      const rarityColors = [
        { name: 'COMMON', color: 0xB0C3D9, emoji: '⚪' },      // White/Gray
        { name: 'UNCOMMON', color: 0x5E98D9, emoji: '🔵' },   // Light Blue
        { name: 'RARE', color: 0x4B69FF, emoji: '🔵' },       // Blue
        { name: 'EPIC', color: 0x8847FF, emoji: '🟣' },       // Purple
        { name: 'LEGENDARY', color: 0xD32CE6, emoji: '🟣' },  // Pink/Purple
        { name: 'EXOTIC', color: 0xEB4B4B, emoji: '🔴' },     // Red
      ];

      // Animation frames - speeds up then slows down like CS:GO
      const animationFrames = [
        { delay: 500, rarity: 0 },
        { delay: 400, rarity: 1 },
        { delay: 350, rarity: 2 },
        { delay: 300, rarity: 3 },
        { delay: 250, rarity: 4 },
        { delay: 300, rarity: 5 },
        { delay: 350, rarity: 0 },
        { delay: 450, rarity: 1 },
        { delay: 600, rarity: 2 },
      ];

      // THIRD: Animate while the image is being fetched (if needed)
      const animationPromise = (async () => {
        for (let i = 0; i < animationFrames.length; i++) {
          const frame = animationFrames[i];
          await new Promise(resolve => setTimeout(resolve, frame.delay));
          
          const currentRarity = rarityColors[frame.rarity];
          const bars = Array(7).fill(currentRarity.emoji).join('');
          
          const spinEmbed = new EmbedBuilder()
            .setTitle(`${caseEmoji} Opening ${caseDefinition.name}...`)
            .setDescription(`🔄 **Spinning...**\n\n${bars}`)
            .setColor(currentRarity.color)
            .setFooter({ text: '🎰 Rolling through the possibilities...' });

          await interaction.editReply({ embeds: [spinEmbed] });
        }
      })();

      // FOURTH: Fetch image and price from Steam Market in parallel
      const steamDataPromise = (async () => {
        try {
          // Fetch from Steam Market API (incluye imagen Y precio)
          console.log(`🔍 Fetching Steam data for: ${result.item.name}`);
          
          const steamItem = await searchSteamItem(result.item.name, 1); // 1 = USD
          
          if (steamItem) {
            if (steamItem.imageUrl) {
              itemImageUrl = steamItem.imageUrl;
              console.log(`✅ Found image: ${steamItem.imageUrl}`);
            }
            if (steamItem.priceUSD > 0) {
              itemPriceUSD = steamItem.priceUSD;
              console.log(`💲 Steam Market price: $${steamItem.priceUSD.toFixed(2)} USD`);
            }
          } else {
            console.log(`⚠️ No data found on Steam Market for ${result.item.name}`);
          }
        } catch (error) {
          console.error('Error fetching Steam Market data:', error);
        }
      })();

      // Wait for both animation and Steam data fetching to complete
      await Promise.all([animationPromise, steamDataPromise]);

      // Show final rarity color before revealing
      const resultRarityColor = rarityColors.find(r => r.name === result.item.rarity) || rarityColors[0];
      const finalBars = Array(7).fill(resultRarityColor.emoji).join('');
      
      const revealingEmbed = new EmbedBuilder()
        .setTitle(`${caseEmoji} Opening ${caseDefinition.name}...`)
        .setDescription(`✨ **Revealing...**\n\n${finalBars}`)
        .setColor(resultRarityColor.color)
        .setFooter({ text: '🎊 You got something!' });

      await interaction.editReply({ embeds: [revealingEmbed] });
      
      // Final reveal with a dramatic pause
      await new Promise(resolve => setTimeout(resolve, 800));      const rarityEmojis: { [key: string]: string } = {
        COMMON: '⚪',
        UNCOMMON: '🔵',
        RARE: '🔵',
        EPIC: '🟣',
        LEGENDARY: '🟣',
        EXOTIC: '🔴'
      };
      
      // Final reveal embed
      const finalEmbed = new EmbedBuilder()
        .setTitle(`${caseEmoji} Case Opened!`)
        .setDescription(`**🎉 ${interaction.user.username} unboxed:**\n\n${rarityEmojis[result.item.rarity]} **${result.item.name}**`)
        .setColor(RARITY_CONFIG[result.item.rarity as keyof typeof RARITY_CONFIG].color);
      
      // Add fields
      const fields: Array<{ name: string; value: string; inline: boolean }> = [
        { name: '✨ Rarity', value: getRarityDisplayName(result.item.rarity), inline: true },
        { name: '💰 Bonus Coins', value: `+${result.bonusCoins}`, inline: true },
        { name: '⭐ Bonus XP', value: `+${result.bonusXP}`, inline: true }
      ];
      
      // Add Steam Market price if available
      if (itemPriceUSD !== null && itemPriceUSD > 0) {
        fields.push({ name: '💵 Market Value', value: `$${(itemPriceUSD as number).toFixed(2)} USD`, inline: true });
      }
      
      finalEmbed.addFields(fields);
      finalEmbed.setFooter({ text: `Use /inventory to see all your items | Opened: ${caseEmoji} ${caseDefinition.name}` });
      finalEmbed.setTimestamp();

      // Add item image if available (should be loaded by now)
      const imageToShow = itemImageUrl || result.item.iconUrl;
      if (imageToShow) {
        // Convert Steam CDN URL to our proxy URL so Discord accepts it
        const proxiedUrl = getSteamImageProxyUrl(imageToShow);
        
        if (proxiedUrl) {
          // Silently try to set image, but don't fail if it doesn't work
          try {
            finalEmbed.setThumbnail(proxiedUrl);
          } catch (err) {
            // Image failed, continue without it
          }
        }
      }

      await interaction.editReply({ embeds: [finalEmbed] });
    } catch (error: any) {
      const embed = EmbedHelper.error(error.message || 'Failed to open case');
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
