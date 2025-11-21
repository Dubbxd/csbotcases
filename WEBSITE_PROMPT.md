# 🎮 PROMPT COMPLETO: CSBot - Discord Bot de Cajas CS:GO/CS2

## OBJETIVO
Crear una página web moderna, atractiva e informativa para promocionar **CaseOps**, un bot de Discord con sistema de cajas estilo CS:GO/CS2, economía completa, sistema de XP, mercado entre jugadores y colección de skins.

---

## 📋 DESCRIPCIÓN DEL BOT

### Concepto General
CaseOps es un bot de Discord inspirado en el sistema de cajas de CS:GO/CS2 y bots de colección tipo Karuta. Los usuarios pueden:
- Abrir cajas para obtener skins aleatorias
- Coleccionar armas con diferentes rarezas
- Comprar y vender items en un mercado P2P
- Ganar XP por actividad en el servidor
- Competir en leaderboards
- Quemar items no deseados por monedas
- Personalizar su perfil con cosméticos

### Stack Tecnológico
- **Runtime:** Node.js 20+
- **Lenguaje:** TypeScript 5.3
- **Framework Discord:** discord.js v14
- **Base de Datos:** PostgreSQL + Prisma ORM
- **Cache:** Redis (ioredis)
- **API:** Express
- **Logging:** Winston
- **Validación:** Zod

---

## 🎯 SISTEMAS PRINCIPALES

### 1. SISTEMA DE XP Y NIVELES
**Cómo funciona:**
- Los usuarios ganan XP al enviar mensajes en el servidor
- XP variable por mensaje: 10-25 puntos
- Cooldown de 60 segundos entre mensajes que dan XP
- Fórmula de nivel: `XP_necesario = 100 * (nivel ^ 1.5)`
- Recompensas al subir de nivel: coins y casos gratis

**Comandos:**
- `/profile [@usuario]` - Ver tu perfil con nivel, XP, monedas y stats
- `/rank [@usuario]` - Ver posición en el ranking
- `/leaderboard` - Top 10 usuarios del servidor

**Características:**
- Sistema anti-spam integrado
- Mensajes personalizables de level-up
- Configuración por servidor (XP mínimo/máximo, cooldown)

---

### 2. SISTEMA DE CAJAS Y DROPS 📦

**Tipos de Cajas:**
1. **Dreams & Nightmares Case** 🌙
   - Colección de skins de la comunidad
   - Precio: 100 coins
   
2. **Chroma 3 Case** 🌈
   - Skins coloridas con acabados vibrantes
   - Precio: 120 coins

**Sistema de Rareza (CS:GO Authentic):**

| Rareza | Emoji | Nombre | Probabilidad | Bonus Coins | Bonus XP |
|--------|-------|--------|--------------|-------------|----------|
| ⚪ COMMON | Consumer Grade | 55% | +10 | +5 |
| 🔵 UNCOMMON | Mil-Spec | 30% | +25 | +15 |
| 🟣 RARE | Restricted | 10% | +50 | +30 |
| 🩷 VERY_RARE | Classified | 4% | +100 | +60 |
| 🔴 LEGENDARY | Covert | 1% | +250 | +150 |
| ⭐ EXOTIC | Exceedingly Rare | 0.1% | +500 | +300 |

**Mecánica de Apertura:**
1. Usuario usa `/open <nombre_caja>`
2. Se consume 1 caja + 1 llave del inventario
3. Animación de "spinning" con barras de rareza: ⚪🔵🟣🔴⭐
4. Reveal dramático con delay
5. Item añadido al inventario + bonus de coins/XP
6. Imagen del skin mostrada en el embed

**Comandos:**
- `/open dreams` - Abrir Dreams & Nightmares Case
- `/open chroma` - Abrir Chroma 3 Case
- `/cases` - Ver todas las cajas disponibles
- `/inventory [filter]` - Ver tus items (filtro por rareza opcional)

