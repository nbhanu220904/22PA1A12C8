// Frontend logging utility that doesn't use console.log
// Logs are stored in sessionStorage and can be viewed in browser dev tools

const LOG_KEY = 'url_shortener_logs'

export const logEvent = (event, data = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    data,
    userAgent: navigator.userAgent,
    url: window.location.href
  }

  try {
    // Get existing logs
    const existingLogs = JSON.parse(sessionStorage.getItem(LOG_KEY) || '[]')
    
    // Add new log entry
    existingLogs.push(logEntry)
    
    // Keep only last 100 entries to prevent storage overflow
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100)
    }
    
    // Store back to sessionStorage
    sessionStorage.setItem(LOG_KEY, JSON.stringify(existingLogs))
    
    // Also dispatch custom event for real-time monitoring
    window.dispatchEvent(new CustomEvent('urlShortenerLog', { detail: logEntry }))
  } catch (error) {
    // Fallback if sessionStorage is not available
    window.dispatchEvent(new CustomEvent('urlShortenerLog', { detail: logEntry }))
  }
}

export const getLogs = () => {
  try {
    return JSON.parse(sessionStorage.getItem(LOG_KEY) || '[]')
  } catch {
    return []
  }
}

export const clearLogs = () => {
  try {
    sessionStorage.removeItem(LOG_KEY)
  } catch {
    // Ignore errors
  }
}

// Initialize logging
logEvent('FRONTEND_INITIALIZED', { 
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent 
})