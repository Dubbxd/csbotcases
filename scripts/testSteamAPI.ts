import { searchSteamItem } from '../src/core/scraper/steamMarketClient';

async function test() {
  const result = await searchSteamItem('MP9 | Starlight Protector');
  
  console.log('Name:', result?.name);
  console.log('Image URL:', result?.imageUrl);
  console.log('URL Length:', result?.imageUrl?.length);
  console.log('\nFull response:');
  console.log(JSON.stringify(result, null, 2));
  
  process.exit(0);
}

test();