**Items Disponibles (Ejemplos):**
- MP7 | Abyssal Apparition (Mil-Spec)
- P250 | Asiimov (Mil-Spec)
- M4A1-S | Night Terror (Classified)
- AK-47 | Nightwish (Classified)
- AWP | Desert Hydra (Covert)
- ★ Butterfly Knife | Doppler (Exceedingly Rare)

---

### 3. SISTEMA DE ECONOMÍA 💰

**Moneda:** Coins (💰)

**Formas de Ganar Coins:**
1. **Daily Reward** - 100 coins cada 24h (`/daily`)
2. **Level Up** - 50 coins por nivel
3. **Abrir Cajas** - Bonus según rareza del item
4. **Vender en Market** - Precio que tú decidas
5. **Quemar Items** - Valor fijo según rareza
6. **Regalar** - Otros usuarios pueden darte (`/gift`)

**Comandos:**
- `/balance [@usuario]` - Ver monedas propias o de otro
- `/daily` - Reclamar recompensa diaria
- `/gift @usuario <cantidad>` - Regalar coins
- `/shop` - Ver tienda de cajas y llaves

**Precios de Tienda:**
- 🔑 Universal Key: 50 coins
- 📦 Dreams & Nightmares Case: 100 coins
- 📦 Chroma 3 Case: 120 coins

---

### 4. SISTEMA DE INVENTARIO 🎒

**Características:**
- Paginación de 3 items por página
- Filtros por rareza (Mil-Spec, Restricted, Classified, Covert, Exotic)
- Resumen compacto de cajas y llaves
- Inspección detallada de items
- Imágenes de skins en alta calidad
- Estados: ✅ In Inventory / 🏪 Listed on Market

**Interfaz:**
```
📦 Your Inventory
━━━━━━━━━━━━━━━━━
📦 Cases: 🌙 Dreams & Nightmares x4 • 🌈 Chroma 3 x2
🔑 Keys: 5x Universal

🔵 1. MP7 | Abyssal Apparition
Mil-Spec • ID: 138 • ✅

🔵 2. P250 | Asiimov
Mil-Spec • ID: 137 • ✅

🟣 3. AK-47 | Nightwish
Classified • ID: 140 • 🏪

Page 1/4 • 12 items total • Click 🔍 to inspect
[⏮️] [◀️] [1/4] [▶️] [⏭️]
[🔍 #1] [🔍 #2] [🔍 #3]
```

**Inspección de Items:**
Al hacer click en 🔍, se muestra:
- Imagen grande del skin
- Nombre completo (arma + skin)
- Rareza con color
- Weapon type (AK-47, AWP, etc.)
- Fecha de obtención
- Botones: 💰 Sell on Market | 🔥 Burn

---

### 5. MERCADO P2P 🏪

**Características:**
- Marketplace entre jugadores del mismo servidor
- Comisión del 5% por venta
- Precio mínimo: 10 coins
- Precio máximo: 1,000,000 coins
- Máximo 20 listings activos por usuario
- Filtros por rareza y precio

**Comandos:**
- `/market browse [rarity]` - Navegar items a la venta
- `/market list <item_id> <precio>` - Listar tu item
- `/market buy <listing_id>` - Comprar un item
- `/market mylistings` - Ver tus listings activos
- `/market cancel <listing_id>` - Cancelar un listing

**Flujo de Venta:**
1. Usuario inspecciona item en inventario
2. Click en "💰 Sell on Market"
3. Usa `/market list item_id:138 price:200`
4. Item marcado como `inMarket: true`
5. Aparece en `/market browse` para otros usuarios
6. Al venderse: vendedor recibe 95% del precio (5% comisión)

**Precios Recomendados:**
- Mil-Spec: 50-200 coins
- Restricted: 200-500 coins
- Classified: 500-1,500 coins
- Covert: 1,500-5,000 coins
- Knives/Gloves: 5,000+ coins

---

### 6. SISTEMA DE BURN/RECYCLE 🔥

**Concepto:**
Destruir permanentemente items no deseados a cambio de coins instantáneas.

