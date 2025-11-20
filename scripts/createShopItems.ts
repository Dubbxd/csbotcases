import prisma from '../src/db/client';

async function main() {
  // Create shop items for both CS2 cases
  await prisma.shopItem.create({
    data: {
      type: 'case',
      name: 'Dreams & Nightmares Case',
      description: 'Community-designed skins from the Dreams & Nightmares contest',
      price: 500,
      caseDefId: 1,
      isRotating: false,
    },
  });
  console.log('✅ Created shop item for Dreams & Nightmares Case (500 coins)');

  await prisma.shopItem.create({
    data: {
      type: 'case',
      name: 'Chroma 3 Case',
      description: 'Contains colorful weapon finishes and rare knives',
      price: 750,
      caseDefId: 2,
      isRotating: false,
    },
  });
  console.log('✅ Created shop item for Chroma 3 Case (750 coins)');

  const allItems = await prisma.shopItem.findMany({
    where: { type: 'case' },
  });
  
  console.log('\n🛒 Case shop items:');
  allItems.forEach(item => {
    console.log(`  ${item.name} - ${item.price} coins (caseId: ${item.caseDefId})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
