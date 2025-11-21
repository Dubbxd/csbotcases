import { ExtendedClient } from './bot/client';
import { env } from './config/env';
import logger from './bot/utils/logger';

// Import API server
import { startAPIServer } from './api/server';

// Build: v2.1.0 - Image proxy improvements

async function main() {
  try {
    logger.info('Starting CS:GO Discord Bot...');

    // Initialize Discord bot
    const client = new ExtendedClient();
    await client.start(env.DISCORD_TOKEN);

    // Start API server
    await startAPIServer(env.API_PORT);

    logger.info('All systems initialized successfully!');
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

main();
