# Railway Environment Variables Setup

## Required Environment Variables

After deploying to Railway, you **MUST** configure these environment variables:

### 1. PUBLIC_API_URL
**Purpose:** Allows the bot to proxy Steam CDN images through its own server so Discord can display them.

**How to set:**
1. Go to your Railway project dashboard
2. Click on your service
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Set:
   - **Variable:** `PUBLIC_API_URL`
   - **Value:** `https://csbotcases-production.up.railway.app` (your Railway app URL)

### 2. DATABASE_URL
**Purpose:** Connection string for PostgreSQL database.

**How to set:**
Railway automatically provides this when you add a PostgreSQL service.
- Make sure to use the **PUBLIC** connection URL, not the internal one
- Format: `postgresql://postgres:PASSWORD@HOST:PORT/railway`

### 3. DISCORD_TOKEN
**Purpose:** Your Discord bot token.

**How to get:**
1. Go to https://discord.com/developers/applications
2. Select your application
3. Go to **Bot** tab
4. Copy the token

**Set in Railway:**
- Variable: `DISCORD_TOKEN`
- Value: Your bot token

### 4. DISCORD_CLIENT_ID
**Purpose:** Your Discord application ID.

**How to get:**
1. Go to https://discord.com/developers/applications
2. Select your application
3. Go to **General Information**
4. Copy the **Application ID**

**Set in Railway:**
- Variable: `DISCORD_CLIENT_ID`
- Value: Your application ID

## Optional Variables

### REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
The bot has automatic fallback to memory cache if Redis is not available.
Redis is optional but recommended for production.

## Verify Setup

After setting all variables:
1. Railway will automatically redeploy
2. Check the **Deploy Logs** to ensure no errors
3. Test the bot in Discord with `/open`
4. Images should now display correctly!

## Common Issues

### Images not showing
- **Solution:** Make sure `PUBLIC_API_URL` is set correctly
- Check that the URL matches your Railway domain
- Ensure it starts with `https://`

### Database connection errors
- **Solution:** Use the PUBLIC database URL, not the internal railway.internal URL
- Check that PostgreSQL service is running

### Bot not responding
- **Solution:** Check that `DISCORD_TOKEN` and `DISCORD_CLIENT_ID` are correct
- Verify the bot has proper permissions in your Discord server
