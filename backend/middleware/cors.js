const cors = require('cors');

// Get allowed origins from environment
const getAllowedOrigins = () => {
  const origins = [process.env.FRONTEND_URL];
  
  // In development, also allow localhost variations
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:8080');
    origins.push('http://127.0.0.1:8080');
    origins.push('http://localhost:5500'); // Live Server default
    origins.push('http://127.0.0.1:5500');
  }
  
  return origins.filter(Boolean);
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = cors(corsOptions);
