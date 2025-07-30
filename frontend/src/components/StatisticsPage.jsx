// frontend/src/components/StatisticsPage.jsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Grid,
  Divider,
  CircularProgress,
  Link,
} from '@mui/material';

import { getStatsByShortcode } from '../api/stats';
import logger from '../middleware/logger';

const shortcodesToTrack = ['ex123', 'demo456']; // Replace with localStorage/session-driven data

const StatisticsPage = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const allData = [];
        for (let code of shortcodesToTrack) {
          const data = await getStatsByShortcode(code);
          allData.push({ shortcode: code, ...data });
        }
        setStats(allData);
        logger.info('Fetched all stats', { stats: allData });
      } catch (err) {
        logger.error('Failed to load stats', { message: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  if (loading) {
    return (
      <Container>
        <Box textAlign="center" mt={5}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        URL Statistics
      </Typography>

      <Grid container spacing={3}>
        {stats.map((item, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  <Link
                    href={`http://localhost:5000/${item.shortcode}`}
                    target="_blank"
                  >
                    {item.shortcode}
                  </Link>
                </Typography>

                <Typography variant="body2" color="textSecondary">
                  Original URL: {item.url}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Created At: {item.createdAt}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Expiry Date: {item.expiry || 'Never'}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  🔁 Total Clicks: {item.clicks?.length || 0}
                </Typography>

                <Divider sx={{ my: 1 }} />

                {item.clicks?.map((click, i) => (
                  <Box key={i} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">
                      {new Date(click.timestamp).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Referrer: {click.referrer || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Location: {click.location || 'Unknown'}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default StatisticsPage;
