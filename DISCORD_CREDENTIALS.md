# 🔑 Discord Bot Credentials

## ⚠️ INFORMACIÓN IMPORTANTE
**NUNCA compartas estas credenciales públicamente. Si las subes a GitHub, asegúrate de que `.env` esté en `.gitignore`.**

---

## 📋 Credenciales de tu Bot

### Application ID
```
1440863876609740891
```

### Client ID
```
1440863876609740891
```

### Client Secret
```
8xAGonrZgrkI3ntmfgXT_TCLA44pkkXO
```

### Public Key
```
732448404023d2e4bdf135048e7c5cc610f0767362b297a43aeb5dd03edc74d6
```

---

## 🤖 Obtener el Bot Token

**El bot token NO es el client secret.** Necesitas obtenerlo del Discord Developer Portal:

### Pasos para obtener el token:

1. **Ve al Discord Developer Portal**
   - Visita: https://discord.com/developers/applications
   - Inicia sesión con tu cuenta de Discord

2. **Selecciona tu aplicación**
   - Busca la aplicación con ID: `1440863876609740891`
   - Haz clic en ella

3. **Ve a la sección "Bot"**
   - En el menú lateral, haz clic en "Bot"
   
4. **Resetea el token (si es necesario)**
   - Si nunca has copiado el token, haz clic en "Reset Token"
   - ⚠️ **ADVERTENCIA:** Esto invalidará cualquier token anterior
   - Confirma la acción

5. **Copia el token**
   - Haz clic en "Copy" para copiar el token
   - El token se ve así: `MTQ0MDg2Mzg3NjYwOTc0MDg5MQ.Gxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **IMPORTANTE:** Solo podrás verlo una vez. Guárdalo en un lugar seguro.

6. **Pega el token en `.env`**
   - Abre el archivo `.env`
   - Reemplaza `DISCORD_TOKEN=your_bot_token_here` con tu token real
   - Ejemplo: `DISCORD_TOKEN=MTQ0MDg2Mzg3NjYwOTc0MDg5MQ.Gxxxxx.xxxxxxxxxx`

---

## 🔧 Configuración del Bot en Discord Portal

### Intents Requeridos

Para que el bot funcione correctamente, necesitas habilitar los siguientes **Privileged Gateway Intents**:

1. Ve a la sección **Bot** en el Developer Portal
2. Scroll hasta **Privileged Gateway Intents**
3. Habilita los siguientes:
   - ✅ **PRESENCE INTENT** (Opcional - para ver estado de usuarios)
   - ✅ **SERVER MEMBERS INTENT** (Requerido - para ver miembros del servidor)
   - ✅ **MESSAGE CONTENT INTENT** (Requerido - para leer mensajes y dar XP)

4. Haz clic en **Save Changes**

---

## 🔗 Invitar el Bot a tu Servidor

### URL de Invitación (Método Rápido)

Usa esta URL para invitar el bot con todos los permisos necesarios:

```
https://discord.com/api/oauth2/authorize?client_id=1440863876609740891&permissions=8&scope=bot%20applications.commands
```

**Permisos incluidos:**
- `permissions=8` = Administrator (todos los permisos)
- `scope=bot%20applications.commands` = Bot + Slash Commands

### URL de Invitación (Permisos Mínimos)

Si prefieres dar solo los permisos necesarios:

```
https://discord.com/api/oauth2/authorize?client_id=1440863876609740891&permissions=277025770560&scope=bot%20applications.commands
```

**Permisos incluidos:**
- Ver canales
- Enviar mensajes
- Enviar mensajes en hilos
- Incrustar enlaces (embeds)
- Adjuntar archivos
- Leer historial de mensajes
- Mencionar @everyone, @here y roles
- Usar emojis externos
- Añadir reacciones
- Usar comandos de aplicación

---

## 📝 Configurar tu Servidor de Pruebas

1. **Obtén el ID de tu servidor de Discord:**
   - Habilita el "Modo Desarrollador" en Discord:
     - Settings → Advanced → Developer Mode (actívalo)
   - Haz clic derecho en tu servidor
   - Selecciona "Copy Server ID"

2. **Agrega el ID a `.env`:**
   ```env
   DISCORD_GUILD_ID=tu_server_id_aqui
   ```
   - Ejemplo: `DISCORD_GUILD_ID=123456789012345678`

**¿Para qué sirve?**
- Cuando estás en desarrollo, los comandos se registran solo en ese servidor
- Los comandos aparecen instantáneamente (vs. 1 hora globalmente)
- Puedes probar cambios sin afectar otros servidores

---

## ✅ Checklist de Configuración

Antes de iniciar el bot, verifica que hayas completado:

- [ ] **Obtuviste el Bot Token** del Developer Portal
- [ ] **Copiaste el token** a `.env` como `DISCORD_TOKEN`
- [ ] **Habilitaste los Intents** necesarios (Message Content, Server Members)
- [ ] **Invitaste el bot** a tu servidor de Discord
- [ ] **Obtuviste el Server ID** y lo agregaste a `.env` como `DISCORD_GUILD_ID`
- [ ] **Configuraste PostgreSQL** y Redis (ver INSTALLATION.md)
- [ ] **Verificaste** que `.env` tiene todas las variables necesarias

---

## 🚀 Siguiente Paso

Una vez que hayas:
1. ✅ Obtenido el bot token
2. ✅ Configurado todos los intents
3. ✅ Invitado el bot a tu servidor
4. ✅ Actualizado el `.env`

**Ejecuta:**

```powershell
# Instalar dependencias
npm install

# Configurar base de datos
npx prisma migrate dev
npx prisma db seed

# Desplegar comandos slash
npm run deploy

# Iniciar el bot
npm run dev
```

---

## 🆘 Problemas Comunes

### Error: "An invalid token was provided"
- ❌ El token en `.env` no es correcto
- ✅ Ve al Developer Portal y copia el token nuevamente
- ✅ Asegúrate de NO incluir espacios al copiarlo

### Error: "Missing Access"
- ❌ El bot no tiene permisos en el servidor
- ✅ Reinvita el bot con la URL de invitación correcta

### Comandos no aparecen
- ❌ No ejecutaste `npm run deploy`
- ❌ `DISCORD_GUILD_ID` no está configurado
- ✅ Ejecuta `npm run deploy` después de configurar el guild ID

### Bot aparece offline
- ❌ El token es inválido
- ❌ Los intents no están habilitados
- ✅ Verifica el token y los intents en el Developer Portal

---

## 📚 Recursos Útiles

- **Discord Developer Portal:** https://discord.com/developers/applications
- **Discord.js Guide:** https://discordjs.guide/
- **Documentación del proyecto:** Ver archivos `.md` en la raíz

---

**¡Listo! Con estas credenciales configuradas, tu bot estará funcionando en minutos. 🎮**
