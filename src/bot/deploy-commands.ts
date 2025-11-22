import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { env } from '../config/env';
import logger from './utils/logger';

const commands: any[] = [];

// Load all commands
const commandsPath = join(__dirname, 'commands');
const commandFolders = readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = join(commandsPath, folder);
  const commandFiles = readdirSync(folderPath).filter((file) =>
    file.endsWith('.ts') || file.endsWith('.js')
  );

  for (const file of commandFiles) {
    const filePath = join(folderPath, file);
    const command = require(filePath).default;
    
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      logger.info(`Loaded command: ${command.data.name}`);
    }
  }
}

// Deploy commands
const rest = new REST().setToken(env.DISCORD_TOKEN);

(async () => {
  try {
    logger.info(`Started refreshing ${commands.length} application (/) commands.`);

    // Deploy as guild commands for instant updates (recommended during development)
    // For production with multiple servers, use applicationCommands instead
    if (env.DISCORD_GUILD_ID) {
      const data: any = await rest.put(
        Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID),
        { body: commands }
      );
      logger.info(`Successfully reloaded ${data.length} guild commands for server ${env.DISCORD_GUILD_ID}.`);
    } else {
      // Fallback to global commands if no guild ID specified
      const data: any = await rest.put(
        Routes.applicationCommands(env.DISCORD_CLIENT_ID),
        { body: commands }
      );
      logger.info(`Successfully reloaded ${data.length} global application commands.`);
    }
  } catch (error) {
    logger.error('Error deploying commands:', error);
  }
})();
