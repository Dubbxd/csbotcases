import prisma from '../src/db/client';

async function main() {
  // Borrar items antiguos
  await prisma.shopItem.deleteMany({
    where: { 
      OR: [
        { type: 'case' },
        { type: 'key' }
      ]
    },
  });

  // Crear cajas
  await prisma.shopItem.createMany({
    data: [
      {
        type: 'case',
        name: 'Dreams & Nightmares Case',
        description: 'Community-designed skins from the Dreams & Nightmares contest',
        price: 500,
        caseDefId: 1,
        isRotating: false,
      },
      {
        type: 'case',
        name: 'Chroma 3 Case',
        description: 'Contains colorful weapon finishes and rare knives',
        price: 750,
        caseDefId: 2,
        isRotating: false,
      },
      {
        type: 'key',
        name: 'Universal Key',
        description: 'Can open any case',
        price: 200,
        keyDefId: 1,
        isRotating: false,
      },
    ],
  });

  console.log('✅ Shop items actualizados con IDs correctos (1 y 2)');

  const cases = await prisma.shopItem.findMany({
    where: { type: 'case' },
  });
  
  const keys = await prisma.shopItem.findMany({
    where: { type: 'key' },
  });

  console.log('\n🛒 Shop items:');
  console.log('📦 Cases:');
  cases.forEach(i => console.log(`  ${i.name} - ${i.price} coins (caseId: ${i.caseDefId})`));
  console.log('🔑 Keys:');
  keys.forEach(i => console.log(`  ${i.name} - ${i.price} coins (keyId: ${i.keyDefId})`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
