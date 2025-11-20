import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

/**
 * Image proxy endpoint to serve Steam CDN images
 * Discord blocks Steam CDN URLs, so we proxy them through our server
 * 
 * Usage: GET /api/image-proxy?url=<encoded_steam_url>
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const imageUrl = req.query.url as string;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    // Validate that it's a Steam CDN URL for security
    if (!imageUrl.startsWith('https://community.cloudflare.steamstatic.com/economy/image/')) {
      return res.status(400).json({ error: 'Invalid image URL. Only Steam CDN URLs are allowed.' });
    }

    // Fetch the image from Steam
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000, // 10 second timeout
    });

    // Get the content type
    const contentType = response.headers['content-type'] || 'image/png';

    // Set cache headers (cache for 1 day)
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    });

    // Send the image
    res.send(response.data);
  } catch (error: any) {
    console.error('Error proxying image:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

export default router;
