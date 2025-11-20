# Railway Deployment Guide

## Prerequisites
1. GitHub account
2. Railway account (sign up at https://railway.app)
3. Push your code to GitHub

## Step 1: Prepare the Repository

Make sure your `.env` is in `.gitignore`:
```bash
git status
# Make sure .env is NOT listed
```

## Step 2: Deploy to Railway

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect it's a Node.js project

## Step 3: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a `DATABASE_URL` variable

## Step 4: Add Redis (Optional)

1. Click "New" again
2. Select "Database" → "Redis"
3. Railway will create Redis connection variables

## Step 5: Configure Environment Variables

In Railway, go to your service → Variables tab and add:

```env
# Discord (REQUIRED)
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_guild_id_optional

# API (REQUIRED)
API_SECRET=your_random_secret_key
PUBLIC_API_URL=https://your-service-name.up.railway.app

# Redis (Railway auto-creates these)
REDIS_HOST=redis.railway.internal
REDIS_PORT=6379
REDIS_PASSWORD=auto_generated

# Database (Railway auto-creates this)
DATABASE_URL=postgresql://user:pass@host:port/db

# Environment
NODE_ENV=production
LOG_LEVEL=info

# XP System (Optional - has defaults)
XP_MIN_PER_MESSAGE=10
XP_MAX_PER_MESSAGE=25
XP_COOLDOWN_SECONDS=60

# Economy (Optional - has defaults)
DAILY_REWARD_COINS=100
DAILY_REWARD_XP=50
CASE_OPEN_DAILY_LIMIT=10
```

## Step 6: Get Your Public URL

1. After deployment, Railway will give you a URL like: `https://your-service-name.up.railway.app`
2. Copy this URL
3. Update `PUBLIC_API_URL` variable to this URL

## Step 7: Run Database Migrations

In Railway's service settings:
1. Go to "Settings" tab
2. Find "Deploy" section
3. Add a custom start command:
   ```
   npm run prisma:deploy && npm start
   ```

Or run manually in Railway's terminal:
```bash
npx prisma migrate deploy
npx tsx src/db/seedCS2Cases.ts
npx tsx scripts/updateShopItems.ts
```

## Step 8: Deploy Commands to Discord

You'll need to run this once from your local machine or Railway terminal:
```bash
npm run deploy-commands
```

## Step 9: Test Your Bot

1. Invite the bot to your Discord server
2. Try `/start` command
3. Try `/open` command - images should now work!

## Troubleshooting

### Check Logs
- Go to Railway → Your Service → Deployments
- Click on the latest deployment
- View logs in real-time

### Database Issues
- Make sure `DATABASE_URL` is set correctly
- Check if migrations ran: look for "✅" in deployment logs

### Bot Not Responding
- Verify `DISCORD_TOKEN` is correct
- Check if bot has proper permissions in Discord server
- View logs for error messages

### Images Not Loading
- Verify `PUBLIC_API_URL` matches your Railway URL (with https://)
- Make sure Railway service is running
- Check `/api/image-proxy` endpoint is accessible

## Updating Your Bot

When you push to GitHub, Railway will automatically:
1. Pull the latest code
2. Build the project
3. Run migrations
4. Restart the service

## Cost

Railway offers:
- **Free tier**: $5 of usage per month
- **Pro**: $20/month for more resources

Your bot should fit comfortably in the free tier for testing.
