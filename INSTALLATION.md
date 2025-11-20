# Installation Guide

## Prerequisites

- **Node.js** 20+ installed
- **PostgreSQL** database
- **Redis** server (for cooldowns and caching)
- **Discord Bot Application** created on Discord Developer Portal

## Step-by-Step Setup

### 1. Clone and Install Dependencies

```powershell
cd c:\Users\xsend\Documents\BotDiscord
npm install
```

### 2. Database Setup

**Install PostgreSQL:**
- Download from https://www.postgresql.org/download/windows/
- Create a new database: `csgo_bot`

**Configure DATABASE_URL:**
```
DATABASE_URL="postgresql://username:password@localhost:5432/csgo_bot?schema=public"
```

### 3. Redis Setup

**Install Redis for Windows:**
- Download from https://github.com/microsoftarchive/redis/releases
- Or use WSL/Docker

**Start Redis:**
```powershell
redis-server
```

### 4. Discord Bot Setup

1. Go to https://discord.com/developers/applications
2. Create New Application
3. Go to "Bot" tab → Click "Add Bot"
4. Enable these **Privileged Gateway Intents**:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. Copy the bot token

### 5. Configure Environment Variables

```powershell
cp .env.example .env
```

Edit `.env` with your values:

```env
# Discord
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_id_here

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/csgo_bot"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# API
API_PORT=3000
API_SECRET=your_random_secret_here

# Optional: Top.gg
TOPGG_WEBHOOK_SECRET=your_topgg_secret
TOPGG_TOKEN=your_topgg_token
```

### 6. Initialize Database

```powershell
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial data
npx tsx src/db/seed.ts
```

### 7. Deploy Slash Commands

```powershell
npm run deploy-commands
```

### 8. Invite Bot to Server

Generate invite URL with these permissions:
- Scopes: `bot`, `applications.commands`
- Permissions: 
  - Send Messages
  - Embed Links
  - Attach Files
  - Use External Emojis
  - Read Message History
  - Add Reactions

URL format:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=412317240384&scope=bot%20applications.commands
```

### 9. Start the Bot

**Development:**
```powershell
npm run dev
```

**Production:**
```powershell
npm run build
npm start
```

## Verification

1. Check bot appears online in Discord
2. Check logs in terminal for "Bot is ready!"
3. Try commands:
   - `/ping` - Check latency
   - `/profile` - View your profile
   - `/daily` - Claim daily reward

## Troubleshooting

### Bot doesn't respond to commands
- Ensure bot has "applications.commands" scope
- Run `npm run deploy-commands` again
- Check bot has permission to send messages in channel

### Database errors
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Ensure migrations ran: `npm run prisma:migrate`

### Redis errors
- Check Redis is running: `redis-cli ping` should return "PONG"
- Verify REDIS_HOST and REDIS_PORT in .env

### XP not being awarded
- Check Message Content Intent is enabled
- Verify channel is not in ignored channels
- Check for cooldown messages (default 60s between XP gains)

## Optional: Configure Top.gg Voting

1. List your bot on https://top.gg
2. Set webhook URL to: `https://your-domain.com/webhooks/votes/topgg`
3. Copy webhook secret to TOPGG_WEBHOOK_SECRET in .env
4. Users can vote every 12 hours to get keys

## Database Management

**View database in browser:**
```powershell
npm run prisma:studio
```

**Reset database (WARNING: Deletes all data):**
```powershell
npx prisma migrate reset
npx tsx src/db/seed.ts
```

**Create new migration:**
```powershell
npx prisma migrate dev --name your_migration_name
```

## Production Deployment

### Using PM2

```powershell
npm install -g pm2
npm run build
pm2 start dist/index.js --name csgo-bot
pm2 save
```

### Environment Variables
- Set NODE_ENV=production
- Use strong API_SECRET
- Configure proper DATABASE_URL for production DB
- Set up Redis with password in production

### Monitoring
```powershell
pm2 logs csgo-bot
pm2 monit
```

## Need Help?

Check logs in:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
