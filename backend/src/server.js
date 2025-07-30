import express from 'express';
import cors from 'cors';
import { urlRoutes } from './routes/urlRoutes.js';
import { redirectRoute } from './routes/redirectRoute.js';
import { loggingMiddleware } from './middleware/loggingMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';
import { cleanupExpiredUrls } from './services/cleanupService.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(loggingMiddleware);

// Routes
app.use('/shorturls', urlRoutes);
app.use('/', redirectRoute);

// Error handling
app.use(errorHandler);

// Start cleanup service
cleanupExpiredUrls();

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});