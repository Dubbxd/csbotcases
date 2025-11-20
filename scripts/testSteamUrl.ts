import axios from 'axios';

/**
 * Test if a Steam image URL is valid
 */
async function testSteamUrl(url: string) {
  try {
    const response = await axios.head(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 5000,
    });
    console.log('✅ URL works:', url);
    console.log('Content-Type:', response.headers['content-type']);
    return true;
  } catch (error: any) {
    console.log('❌ URL failed:', url);
    console.log('Error:', error.response?.status || error.message);
    
    // Try without size parameter
    if (url.includes('/256fx256f')) {
      const urlWithoutSize = url.replace('/256fx256f', '');
      console.log('Trying without size...');
      try {
        const response2 = await axios.head(urlWithoutSize, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          timeout: 5000,
        });
        console.log('✅ URL works without size:', urlWithoutSize);
        return true;
      } catch (error2: any) {
        console.log('❌ Also failed without size');
      }
    }
    return false;
  }
}

// Test a few URLs
const testUrls = [
  'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLuoKhRf1OD3dzxP7c-Jh5C0m_7zO6-fkjMIvpEkj7iVotmliwC3-UVqNTyhI4DHdgdoN1iF-AS2w-y615K1ot2XnjLdm0Hg/256fx256f',
  'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLuoKhRf1OD3dzxP7c-Jh5C0m_7zO6-fkjMIvpEkj7iVotmliwC3-UVqNTyhI4DHdgdoN1iF-AS2w-y615K1ot2XnjLdm0Hg',
];

(async () => {
  for (const url of testUrls) {
    await testSteamUrl(url);
    console.log('---');
  }
})();
