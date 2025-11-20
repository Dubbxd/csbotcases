# Troubleshooting Guide

Common issues and their solutions.

## 🚨 Installation Issues

### "Cannot find module '@prisma/client'"

**Cause:** Prisma client not generated after installation.

**Solution:**
```powershell
npm run prisma:generate
```

### "Failed to run migrations"

**Cause:** Database connection issue or DATABASE_URL incorrect.

**Solutions:**
1. Check PostgreSQL is running:
```powershell
# Test connection
psql -U postgres
```

2. Verify DATABASE_URL format:
```
postgresql://username:password@localhost:5432/database_name
```

3. Ensure database exists:
```sql
CREATE DATABASE csgo_bot;
```

### "Redis connection refused"

**Cause:** Redis server not running.

**Solutions:**

**Windows (WSL):**
```bash
sudo service redis-server start
```

**Windows (Native Redis):**
```powershell
redis-server
```

**Docker:**
```powershell
docker run -d -p 6379:6379 redis
```

### "npm install fails with permission errors"

**Solution:**
```powershell
# Run as administrator or:
npm install --legacy-peer-deps
```

## 🤖 Bot Issues

### Bot doesn't come online

**Checklist:**
1. ✅ DISCORD_TOKEN is correct in `.env`
2. ✅ Bot has been invited to server
3. ✅ No firewall blocking outgoing connections
4. ✅ Check logs: `logs/error.log`

**Test token:**
```powershell
npm run dev
# Look for "Logged in as BotName#1234"
```

### Bot doesn't respond to commands

**Cause 1:** Commands not deployed

**Solution:**
```powershell
npm run deploy-commands
```

**Cause 2:** Missing bot permissions

**Required permissions:**
- Send Messages
- Embed Links
- Use Slash Commands
- Read Message History

**Cause 3:** Wrong bot scopes

