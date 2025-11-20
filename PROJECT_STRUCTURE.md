# Project Structure Overview

This document explains the organization and purpose of each directory and key file in the project.

## Root Directory

```
BotDiscord/
├── src/                    # Source code
├── prisma/                 # Generated Prisma files
├── dist/                   # Compiled JavaScript (after build)
├── logs/                   # Application logs
├── node_modules/           # Dependencies
├── .env                    # Environment variables (not in git)
├── .env.example           # Example environment file
├── .gitignore             # Git ignore rules
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── README.md              # Project overview
├── INSTALLATION.md        # Complete setup guide
├── COMMANDS.md            # Command documentation
├── QUICKSTART.md          # Quick start guide
└── setup.ps1              # Automated setup script
```

## Source Code (`src/`)

### `src/bot/` - Discord Bot Implementation

**Purpose:** All Discord-specific code, commands, events, and utilities.

```
bot/
├── commands/               # Slash command implementations
│   ├── info/              # General info commands
│   ├── xp/                # XP and leveling commands
│   ├── economy/           # Currency and shop commands
│   ├── cases/             # Case opening and inventory
│   ├── market/            # Marketplace commands
│   └── admin/             # Administrator commands
│
├── events/                # Discord event handlers
│   ├── ready.ts          # Bot startup
│   ├── messageCreate.ts  # Message events (XP system)
│   ├── interactionCreate.ts  # Slash command handling
│   └── guildCreate.ts    # New server joined
│
├── middleware/            # Bot middleware
│   ├── cooldownManager.ts    # Rate limiting
│   └── antiSpam.ts          # Spam detection
│
├── utils/                 # Bot utilities
│   ├── logger.ts         # Winston logger
│   ├── embeds.ts         # Discord embed helpers
│   └── pagination.ts     # Paginated messages
│
├── client.ts             # Extended Discord.js client
└── deploy-commands.ts    # Command registration script
```

### `src/core/` - Business Logic Services

**Purpose:** Pure business logic, database operations, and game mechanics.

```
core/
├── xp/
│   └── xpService.ts          # XP calculation and leveling
│
├── economy/
│   ├── currencyService.ts    # Coin management
│   └── dailyService.ts       # Daily rewards
│
├── loot/
│   ├── caseService.ts        # Case opening logic
│   └── dropTableService.ts   # Drop probability system
│
├── inventory/
│   └── inventoryService.ts   # Item management
│
├── market/
│   └── marketService.ts      # P2P marketplace
│
├── user/
│   └── userService.ts        # User profiles
│
└── guild/
    └── guildConfigService.ts # Server configuration
```

**Why separated from `bot/`?**
- Business logic is independent of Discord
- Easier to test
- Could be reused in web interface
- Clear separation of concerns

### `src/api/` - Web API Server

**Purpose:** HTTP endpoints for webhooks and future web integrations.

```
api/
├── routes/
│   ├── health.ts          # Health check endpoint
│   └── votes.ts           # Top.gg webhook
│
└── server.ts              # Express app configuration
```

**Current endpoints:**
- `GET /health` - Health check
- `POST /webhooks/votes/topgg` - Vote rewards

### `src/db/` - Database Layer

**Purpose:** Database schema, client, and seed data.

```
db/
├── prisma/
│   └── schema.prisma      # Database schema definition
│
├── client.ts              # Prisma client singleton
└── seed.ts               # Initial data seeder
```

**Schema includes:**
- Users and guilds
- XP profiles
- Items and cases
- Market listings
- Transactions
- Configuration

### `src/config/` - Configuration

**Purpose:** Application configuration and game data.

```
config/
├── drop-tables/           # Case drop definitions (JSON)
│   ├── classic.json      # Classic case drops
│   ├── knives.json       # Knife collection
│   └── agents.json       # Agent case
│
├── env.ts                # Environment variables schema
└── constants.ts          # Game constants and formulas
```

**Why JSON drop tables?**
- Easy to edit without code changes
- Can be hot-reloaded
- Non-technical users can modify
- Version control friendly

## Key Files Explained

