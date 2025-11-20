import prisma from '../src/db/client';

async function main() {
  // Delete duplicate Dreams & Nightmares Case (ID: 2)
  await prisma.caseDefinition.delete({
    where: { id: 2 },
  });

  console.log('✅ Caja duplicada (ID: 2) eliminada');

  // Show remaining cases
  const cases = await prisma.caseDefinition.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  console.log('\n📦 Cajas restantes:');
  console.log(JSON.stringify(cases, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
