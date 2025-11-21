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
      
      // Get all possible items from the case for realistic carousel
      const possibleItems = await prisma.caseDropItem.findMany({
        where: { caseId: caseDefinition.id },
        include: { itemDef: true }
      });

      // Create a carousel of items (won item in the middle)
      const createCarousel = () => {
        const items = [];
        // Add 5 random items before
        for (let i = 0; i < 5; i++) {
          const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
          items.push(randomItem.itemDef);
        }
        // Add the winning item (position 5)
        items.push(result.item);
        // Add 5 random items after
        for (let i = 0; i < 5; i++) {
          const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
          items.push(randomItem.itemDef);
        }
        return items;
      };

      const carousel = createCarousel();
      
      // CS:GO-style animation with deceleration
      // Start fast, gradually slow down, then crawl to the winning item
      const animationFrames = [
        // Fast start (100ms each)
        { delay: 100, position: 0 },
        { delay: 100, position: 1 },
        { delay: 100, position: 2 },
        // Medium speed (150ms each)
        { delay: 150, position: 3 },
        { delay: 150, position: 4 },
        // Slowing down (200-300ms)
        { delay: 200, position: 5 },
        { delay: 250, position: 6 },
        { delay: 300, position: 7 },
        // Crawling to winner (400-700ms)
        { delay: 400, position: 8 },
        { delay: 500, position: 9 },
        { delay: 600, position: 10 },
      ];

      // THIRD: CS:GO-style carousel animation
      const animationPromise = (async () => {
        for (let i = 0; i < animationFrames.length; i++) {
          const frame = animationFrames[i];
          await new Promise(resolve => setTimeout(resolve, frame.delay));
          
          // Create a 7-slot window (3 before, 1 center, 3 after)
          const windowStart = Math.max(0, frame.position - 3);
          const window = carousel.slice(windowStart, windowStart + 7);
          
          // Pad if needed
          while (window.length < 7) {
            const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
            window.push(randomItem.itemDef);
          }

          // Get rarity emoji for each item in window
          const rarityEmojis: { [key: string]: string } = {
            COMMON: '⚪',
            UNCOMMON: '🔵',
            RARE: '🟣',
            VERY_RARE: '🩷',
            LEGENDARY: '🔴',
            EXOTIC: '⭐'
          };

          const displayItems = window.map(item => rarityEmojis[item.rarity] || '⚪').join('');
          const centerIndex = Math.min(3, frame.position);
          const centerItem = window[centerIndex];
          
          // Highlight center position with arrow
          let displayText = '';
          for (let j = 0; j < window.length; j++) {
            if (j === 3) {
              displayText += `**[${rarityEmojis[window[j].rarity]}]**`;
            } else {
              displayText += rarityEmojis[window[j].rarity];
            }
          }

          const spinEmbed = new EmbedBuilder()
            .setTitle(`${caseEmoji} Opening ${caseDefinition.name}...`)
            .setDescription(`🎰 **Rolling...**\n\n${displayText}\n\n↓`)
            .setColor(RARITY_CONFIG[centerItem.rarity as keyof typeof RARITY_CONFIG]?.color || 0x5865F2)
            .setFooter({ text: `🎲 Spinning through possibilities...` });

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

      // Final slow-motion reveal (last 3 positions)
      const rarityEmojis: { [key: string]: string } = {
        COMMON: '⚪',
        UNCOMMON: '🔵',
        RARE: '🟣',
        VERY_RARE: '🩷',
        LEGENDARY: '🔴',
        EXOTIC: '⭐'
      };

      // Show the winning item centered with final slow animation
      const finalWindow = carousel.slice(2, 9); // Item at position 5 will be in center
      const finalDisplay = finalWindow.map((item, idx) => {
        if (idx === 3) {
          return `**[${rarityEmojis[item.rarity]}]**`;
        }
        return rarityEmojis[item.rarity];
      }).join('');

      const revealingEmbed = new EmbedBuilder()
        .setTitle(`${caseEmoji} ${caseDefinition.name}`)
        .setDescription(`✨ **You unboxed...**\n\n${finalDisplay}\n\n↓`)
        .setColor(RARITY_CONFIG[result.item.rarity as keyof typeof RARITY_CONFIG].color)
        .setFooter({ text: '🎊 Opening complete!' });

      await interaction.editReply({ embeds: [revealingEmbed] });
      
      // Dramatic pause before final reveal
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Special messages for rare items
      let specialMessage = '';
      if (result.item.rarity === 'EXOTIC') {
        specialMessage = '\n\n🌟 **EXCEEDINGLY RARE!** 🌟\n*An incredibly lucky drop!*';
      } else if (result.item.rarity === 'LEGENDARY') {
        specialMessage = '\n\n🔥 **COVERT DROP!** 🔥\n*Extremely rare find!*';
      } else if (result.item.rarity === 'VERY_RARE') {
        specialMessage = '\n\n💎 **CLASSIFIED!** 💎\n*High tier drop!*';
      }
      
      // Final reveal embed
      const finalEmbed = new EmbedBuilder()
        .setTitle(`${caseEmoji} Case Opened!`)
        .setDescription(`**🎉 ${interaction.user.username} unboxed:**\n\n${rarityEmojis[result.item.rarity]} **${result.item.name}**${specialMessage}`)
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
