import { v4 as uuidv4 } from 'uuid';

// In-memory storage (for production, use a database)
const urlDatabase = new Map();
const analytics = new Map();

export class UrlModel {
  static create(data) {
    const id = uuidv4();
    const shortcode = data.shortcode || this.generateShortcode();
    const expiryTime = data.validity ? 
      new Date(Date.now() + data.validity * 60 * 1000) : 
      new Date(Date.now() + 30 * 60 * 1000); // 30 minutes default

    const urlData = {
      id,
      shortcode,
      url: data.url,
      createdAt: new Date(),
      expiryTime,
      isExpired: false
    };

    urlDatabase.set(shortcode, urlData);
    analytics.set(shortcode, {
      clicks: 0,
      clickHistory: []
    });

    return urlData;
  }

  static findByShortcode(shortcode) {
    const urlData = urlDatabase.get(shortcode);
    if (!urlData) return null;

    // Check if expired
    if (new Date() > urlData.expiryTime) {
      urlData.isExpired = true;
      urlDatabase.set(shortcode, urlData);
    }

    return urlData;
  }

  static getAnalytics(shortcode) {
    const urlData = urlDatabase.get(shortcode);
    const analyticsData = analytics.get(shortcode);
    
    if (!urlData || !analyticsData) return null;

    return {
      ...urlData,
      ...analyticsData
    };
  }

  static recordClick(shortcode, clickData) {
    const analyticsData = analytics.get(shortcode);
    if (!analyticsData) return false;

    analyticsData.clicks += 1;
    analyticsData.clickHistory.push({
      timestamp: new Date(),
      ip: clickData.ip,
      userAgent: clickData.userAgent,
      referrer: clickData.referrer,
      location: clickData.location
    });

    analytics.set(shortcode, analyticsData);
    return true;
  }

  static shortcodeExists(shortcode) {
    return urlDatabase.has(shortcode);
  }

  static generateShortcode() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure uniqueness
    if (this.shortcodeExists(result)) {
      return this.generateShortcode();
    }
    
    return result;
  }

  static getAllExpired() {
    const expired = [];
    for (const [shortcode, data] of urlDatabase.entries()) {
      if (new Date() > data.expiryTime) {
        expired.push(shortcode);
      }
    }
    return expired;
  }

  static deleteExpired(shortcodes) {
    shortcodes.forEach(shortcode => {
      urlDatabase.delete(shortcode);
      analytics.delete(shortcode);
    });
  }
}