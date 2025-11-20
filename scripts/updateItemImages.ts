import prisma from '../src/db/client';

/**
 * Update item images with example Steam URLs
 * This is a one-time script to add images to existing items
 */
async function updateItemImages() {
  console.log('Updating item images...');

  // Example CS:GO weapon image URLs from Steam
  const imageUpdates = [
    {
      weapon: 'MP9',
      skin: 'Deadly Poison',
      iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6r8FA957OXJfzdF_8iDlo-KmIHLpbn0xGoI78B73uqY9N_z2gfh80drNW_yJYWLcjBgfxiOrVeBdxiBzGPf2A/256fx256f',
    },
    {
      weapon: 'AK-47',
      skin: 'Redline',
      iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyUJ6sR03b3CpdSh3lDt80I5NWCld9edI1I3Yw3W_FLsk-y7jMfovJ6dn3Bnv3Nw7S7dzRLk1B5LOO1sg_CACQLJuLkw-8g/256fx256f',
    },
    {
      weapon: 'AWP',
      skin: 'Dragon Lore',
      iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAZt7PLDPzBHyMuylZO0m_7zO6_ummpD78A_37iTpNqm0FDg_BBoMTr2ItOVegE6Zw3Y-FO-kL3ogJC9vpnByCBjuSYk4HmJn0GyhB5LPeBo1-XLVxzAUP5ZQKPX/256fx256f',
    },
    {
      weapon: 'M4A4',
      skin: 'Howl',
      iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alDLPIhm5D19R0i_rVyoHwjF2hpl1rZDz2d4OWcQZqYF_W_FK7wOm5hJG96ZnXiSw0oOtM9jk/256fx256f',
    },
    {
      weapon: 'Glock-18',
      skin: 'Fade',
      iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0Ob3djFN79fnzL-ckvbnNrfum25V4dB8teXA54vwxg3sqEJrYzylI46QclQ4YQ3Z-wfqk-zm18O4vpnJnWwj5Hf4Gz45fg/256fx256f',
    },
    {
      weapon: 'Desert Eagle',
      skin: 'Blaze',
      iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PDdTjlH_9mkgI-KkPDmPYTck29Y_cg_3L2Y84-i21btrRJkMGj6d9DBdFQ4YASB-gC3krrvhpDt75nJz3Y3uHQg7WGdwUL7wFKg9Q/256fx256f',
    },
  ];

  for (const update of imageUpdates) {
    try {
      const result = await prisma.itemDefinition.updateMany({
        where: {
          weapon: update.weapon,
          skin: update.skin,
        },
        data: {
          iconUrl: update.iconUrl,
        },
      });

      if (result.count > 0) {
        console.log(`✅ Updated ${result.count} items for ${update.weapon} | ${update.skin}`);
      } else {
        console.log(`⚠️  No items found for ${update.weapon} | ${update.skin}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${update.weapon} | ${update.skin}:`, error);
    }
  }

  console.log('\n✨ Done updating item images!');
}

// Run the script
updateItemImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
