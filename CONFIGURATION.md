# Configuration Examples

This document provides example configurations for different use cases.

## Basic Server Configuration

### Small Server (< 100 members)

```env
# XP System - Generous for small communities
XP_MIN_PER_MESSAGE=15
XP_MAX_PER_MESSAGE=30
XP_COOLDOWN_SECONDS=45
XP_MIN_MESSAGE_LENGTH=2

# Economy - Higher rewards
DAILY_REWARD_COINS=150
DAILY_REWARD_XP=75
LEVEL_UP_COINS=75

# Cases - More opportunities
CASE_OPEN_DAILY_LIMIT=15
```

### Medium Server (100-1000 members)

```env
# XP System - Balanced
XP_MIN_PER_MESSAGE=10
XP_MAX_PER_MESSAGE=25
XP_COOLDOWN_SECONDS=60
XP_MIN_MESSAGE_LENGTH=3

# Economy - Standard rewards
DAILY_REWARD_COINS=100
DAILY_REWARD_XP=50
LEVEL_UP_COINS=50

# Cases - Standard limits
CASE_OPEN_DAILY_LIMIT=10
```

### Large Server (1000+ members)

```env
# XP System - Conservative to prevent spam
XP_MIN_PER_MESSAGE=5
XP_MAX_PER_MESSAGE=15
XP_COOLDOWN_SECONDS=90
XP_MIN_MESSAGE_LENGTH=5

# Economy - Lower rewards
DAILY_REWARD_COINS=75
DAILY_REWARD_XP=30
LEVEL_UP_COINS=30

# Cases - Stricter limits
CASE_OPEN_DAILY_LIMIT=5
```

## Use Case Configurations

### Casual Gaming Server

**Goal:** Keep users engaged without grinding

```env
XP_MIN_PER_MESSAGE=20
XP_MAX_PER_MESSAGE=40
XP_COOLDOWN_SECONDS=30
DAILY_REWARD_COINS=200
LEVEL_UP_COINS=100
CASE_OPEN_DAILY_LIMIT=20
MARKET_FEE_PERCENT=3
```

**Guild Config:**
```typescript
{
  levelUpRewardType: "both",  // Give coins AND cases
  levelUpRewardCoins: 100,
  antiSpamEnabled: true,
  marketEnabled: true,
  marketGlobal: false
}
```

### Competitive/Active Server

**Goal:** Reward high activity, maintain balance

```env
XP_MIN_PER_MESSAGE=8
XP_MAX_PER_MESSAGE=18
XP_COOLDOWN_SECONDS=60
DAILY_REWARD_COINS=100
LEVEL_UP_COINS=50
CASE_OPEN_DAILY_LIMIT=10
MARKET_FEE_PERCENT=5
```

**Guild Config:**
```typescript
{
  levelUpRewardType: "case",  // Only cases
  levelUpRewardCoins: 50,
  antiSpamEnabled: true,
  marketEnabled: true,
  caseOpenDailyLimit: 10
}
```

### Economy-Focused Server

**Goal:** Emphasis on trading and market

```env
XP_MIN_PER_MESSAGE=10
XP_MAX_PER_MESSAGE=20
DAILY_REWARD_COINS=50
LEVEL_UP_COINS=25
MARKET_FEE_PERCENT=2
CASE_OPEN_DAILY_LIMIT=5
```

**Guild Config:**
```typescript
{
  levelUpRewardType: "coins",  // Only coins
  marketEnabled: true,
  marketGlobal: true,  // Cross-server market
  caseOpenDailyLimit: 5  // Keep items rare
}
```

### RP/Community Server

**Goal:** Slow progression, community focus

```env
XP_MIN_PER_MESSAGE=5
XP_MAX_PER_MESSAGE=10
XP_COOLDOWN_SECONDS=120
DAILY_REWARD_COINS=50
LEVEL_UP_COINS=25
CASE_OPEN_DAILY_LIMIT=3
```

**Guild Config:**
```typescript
{
  levelUpRewardType: "both",
  antiSpamEnabled: true,
  xpMinMessageLength: 10,  // Encourage meaningful messages
  marketEnabled: true
}
```

## Anti-Spam Configurations

### Strict Anti-Spam

For servers with spam issues:

```typescript
// guildConfig
{
  antiSpamEnabled: true,
  xpCooldownSeconds: 90,
  xpMinMessageLength: 5,
  ignoredChannels: ["bot-commands", "spam"],
  xpEnabledChannels: ["general", "chat"]  // Whitelist only
}
```

### Lenient Anti-Spam

For trusted communities:

