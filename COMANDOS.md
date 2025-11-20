# 📋 CS:GO Bot - Comandos Disponibles

## 🎮 **CASOS**

### `/open`
- **Descripción:** Abre una caja con animación estilo CS:GO
- **Opciones:**
  - `case` - Selecciona la caja a abrir (Dreams & Nightmares o Chroma 3)
  - `key` - Selecciona la llave (Universal Key)
- **Características:**
  - ✨ Animación de ruleta (9 frames)
  - 🖼️ Imágenes desde Steam CDN
  - 🎲 Probabilidades CS2 reales:
    - 🔵 Mil-Spec: 79.92%
    - 🟣 Restricted: 15.98%
    - 🟣 Classified: 3.20%
    - 🔴 Covert: 0.64%
    - ⭐ **Knives: 0.26%** (SUPER RAROS!)

### `/inventory`
- **Descripción:** Ver tu inventario de cajas, llaves e items
- **Opciones:**
  - `filter` - Filtrar por rareza (opcional)
- **Muestra:**
  - 📦 Cajas agrupadas por tipo
  - 🔑 Llaves agrupadas por tipo
  - ✨ Items con emojis de rareza

---

## 🛒 **TIENDA**

### `/shop`
- **Descripción:** Ver la tienda de cajas y llaves
- **Muestra:**
  - 🌙 Dreams & Nightmares Case - 500 coins
  - 🌈 Chroma 3 Case - 750 coins
  - 🔑 Universal Key - 200 coins

### `/buy`
- **Descripción:** Comprar cajas o llaves
- **Opciones:**
  - `item` - Selecciona qué comprar
  - `amount` - Cantidad (1-10, default: 1)
- **Items disponibles:**
  - 🌙 Dreams & Nightmares Case (500 coins)
  - 🌈 Chroma 3 Case (750 coins)
  - 🔑 Universal Key (200 coins)

---

## 💰 **ECONOMÍA**

### `/daily`
- **Descripción:** Reclamar recompensa diaria
- **Recompensas:**
  - 💰 Coins
  - ⭐ XP
- **Cooldown:** 24 horas

### `/balance`
- **Descripción:** Ver balance de coins
- **Opciones:**
  - `user` - Ver balance de otro usuario (opcional)

### `/gift`
- **Descripción:** Regalar coins a otro usuario
- **Opciones:**
  - `user` - Usuario a quien regalar
  - `amount` - Cantidad de coins

---

## 👤 **USUARIO**

### `/start`
- **Descripción:** Obtener starter pack (una sola vez)
- **Recompensas:**
  - 💰 1000 coins
  - 🌙 2x Dreams & Nightmares Case
  - 🔑 2x Universal Key

### `/profile`
- **Descripción:** Ver perfil de usuario
- **Opciones:**
  - `user` - Ver perfil de otro usuario (opcional)
- **Muestra:**
  - 📊 Nivel y XP
  - 💰 Balance
  - 📦 Estadísticas (cajas abiertas, items totales)
  - 🏆 Ranking

---

## 🏆 **EXPERIENCIA**

### `/leaderboard`
- **Descripción:** Ver tabla de clasificación del servidor
- **Muestra:**
  - Top usuarios por nivel
  - XP total
  - Ranking

---

## ℹ️ **INFO**

### `/ping`
- **Descripción:** Ver latencia del bot
- **Muestra:**
  - 🏓 Latencia del bot
  - 📡 Latencia de la API de Discord

---

## 🎯 **Sistema de Rareza**

| Rareza | Emoji | Probabilidad | Ejemplos |
|--------|-------|--------------|----------|
| Mil-Spec (Blue) | 🔵 | 79.92% | M4A1-S Night Terror, AK-47 Orange Peel |
| Restricted (Purple) | 🟣 | 15.98% | AWP Exoskeleton, MP9 Starlight Protector |
| Classified (Pink) | 🟣 | 3.20% | M4A4 In Living Color, AK-47 Phantom Disruptor |
| Covert (Red) | 🔴 | 0.64% | MP9 Starlight Protector, AK-47 Nightwish |
| Knives (Gold) | ⭐ | 0.26% | Karambit Fade, Butterfly Doppler |

---

## 📦 **Cajas Disponibles**

### 🌙 Dreams & Nightmares Case (ID: 1)
- **Precio:** 500 coins
- **Items:** 20 items (17 armas + 3 cuchillos)
- **Destacados:**
  - AK-47 Nightwish (Covert)
  - MP9 Starlight Protector (Covert)
  - Karambit Fade (Knife)

### 🌈 Chroma 3 Case (ID: 3)
- **Precio:** 750 coins
- **Items:** 15 items (13 armas + 2 cuchillos)
- **Destacados:**
  - M4A1-S Chantico's Fire (Covert)
  - Tec-9 Re-Entry (Classified)
  - Karambit Doppler (Knife)

---

## 🔧 **Comandos de Administración**

*Por implementar...*

---

## 💡 **Consejos**

1. **Cómo conseguir coins:**
   - `/daily` - Recompensa diaria
   - Chatear para ganar XP y subir de nivel
   - Vender items en el mercado (próximamente)

2. **Cómo conseguir cajas:**
   - `/start` - Starter pack (una sola vez)
   - `/buy` - Comprar en la tienda
   - Drops aleatorios al chatear

3. **Sobre los cuchillos:**
   - Son EXTREMADAMENTE raros (0.26%)
   - Aproximadamente 1 en 385 aperturas
   - Respeta las probabilidades reales de CS2

4. **Imágenes de Steam:**
   - Todas las armas tienen imágenes reales desde Steam CDN
   - Se cargan automáticamente durante la animación
   - Se cachean para futuras aperturas
