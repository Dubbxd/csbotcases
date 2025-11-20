# Image Proxy Setup

## Problem
Discord cannot access `http://localhost:3000` because it's only accessible from your local machine.

## Solution
Use ngrok to expose your local server to the internet.

### Steps:

1. **Install ngrok:**
   - Download from https://ngrok.com/download
   - Or install via npm: `npm install -g ngrok`

2. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Copy the HTTPS URL:**
   - ngrok will show something like: `https://abc123.ngrok.io`
   - This is your public URL

4. **Update the bot to use the ngrok URL:**
   - Add to your `.env` file:
     ```
     PUBLIC_API_URL=https://your-ngrok-url.ngrok.io
     ```

5. **Restart the bot**

## Alternative: Deploy to production
For a permanent solution, deploy your bot to:
- Railway.app (free tier available)
- Render.com (free tier available)
- Heroku
- A VPS (DigitalOcean, Linode, etc.)
