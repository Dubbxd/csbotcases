// XP & Leveling
export const XP_FORMULA = {
  BASE: 100,
  EXPONENT: 1.5,
  calculateXPNeeded: (level: number): number => {
    return Math.floor(XP_FORMULA.BASE * Math.pow(level, XP_FORMULA.EXPONENT));
  },
  calculateLevel: (xp: number): number => {
    let level = 1;
    let totalXP = 0;
    while (totalXP <= xp) {
      totalXP += XP_FORMULA.calculateXPNeeded(level);
      if (totalXP <= xp) level++;
    }
    return level;
  },
};

// Rarities
export const RARITY_CONFIG = {
  COMMON: { color: 0xb0c3d9, emoji: '⚪', name: 'Common' },
  UNCOMMON: { color: 0x5e98d9, emoji: '🔵', name: 'Uncommon' },
  RARE: { color: 0x4b69ff, emoji: '💙', name: 'Rare' },
  VERY_RARE: { color: 0x8847ff, emoji: '💜', name: 'Very Rare' },
  LEGENDARY: { color: 0xd32ce6, emoji: '🌟', name: 'Legendary' },
  EXOTIC: { color: 0xeb4b4b, emoji: '🔴', name: 'Exotic' },
};

// Drop Probabilities (default)
export const DEFAULT_DROP_PROBABILITIES = {
  COMMON: 0.55,
  UNCOMMON: 0.30,
  RARE: 0.10,
  VERY_RARE: 0.04,
  LEGENDARY: 0.01,
  EXOTIC: 0.001,
};

// Cooldowns (in seconds)
export const COOLDOWNS = {
  XP_MESSAGE: 60,
  DAILY_REWARD: 86400, // 24 hours
  CASE_OPEN: 5, // Between consecutive opens
};

// Limits
export const LIMITS = {
  INVENTORY_PAGE_SIZE: 10,
  MARKET_PAGE_SIZE: 15,
  LEADERBOARD_PAGE_SIZE: 10,
  MAX_SHELF_SLOTS: 5,
  MAX_LISTINGS_PER_USER: 20,
  MIN_MARKET_PRICE: 10,
  MAX_MARKET_PRICE: 1000000,
};

// Messages
export const MESSAGES = {
  ERRORS: {
    NO_PERMISSION: '❌ No tienes permisos para usar este comando.',
    BANNED: '🚫 Has sido baneado del bot.',
    COOLDOWN: '⏰ Espera {time} antes de hacer esto otra vez.',
    NOT_ENOUGH_COINS: '💰 No tienes suficientes monedas.',
    NOT_ENOUGH_XP: '⭐ No tienes suficiente XP.',
    NO_CASE: '📦 No tienes ninguna caja de este tipo.',
    NO_KEY: '🔑 No tienes ninguna llave para esta caja.',
    DAILY_LIMIT: '⏰ Has alcanzado el límite diario de aperturas.',
    ITEM_NOT_FOUND: '❌ Ítem no encontrado.',
    LISTING_NOT_FOUND: '❌ Listado no encontrado.',
    ALREADY_SOLD: '❌ Este ítem ya fue vendido.',
    CANNOT_BUY_OWN: '❌ No puedes comprar tus propios ítems.',
    MAINTENANCE: '🔧 El bot está en mantenimiento. Intenta más tarde.',
  },
  SUCCESS: {
    LEVEL_UP: '🎉 ¡Felicidades {user}! Subiste al **Nivel {level}**!',
    CASE_OPENED: '📦 ¡Abriste una {case}!',
    DAILY_CLAIMED: '🎁 ¡Recompensa diaria reclamada!',
    ITEM_PURCHASED: '✅ ¡Compraste {item}!',
    LISTING_CREATED: '✅ Tu {item} ha sido listado por {price} monedas.',
    LISTING_CANCELLED: '✅ Listado cancelado.',
    ITEM_SOLD: '💰 ¡Tu {item} fue vendido por {price} monedas!',
  },
};

// Emojis
export const EMOJIS = {
  XP: '⭐',
  LEVEL: '🆙',
  COINS: '💰',
  CASE: '📦',
  KEY: '🔑',
  INVENTORY: '🎒',
  SHOP: '🏪',
  MARKET: '🏛️',
  DAILY: '🎁',
  VOTE: '🗳️',
  LOADING: '⏳',
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
};

// Colors
export const COLORS = {
  PRIMARY: 0x5865f2,
  SUCCESS: 0x57f287,
  ERROR: 0xed4245,
  WARNING: 0xfee75c,
  INFO: 0x5865f2,
};
