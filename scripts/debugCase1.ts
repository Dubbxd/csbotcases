import prisma from '../src/db/client';

async function main() {
  console.log('🔍 Debugging Case 1 (Dreams & Nightmares)...\n');

  // Check case exists
  const caseInfo = await prisma.caseDefinition.findUnique({
    where: { id: 1 },
  });
  console.log('📦 Case Info:', caseInfo);

  // Check drop tables
  const dropTables = await prisma.caseDropTable.findMany({
    where: { caseId: 1 },
    orderBy: { probability: 'desc' },
  });
  console.log('\n📊 Drop Tables:');
  dropTables.forEach(dt => {
    console.log(`  ${dt.rarity}: ${(dt.probability * 100).toFixed(2)}%`);
  });

  // Check drop items by rarity
  console.log('\n🎯 Items by Rarity:');
  for (const table of dropTables) {
    const items = await prisma.caseDropItem.findMany({
      where: {
        caseId: 1,
        rarity: table.rarity,
      },
      include: {
        itemDef: true,
      },
    });
    console.log(`\n  ${table.rarity} (${items.length} items):`);
    items.forEach(item => {
      console.log(`    - ${item.itemDef.weapon} | ${item.itemDef.skin} (weight: ${item.weight})`);
    });
  }

  // Check total items
  const totalItems = await prisma.caseDropItem.count({
    where: { caseId: 1 },
  });
  console.log(`\n✅ Total items in case 1: ${totalItems}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
