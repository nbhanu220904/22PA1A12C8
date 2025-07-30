import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material'
import { Search, Analytics, AccessTime, Mouse, Language, Visibility } from '@mui/icons-material'
import { getUrlStats } from '../services/urlService'
import { logEvent } from '../utils/logger'

const UrlStatistics = () => {
  const [shortcode, setShortcode] = useState('')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!shortcode.trim()) return

    setLoading(true)
    setError('')
    setStats(null)

    logEvent('STATS_LOOKUP_STARTED', { shortcode })

    try {
      const data = await getUrlStats(shortcode.trim())
      setStats(data)
      logEvent('STATS_LOOKUP_COMPLETED', { shortcode, clickCount: data.clickCount })
    } catch (err) {
      setError(err.message || 'Failed to fetch statistics')
      logEvent('STATS_LOOKUP_FAILED', { shortcode, error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          URL Statistics
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Enter a shortcode to view detailed analytics and click history
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2, maxWidth: 600, mx: 'auto' }}>
            <TextField
              fullWidth
              label="Shortcode"
              value={shortcode}
              onChange={(e) => setShortcode(e.target.value)}
              placeholder="abc123"
              required
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={<Search />}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Loading...' : 'Get Stats'}
            </Button>
          </Box>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {stats && (
        <Grid container spacing={3}>
          {/* Overview Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  URL Overview
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Original URL:
                      </Typography>
                      <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                        {stats.originalUrl}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Short URL:
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontFamily: 'monospace',
                          backgroundColor: 'grey.100',
                          p: 1,
                          borderRadius: 1,
                          display: 'inline-block'
                        }}
                      >
                        {`${window.location.protocol}//${window.location.host.replace(':3000', ':8000')}/${stats.shortcode}`}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip 
                        icon={<AccessTime />}
                        label={`Created: ${formatDate(stats.createdAt)}`}
                        color="primary"
                      />
                      <Chip 
                        icon={<AccessTime />}
                        label={`Expires: ${formatDate(stats.expiresAt)}`}
                        color="secondary"
                      />
                      <Chip 
                        icon={<Mouse />}
                        label={`${stats.clickCount} clicks`}
                        color="success"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Analytics Summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Click Analytics
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h3" color="primary">
                    {stats.clickCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'flex-end' }}>
                    Total Clicks
                  </Typography>
                </Box>

                {stats.clickCount > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      First Click: {formatDate(stats.clicks[0].timestamp)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last Click: {formatDate(stats.clicks[stats.clicks.length - 1].timestamp)}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Geographic Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Language sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Geographic Distribution
                </Typography>
                
                {stats.clickCount > 0 ? (
                  <Box>
                    {Object.entries(
                      stats.clicks.reduce((acc, click) => {
                        const location = click.location || 'Unknown'
                        acc[location] = (acc[location] || 0) + 1
                        return acc
                      }, {})
                    ).map(([location, count]) => (
                      <Box key={location} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{location}</Typography>
                        <Chip label={count} size="small" />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No clicks yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Click History Table */}
          {stats.clickCount > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Visibility sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Click History
                  </Typography>
                  
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>IP Address</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>Referrer</TableCell>
                          <TableCell>User Agent</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.clicks.slice().reverse().map((click, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(click.timestamp)}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>
                              {click.ip}
                            </TableCell>
                            <TableCell>{click.location || 'Unknown'}</TableCell>
                            <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {click.referrer || 'Direct'}
                            </TableCell>
                            <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {click.userAgent || 'Unknown'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  )
}

export default UrlStatistics