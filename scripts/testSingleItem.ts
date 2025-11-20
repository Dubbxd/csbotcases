/**
 * Test fetching a single item from Steam Market
 */

import { searchSteamItem } from '../src/core/scraper/steamMarketClient';

async function testItem() {
  console.log('🧪 Testing Steam Market API with a single item...\n');
  
  const testItemName = 'G3SG1 | Dream Glade';
  
  try {
    console.log(`🔍 Searching for: "${testItemName}"`);
    const result = await searchSteamItem(testItemName, 1); // USD
    
    if (result) {
      console.log('\n✅ Success!');
      console.log('━'.repeat(60));
      console.log(`📦 Name: ${result.name}`);
      console.log(`💵 Price USD: $${result.priceUSD.toFixed(2)}`);
      console.log(`💰 Price MXN: $${result.priceMXN.toFixed(2)}`);
      console.log(`🖼️  Image URL: ${result.imageUrl}`);
      console.log(`🔗 Market URL: ${result.url}`);
      console.log('━'.repeat(60));
    } else {
      console.log('\n❌ No data found');
    }
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

testItem().then(() => {
  console.log('\n✨ Test complete');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
