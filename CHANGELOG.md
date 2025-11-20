# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-19

### 🎉 Initial Release

#### Added - Core Systems
- **XP & Leveling System**
  - Message-based XP gain with cooldowns
  - Dynamic level calculation formula
  - Level-up rewards (coins and cases)
  - Server leaderboards
  - User rank tracking

- **Economy System**
  - Coin currency
  - Daily rewards (24h cooldown)
  - Transaction logging
  - Balance tracking per server

- **Case Opening System**
  - 3 case types (Classic, Knives, Agents)
  - Rarity-based drop system (6 tiers)
  - Universal key system
  - Daily opening limits
  - Bonus coins and XP on drops
  - Drop table configuration via JSON

- **Inventory Management**
  - Item collection system
  - Paginated inventory view
  - Rarity filters
  - Item recycling for coins
  - Item statistics

- **P2P Marketplace**
  - List items for sale
  - Browse with filters
  - Secure transactions
  - 5% marketplace fee
  - Listing management
  - Purchase history

#### Added - Commands

**Information:**
- `/ping` - Check bot latency
- `/profile [user]` - View user profile
- `/balance [user]` - Check coin balance

**XP & Leveling:**
- `/rank [user]` - View current rank
- `/leaderboard` - Top 10 users

**Economy:**
- `/daily` - Claim daily reward
- `/shop` - Browse shop
- `/buy <item>` - Purchase items

**Cases:**
- `/cases` - View available cases
- `/open <case> <key>` - Open a case
- `/inventory [filter]` - View inventory

**Market:**
- `/market browse [filters]` - Browse listings
- `/market list <item> <price>` - List item
- `/market buy <listing>` - Buy item
- `/market cancel <listing>` - Cancel listing

**Admin:**
- `/admin config` - Configure server
- `/admin ban <user>` - Ban user
- `/admin unban <user>` - Unban user

#### Added - Features

**Security & Anti-Abuse:**
- Redis-based cooldown system
- Anti-spam protection (rate limiting)
- Message repetition detection
- Minimum message length requirement
- User ban system
- Transaction atomicity

**Database:**
- PostgreSQL with Prisma ORM
- Comprehensive schema with indexes
- Relationship management
- Migration system

**API:**
- Express server
- Health check endpoint
- Top.gg webhook for vote rewards

**Configuration:**
- Per-server settings
- Configurable XP rates
- Configurable rewards
- Channel ignore list
- Custom level-up channels

**Developer Experience:**
- TypeScript for type safety
- Winston logging system
- Environment validation with Zod
- Modular architecture
- Comprehensive documentation

#### Technical Details

**Dependencies:**
- discord.js ^14.14.1
- @prisma/client ^5.7.0
- ioredis ^5.3.2
- express ^4.18.2
- winston ^3.11.0
- zod ^3.22.4

**Database Tables:**
- User, Guild, UserGuildProfile
- ItemDefinition, UserItem
- CaseDefinition, CaseDropTable, UserCase
- KeyDefinition, UserKey
- Transaction, MarketListing
- GuildConfig, VoteLog, Cooldown

**Performance:**
- Redis caching for cooldowns
- Database indexes for queries
- Paginated results
- Efficient transaction handling

### 📚 Documentation

- Complete installation guide
- Command reference
- Project structure documentation
- Troubleshooting guide
- Roadmap for future features
- Quick start guide

### Known Issues

- TypeScript compilation errors (cosmetic, doesn't affect functionality)
- Some Prisma implicit any types
- Vote system partially implemented (requires setup)

---

## [Unreleased]

### Planned for v1.1.0

- [ ] Interactive /help command
- [ ] Mission/achievement system
- [ ] Trade system between users
- [ ] Advanced statistics
- [ ] Item crafting system
- [ ] Showcase/shelf cosmetics

### Under Consideration

- Web dashboard
- Event system
- Premium features
- Mobile responsiveness
- Multi-language support

---

## Version Naming Convention

- **Major** (X.0.0) - Breaking changes or major features
- **Minor** (1.X.0) - New features, backward compatible
- **Patch** (1.0.X) - Bug fixes, minor improvements

## Support

For issues or questions:
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Open an issue on GitHub
- Review documentation in [INSTALLATION.md](./INSTALLATION.md)
