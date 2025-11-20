# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies

```powershell
npm install
```

### 2. Setup Environment

Edit `.env` file and add:
- Your Discord bot token → `DISCORD_TOKEN`
- Your Discord application ID → `DISCORD_CLIENT_ID`
- Your PostgreSQL database URL → `DATABASE_URL`

### 3. Initialize Database

```powershell
npm run prisma:generate
npm run prisma:migrate
npx tsx src/db/seed.ts
```

### 4. Deploy Commands

```powershell
npm run deploy-commands
```

### 5. Start Bot

```powershell
npm run dev
```

## ✅ Verification

Bot should show:
```
[INFO] Logged in as YourBot#1234
[INFO] Serving X guilds
[INFO] Bot is ready!
[INFO] API server listening on port 3000
```

## 🎮 Test Commands

In Discord, try:
- `/ping` - Should respond with latency
- `/profile` - Should show your profile
- `/balance` - Should show 100 starting coins
- `/daily` - Claim your first daily reward

## 📚 Full Documentation

- [INSTALLATION.md](./INSTALLATION.md) - Complete setup guide
- [COMMANDS.md](./COMMANDS.md) - All available commands
- [README.md](./README.md) - Project overview

## 🆘 Common Issues

**"Cannot find module '@prisma/client'"**
```powershell
npm run prisma:generate
```

**"Connection refused to database"**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env

**"Bot doesn't respond to commands"**
```powershell
npm run deploy-commands
```

**"Message Content Intent error"**
- Go to Discord Developer Portal
- Enable "Message Content Intent" in Bot settings

## 🎯 Next Steps

1. Customize XP/coin amounts in `.env`
2. Add more items to drop tables in `src/config/drop-tables/`
3. Configure server settings with `/admin config`
4. Set up Top.gg voting for free keys
5. Deploy to production with PM2

Enjoy your CS:GO Discord bot! 🎉
