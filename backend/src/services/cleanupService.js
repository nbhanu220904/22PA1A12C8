import cron from 'node-cron';
import { UrlModel } from '../models/urlModel.js';
import { logger } from '../middleware/loggingMiddleware.js';

export const cleanupExpiredUrls = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    const expiredShortcodes = UrlModel.getAllExpired();
    if (expiredShortcodes.length > 0) {
      UrlModel.deleteExpired(expiredShortcodes);
      logger.info('Cleaned up expired URLs', { 
        count: expiredShortcodes.length,
        shortcodes: expiredShortcodes 
      });
    }
  });

  logger.info('Cleanup service started');
};