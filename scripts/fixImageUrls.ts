import prisma from '../src/db/client';

/**
 * Fix Steam image URLs by removing size parameters that cause 404
 * URLs like /256fx256f, /512fx512f cause 404 on Steam CDN
 */
async function fixImageUrls() {
  console.log('🔧 Starting image URL fix...\n');

  try {
    // Get all items with iconUrl containing size parameters
    const items = await prisma.itemDefinition.findMany({
      where: {
        iconUrl: {
          contains: 'fx',
        },
      },
    });

    console.log(`Found ${items.length} items with size parameters in iconUrl\n`);

    let fixed = 0;
    for (const item of items) {
      if (!item.iconUrl) continue;

      let newUrl = item.iconUrl;
      let changed = false;

      // Remove various size parameters
      if (newUrl.includes('/256fx256f')) {
        newUrl = newUrl.replace('/256fx256f', '');
        changed = true;
      } else if (newUrl.includes('/512fx512f')) {
        newUrl = newUrl.replace('/512fx512f', '');
        changed = true;
      } else if (newUrl.includes('/360fx360f')) {
        newUrl = newUrl.replace('/360fx360f', '');
        changed = true;
      } else if (newUrl.includes('/128fx128f')) {
        newUrl = newUrl.replace('/128fx128f', '');
        changed = true;
      }

      if (changed) {
        await prisma.itemDefinition.update({
          where: { id: item.id },
          data: { iconUrl: newUrl },
        });

        console.log(`✅ Fixed: ${item.name}`);
        console.log(`   Old: ${item.iconUrl}`);
        console.log(`   New: ${newUrl}\n`);
        fixed++;
      }
    }

    console.log(`\n✅ Done! Fixed ${fixed} image URLs`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImageUrls();
