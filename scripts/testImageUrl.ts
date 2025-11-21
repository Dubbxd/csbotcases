import axios from 'axios';

const testUrl = 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposem2LFZf1OD3dm5R642JqImKhfDLPr7Vn35cpp0l2-qTp9qu21e1-kdoYTv6dtTHIAE2Z1nS-QK-wO_vhZW4vJuYzCBl7ikq5irZlAv330-VO1AqVw';

async function testImageFetch() {
  try {
    console.log('Testing URL:', testUrl);
    console.log('URL Length:', testUrl.length);
    
    const response = await axios.get(testUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
      timeout: 10000,
      validateStatus: (status) => status < 500,
    });

    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers['content-type']);
    console.log('Content-Length:', response.headers['content-length']);
    
    if (response.status === 200) {
      console.log('✅ Image fetched successfully!');
    } else {
      console.log('❌ Failed with status:', response.status);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

testImageFetch();
