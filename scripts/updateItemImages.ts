/**
 * Script para actualizar las URLs de imágenes de items usando Steam Market API
 */

import prisma from '../src/db/client';
import { searchSteamItem } from '../src/core/scraper/steamMarketClient';

async function updateItemImages() {
  console.log('🔄 Actualizando URLs de imágenes y precios desde Steam Market (MXN)...\n');

  // Obtener todos los items
  const items = await prisma.itemDefinition.findMany({
    select: {
      id: true,
      name: true,
      iconUrl: true,
    },
  });

  console.log(`📦 Encontrados ${items.length} items\n`);

  let updated = 0;
  let failed = 0;

  for (const item of items) {
    console.log(`🔍 Buscando: ${item.name}`);

    try {
      // Buscar el item en Steam Market con moneda MXN (7)
      const steamItem = await searchSteamItem(item.name, 7);

      if (steamItem?.imageUrl) {
        // Actualizar la URL de la imagen
        await prisma.itemDefinition.update({
          where: { id: item.id },
          data: { 
            iconUrl: steamItem.imageUrl,
            // Opcionalmente podrías agregar un campo de precio si lo tienes en el schema
            // marketPriceMXN: steamItem.priceMXN
          },
        });

        console.log(`   ✅ Actualizado: ${steamItem.imageUrl.substring(0, 80)}...`);
        console.log(`   💰 Precio MXN: $${steamItem.priceMXN.toFixed(2)}`);
        updated++;
      } else {
        console.log(`   ⚠️  No se encontró en Steam Market`);
        failed++;
      }

      // Delay para respetar rate limits de Steam (2 segundos entre requests)
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
      failed++;
    }

    console.log('');
  }

  console.log('\n📊 Resumen:');
  console.log(`   ✅ Actualizados: ${updated}`);
  console.log(`   ❌ Fallidos: ${failed}`);
  console.log(`   📦 Total: ${items.length}`);

  await prisma.$disconnect();
}

updateItemImages()
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
