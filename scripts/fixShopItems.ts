import prisma from '../src/db/client';

async function main() {
  // Delete old shop item that references non-existent case ID 2
  await prisma.shopItem.deleteMany({
    where: {
      caseDefId: 2,
    },
  });
  console.log('✅ Deleted shop item for non-existent case ID 2');

  // Create shop item for Chroma 3 Case (ID: 3)
  const chroma3Shop = await prisma.shopItem.create({
    data: {
      type: 'case',
      name: 'Chroma 3 Case',
      description: 'Contains colorful weapon finishes and rare knives',
      price: 750,
      caseDefId: 3,
      isRotating: false,
    },
  });
  console.log('✅ Created shop item for Chroma 3 Case');

  // Show all shop items
  const shopItems = await prisma.shopItem.findMany({
    include: {
      caseDef: true,
      keyDef: true,
    },
  });

  console.log('\n🛒 Updated Shop Items:');
  shopItems.forEach(item => {
    const ref = item.type === 'case' 
      ? `${item.caseDef?.name}` 
      : `${item.keyDef?.name}`;
    console.log(`  ${item.name} - ${item.price} coins (${ref})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