Reinvite bot with:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=412317240384&scope=bot%20applications.commands
```

### "/profile shows 'Profile not found'"

**Cause:** User profile not created yet.

**Solution:** Send a message in the server first to create profile, or use another command like `/ping`.

### XP not being awarded

**Common causes:**

1. **Cooldown active** (60 seconds default)
   - Normal behavior
   - Wait and try again

2. **Message too short**
   - Must be at least 3 characters
   - Check `XP_MIN_MESSAGE_LENGTH` in `.env`

3. **Channel is ignored**
   - Admin may have disabled XP in that channel
   - Check with `/admin config`

4. **Anti-spam triggered**
   - Stop sending repeated messages
   - Wait 30 seconds

### "Daily already claimed"

**Cause:** Claimed within last 24 hours.

**Check remaining time:**
The error message shows when you can claim again.

**Force reset (DEV ONLY):**
```sql
UPDATE "UserGuildProfile" 
SET "lastDailyAt" = NULL 
WHERE "userId" = 'YOUR_USER_ID';
```

## 📦 Case Opening Issues

### "You do not have this case"

**Solutions:**
1. Buy case from shop: `/shop`
2. Wait for level up reward
3. Admin can grant: `/admin givecase`

**Verify inventory:**
```powershell
# Check database
npx prisma studio
# Navigate to UserCase table
```

### "You do not have this key"

**Solutions:**
1. Buy from shop: `/shop`
2. Vote on Top.gg
3. Admin can grant: `/admin givekey`

### "Daily case opening limit reached"

**Cause:** Opened 10 cases today (default limit).

**Solutions:**
1. Wait until tomorrow
2. Admin can adjust limit in guild config
3. Upgrade to premium (future feature)

**Check count:**
```sql
SELECT "casesOpened" 
FROM "UserGuildProfile" 
WHERE "userId" = 'YOUR_ID';
```

### Case opening animation stuck

**Cause:** Bot lag or Discord API issues.

**Solution:**
- Wait a few seconds
- If still stuck, try opening another case
- Check bot logs for errors

## 💰 Economy Issues

### "Insufficient funds" but I have coins

**Possible causes:**

1. **Wrong guild**
   - Coins are per-server
   - Check you're in correct server

2. **Price changed**
   - Shop prices may have been updated
   - Check current price with `/shop`

3. **Database sync issue**
   - Rare, check logs
   - Restart bot

**Verify balance:**
```sql
SELECT "coins" 
FROM "UserGuildProfile" 
WHERE "userId" = 'YOUR_ID' 
AND "guildId" = 'GUILD_ID';
```

### Transaction failed but coins deducted

**Cause:** Transaction rollback failure (very rare).

**Solution:**
1. Check logs for error
2. Contact admin
3. Admin can refund:
```powershell
# Use admin command
/admin givecoin user:@user amount:LOST_AMOUNT
```

### Negative coins balance

**Cause:** Bug in transaction logic.

**Immediate fix:**
```sql
UPDATE "UserGuildProfile" 
SET "coins" = 0 
WHERE "coins" < 0;
```

**Report bug** with logs to developer.

## 🏛️ Market Issues

### "Listing not found"

**Causes:**
1. Item already sold
2. Seller cancelled listing
3. Database lag

**Solution:** Refresh market with `/market browse`

### Cannot list item

**Checklist:**
1. ✅ Item is in your inventory
2. ✅ Item is not already listed
3. ✅ You have <20 active listings
4. ✅ Price is between 10 and 1,000,000
5. ✅ Item is not locked

**Check item status:**
```sql
SELECT * FROM "UserItem" WHERE "id" = ITEM_ID;
```

### "This item already sold"

**Cause:** Someone bought it before you.

**Solution:** Normal behavior, search for another.

### Market showing wrong prices

**Cause:** Cache issue.

**Solution:**
1. Wait 30 seconds
2. Try command again
3. If persists, restart bot

## 🔧 Performance Issues

### Bot is slow to respond

**Possible causes:**

1. **Database overload**
   - Too many users
   - Missing indexes

**Solution:**
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

2. **Redis connection issues**
   - Check Redis is running
   - Check Redis memory

**Solution:**
```powershell
redis-cli info memory
```

3. **Discord API rate limiting**
   - Normal during high traffic
   - Wait a few seconds

### High memory usage

**Cause:** Cache buildup or memory leak.

**Solutions:**

1. **Restart bot:**
```powershell
pm2 restart csgo-bot
```

2. **Clear Redis cache:**
```powershell
redis-cli FLUSHDB
```

3. **Check for leaks:**
```powershell
# Monitor memory
pm2 monit
```

### Database connection errors

**Symptoms:**
- "Too many connections"
- "Connection timeout"

**Solutions:**

1. **Increase pool size:**
```
DATABASE_URL="postgresql://user:pass@localhost:5432/db?connection_limit=20"
```

2. **Check active connections:**
```sql
SELECT count(*) FROM pg_stat_activity;
```

3. **Kill idle connections:**
```sql
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND state_change < NOW() - INTERVAL '5 minutes';
```

## 🐛 Error Messages

### "Cannot read property 'guild' of undefined"

**Cause:** Command used in DM instead of server.

**Solution:** Use command in a server channel.

### "Missing Access"

**Cause:** Bot lacks permissions.

**Solution:** Give bot required permissions in server settings.

### "Unknown Interaction"

**Cause:** Command took too long (>3 seconds).

**Solution:**
1. Use `await interaction.deferReply()` in command
2. Optimize slow database queries

### "DiscordAPIError[50013]: Missing Permissions"

**Cause:** Bot can't perform action in that channel.

**Solution:** Check channel permissions for bot role.

## 📊 Database Issues

### "Unique constraint violation"

**Common scenarios:**

1. **Duplicate vote:**
   - Normal, prevents abuse
   - Vote tracking working correctly

2. **User already exists:**
   - Use upsert instead of create
   - Check code logic

### Migration fails

**Error:** "Migration failed to apply"

**Solutions:**

1. **Reset migrations (DEV ONLY):**
```powershell
npx prisma migrate reset
npx tsx src/db/seed.ts
```

2. **Manually fix:**
```sql
-- Check migration status
SELECT * FROM "_prisma_migrations";
```

3. **Revert schema:**
```powershell
git checkout schema.prisma
npm run prisma:generate
```

### Data corruption

**Symptoms:**
- Negative values
- Missing relationships
- Duplicate entries

**Emergency backup:**
```powershell
# Export current data
npx prisma db pull
pg_dump csgo_bot > backup.sql
```

**Restore from backup:**
```powershell
psql csgo_bot < backup.sql
```

## 🔐 Security Issues

### "Unauthorized" on webhook

**Cause:** Wrong TOPGG_WEBHOOK_SECRET.

**Solution:**
1. Get correct secret from Top.gg dashboard
2. Update in `.env`
3. Restart bot

### Spam attacks

**Built-in protection:**
- Anti-spam middleware (5 msgs / 10 sec)
- XP cooldowns (60 seconds)
- Command cooldowns (5-10 seconds)

**Additional measures:**
1. Ban user: `/admin ban user:@spammer`
2. Ignore channel: `/admin config`
3. Report to Discord

## 🆘 Getting Help

### Before asking for help:

1. ✅ Check this troubleshooting guide
2. ✅ Check logs in `logs/error.log`
3. ✅ Check Discord Developer Portal
4. ✅ Verify .env configuration
5. ✅ Try restarting bot

### Information to provide:

- Bot version
- Node.js version
- PostgreSQL version
- Error message (full stack trace)
- Steps to reproduce
- Relevant code snippet
- Log files

### Useful commands for debugging:

```powershell
# Check bot is running
pm2 list

# View logs
pm2 logs csgo-bot

# Check database
npx prisma studio

# Test Redis
redis-cli ping

# Check Node version
node --version

# Check dependencies
npm list
```

### Emergency bot restart:

```powershell
# If using PM2
pm2 restart csgo-bot

# If running with npm
# Ctrl+C to stop
npm run dev
```

## 📚 Additional Resources

- [Discord.js Guide](https://discordjs.guide/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Manual](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

---

**Still having issues?** Open an issue on GitHub with:
- Environment (Windows/Linux/Mac)
- Node version
- Full error message
- Steps to reproduce
