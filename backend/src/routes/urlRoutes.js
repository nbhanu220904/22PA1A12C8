import express from 'express';
import { UrlModel } from '../models/urlModel.js';
import { logger } from '../middleware/loggingMiddleware.js';

const router = express.Router();

// POST /shorturls - Create short URL
router.post('/', (req, res) => {
  try {
    const { url, shortcode, validity } = req.body;

    // Validation
    if (!url) {
      logger.warn('URL creation failed - missing URL', { body: req.body });
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      logger.warn('URL creation failed - invalid URL format', { url });
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check if custom shortcode already exists
    if (shortcode && UrlModel.shortcodeExists(shortcode)) {
      logger.warn('URL creation failed - shortcode already exists', { shortcode });
      return res.status(400).json({ error: 'Shortcode already exists' });
    }

    // Validate shortcode format (alphanumeric, 3-10 chars)
    if (shortcode && !/^[a-zA-Z0-9]{3,10}$/.test(shortcode)) {
      logger.warn('URL creation failed - invalid shortcode format', { shortcode });
      return res.status(400).json({ error: 'Shortcode must be 3-10 alphanumeric characters' });
    }

    // Validate validity (positive number)
    if (validity && (isNaN(validity) || validity <= 0)) {
      logger.warn('URL creation failed - invalid validity', { validity });
      return res.status(400).json({ error: 'Validity must be a positive number (minutes)' });
    }

    const urlData = UrlModel.create({ url, shortcode, validity });
    
    logger.info('URL created successfully', {
      shortcode: urlData.shortcode,
      url: urlData.url,
      expiryTime: urlData.expiryTime
    });

    res.status(201).json({
      shortLink: `http://localhost:8000/${urlData.shortcode}`,
      shortcode: urlData.shortcode,
      url: urlData.url,
      expiryTime: urlData.expiryTime,
      createdAt: urlData.createdAt
    });

  } catch (error) {
    logger.error('Error creating short URL', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /shorturls/:shortcode - Get analytics
router.get('/:shortcode', (req, res) => {
  try {
    const { shortcode } = req.params;
    const analytics = UrlModel.getAnalytics(shortcode);

    if (!analytics) {
      logger.warn('Analytics request failed - shortcode not found', { shortcode });
      return res.status(404).json({ error: 'Short URL not found' });
    }

    logger.info('Analytics retrieved', { shortcode, clicks: analytics.clicks });

    res.json({
      shortcode: analytics.shortcode,
      url: analytics.url,
      createdAt: analytics.createdAt,
      expiryTime: analytics.expiryTime,
      isExpired: analytics.isExpired,
      clicks: analytics.clicks,
      clickHistory: analytics.clickHistory
    });

  } catch (error) {
    logger.error('Error retrieving analytics', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as urlRoutes };