### `src/index.ts`
**Entry point** - Starts bot and API server.

### `src/bot/client.ts`
**Extended Discord client** - Loads commands and events, custom methods.

### `src/db/prisma/schema.prisma`
**Database schema** - Defines all tables, relations, and indexes.

### `src/config/constants.ts`
**Game constants** - XP formulas, drop rates, limits, messages.

### `src/config/env.ts`
**Environment config** - Validates and parses .env using Zod.

## Data Flow Examples

### XP System Flow
```
User sends message
    ↓
messageCreate.ts (bot/events/)
    ↓
Check cooldown (middleware/cooldownManager.ts)
    ↓
Check spam (middleware/antiSpam.ts)
    ↓
xpService.addXP() (core/xp/)
    ↓
Update database (Prisma)
    ↓
If level up → Grant rewards
```

### Case Opening Flow
```
User runs /open
    ↓
open.ts command (bot/commands/cases/)
    ↓
caseService.openCase() (core/loot/)
    ↓
Check user has case + key
    ↓
dropTableService.performDrop()
    ↓
Select rarity → Select item
    ↓
Transaction: Remove case+key, Add item
    ↓
Return result to user
```

### Market Transaction Flow
```
User runs /market buy
    ↓
buyitem.ts command (bot/commands/market/)
    ↓
marketService.buyItem() (core/market/)
    ↓
Validate listing still active
    ↓
Check buyer has coins
    ↓
Atomic transaction:
  - Transfer coins
  - Transfer item ownership
  - Update listing
  - Log transactions
    ↓
Notify buyer and seller
```

## Adding New Features

### Adding a New Command

1. Create file in `src/bot/commands/<category>/<name>.ts`
2. Export default object with `data` and `execute`
3. Restart bot (auto-loaded)
4. Run `npm run deploy-commands`

### Adding a New Item Type

1. Add enum value in `prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Update constants in `src/config/constants.ts`
4. Add to drop tables JSON files
5. Update embed helpers if needed

### Adding a New Service

1. Create file in `src/core/<category>/<name>Service.ts`
2. Implement business logic methods
3. Export singleton instance
4. Import in commands/events as needed

### Adding New Drop Table

1. Create JSON file in `src/config/drop-tables/`
2. Follow existing format
3. Update `dropTableService.ts` to load it
4. Run seed script to sync to database

## Best Practices

### Service Layer
- ✅ Keep pure business logic
- ✅ No Discord.js imports
- ✅ Use Prisma for DB access
- ✅ Throw errors, handle in commands
- ✅ Make testable

### Command Files
- ✅ Handle Discord interaction
- ✅ Call service methods
- ✅ Use EmbedHelper for responses
- ✅ Catch and display errors
- ✅ Keep thin, delegate to services

### Database
- ✅ Use transactions for multi-step operations
- ✅ Add indexes for frequent queries
- ✅ Validate data before saving
- ✅ Use Prisma migrations

### Configuration
- ✅ Use .env for secrets
- ✅ Use constants.ts for game logic
- ✅ Use JSON for data tables
- ✅ Validate env with Zod

## Development Workflow

1. **Make changes** to code
2. **Test locally** with `npm run dev`
3. **Check logs** in `logs/` directory
4. **Run migrations** if schema changed
5. **Deploy commands** if commands changed
6. **Build** with `npm run build` before production

## Testing

Currently no automated tests, but you can:
- Test commands in Discord
- Check `logs/combined.log` for errors
- Use Prisma Studio to inspect database
- Monitor Redis with `redis-cli monitor`

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `API_SECRET`
- [ ] Configure production `DATABASE_URL`
- [ ] Set up Redis with password
- [ ] Enable logging to file
- [ ] Set up PM2 for process management
- [ ] Configure backup strategy
- [ ] Set up monitoring (logs, uptime)
- [ ] Use HTTPS for webhooks
- [ ] Rate limit API endpoints

## Need Help?

- Check inline code comments
- Read service method JSDoc
- Check logs in `logs/`
- Use Prisma Studio to debug DB
- Review Discord.js documentation
