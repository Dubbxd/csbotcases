import prisma from '../src/db/client';

async function main() {
  const keys = await prisma.keyDefinition.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  console.log('🔑 Keys in database:');
  console.log(JSON.stringify(keys, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
