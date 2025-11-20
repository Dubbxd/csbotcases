/**
 * Steam Market Client - Obtiene información de items de CS2 incluyendo imágenes
 */

import axios from 'axios';

const BASE_URL = 'https://steamcommunity.com/market/search/render/';
const APP_ID = 730; // Counter-Strike 2

interface SteamMarketItem {
  name: string;
  priceCents: number;
  priceMXN: number;
  priceUSD: number;
  url: string;
  imageUrl: string | null;
}

/**
 * Cliente HTTP configurado con headers apropiados
 */
const client = axios.create({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://steamcommunity.com/market/'
  }
});

/**
 * Busca un item específico por nombre en Steam Market
 * @param itemName - Nombre del item a buscar (ej: "AK-47 | Nightwish")
 * @param currency - Código de moneda (1 = USD, 7 = MXN)
 * @returns Información del item incluyendo URL de imagen y precio
 */
export async function searchSteamItem(itemName: string, currency: number = 7): Promise<SteamMarketItem | null> {
  const params = {
    query: itemName,
    start: 0,
    count: 5,
    search_descriptions: 0,
    sort_column: 'price',
    sort_dir: 'asc',
    appid: APP_ID,
    currency,
    norender: 1
  };

  try {
    const response = await client.get(BASE_URL, { params });

    if (response.status !== 200 || !response.data.success) {
      return null;
    }

    const results = response.data.results;
    if (!results || !Array.isArray(results) || results.length === 0) {
      return null;
    }

    // Buscar coincidencia exacta o la más cercana
    let bestMatch = results[0];
    for (const item of results) {
      const itemNameLower = (item.name || item.hash_name || '').toLowerCase();
      if (itemNameLower === itemName.toLowerCase()) {
        bestMatch = item;
        break;
      }
    }

    // Parsear el resultado
    const name = bestMatch.name || bestMatch.hash_name;
    const priceCents = bestMatch.sell_price || 0;
    
    // Calcular precios en ambas monedas (aproximado)
    const priceMXN = currency === 7 ? priceCents / 100 : (priceCents / 100) * 18; // Estimado
    const priceUSD = currency === 1 ? priceCents / 100 : (priceCents / 100) / 18; // Estimado
    
    const imageUrl = bestMatch.asset_description?.icon_url
      ? `https://community.cloudflare.steamstatic.com/economy/image/${bestMatch.asset_description.icon_url}`
      : null;
    const url = `https://steamcommunity.com/market/listings/730/${encodeURIComponent(name)}`;

    return {
      name,
      priceCents,
      priceMXN,
      priceUSD,
      url,
      imageUrl
    };

  } catch (error: any) {
    console.error(`Error searching Steam Market for "${itemName}":`, error.message);
    return null;
  }
}

/**
 * Obtiene las URLs de imágenes para múltiples items
 * @param itemNames - Array de nombres de items
 * @returns Map de nombre -> URL de imagen
 */
export async function batchSearchImages(itemNames: string[]): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  
  for (const itemName of itemNames) {
    try {
      const item = await searchSteamItem(itemName);
      results.set(itemName, item?.imageUrl || null);
      
      // Delay para respetar rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.set(itemName, null);
    }
  }
  
  return results;
}
