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

    const data: any = await rest.put(
      Routes.applicationCommands(env.DISCORD_CLIENT_ID),
      { body: commands }
    );

    logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    logger.error('Error deploying commands:', error);
  }
})();
