import prisma from '../src/db/client';

async function check() {
  const item = await prisma.itemDefinition.findFirst({
    where: { 
      weapon: 'XM1014',
      skin: 'Zombie Offensive'
    },
    select: { 
      name: true, 
      iconUrl: true 
    }
  });

  console.log('Item:', item?.name);
  console.log('URL length:', item?.iconUrl?.length);
  console.log('Full URL:');
  console.log(item?.iconUrl);

  await prisma.$disconnect();
}

check();
