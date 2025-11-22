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

      // Initial "Opening case..." message with hype
      const caseEmoji = caseDefinition.name.includes('Dreams') ? '🌙' : '🌈';
      
      const openingEmbed = new EmbedBuilder()
        .setTitle(`${caseEmoji} ${caseDefinition.name}`)
        .setDescription(`🎰 **${interaction.user.username} is opening a case!**\n\n💨💨💨 *Initializing...*\n\n🔑 Key inserted\n🔓 Unlocking...\n⚡ Rolling the odds...`)
        .setColor(0xFFD700)
        .setFooter({ text: '🍀 Good luck! May the odds be in your favor!' });

      await interaction.reply({ embeds: [openingEmbed] });
      
      // Brief pause for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 800));

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
      
      // CS:GO-style animation with realistic deceleration curve
      // Ultra-fast start, smooth deceleration, dramatic crawl to winner
      const animationFrames = [
        // Lightning fast start (60ms each) - BLUR EFFECT
        { delay: 60, position: 0, status: '💨 **SPINNING...**' },
        { delay: 60, position: 1, status: '💨 **SPINNING...**' },
        { delay: 80, position: 2, status: '💨 **SPINNING FAST...**' },
        { delay: 90, position: 3, status: '💨 **SPINNING FAST...**' },
        // Medium speed (120-180ms) - visible items
        { delay: 120, position: 4, status: '🎰 **Rolling...**' },
        { delay: 150, position: 5, status: '🎰 **Rolling...**' },
        { delay: 180, position: 6, status: '🎲 **Slowing down...**' },
        // Slowing down (220-300ms) - building tension
        { delay: 220, position: 7, status: '⏳ **Almost there...**' },
        { delay: 260, position: 8, status: '⏳ **Almost there...**' },
        { delay: 300, position: 9, status: '✨ **So close...**' },
        // Final crawl (400-800ms) - MAXIMUM TENSION
        { delay: 400, position: 10, status: '🔮 **Revealing...**' },
        { delay: 500, position: 11, status: '🔮 **Revealing...**' },
        { delay: 650, position: 12, status: '🎊 **HERE IT COMES...**' },
        { delay: 750, position: 13, status: '🎊 **HERE IT COMES...**' },
        { delay: 900, position: 14, status: '🌟 **REVEALED!**' },
      ];

      // THIRD: Enhanced CS:GO-style carousel animation with visual effects
      const animationPromise = (async () => {
        for (let i = 0; i < animationFrames.length; i++) {
          const frame = animationFrames[i];
          await new Promise(resolve => setTimeout(resolve, frame.delay));
          
          // Create a 9-slot window for better visual effect (4 before, 1 center, 4 after)
          const windowStart = Math.max(0, frame.position - 4);
          const window = carousel.slice(windowStart, windowStart + 9);
          
          // Pad if needed
          while (window.length < 9) {
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

          const centerIndex = 4; // Middle of 9-slot window
          const centerItem = window[centerIndex];
          
          // Create visual effect based on speed
          let displayText = '';
          const isBlurred = i < 4; // First 4 frames are blurred
          const isPulsing = i >= animationFrames.length - 5; // Last 5 frames pulse
          
          if (isBlurred) {
            // Blur effect: show items smaller and closer together
            displayText = window.map((item, idx) => {
              if (idx === centerIndex) {
                return `**〔${rarityEmojis[item.rarity]}〕**`;
              }
              return rarityEmojis[item.rarity];
            }).join('');
          } else if (isPulsing) {
            // Pulsing effect: larger spacing, glowing center
            displayText = window.map((item, idx) => {
              if (idx === centerIndex) {
                return ` ✨**【${rarityEmojis[item.rarity]}】**✨ `;
              } else if (Math.abs(idx - centerIndex) === 1) {
                return ` ${rarityEmojis[item.rarity]} `;
              }
              return rarityEmojis[item.rarity];
            }).join('');
          } else {
            // Normal speed: clear view with highlight
            displayText = window.map((item, idx) => {
              if (idx === centerIndex) {
                return ` **[${rarityEmojis[item.rarity]}]** `;
              }
              return rarityEmojis[item.rarity];
            }).join(' ');
          }

          // Dynamic color based on what's in center
          let embedColor = RARITY_CONFIG[centerItem.rarity as keyof typeof RARITY_CONFIG]?.color || 0x5865F2;
          
          // Add extra flair for rare items
          let footerText = '🎲 Spinning through possibilities...';
          if (isPulsing && centerItem.rarity === 'EXOTIC') {
            footerText = '🌟✨ SOMETHING SPECIAL IS COMING... ✨🌟';
          } else if (isPulsing && centerItem.rarity === 'LEGENDARY') {
            footerText = '🔥 RARE DROP INCOMING! 🔥';
          } else if (isPulsing) {
            footerText = '💎 Almost revealed...';
          }

          const spinEmbed = new EmbedBuilder()
            .setTitle(`${caseEmoji} ${caseDefinition.name}`)
            .setDescription(`${frame.status}\n\n${displayText}\n\n${isPulsing ? '⬇️  ⬇️  ⬇️' : '↓'}`)
            .setColor(embedColor)
            .setFooter({ text: footerText });

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

      // Final slow-motion reveal with multiple tension-building stages
      const rarityEmojis: { [key: string]: string } = {
        COMMON: '⚪',
        UNCOMMON: '🔵',
        RARE: '🟣',
        VERY_RARE: '🩷',
        LEGENDARY: '🔴',
        EXOTIC: '⭐'
      };

      // Stage 1: Lock in position (600ms)
      const finalWindow = carousel.slice(2, 11);
      const lockDisplay = finalWindow.map((item, idx) => {
        if (idx === 4) {
          return ` 🔒**[${rarityEmojis[item.rarity]}]**🔒 `;
        }
        return rarityEmojis[item.rarity];
      }).join(' ');

      const lockEmbed = new EmbedBuilder()
        .setTitle(`${caseEmoji} ${caseDefinition.name}`)
        .setDescription(`🎯 **LOCKED IN!**\n\n${lockDisplay}\n\n⬇️  ⬇️  ⬇️`)
        .setColor(RARITY_CONFIG[result.item.rarity as keyof typeof RARITY_CONFIG].color)
        .setFooter({ text: '🎊 Checking your drop...' });

      await interaction.editReply({ embeds: [lockEmbed] });
      await new Promise(resolve => setTimeout(resolve, 600));

      // Stage 2: Building suspense (700ms)
      const suspenseDisplay = ` ✨✨ **【${rarityEmojis[result.item.rarity]}】** ✨✨ `;
      
      const suspenseEmbed = new EmbedBuilder()
        .setTitle(`${caseEmoji} ${caseDefinition.name}`)
        .setDescription(`🌟 **Revealing your drop...**\n\n${suspenseDisplay}\n\n━━━━━━━━━━━━━━━`)
        .setColor(RARITY_CONFIG[result.item.rarity as keyof typeof RARITY_CONFIG].color)
        .setFooter({ text: result.item.rarity === 'EXOTIC' ? '🌟 EXTRAORDINARY LUCK! 🌟' : result.item.rarity === 'LEGENDARY' ? '🔥 INCREDIBLE DROP! 🔥' : '💎 Here it comes...' });

      await interaction.editReply({ embeds: [suspenseEmbed] });
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Special messages for rare items with MAXIMUM HYPE
      let specialMessage = '';
      if (result.item.rarity === 'EXOTIC') {
        specialMessage = '\n\n🌟✨⭐ **EXCEEDINGLY RARE!** ⭐✨🌟\n*JACKPOT! Only 0.1% chance!*\n━━━━━━━━━━━━━━━━━';
      } else if (result.item.rarity === 'LEGENDARY') {
        specialMessage = '\n\n🔥💥🔴 **COVERT DROP!** 🔴💥🔥\n*LEGENDARY! Only 1% chance!*\n━━━━━━━━━━━━━━━━━';
      } else if (result.item.rarity === 'VERY_RARE') {
        specialMessage = '\n\n💎🩷✨ **CLASSIFIED!** ✨🩷💎\n*High tier! Only 4% chance!*';
      } else if (result.item.rarity === 'RARE') {
        specialMessage = '\n\n🟣 **RESTRICTED!** 🟣\n*Nice pull! 10% drop rate*';
      }
      
      // Final reveal embed with MAXIMUM EXCITEMENT
      const finalEmbed = new EmbedBuilder()
        .setTitle(`${caseEmoji} 🎉 CASE OPENED! 🎉`)
        .setDescription(`**${interaction.user.username} unboxed:**\n\n${rarityEmojis[result.item.rarity]} ✨ **${result.item.name}** ✨${specialMessage}`)
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
