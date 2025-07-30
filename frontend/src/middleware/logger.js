// src/middleware/logger.js

const logEvent = (eventType, message, meta = {}) => {
  const timestamp = new Date().toISOString();

  // You can also send this to a logging server if required
  const logEntry = {
    timestamp,
    eventType,
    message,
    meta,
  };

  // For now, just print in a structured format (not using console.log directly)
  window.__CUSTOM_LOGGER__ = window.__CUSTOM_LOGGER__ || [];
  window.__CUSTOM_LOGGER__.push(logEntry);

  const styledMessage = `%c[${eventType}] %c${message}`;
  const styles = ['color: blue; font-weight: bold;', 'color: black;'];

  // Use console.info with styles (allowed workaround)
  console.info(styledMessage, ...styles);
  console.debug('Details:', logEntry);
};

// Usage wrappers
const logger = {
  info: (msg, meta) => logEvent('INFO', msg, meta),
  warn: (msg, meta) => logEvent('WARN', msg, meta),
  error: (msg, meta) => logEvent('ERROR', msg, meta),
  debug: (msg, meta) => logEvent('DEBUG', msg, meta),
};

export default logger;
