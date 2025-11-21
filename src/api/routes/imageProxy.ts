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
    let imageUrl = req.query.url as string;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    // Validate that it's a Steam CDN URL for security
    if (!imageUrl.startsWith('https://community.cloudflare.steamstatic.com/economy/image/')) {
      return res.status(400).json({ error: 'Invalid image URL. Only Steam CDN URLs are allowed.' });
    }

    // Fetch the image from Steam CDN
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
      timeout: 10000,
      validateStatus: (status) => status === 200,
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
    console.error('URL attempted:', req.query.url);
    
    if (error.response?.status === 404) {
      // Return a 1x1 transparent PNG as fallback instead of error
      // This prevents Discord from showing broken image icons
      const transparentPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      
      res.set({
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      });
      
      return res.send(transparentPng);
    }
    
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

export default router;
