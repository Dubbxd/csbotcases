# CS:GO Discord Bot 🎮

Bot de Discord tipo Karuta con sistema de cajas CS:GO/CS2, economía completa, y mercado entre jugadores.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-14.14-5865F2)](https://discord.js.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🌟 Features

### Core Systems
- 🎯 **Sistema de XP y Niveles** - Gana experiencia por actividad, sube de nivel y desbloquea recompensas
- 📦 **Cajas y Llaves** - Sistema de cajas tipo CS:GO con probabilidades por rareza
- 💰 **Economía Completa** - Monedas, tienda dinámica, y recompensas diarias
- 🎒 **Inventario Inteligente** - Sistema de colección con filtros y paginación
- 🏪 **Mercado P2P** - Marketplace entre jugadores con comisiones y anti-duplicados
- 🎨 **Cosméticos** - Estantes de exhibición y backgrounds personalizables
- 🗳️ **Sistema de Votos** - Integración con Top.gg para recompensas por voto

### Security & Performance
- ⚙️ **Anti-Spam** - Protección contra flood y mensajes repetitivos
- 🔒 **Sistema de Baneos** - Control de usuarios problemáticos
- ⏱️ **Cooldowns Inteligentes** - Rate limiting con Redis
- 🛡️ **Transacciones Seguras** - Atomic DB transactions para prevenir duplicados
- 📊 **Logging Completo** - Sistema de logs con Winston

## 📋 Quick Start

```powershell
# 1. Install dependencies
npm install

# 2. Configure environment
# Edit .env with your Discord token and database URL

# 3. Setup database
npm run prisma:generate
npm run prisma:migrate
npx tsx src/db/seed.ts

# 4. Deploy commands
npm run deploy-commands

# 5. Start bot
npm run dev
```

**📖 Detailed guides:**
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup
- [INSTALLATION.md](./INSTALLATION.md) - Complete installation guide
- [COMMANDS.md](./COMMANDS.md) - All available commands

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        Discord Users                             │
└────────────────┬───────────────────────────┬────────────────────┘
                 │                           │
                 │ Slash Commands            │ Messages
                 ▼                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Discord.js Client                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Events     │  │  Commands    │  │  Middleware  │          │
│  │              │  │              │  │              │          │
│  │ • ready      │  │ • info/      │  │ • cooldowns  │          │
│  │ • message    │  │ • economy/   │  │ • anti-spam  │          │
│  │ • interaction│  │ • cases/     │  │ • ban check  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 │ Service Layer
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Core Services                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │    XP    │ │ Economy  │ │   Loot   │ │  Market  │          │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │Inventory │ │   User   │ │  Guild   │                        │
│  │ Service  │ │ Service  │ │ Service  │                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
└────────────────┬──────────────────┬─────────────────────────────┘
                 │                  │
                 ▼                  ▼
┌──────────────────────┐  ┌──────────────────────┐
│   PostgreSQL DB      │  │      Redis Cache     │
│  (Prisma ORM)        │  │   (Cooldowns)        │
│                      │  │                      │
│ • Users              │  │ • XP cooldowns       │
│ • Guilds             │  │ • Command cooldowns  │
│ • Items              │  │ • Anti-spam tracking │
│ • Cases              │  │                      │
│ • Transactions       │  │                      │
│ • Market Listings    │  │                      │
└──────────────────────┘  └──────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Express API Server                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Webhooks                                                 │  │
│  │  • /webhooks/votes/topgg  (Vote rewards)                 │  │
│  │  • /health                (Health check)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Estructura del Proyecto

```
csgo-bot/
├── src/
│   ├── bot/                    # Discord bot logic
│   │   ├── commands/           # Slash commands
│   │   │   ├── info/          # ping, profile, help
│   │   │   ├── xp/            # rank, leaderboard
│   │   │   ├── economy/       # balance, daily, shop
│   │   │   ├── cases/         # open, inventory
│   │   │   ├── market/        # browse, list, buy
│   │   │   └── admin/         # config, ban, give
│   │   ├── events/            # Event handlers
│   │   │   ├── ready.ts
│   │   │   ├── messageCreate.ts
│   │   │   ├── interactionCreate.ts
│   │   │   └── guildCreate.ts
│   │   ├── middleware/        # Bot middleware
│   │   │   ├── cooldownManager.ts
│   │   │   └── antiSpam.ts
│   │   ├── utils/            # Utilities
│   │   │   ├── logger.ts
│   │   │   ├── embeds.ts
│   │   │   └── pagination.ts
│   │   └── client.ts         # Extended Discord client
│   │
│   ├── core/                 # Business logic services
│   │   ├── xp/
│   │   │   └── xpService.ts
│   │   ├── economy/
│   │   │   ├── currencyService.ts
│   │   │   └── dailyService.ts
│   │   ├── loot/
│   │   │   ├── caseService.ts
│   │   │   └── dropTableService.ts
│   │   ├── inventory/
│   │   │   └── inventoryService.ts
│   │   ├── market/
│   │   │   └── marketService.ts
│   │   ├── user/
│   │   │   └── userService.ts
│   │   └── guild/
│   │       └── guildConfigService.ts
│   │
│   ├── api/                  # Web API
│   │   ├── routes/
│   │   │   ├── health.ts
│   │   │   └── votes.ts
│   │   └── server.ts
│   │
│   ├── db/                   # Database
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── client.ts
│   │   └── seed.ts
│   │
│   ├── config/               # Configuration
│   │   ├── drop-tables/      # JSON drop tables
│   │   │   ├── classic.json
│   │   │   ├── knives.json
│   │   │   └── agents.json
│   │   ├── env.ts
│   │   └── constants.ts
│   │
│   └── index.ts             # Main entry point
│
├── .env                     # Environment variables
├── .env.example            # Example configuration
├── package.json
├── tsconfig.json
├── README.md
├── INSTALLATION.md         # Complete setup guide
├── COMMANDS.md            # Command documentation
└── QUICKSTART.md          # Quick start guide
```

## Comandos

### Información
- `/ping` - Check bot latency
- `/profile [@user]` - Ver perfil de usuario
- `/rank [@user]` - Ver nivel y XP
- `/leaderboard` - Top usuarios del servidor

### Cajas e Inventario
- `/cases` - Ver tipos de cajas disponibles
- `/open <case>` - Abrir una caja
- `/inventory [filter]` - Ver tu inventario
- `/daily` - Reclamar recompensa diaria

### Economía
- `/balance` - Ver tus monedas
- `/shop` - Ver la tienda
- `/buy <item>` - Comprar en la tienda

### Mercado
- `/market browse [filters]` - Navegar mercado
- `/market list <item> <price>` - Listar ítem
- `/market buy <listing_id>` - Comprar ítem
- `/market cancel <listing_id>` - Cancelar listado

### Cosméticos
- `/shelf [configure]` - Configurar estante de exhibición
- `/background [set]` - Cambiar background

### Admin
- `/admin config` - Configurar servidor
- `/admin ban <user>` - Banear usuario
- `/admin economy <action>` - Controlar economía

## 🛠️ Tecnologías

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ |
| Language | TypeScript 5.3 |
| Discord | discord.js v14 |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis (ioredis) |
| API | Express |
| Logging | Winston |
| Validation | Zod |

## 🎲 Sistema de Drops

El bot usa un sistema de probabilidades tipo CS:GO:

| Rarity | Emoji | Drop Rate | Bonus Coins | Bonus XP |
|--------|-------|-----------|-------------|----------|
| Common | ⚪ | 55% | +10 | +5 |
| Uncommon | 🔵 | 30% | +25 | +15 |
| Rare | 💙 | 10% | +50 | +30 |
| Very Rare | 💜 | 4% | +100 | +60 |
| Legendary | 🌟 | 1% | +250 | +150 |
| Exotic | 🔴 | 0.1% | +500 | +300 |

## 📖 Documentación Completa

- **[QUICKSTART.md](./QUICKSTART.md)** - Inicio rápido en 5 minutos
- **[INSTALLATION.md](./INSTALLATION.md)** - Guía completa de instalación
- **[COMMANDS.md](./COMMANDS.md)** - Referencia de todos los comandos
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Organización del código
- **[ROADMAP.md](./ROADMAP.md)** - Roadmap y features futuras
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solución de problemas

## 🤝 Contribuir

¿Quieres contribuir? ¡Genial!

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

Ver [ROADMAP.md](./ROADMAP.md) para features planeadas.

## ⚠️ Disclaimer

Este es un bot de entretenimiento para servidores de Discord. No involucra dinero real ni gambling con moneda real. Todas las "monedas" y "items" son virtuales y sin valor monetario.

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- Discord.js por la excelente librería
- Prisma por el ORM moderno
- La comunidad de CS:GO por la inspiración

## 📞 Soporte

- 📖 Revisa la [documentación](./INSTALLATION.md)
- 🐛 Reporta bugs en [Issues](https://github.com/yourusername/csgo-bot/issues)
- 💬 Preguntas en [Discussions](https://github.com/yourusername/csgo-bot/discussions)
- 🔧 Problemas comunes en [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

⭐ **Si te gusta el proyecto, dale una estrella en GitHub!**