**Valores de Quemado:**

| Rareza | Valor Base |
|--------|------------|
| ⚪ Consumer Grade | 10 coins |
| 🔵 Mil-Spec | 50 coins |
| 🟣 Restricted | 150 coins |
| 🩷 Classified | 400 coins |
| 🔴 Covert | 1,000 coins |
| ⭐ Exceedingly Rare | 5,000 coins |

**Cómo Usar:**
1. `/inventory` → Click 🔍 en un item
2. Click en "🔥 Burn for 50 coins"
3. Confirmación con advertencia
4. Click "✅ Confirm Burn"
5. Item destruido → coins añadidas instantáneamente

**Restricciones:**
- ❌ No puedes quemar items listados en el market
- ❌ No puedes quemar items bloqueados
- ⚠️ Acción irreversible

**Burn vs Market:**
- **Burn:** Instantáneo, sin comisión, valor fijo
- **Market:** Toma tiempo, 5% comisión, precio variable

---

### 7. SISTEMA DE STARTER PACK 🎁

**Comando:** `/start` (una sola vez por usuario)

**Contenido:**
- 💰 500 coins iniciales
- 🔑 3 Universal Keys
- 📦 1 Dreams & Nightmares Case
- 📦 1 Chroma 3 Case

**Objetivo:**
Dar a nuevos usuarios suficiente para empezar a jugar sin esperar por daily o XP.

---

## 🎮 COMANDOS COMPLETOS

### 📊 Información
```
/ping                    - Latencia del bot
/profile [@usuario]      - Ver perfil completo
/rank [@usuario]         - Posición en ranking
/leaderboard            - Top 10 del servidor
/start                  - Reclamar starter pack (una vez)
```

### 💰 Economía
```
/balance [@usuario]      - Ver monedas
/daily                  - Recompensa diaria (100 coins)
/gift @usuario cantidad - Regalar coins
/shop                   - Ver tienda
/buy <item> [cantidad]  - Comprar de la tienda
```

### 📦 Cajas e Inventario
```
/cases                        - Ver cajas disponibles
/open <dreams|chroma>         - Abrir una caja
/inventory [filter:rarity]    - Ver tu inventario
  Filtros: mil-spec, restricted, classified, covert, exotic
```

### 🏪 Mercado
```
/market browse [rarity]           - Navegar marketplace
/market list <item_id> <precio>   - Listar item
/market buy <listing_id>          - Comprar item
/market mylistings                - Tus listings activos
/market cancel <listing_id>       - Cancelar listing
```

### 🔧 Admin (Solo moderadores)
```
/admin config           - Configurar bot en el servidor
/admin ban @user        - Banear usuario del bot
/admin unban @user      - Desbanear usuario
/admin give @user coins - Dar coins a un usuario
/admin give @user case  - Dar cajas a un usuario
```

---

## 🎨 CARACTERÍSTICAS ESPECIALES

### Animaciones de Apertura de Cajas
```
Estado 1: "🔄 Spinning..."
⚪⚪⚪⚪⚪⚪⚪

Estado 2: "🔄 Spinning..."
⚪🔵⚪🔵🟣🔵⚪

Estado 3: "✨ Revealing..."
⚪🔵⚪🔵🩷🔵⚪
           ↑

Estado Final: "🎉 You unboxed!"
🩷 M4A1-S | Night Terror
Classified (Pink)
+100 coins | +60 XP
```

### Sistema Anti-Spam
- Cooldown de 60 segundos entre mensajes con XP
- Detección de mensajes repetitivos
- Protección contra flooding
- Rate limiting en comandos

### Seguridad
- Transacciones atómicas en la base de datos
- Validación de permisos en todos los comandos
- Sistema de baneos persistente
- Logs completos con Winston

### Optimización
- Cache de cooldowns en Redis
- Paginación en inventarios y leaderboards
- Lazy loading de imágenes de skins
- Proxy de imágenes de Steam CDN

---

