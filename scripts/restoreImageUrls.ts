import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restoreImageUrls() {
  console.log('🔧 Restoring image URLs with size parameters...\n');

  // Find all items where the URL doesn't have a size parameter
  const items = await prisma.itemDefinition.findMany({
    where: {
      AND: [
        {
          iconUrl: {
            contains: 'community.cloudflare.steamstatic.com/economy/image/',
          },
        },
        {
          iconUrl: {
            not: {
              contains: 'fx',
            },
          },
        },
      ],
    },
  });

  console.log(`Found ${items.length} items without size parameters\n`);

  for (const item of items) {
    if (!item.iconUrl) continue;

    // Add /256fx256f to the end of the URL
    const newUrl = item.iconUrl + '/256fx256f';

    await prisma.itemDefinition.update({
      where: { id: item.id },
      data: { iconUrl: newUrl },
    });

    console.log(`✅ Restored: ${item.name}`);
    console.log(`  New: ${newUrl.substring(newUrl.length - 60)}\n`);
  }

  console.log(`✅ Done! Restored ${items.length} image URLs`);
  await prisma.$disconnect();
}

restoreImageUrls().catch(console.error);
