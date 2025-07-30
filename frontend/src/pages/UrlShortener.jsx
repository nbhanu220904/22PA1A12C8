import React, { useState } from 'react'
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Chip,
  Divider
} from '@mui/material'
import { Add, Remove, ContentCopy, Link } from '@mui/icons-material'
import { createShortUrl } from '../services/urlService'
import { logEvent } from '../utils/logger'

const UrlShortener = () => {
  const [urls, setUrls] = useState([{ url: '', shortcode: '', validity: 30 }])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '' })

  const addUrlField = () => {
    if (urls.length < 5) {
      setUrls([...urls, { url: '', shortcode: '', validity: 30 }])
      logEvent('URL_FIELD_ADDED', { totalFields: urls.length + 1 })
    }
  }

  const removeUrlField = (index) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index)
      setUrls(newUrls)
      logEvent('URL_FIELD_REMOVED', { totalFields: newUrls.length })
    }
  }

  const updateUrl = (index, field, value) => {
    const newUrls = [...urls]
    newUrls[index][field] = value
    setUrls(newUrls)
  }

  const validateUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResults([])

    const validUrls = urls.filter(item => item.url.trim())
    
    if (validUrls.length === 0) {
      setError('Please enter at least one URL')
      setLoading(false)
      return
    }

    // Validate all URLs
    for (const item of validUrls) {
      if (!validateUrl(item.url)) {
        setError(`Invalid URL: ${item.url}`)
        setLoading(false)
        return
      }
    }

    logEvent('URL_SHORTENING_STARTED', { urlCount: validUrls.length })

    try {
      const promises = validUrls.map(item => 
        createShortUrl(item.url, item.shortcode || undefined, item.validity)
      )
      
      const responses = await Promise.all(promises)
      setResults(responses)
      logEvent('URL_SHORTENING_COMPLETED', { 
        urlCount: responses.length,
        successCount: responses.length 
      })
    } catch (err) {
      setError(err.message || 'Failed to create short URLs')
      logEvent('URL_SHORTENING_FAILED', { error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setSnackbar({ open: true, message: 'Copied to clipboard!' })
      logEvent('URL_COPIED', { url: text })
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to copy' })
    }
  }

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          URL Shortener
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Shorten up to 5 URLs at once with optional custom shortcodes and expiry times
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {urls.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        URL #{index + 1}
                      </Typography>
                      {urls.length > 1 && (
                        <IconButton 
                          onClick={() => removeUrlField(index)}
                          color="error"
                          size="small"
                        >
                          <Remove />
                        </IconButton>
                      )}
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Long URL"
                          value={item.url}
                          onChange={(e) => updateUrl(index, 'url', e.target.value)}
                          placeholder="https://example.com/very-long-url"
                          required={index === 0}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Custom Shortcode (Optional)"
                          value={item.shortcode}
                          onChange={(e) => updateUrl(index, 'shortcode', e.target.value)}
                          placeholder="custom123"
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Validity (Minutes)"
                          value={item.validity}
                          onChange={(e) => updateUrl(index, 'validity', parseInt(e.target.value) || 30)}
                          inputProps={{ min: 1, max: 10080 }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            {urls.length < 5 && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addUrlField}
              >
                Add Another URL
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={<Link />}
            >
              {loading ? 'Shortening...' : 'Shorten URLs'}
            </Button>
          </Box>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {results.length > 0 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Shortened URLs
          </Typography>
          <Grid container spacing={2}>
            {results.map((result, index) => (
              <Grid item xs={12} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Result #{index + 1}
                      </Typography>
                      <Chip 
                        label={`Expires: ${new Date(result.expiry).toLocaleString()}`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Original URL:
                      </Typography>
                      <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                        {result.originalUrl}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Short URL:
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          flexGrow: 1, 
                          fontFamily: 'monospace',
                          backgroundColor: 'grey.100',
                          p: 1,
                          borderRadius: 1
                        }}
                      >
                        {result.shortLink}
                      </Typography>
                      <IconButton 
                        onClick={() => copyToClipboard(result.shortLink)}
                        size="small"
                      >
                        <ContentCopy />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Box>
  )
}

export default UrlShortener