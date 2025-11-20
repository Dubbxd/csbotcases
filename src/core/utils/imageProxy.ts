import { env } from '../../config/env';

/**
 * Converts a Steam CDN image URL to use our image proxy
 * This is necessary because Discord blocks Steam CDN URLs in embeds
 * 
 * @param steamUrl - Original Steam CDN URL
 * @returns Proxied URL that Discord will accept
 */
export function getSteamImageProxyUrl(steamUrl: string | null): string | null {
  if (!steamUrl) return null;
  
  // Only proxy Steam CDN URLs
  if (!steamUrl.startsWith('https://community.cloudflare.steamstatic.com/economy/image/')) {
    return steamUrl;
  }

  // Get base URL from environment (could be ngrok URL or production URL)
  let baseUrl = env.PUBLIC_API_URL;
  
  // Ensure base URL has protocol
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }

  // Encode the Steam URL and return proxy URL
  const encodedUrl = encodeURIComponent(steamUrl);
  return `${baseUrl}/api/image-proxy?url=${encodedUrl}`;
}
