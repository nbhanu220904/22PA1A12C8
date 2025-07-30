import express from 'express';
import { UrlModel } from '../models/urlModel.js';
import { getLocationFromIP } from '../services/geoService.js';
import { logger } from '../middleware/loggingMiddleware.js';

const router = express.Router();

// GET /:shortcode - Redirect to original URL
router.get('/:shortcode', (req, res) => {
  try {
    const { shortcode } = req.params;
    const urlData = UrlModel.findByShortcode(shortcode);

    if (!urlData) {
      logger.warn('Redirect failed - shortcode not found', { shortcode });
      return res.status(404).json({ error: 'Short URL not found' });
    }

    if (urlData.isExpired) {
      logger.warn('Redirect failed - URL expired', { shortcode });
      return res.status(410).json({ error: 'Short URL has expired' });
    }

    // Record analytics
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const location = getLocationFromIP(clientIP);
    
    const clickData = {
      ip: clientIP,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referer') || 'Direct',
      location
    };

    UrlModel.recordClick(shortcode, clickData);

    logger.info('Successful redirect', {
      shortcode,
      url: urlData.url,
      ip: clientIP,
      location: location.city
    });

    // Redirect to original URL
    res.redirect(urlData.url);

  } catch (error) {
    logger.error('Error processing redirect', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as redirectRoute };