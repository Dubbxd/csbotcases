import prisma from '../src/db/client';

async function giveItems() {
  const userId = '408080646783631361'; // dubbxd
  const guildId = '1432825442544648346'; // Apps Test

  console.log('🎁 Giving items to dubbxd...');

  // Ensure user exists
  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  // Ensure profile exists
  await prisma.userGuildProfile.upsert({
    where: { userId_guildId: { userId, guildId } },
    create: {
      userId,
      guildId,
      xp: 0,
      level: 1,
      coins: 5000,
    },
    update: {},
  });

  // Give 11 Dreams & Nightmares Cases
  const cases = [];
  for (let i = 0; i < 11; i++) {
    cases.push({
      ownerId: userId,
      guildId: guildId,
      caseId: 1, // Dreams & Nightmares
    });
  }

  await prisma.userCase.createMany({
    data: cases,
  });

  // Give 1 Universal Key
  await prisma.userKey.create({
    data: {
      ownerId: userId,
      guildId: guildId,
      keyDefId: 1,
    },
  });

  console.log('✅ Dado:');
  console.log('  📦 11x Dreams & Nightmares Case');
  console.log('  🔑 1x Universal Key');

  await prisma.$disconnect();
}

giveItems();
