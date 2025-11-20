import prisma from '../src/db/client';

async function main() {
  const [cases, keys, shopItems] = await Promise.all([
    prisma.caseDefinition.findMany({
      select: { id: true, name: true, description: true },
    }),
    prisma.keyDefinition.findMany({
      select: { id: true, name: true, description: true },
    }),
    prisma.shopItem.findMany({
      select: { id: true, name: true, price: true, type: true, caseDefId: true, keyDefId: true },
    }),
  ]);

  console.log('📦 CASES:');
  cases.forEach(c => console.log(`  ID ${c.id}: ${c.name} - ${c.description}`));
  
  console.log('\n🔑 KEYS:');
  keys.forEach(k => console.log(`  ID ${k.id}: ${k.name} - ${k.description}`));
  
  console.log('\n🛒 SHOP ITEMS:');
  shopItems.forEach(s => {
    const ref = s.type === 'case' ? `caseId:${s.caseDefId}` : `keyId:${s.keyDefId}`;
    console.log(`  ID ${s.id}: ${s.name} - ${s.price} coins (${ref})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
