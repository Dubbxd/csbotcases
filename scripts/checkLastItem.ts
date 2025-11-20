import prisma from '../src/db/client';

async function checkLastOpenedItem() {
  const lastItem = await prisma.userItem.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      itemDef: {
        select: {
          name: true,
          weapon: true,
          skin: true,
          iconUrl: true,
          rarity: true
        }
      }
    }
  });

  if (!lastItem) {
    console.log('❌ No items found');
    return;
  }

  console.log('🎰 Último item abierto:');
  console.log(`  Name: ${lastItem.itemDef.name}`);
  console.log(`  Weapon: ${lastItem.itemDef.weapon}`);
  console.log(`  Skin: ${lastItem.itemDef.skin}`);
  console.log(`  Rarity: ${lastItem.itemDef.rarity}`);
  console.log(`  IconUrl: ${lastItem.itemDef.iconUrl}`);
  console.log('');
  console.log('🔗 Probando el URL en Discord:');
  console.log(lastItem.itemDef.iconUrl);

  await prisma.$disconnect();
}

checkLastOpenedItem();
