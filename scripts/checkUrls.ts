import prisma from '../src/db/client';

async function checkUrls() {
  const item = await prisma.itemDefinition.findFirst({
    where: {
      iconUrl: { not: null }
    },
    select: {
      name: true,
      iconUrl: true
    }
  });

  console.log('Item:', item?.name);
  console.log('URL length:', item?.iconUrl?.length);
  console.log('Full URL:', item?.iconUrl);
  
  process.exit(0);
}

checkUrls();