## 📊 ESTADÍSTICAS Y TRACKING

### Por Usuario
- Total de cajas abiertas
- Items obtenidos por rareza
- Monedas ganadas totales
- Nivel y XP
- Mensajes enviados
- Items vendidos/comprados
- Items quemados

### Por Servidor
- Total de usuarios activos
- Cajas abiertas totalmente
- Volumen del mercado
- Leaderboard de XP
- Leaderboard de monedas

---

## 🎯 CASOS DE USO

### Caso 1: Nuevo Usuario
1. Entra al servidor
2. Usa `/start` → recibe starter pack
3. Usa `/open dreams` → obtiene MP7 | Abyssal Apparition
4. Chatea en el servidor → gana XP
5. Sube a nivel 2 → recibe 50 coins
6. Usa `/daily` → recibe 100 coins más
7. Compra más cajas en `/shop`

### Caso 2: Coleccionista
1. Abre 50 cajas en una semana
2. Obtiene varios Mil-Spec y Restricted
3. Vende duplicados en `/market`
4. Compra skins específicas del market
5. Exhibe su colección en el inventario
6. Compite en el leaderboard

### Caso 3: Trader
1. Compra cajas baratas en el shop
2. Las abre buscando items raros
3. Lista items buenos en el market a precio alto
4. Compra items baratos del market
5. Los revende con ganancia
6. Acumula monedas para comprar knives

### Caso 4: Casual
1. Chatea normalmente en el servidor
2. Gana XP pasivamente
3. Usa `/daily` cada día
4. Acumula monedas lentamente
5. Compra una caja cuando puede
6. Quema items no deseados con `/inventory` → 🔥

---

## 🔮 ROADMAP FUTURO

### En Desarrollo
- [ ] Sistema de float/wear para items (Factory New, Battle-Scarred, etc.)
- [ ] Más cajas: Gamma Case, Spectrum Case, Clutch Case
- [ ] Agents (personajes coleccionables)
- [ ] Stickers y charms
- [ ] Sistema de trade entre usuarios

### Planeado
- [ ] Backgrounds y shelves personalizables
- [ ] Logros y badges
- [ ] Eventos temporales con cajas exclusivas
- [ ] Sistema de votos en Top.gg con recompensas
- [ ] Integración con Steam Market API para precios reales
- [ ] Mini-juegos (coinflip, crash, roulette)

---

## 💡 CARACTERÍSTICAS ÚNICAS

### 1. Imágenes Reales de Steam
- Usa las imágenes oficiales de Steam Community
- Proxy propio para compatibilidad con Discord
- Actualización automática de iconos

### 2. Probabilidades Auténticas
- Basadas en el sistema real de CS:GO/CS2
- Transparentes y verificables
- Drop tables en JSON configurables

### 3. Economía Balanceada
- Precios calibrados para evitar inflación
- Comisiones de mercado para sink de monedas
- Sistema de burn para remover items comunes

### 4. Experiencia Pulida
- Embeds con colores por rareza
- Emojis consistentes en toda la interfaz
- Animaciones fluidas en aperturas de cajas
- Paginación intuitiva con botones

---

## 🎨 PALETA DE COLORES (Para el sitio web)

### Colores de Rareza
- **Consumer Grade:** `#B0C3D9` (Gris claro)
- **Mil-Spec:** `#5E98D9` (Azul claro)
- **Restricted:** `#8847FF` (Morado)
- **Classified:** `#D32CE6` (Rosa)
- **Covert:** `#EB4B4B` (Rojo)
- **Exceedingly Rare:** `#FFD700` (Dorado)

### Colores de Sistema
- **Primary:** `#5865F2` (Discord Blurple)
- **Success:** `#57F287` (Verde)
- **Error:** `#ED4245` (Rojo)
- **Warning:** `#FEE75C` (Amarillo)

---

## 📱 SECCIONES SUGERIDAS PARA LA WEB

