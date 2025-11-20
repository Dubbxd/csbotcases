# 🎁 Sistema de Drops Automáticos - CS:GO Bot

## 📋 Resumen

El bot ahora incluye un **sistema de drops automáticos** similar a Karuta, donde cajas y items aparecen aleatoriamente en los canales del servidor para que los usuarios los reclamen.

---

## ✨ Características

### 🎰 Drops Aleatorios
- **Aparecen automáticamente** cada 30 minutos - 2 horas
- **Cualquier canal de texto** puede recibir drops
- **Basados en rareza** con probabilidades realistas:
  - ⚪ COMMON: 40%
  - 🔵 UNCOMMON: 30%
  - 🟣 RARE: 15%
  - 🟣 EPIC: 10%
  - 🟡 LEGENDARY: 4%
  - 🔴 EXOTIC: 1% (Knives, special items)

### ⏱️ Sistema de Reclamo
- **60 segundos** para reclamar después de aparecer
- **Primero en llegar, primero en recibir**
- **Click en el botón** para reclamar
- Items se agregan automáticamente al inventario

---

## 🛠️ Comandos Nuevos

### Para Usuarios

#### `/start`
Obtén tu paquete de inicio (solo una vez):
- 💰 1000 coins
- 📦 2x Classic Case
- 🔑 2x Universal Key

#### `/shop`
Ver todas las cajas y llaves disponibles para comprar

#### `/buy <item> [cantidad]`
Comprar cajas o llaves con coins
- `case_1` - Classic Case (500 coins)
- `case_2` - Knife Collection (2000 coins)  
- `case_3` - Agent Case (1000 coins)
- `key_1` - Universal Key (200 coins)

**Ejemplo:**
```
/buy item:case_1 amount:3
```

#### `/gift <usuario> <cantidad>`
Regalar coins a otros jugadores

---

## 🎮 Cómo Funciona

### 1. **Drops Automáticos**
```
[Bot Message]
🚨 ITEM DROP! 🚨

📦 A Case Has Appeared!
🟡 Dragon Lore AWP

Click the button below to claim it!
First come, first served!

[🎁 Claim Drop Button]

Rarity: LEGENDARY | 60s to claim
```

### 2. **Alguien lo Reclama**
```
✅ Drop Claimed!
@Usuario claimed 🟡 Dragon Lore AWP!

Better luck next time!
```

### 3. **Item va al Inventario**
El item se agrega automáticamente al `/inventory` del usuario

---

## 🔧 Configuración del Sistema

### Intervalos de Drop
```typescript
minInterval: 30  // 30 minutos mínimo
maxInterval: 120 // 2 horas máximo
```

### Tiempo de Reclamo
```typescript
claimTimeout: 60 // 60 segundos
```

### Probabilidades de Rareza
```typescript
COMMON: 40%
UNCOMMON: 30%
RARE: 15%
EPIC: 10%
LEGENDARY: 4%
EXOTIC: 1%
```

---

## 📊 Base de Datos de Items

### Scraper de Steam Market

El bot incluye un scraper para obtener items reales de CS:GO desde Steam Community Market:

#### Uso Manual
```bash
# Ejecutar el scraper
npx tsx src/core/scraper/steamMarketScraper.ts
```

Esto hará:
1. Buscar cajas en el Steam Market
2. Buscar armas populares (AK-47, AWP, M4A4, etc.)
3. Buscar agentes
4. Sincronizar todo a la base de datos

#### Items Soportados
- 📦 **Cases** - Cajas del juego
- 🔫 **Skins** - Skins de armas
- 🔪 **Knives** - Cuchillos (EXOTIC)
- 🧤 **Gloves** - Guantes
- 🎭 **Agents** - Agentes/Operadores
- 🎵 **Music Kits** - Kits de música
- 🎨 **Stickers** - Stickers
- 🖌️ **Graffiti** - Graffitis

---

## 🎯 Estrategia de Juego

### Para Usuarios

1. **Usa `/start`** para obtener tu paquete inicial
2. **Abre tus cajas gratis** con `/open`
3. **Mantente activo** en el servidor para ver drops
4. **Sé rápido** - tienes 60 segundos para reclamar
5. **Gana coins** con `/daily` y subiendo de nivel
6. **Compra más cajas** en el `/shop`

### Ciclo de Economía
```
Chatear → Ganar XP → Subir Nivel → Obtener Coins
                                       ↓
                          ← Comprar Cajas ← /daily
                                       ↓
                                  Abrir Cajas
                                       ↓
                          ← Obtener Items Raros → 
```

---

## 📈 Estadísticas

El sistema registra:
- ✅ Drops totales en el servidor
- ✅ Quién reclamó qué
- ✅ Rareza de items obtenidos
- ✅ Horarios de drops

---

## 🔮 Próximas Features

### v1.1
- 🔄 Sistema de intercambio (trade) entre usuarios
- 📊 Estadísticas de drop rate por usuario
- 🎁 Eventos especiales con drops aumentados
- 🏆 Logros por reclamar ciertos items

### v1.2
- 🌐 Marketplace global entre servidores
- 💎 Items especiales de evento
- 📦 Cajas exclusivas de servidor
- 🎨 Customización de drop rate por canal

---

## ⚙️ Configuración de Servidor

### Habilitar/Deshabilitar Drops
```sql
-- Próximamente: Comando /admin drops toggle
```

### Canales Específicos para Drops
```sql
-- Próximamente: Configurar canales permitidos
```

---

## 💡 Tips

### Para Usuarios
- 🔔 Activa notificaciones para no perderte drops
- ⚡ Ten Discord abierto para reaccionar rápido
- 💬 Chatea regularmente para ganar XP y coins
- 🎯 Guarda coins para cajas especiales

### Para Admins
- 📣 Anuncia cuando haya drops para mantener actividad
- 🎉 Usa el sistema para eventos especiales
- 📊 Revisa estadísticas de engagement

---

## 🐛 Troubleshooting

### Los drops no aparecen
- ✅ Verifica que el bot tenga permisos para enviar mensajes
- ✅ Verifica que el bot tenga permisos para usar botones
- ✅ Espera - los drops son aleatorios (30min - 2h)

### No puedo reclamar
- ✅ Solo el primero en clickear puede reclamar
- ✅ Tienes 60 segundos desde que aparece
- ✅ Verifica tu conexión a internet

### El item no aparece en mi inventario
- ✅ Usa `/inventory` para verificar
- ✅ Revisa los logs del bot
- ✅ Reporta el bug en GitHub

---

## 📝 Changelog

### v1.0.0 (2025-11-19)
- ✨ Sistema de drops aleatorios implementado
- ✨ Scraper de Steam Market
- ✨ Comandos /shop, /buy, /gift, /start
- ✨ Integración con sistema de inventario
- ✨ Botones interactivos para reclamar

---

**¡Disfruta del sistema de drops y buena suerte consiguiendo items raros!** 🎰🔥
