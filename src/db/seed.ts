import prisma from './client';
import { dropTableService } from '../core/loot/dropTableService';

async function seed() {
  try {
    console.log('Starting database seed...');

    // Create default key definition
    console.log('Creating default key...');
    await prisma.keyDefinition.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Universal Key',
        description: 'Can open any case',
      },
    });

    // Sync drop tables from JSON files
    console.log('Syncing drop tables...');
    await dropTableService.syncDropTables();

    // Create some example shop items
    console.log('Creating shop items...');
    
    await prisma.shopItem.create({
      data: {
        type: 'case',
        caseDefId: 1,
        name: 'Classic Case',
        description: 'Standard case with classic skins',
        price: 500,
        isRotating: false,
      },
    });

    await prisma.shopItem.create({
      data: {
        type: 'case',
        caseDefId: 2,
        name: 'Knife Collection',
        description: 'Premium case with knife drops',
        price: 2000,
        isRotating: false,
      },
    });

    await prisma.shopItem.create({
      data: {
        type: 'key',
        keyDefId: 1,
        name: 'Universal Key',
        description: 'Opens any case',
        price: 200,
        isRotating: false,
      },
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
