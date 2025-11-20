import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import logger from './utils/logger';

export interface Command {
  data: any;
  execute: (interaction: any) => Promise<void>;
  cooldown?: number;
}

export class ExtendedClient extends Client {
  public commands: Collection<string, Command>;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.User],
    });

    this.commands = new Collection();
  }

  /**
   * Load all commands
   */
  async loadCommands() {
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
          this.commands.set(command.data.name, command);
          logger.info(`Loaded command: ${command.data.name}`);
        } else {
          logger.warn(`Command at ${filePath} is missing required "data" or "execute" property`);
        }
      }
    }

    logger.info(`Loaded ${this.commands.size} commands`);
  }

  /**
   * Load all event handlers
   */
  async loadEvents() {
    const eventsPath = join(__dirname, 'events');
    const eventFiles = readdirSync(eventsPath).filter((file) =>
      file.endsWith('.ts') || file.endsWith('.js')
    );

    for (const file of eventFiles) {
      const filePath = join(eventsPath, file);
      const event = require(filePath).default;

      if (event.once) {
        this.once(event.name, (...args) => event.execute(...args));
      } else {
        this.on(event.name, (...args) => event.execute(...args));
      }

      logger.info(`Loaded event: ${event.name}`);
    }

    logger.info(`Loaded ${eventFiles.length} events`);
  }

  /**
   * Start the bot
   */
  async start(token: string) {
    try {
      await this.loadCommands();
      await this.loadEvents();
      await this.login(token);
    } catch (error) {
      logger.error('Failed to start bot:', error);
      process.exit(1);
    }
  }
}