### 1. Hero Section
- Título atractivo: "Abre Cajas, Colecciona Skins, Domina el Mercado"
- Subtítulo: "Bot de Discord con sistema de cajas CS:GO/CS2"
- CTA: "Agregar a Discord" + "Ver Demo"
- Preview visual del bot en acción

### 2. Features
- Cards con cada sistema principal
- Iconos grandes y coloridos
- GIFs mostrando el bot en uso

### 3. How It Works
- Timeline paso a paso
- Screenshots de comandos
- Explicación simple del flujo

### 4. Commands Reference
- Lista completa organizada por categoría
- Ejemplos de uso
- Permisos requeridos

### 5. Rarity System
- Tabla visual de rarezas
- Probabilidades
- Ejemplos de items

### 6. Statistics
- Contador de servidores
- Contador de usuarios
- Cajas abiertas totales
- Items en circulación

### 7. Testimonials
- Quotes de usuarios reales
- Capturas de momentos épicos (knife pulls)

### 8. FAQ
- Preguntas frecuentes
- Troubleshooting
- Políticas del bot

### 9. Footer
- Links a documentación
- Discord de soporte
- GitHub repo
- Términos de servicio

---

## 🎬 ELEMENTOS VISUALES SUGERIDOS

### Animaciones
- Caja girando al hacer hover
- Contador de stats subiendo
- Reveal de rareza con efecto de brillo
- Transiciones suaves entre secciones

### Componentes Interactivos
- Simulador de apertura de caja
- Calculadora de probabilidades
- Preview de comandos con output
- Tabla de rareza con hover effects

### Media
- GIF de apertura de caja completa
- Video demo de 30-60 segundos
- Screenshots del bot en Discord
- Mockups de mobile

---

## 📝 TONO Y ESTILO DE CONTENIDO

### Voz de Marca
- **Energético:** Usa lenguaje emocionante para cajas y drops
- **Claro:** Explica sistemas complejos de forma simple
- **Amigable:** Tono casual y accesible
- **Competitivo:** Enfatiza leaderboards y colección

### Ejemplos de Copy
- ❌ "Sistema de cajas implementado"
- ✅ "¡Abre cajas épicas y obtén skins legendarias!"

- ❌ "Mercado de intercambio disponible"
- ✅ "Vende tus tesoros, compra tus sueños - Mercado P2P activo 24/7"

- ❌ "Gana XP por actividad"
- ✅ "Sube de nivel mientras charlas - ¡Recompensas en cada nivel!"

---

## 🚀 CALL TO ACTION PRINCIPALES

1. **Agregar a Discord** (Primario)
   - Link de invitación del bot
   - Permisos claros explicados

2. **Unirse al Discord de Soporte** (Secundario)
   - Servidor comunitario
   - Soporte y ayuda

3. **Ver Documentación** (Terciario)
   - Guía completa de comandos
   - Tutoriales paso a paso

4. **GitHub** (Opcional)
   - Repositorio open source
   - Contribuciones

---

## 💻 TECH STACK SUGERIDO PARA LA WEB

### Framework
- **Next.js 14** (React framework con SSR)
- **Tailwind CSS** (Estilos utility-first)
- **Framer Motion** (Animaciones)

### Componentes
- **shadcn/ui** (Componentes modernos)
- **Lucide Icons** (Iconografía)
- **React Syntax Highlighter** (Code snippets)

### Deploy
- **Vercel** (Hosting optimizado para Next.js)
- **Cloudflare** (CDN para assets)

---

## 📚 CONTENIDO EXTRA

### Blog Posts Sugeridos
1. "Cómo funciona el sistema de probabilidades de CS:GO"
2. "Guía: De novato a experto en el mercado"
3. "Los 10 mejores pulls de la comunidad"
4. "Estrategias para maximizar tus ganancias"
5. "Historia detrás del bot: Por qué lo creamos"

### Tutoriales en Video
1. "Setup en 2 minutos"
2. "Tu primera caja: Walkthrough completo"
3. "Cómo vender en el mercado"
4. "Tips y trucos de veteranos"

