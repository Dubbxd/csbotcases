import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Discord
  DISCORD_TOKEN: z.string(),
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_GUILD_ID: z.string().optional(),

  // Database
  DATABASE_URL: z.string(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  // API
  API_PORT: z.string().transform(Number).default('3000'),
  API_SECRET: z.string(),
  PUBLIC_API_URL: z.string().default('http://localhost:3000'),

  // Top.gg
  TOPGG_WEBHOOK_SECRET: z.string().optional(),
  TOPGG_TOKEN: z.string().optional(),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // XP System
  XP_MIN_PER_MESSAGE: z.string().transform(Number).default('10'),
  XP_MAX_PER_MESSAGE: z.string().transform(Number).default('25'),
  XP_COOLDOWN_SECONDS: z.string().transform(Number).default('60'),
  XP_MIN_MESSAGE_LENGTH: z.string().transform(Number).default('3'),

  // Economy
  DAILY_REWARD_COINS: z.string().transform(Number).default('100'),
  DAILY_REWARD_XP: z.string().transform(Number).default('50'),
  LEVEL_UP_COINS: z.string().transform(Number).default('50'),
  MARKET_FEE_PERCENT: z.string().transform(Number).default('5'),

  // Cases
  CASE_OPEN_DAILY_LIMIT: z.string().transform(Number).default('10'),
  VOTE_REWARD_KEYS: z.string().transform(Number).default('1'),
  VOTE_REWARD_COINS: z.string().transform(Number).default('50'),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
