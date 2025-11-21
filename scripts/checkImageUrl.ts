import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUrls() {
  const items = await prisma.itemDefinition.findMany({
    take: 10,
    orderBy: { id: 'asc' }
  });

  console.log('Sample item URLs:\n');
  items.forEach(item => {
    console.log(`${item.name}:`);
    console.log(`  ${item.iconUrl}`);
    console.log(`  Length: ${item.iconUrl?.length || 0}\n`);
  });

  await prisma.$disconnect();
}

checkUrls().catch(console.error);