```typescript
{
  antiSpamEnabled: true,
  xpCooldownSeconds: 30,
  xpMinMessageLength: 2,
  ignoredChannels: ["bot-spam"],
  xpEnabledChannels: []  // All channels enabled
}
```

## Channel Configurations

### Typical Setup

```typescript
{
  levelUpChannelId: "123456789",  // Announcements channel
  logChannelId: "987654321",      // Admin logs
  ignoredChannels: [
    "bot-commands",
    "music",
    "voice-text",
    "afk"
  ],
  xpEnabledChannels: []  // Enable everywhere except ignored
}
```

### Focused XP Zones

```typescript
{
  levelUpChannelId: "announcements-channel-id",
  logChannelId: "admin-logs-channel-id",
  ignoredChannels: [],
  xpEnabledChannels: [
    "general",
    "gaming",
    "discussion"
  ]  // Only these channels give XP
}
```

## Drop Table Customization

### More Generous Drops

Edit `src/config/drop-tables/classic.json`:

```json
{
  "dropTable": {
    "COMMON": 0.40,     // Reduced from 0.55
    "UNCOMMON": 0.35,   // Increased from 0.30
    "RARE": 0.15,       // Increased from 0.10
    "VERY_RARE": 0.08,  // Increased from 0.04
    "LEGENDARY": 0.02   // Increased from 0.01
  }
}
```

### Conservative Drops

```json
{
  "dropTable": {
    "COMMON": 0.70,     // Increased
    "UNCOMMON": 0.20,   // Decreased
    "RARE": 0.07,       // Decreased
    "VERY_RARE": 0.025, // Decreased
    "LEGENDARY": 0.005  // Decreased
  }
}
```

## Market Configurations

### Active Trading

```typescript
{
  marketEnabled: true,
  marketGlobal: true,      // Cross-server trading
  MARKET_FEE_PERCENT: 2,   // Low fee
  MAX_LISTINGS_PER_USER: 30,
  MIN_MARKET_PRICE: 1,
  MAX_MARKET_PRICE: 10000000
}
```

### Controlled Economy

```typescript
{
  marketEnabled: true,
  marketGlobal: false,     // Server-only
  MARKET_FEE_PERCENT: 10,  // High fee
  MAX_LISTINGS_PER_USER: 10,
  MIN_MARKET_PRICE: 50,    // Prevent penny trades
  MAX_MARKET_PRICE: 100000
}
```

## Production Environment

### Recommended Production Settings

```env
# Environment
NODE_ENV=production
LOG_LEVEL=info

# Security
API_SECRET=use-a-strong-random-secret-here

# Database - Use connection pooling
DATABASE_URL="postgresql://user:pass@db-host:5432/prod_db?connection_limit=20&pool_timeout=30"

# Redis - Use password in production
REDIS_HOST=redis-host
REDIS_PORT=6379
REDIS_PASSWORD=strong-redis-password

# Discord
DISCORD_TOKEN=prod-bot-token
DISCORD_CLIENT_ID=prod-client-id

# Conservative rates for large scale
XP_MIN_PER_MESSAGE=10
XP_MAX_PER_MESSAGE=20
XP_COOLDOWN_SECONDS=60
```

### Docker Compose Example

```yaml
version: '3.8'
services:
  bot:
    build: .
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/csgo_bot
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: csgo_bot
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass yourpassword

volumes:
  postgres_data:
```

## Testing/Development

### Development Settings

```env
NODE_ENV=development
LOG_LEVEL=debug

# Faster for testing
XP_MIN_PER_MESSAGE=50
XP_MAX_PER_MESSAGE=100
XP_COOLDOWN_SECONDS=10
DAILY_REWARD_COINS=1000
CASE_OPEN_DAILY_LIMIT=999

# Local services
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/csgo_bot_dev"
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Applying Configuration Changes

### Environment Variables

1. Edit `.env` file
2. Restart bot:
```powershell
pm2 restart csgo-bot
```

### Guild Configuration

Use admin commands:
```
/admin config
```

Or update database directly:
```sql
UPDATE "GuildConfig" 
SET "xpPerMessageMin" = 15,
    "xpPerMessageMax" = 30
WHERE "guildId" = 'YOUR_GUILD_ID';
```

### Drop Tables

1. Edit JSON files in `src/config/drop-tables/`
2. Run seed:
```powershell
npx tsx src/db/seed.ts
```
3. Restart bot

## Monitoring Configuration

Recommended monitoring:

- **CPU/Memory:** pm2 monit
- **Database:** Prisma Studio
- **Redis:** redis-cli monitor
- **Logs:** tail -f logs/combined.log

Set alerts for:
- Error rate > 10/minute
- Response time > 5s
- Database connection failures
- Redis connection failures
