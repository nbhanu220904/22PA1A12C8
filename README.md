# BOLT URL Shortener

A full-stack URL shortener application with comprehensive analytics and logging.

## Project Structure

```
project-root/
├── frontend/   # React application (localhost:3000)
├── backend/    # Node.js microservice (localhost:8000)
└── README.md
```

## Features

### Backend (Microservice)
- **POST /shorturls**: Create short URLs with optional custom shortcodes and expiry
- **GET /shorturls/:shortcode**: Retrieve comprehensive analytics
- **GET /:shortcode**: Redirect to original URL with click tracking
- Logging middleware for all operations (no console.log usage)
- Automatic cleanup of expired URLs
- Geographic location tracking
- Robust error handling (400, 404, 410)

### Frontend (React App)
- **URL Shortener Page**: Input up to 5 URLs simultaneously
- **Statistics Page**: View detailed analytics and click history
- Material UI components for professional design
- Real-time validation and error handling
- Copy-to-clipboard functionality
- Responsive design for all devices

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Start both backend and frontend:
```bash
npm run dev
```

Or start them separately:
```bash
# Terminal 1 - Backend (port 8000)
npm run dev:backend

# Terminal 2 - Frontend (port 3000)
npm run dev:frontend
```

### Usage

1. **Frontend**: Visit http://localhost:3000
2. **Backend API**: Available at http://localhost:8000

## API Endpoints

### Create Short URL
```
POST /shorturls
Content-Type: application/json

{
  "url": "https://example.com/very-long-url",
  "shortcode": "custom123",  // optional
  "validity": 60             // optional, minutes
}
```

### Get Analytics
```
GET /shorturls/:shortcode
```

### Redirect (Browser)
```
GET /:shortcode
```

## Key Features Implemented

- ✅ Globally unique shortcode generation
- ✅ Custom shortcode support with validation
- ✅ Configurable expiry (default 30 minutes)
- ✅ Comprehensive click analytics
- ✅ Geographic location tracking
- ✅ Referrer and user agent tracking
- ✅ Automatic cleanup of expired URLs
- ✅ Structured logging throughout
- ✅ Error handling with proper HTTP codes
- ✅ React frontend with Material UI
- ✅ Responsive design
- ✅ Multiple URL processing (up to 5)

## Logging

All operations are logged using a structured logging middleware:
- Backend logs: `backend/logs/app.log`
- Frontend logs: Browser dev tools + session storage

## Architecture Decisions

1. **In-Memory Storage**: Used for simplicity; easily replaceable with database
2. **Material UI**: Provides professional, accessible components
3. **Structured Logging**: JSON-formatted logs for better analysis
4. **Microservice Pattern**: Clear separation of concerns
5. **Error-First Design**: Comprehensive error handling at all levels

## Development Notes

- Backend uses ES modules
- Frontend uses Vite for fast development
- Concurrent development with hot reloading
- Comprehensive input validation
- RESTful API design
- Geographic IP lookup for analytics