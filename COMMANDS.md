# Commands Guide

## 📋 Table of Contents

- [General Commands](#general-commands)
- [XP & Leveling](#xp--leveling)
- [Economy](#economy)
- [Cases & Inventory](#cases--inventory)
- [Market](#market)
- [Admin Commands](#admin-commands)

---

## General Commands

### `/ping`
Check bot latency and API response time.

**Usage:**
```
/ping
```

### `/profile [user]`
View your profile or another user's profile.

**Options:**
- `user` (optional) - The user to view

**Usage:**
```
/profile
/profile @username
```

**Shows:**
- Level and XP progress
- Rank in server
- Coins balance
- Total items owned
- Cases opened
- Transaction count

---

## XP & Leveling

### How XP Works

- **Gain XP** by sending messages in the server
- **Cooldown:** 60 seconds between XP gains (configurable)
- **Amount:** 10-25 XP per message (configurable)
- **Anti-spam:** Messages must be at least 3 characters
- **Level up:** Automatic when you reach enough XP

### Level Formula

XP needed for next level = `100 × level^1.5`

Example:
- Level 1 → 2: 100 XP
- Level 2 → 3: 283 XP
- Level 3 → 4: 520 XP

### `/rank [user]`
View your current rank and level.

**Usage:**
```
/rank
/rank @username
```

### `/leaderboard`
View the top 10 users in the server.

**Usage:**
```
/leaderboard
```

**Shows:**
- Top 10 users by level and XP
- Their current level and total XP

---

## Economy

### `/balance [user]`
Check your coin balance.

**Usage:**
```
/balance
/balance @username
```

### `/daily`
Claim your daily reward.

**Rewards:**
- 💰 100 coins
- ⭐ 50 XP

**Cooldown:** 24 hours

**Usage:**
```
/daily
```

### `/shop`
Browse the shop and buy items.

**Available Items:**
- Cases (500-2000 coins)
- Keys (200 coins)
- Cosmetics (varies)

**Usage:**
```
/shop
```

### `/buy <item>`
Purchase an item from the shop.

**Usage:**
```
/buy <item_id>
```

---

## Cases & Inventory

### `/cases`
View available case types and your owned cases.

**Case Types:**
- 📦 **Classic Case** - Common skins (500 coins)
- 🔪 **Knife Collection** - Rare knives (2000 coins)
- 👤 **Agent Case** - Character skins (1000 coins)

**Usage:**
```
/cases
```

### `/open <case> <key>`
Open a case with a key.

**Requirements:**
- Must own the case
- Must own a key
- Daily limit: 10 opens per day

**Options:**
- `case` - The case ID to open (1-3)
- `key` - The key ID to use (1 = Universal Key)

**Usage:**
```
/open case:1 key:1
```

**Rewards:**
- Random item based on rarity
- Bonus coins (10-500)
- Bonus XP (5-300)

### Rarity System

| Rarity | Emoji | Drop Rate | Bonus Coins | Bonus XP |
|--------|-------|-----------|-------------|----------|
| Common | ⚪ | 55% | 10 | 5 |
| Uncommon | 🔵 | 30% | 25 | 15 |
| Rare | 💙 | 10% | 50 | 30 |
| Very Rare | 💜 | 4% | 100 | 60 |
| Legendary | 🌟 | 1% | 250 | 150 |
| Exotic | 🔴 | 0.1% | 500 | 300 |

### `/inventory [filter]`
View your inventory with optional filters.

**Options:**
- `filter` - Filter by rarity (COMMON, UNCOMMON, RARE, etc.)

**Usage:**
```
/inventory
/inventory filter:LEGENDARY
```

**Features:**
- Paginated view
- Shows item name, rarity, and ID
- Navigate with ⏮️ ◀️ ▶️ ⏭️ buttons

### `/recycle <item_id>`
Recycle an item for coins.

**Recycle Values:**
- Common: 5 coins
- Uncommon: 15 coins
- Rare: 40 coins
- Very Rare: 100 coins
- Legendary: 300 coins
- Exotic: 750 coins

**Usage:**
```
/recycle item_id:123
```

---

## Market

### `/market browse [filters]`
Browse items listed for sale.

**Options:**
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter
- `rarity` - Filter by rarity
- `search` - Search by item name

**Usage:**
```
/market browse
/market browse rarity:LEGENDARY
/market browse min_price:1000 max_price:5000
```

### `/market list <item_id> <price>`
List an item for sale.

**Requirements:**
- Must own the item
- Item cannot be locked or already listed
- Maximum 20 active listings per user
- Price must be between 10 and 1,000,000 coins

**Options:**
- `item_id` - The inventory item ID to sell
- `price` - Selling price in coins

**Usage:**
```
/market list item_id:123 price:1500
```

**Market Fee:** 5% of sale price

### `/market buy <listing_id>`
Purchase an item from the market.

**Usage:**
```
/market buy listing_id:456
```

**Notes:**
- Cannot buy your own listings
- Must have enough coins
- Item transferred instantly
- Seller receives 95% of price (5% fee)

### `/market cancel <listing_id>`
Cancel your listing.

**Usage:**
```
/market cancel listing_id:456
```

### `/market mylistings`
View all your active listings.

**Usage:**
```
/market mylistings
```

---

## Admin Commands

### `/admin config`
Configure server settings.

**Configurable Options:**
- XP per message (min/max)
- XP cooldown duration
- Level up rewards
- Case open daily limit
- Market settings
- Log channels

**Usage:**
```
/admin config
```

**Requires:** Administrator permission

### `/admin ban <user> [reason]`
Ban a user from using the bot.

**Usage:**
```
/admin ban user:@spammer reason:Abusing the system
```

**Requires:** Administrator permission

### `/admin unban <user>`
Unban a user.

**Usage:**
```
/admin unban user:@user
```

**Requires:** Administrator permission

### `/admin givecoin <user> <amount>`
Give coins to a user.

**Usage:**
```
/admin givecoin user:@user amount:1000
```

**Requires:** Administrator permission

### `/admin givecase <user> <case_id>`
Give a case to a user.

**Usage:**
```
/admin givecase user:@user case_id:1
```

**Requires:** Administrator permission

### `/admin givekey <user> <key_id>`
Give a key to a user.

**Usage:**
```
/admin givekey user:@user key_id:1
```

**Requires:** Administrator permission

---

## Tips & Tricks

### Maximizing XP Gain
- Stay active in chat (respecting cooldown)
- Write meaningful messages (min 3 characters)
- Avoid spam (same message repeatedly)
- Don't flood chat (anti-spam protection)

### Earning Coins
- 💬 Send messages to level up (+50 coins per level)
- 🎁 Claim daily rewards (+100 coins/day)
- 📦 Open cases (bonus coins with each item)
- 🏛️ Sell items on the market
- 🗳️ Vote for the bot on Top.gg (+50 coins per vote)

### Getting Keys
- 🏪 Buy from shop (200 coins)
- 🗳️ Vote on Top.gg (1 key per vote)
- 🎁 Level up rewards (if configured)
- 👑 Admin gifts

### Market Strategy
- 📈 Rare items sell for more
- 🔍 Check market prices before listing
- ⏰ Be patient for good deals
- 💎 Don't sell legendary items cheap!

---

## Cooldowns

| Action | Cooldown |
|--------|----------|
| XP from messages | 60 seconds |
| Daily reward | 24 hours |
| Opening cases | 5 seconds |
| Commands | Varies (5-10s) |

---

## Need Help?

Use `/help` for a quick command reference or check the bot's support server!
