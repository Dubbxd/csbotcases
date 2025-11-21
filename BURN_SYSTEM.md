# 🔥 Sistema de Quemado de Items (Burn/Recycle)

## Descripción General

El sistema de "burn" permite a los usuarios **destruir permanentemente** sus items a cambio de monedas. Es una alternativa al mercado para obtener valor de items no deseados.

## Valores de Quemado por Rareza

Los valores base de quemado están determinados por la rareza del item:

| Rareza | Nombre | Valor Base |
|--------|--------|------------|
| ⚪ COMMON | Consumer Grade | 10 coins |
| 🔵 UNCOMMON | Mil-Spec | 50 coins |
| 🟣 RARE | Restricted | 150 coins |
| 🩷 VERY_RARE | Classified | 400 coins |
| 🔴 LEGENDARY | Covert | 1,000 coins |
| ⭐ EXOTIC | Exceedingly Rare | 5,000 coins |

## Modificadores de Desgaste (Wear)

En el futuro, cuando se implemente el sistema de float/wear, los valores se modificarán:

| Condición | Rango Float | Modificador |
|-----------|-------------|-------------|
| Factory New | 0.00-0.07 | +50% |
| Minimal Wear | 0.07-0.15 | +25% |
| Field-Tested | 0.15-0.38 | Base (1.0x) |
| Well-Worn | 0.38-0.45 | -25% |
| Battle-Scarred | 0.45-1.00 | -50% |

### Ejemplos con Wear:

- **AK-47 Redline (Classified)**
  - Base: 400 coins
  - Factory New (0.05): 400 × 1.5 = **600 coins**
  - Field-Tested (0.25): 400 × 1.0 = **400 coins**
  - Battle-Scarred (0.70): 400 × 0.5 = **200 coins**

- **AWP Dragon Lore (Covert)**
  - Base: 1,000 coins
  - Factory New (0.03): 1,000 × 1.5 = **1,500 coins**
  - Minimal Wear (0.10): 1,000 × 1.25 = **1,250 coins**
  - Well-Worn (0.42): 1,000 × 0.75 = **750 coins**

## Cómo Usar

### Paso 1: Abre tu inventario
```
/inventory
```

### Paso 2: Inspecciona el item
Click en el botón **🔍 #1** (o el número del item que quieras)

### Paso 3: Opciones disponibles
Verás dos botones:
- **💰 Sell on Market** - Lista el item en el mercado
- **🔥 Burn for X coins** - Quema el item por monedas instantáneas

### Paso 4: Confirmar quemado
1. Click en **🔥 Burn for X coins**
2. Se mostrará un mensaje de confirmación
3. Click en **✅ Confirm Burn** para destruir permanentemente el item
4. Click en **❌ Cancel** si cambias de opinión

## Restricciones

No puedes quemar items si:
- ❌ El item está listado en el mercado (`inMarket: true`)
- ❌ El item está bloqueado (`locked: true`)
- ❌ No eres el dueño del item

## Comparación: Burn vs Market

| Aspecto | 🔥 Burn | 💰 Market |
|---------|---------|-----------|
| **Velocidad** | Instantáneo | Esperar comprador |
| **Valor** | Fijo (basado en rareza) | Variable (tú decides) |
| **Fee** | Sin comisión | 5% de comisión |
| **Reversible** | ❌ Permanente | ✅ Puedes cancelar |
| **Mejor para** | Items comunes/baratos | Items raros/valiosos |

## Estrategias Recomendadas

### ✅ Quemar:
- Items comunes (Mil-Spec) que no se venden
- Duplicados de bajo valor
- Items con float malo (Battle-Scarred)
- Cuando necesitas coins rápido

### 💰 Vender en Market:
- Items raros (Classified, Covert, Knives)
- Items con buen float (Factory New, Minimal Wear)
- Items populares que se venden fácil
- Cuando tienes tiempo de esperar

## Registro de Transacciones

Cada quemado se registra en la base de datos:

```typescript
Transaction {
  type: 'RECYCLE',
  amount: coins_earned,
  metadata: {
    itemId: 123,
    itemName: "AK-47 | Redline",
    rarity: "VERY_RARE"
  }
}
```

Puedes ver tu historial con `/transactions` (si está implementado).

## Código de Ejemplo

```typescript
import { burnItem, calculateBurnValue } from '../core/economy/burnService';

// Calcular valor antes de quemar
const burnValue = calculateBurnValue('LEGENDARY', 0.05); // 1500 coins

// Quemar un item
const result = await burnItem(userId, guildId, itemId);
if (result.success) {
  console.log(`Earned ${result.coins} coins!`);
}
```

## Próximas Mejoras

- [ ] Sistema de float/wear en items
- [ ] Estadísticas de quemados por usuario
- [ ] Eventos especiales con bonus de burn (2x coins)
- [ ] Items "fireproof" que no se pueden quemar
- [ ] Logros por quemar X cantidad de items