---

## 🎯 MÉTRICAS DE ÉXITO

### Para la Web
- Tasa de conversión (visitas → invitaciones)
- Tiempo promedio en página
- Bounce rate < 40%
- Mobile responsiveness score > 95

### Para el Bot
- Retención de usuarios a 7 días
- Cajas abiertas por usuario activo
- Volumen de transacciones en mercado
- Tasa de engagement en comandos

---

## ✅ CHECKLIST FINAL PARA LA WEB

### Must-Have
- [ ] Hero section con CTA claro
- [ ] Lista completa de comandos
- [ ] Explicación del sistema de rareza
- [ ] Screenshots del bot
- [ ] FAQ section
- [ ] Links de invitación funcionando
- [ ] Mobile responsive
- [ ] SEO optimizado
- [ ] Velocidad de carga < 3s

### Nice-to-Have
- [ ] Simulador de apertura de cajas
- [ ] Estadísticas en tiempo real
- [ ] Blog con artículos
- [ ] Galería de community pulls
- [ ] Sistema de autenticación Discord OAuth
- [ ] Dashboard para ver tus stats
- [ ] Dark/Light mode toggle

---

## 🎨 INSPIRACIÓN DE DISEÑO

### Referencias
- **CSGORoll.com** - Interfaz de casino CS:GO
- **Discord.com** - Branding y tono de voz
- **Karuta.xyz** - Bot de colección similar
- **CS2.com** - Estética oficial de Counter-Strike

### Estilo Visual
- **Moderno:** Gradientes sutiles, glassmorphism
- **Gaming:** Neón, colores vibrantes, efectos de brillo
- **Profesional:** Grid limpio, tipografía clara
- **Emocionante:** Animaciones, micro-interactions

---

## 📞 INFORMACIÓN DE CONTACTO (PARA LA WEB)

### Soporte
- Discord Server: [Link]
- Email: support@caseops.example
- GitHub Issues: [Link]

### Legal
- Términos de Servicio
- Política de Privacidad
- Disclaimer sobre CS:GO/Valve

---

## 🔑 KEYWORDS PARA SEO

### Primarios
- Discord bot CS:GO
- CS2 Discord bot
- CS:GO case opening bot
- Discord gambling bot

### Secundarios
- Discord economy bot
- CS:GO skin collection
- Discord XP bot
- P2P marketplace Discord
- Case simulator Discord

### Long-tail
- "bot de Discord para abrir cajas de CS:GO"
- "mejor bot de economía Discord CS2"
- "cómo coleccionar skins en Discord"
- "Discord bot con mercado de items"

---

## 🎁 BONUS: EASTER EGGS

### Comandos Ocultos
- `/lucky` - Mensaje de suerte antes de abrir caja
- `/stats rare` - Ver tus mejores pulls

### Achievements Secretos
- "First Blood" - Abre tu primera caja
- "Jackpot" - Obtén un item Exceedingly Rare
- "Whale" - Gasta 10,000 coins en una semana
- "Market Mogul" - Vende 50 items en el mercado

---

## 📖 CONCLUSIÓN

Este bot ofrece una experiencia completa de colección y economía inspirada en CS:GO/CS2, perfectamente integrada en Discord. Combina la emoción de abrir cajas con un sistema de progresión sólido, mercado dinámico y comunidad activa.

**Puntos clave de venta:**
- ✅ Sistema de cajas auténtico tipo CS:GO
- ✅ Economía balanceada y justa
- ✅ Mercado P2P activo
- ✅ Progresión XP por actividad
- ✅ Imágenes reales de Steam
- ✅ Constantemente actualizado
- ✅ Comunidad activa
- ✅ Soporte dedicado

**Perfecto para:**
- Servidores de gaming
- Comunidades de CS:GO/CS2
- Servidores sociales grandes
- Grupos que buscan engagement

---

**Versión del documento:** 2.1.0  
**Última actualización:** Noviembre 2025  
**Autor:** CaseOps Development Team
