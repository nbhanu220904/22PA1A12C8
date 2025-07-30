import { logEvent } from '../utils/logger'

const API_BASE_URL = 'http://localhost:8000'

export const createShortUrl = async (url, shortcode, validity) => {
  try {
    logEvent('API_REQUEST', { endpoint: '/shorturls', method: 'POST' })
    
    const response = await fetch(`${API_BASE_URL}/shorturls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        shortcode,
        validity
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    logEvent('API_SUCCESS', { endpoint: '/shorturls', shortcode: data.shortcode })
    return data
  } catch (error) {
    logEvent('API_ERROR', { endpoint: '/shorturls', error: error.message })
    throw error
  }
}

export const getUrlStats = async (shortcode) => {
  try {
    logEvent('API_REQUEST', { endpoint: `/shorturls/${shortcode}`, method: 'GET' })
    
    const response = await fetch(`${API_BASE_URL}/shorturls/${shortcode}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    logEvent('API_SUCCESS', { endpoint: `/shorturls/${shortcode}`, clickCount: data.clickCount })
    return data
  } catch (error) {
    logEvent('API_ERROR', { endpoint: `/shorturls/${shortcode}`, error: error.message })
    throw error
  }
}