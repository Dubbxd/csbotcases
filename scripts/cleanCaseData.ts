import prisma from '../src/db/client';

async function main() {
  console.log('🗑️  Cleaning up old case data...\n');

  // Delete all case-related data
  await prisma.caseDropItem.deleteMany({});
  console.log('✅ Deleted all CaseDropItem records');

  await prisma.caseDropTable.deleteMany({});
  console.log('✅ Deleted all CaseDropTable records');

  await prisma.itemDefinition.deleteMany({});
  console.log('✅ Deleted all ItemDefinition records');

  await prisma.userItem.deleteMany({});
  console.log('✅ Deleted all UserItem records');

  await prisma.userCase.deleteMany({});
  console.log('✅ Deleted all UserCase records');

  await prisma.caseDefinition.deleteMany({});
  console.log('✅ Deleted all CaseDefinition records');

  await prisma.shopItem.deleteMany({
    where: { type: 'case' },
  });
  console.log('✅ Deleted case shop items');

  console.log('\n✨ Ready to re-seed with CS2 cases!');
  console.log('Run: npx tsx src/db/seedCS2Cases.ts');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
