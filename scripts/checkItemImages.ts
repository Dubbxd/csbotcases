import prisma from '../src/db/client';

async function checkImages() {
  const items = await prisma.itemDefinition.findMany({
    where: {
      caseDropItems: {
        some: { caseId: 1 }
      }
    },
    select: {
      name: true,
      iconUrl: true,
      weapon: true,
      skin: true,
      rarity: true
    },
    take: 5
  });

  console.log('📦 Primeros 5 items de Dreams & Nightmares Case:\n');
  items.forEach(item => {
    console.log(`${item.rarity} - ${item.name}`);
    console.log(`  Weapon: ${item.weapon}`);
    console.log(`  Skin: ${item.skin}`);
    console.log(`  IconUrl: ${item.iconUrl || 'NULL ❌'}`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkImages();
