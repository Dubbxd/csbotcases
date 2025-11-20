import prisma from '../src/db/client';

async function main() {
  const cases = await prisma.caseDefinition.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  console.log('📦 Cases in database:');
  console.log(JSON.stringify(cases, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
