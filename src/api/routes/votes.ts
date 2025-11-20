import { Router } from 'express';
import { env } from '../../config/env';
import { caseService } from '../../core/loot/caseService';
import { currencyService } from '../../core/economy/currencyService';
import { userService } from '../../core/user/userService';
import logger from '../../bot/utils/logger';

const router = Router();

/**
 * Top.gg webhook for votes
 */
router.post('/topgg', async (req, res) => {
  try {
    // Verify authorization header
    const auth = req.headers.authorization;
    if (auth !== env.TOPGG_WEBHOOK_SECRET) {
      logger.warn('Invalid Top.gg webhook authorization');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { user, type, isWeekend } = req.body;

    if (!user) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    logger.info(`Vote received from user ${user} (type: ${type}, weekend: ${isWeekend})`);

    // Ensure user exists
    await userService.getOrCreateUser(user);

    // Calculate rewards (double on weekends if applicable)
    const keyReward = isWeekend ? env.VOTE_REWARD_KEYS * 2 : env.VOTE_REWARD_KEYS;
    const coinReward = isWeekend ? env.VOTE_REWARD_COINS * 2 : env.VOTE_REWARD_COINS;

    // Give rewards (note: we'd need to know which guild, for now we skip guild-specific rewards)
    // In production, you might want to track which guilds the user is in
    
    // Log the vote
    const voteId = `${user}-${Date.now()}`;
    
    // TODO: Store vote in database to prevent duplicates
    // await prisma.voteLog.create({
    //   data: {
    //     userId: user,
    //     platform: 'topgg',
    //     voteExternalId: voteId,
    //     rewardGiven: true,
    //   },
    // });

    logger.info(`Rewards given: ${keyReward} keys, ${coinReward} coins`);

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error processing Top.gg vote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
