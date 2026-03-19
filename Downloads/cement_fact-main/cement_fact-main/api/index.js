require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Add server directory to module paths for Vercel
const serverPath = path.join(__dirname, '..', 'server');
const configPath = path.join(serverPath, 'src', 'config', 'db');
const routesPath = path.join(serverPath, 'src', 'routes');

const { connectDB } = require(configPath);
const authRoutes = require(path.join(routesPath, 'authRoutes'));
const productRoutes = require(path.join(routesPath, 'productRoutes'));
const orderRoutes = require(path.join(routesPath, 'orderRoutes'));

let app;
let dbConnected = false;

// Initialize app once
async function initializeApp() {
  if (app) return app;

  app = express();

  // Connect to MongoDB once
  if (!dbConnected) {
    try {
      await connectDB(process.env.MONGODB_URI);
      dbConnected = true;
      console.log('MongoDB connected');
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
      dbConnected = false;
    }
  }

  app.use(cors({
    origin: '*',
    credentials: true
  }));
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'cement-steel-backend', db: dbConnected ? 'connected' : 'disconnected' });
  });

  app.use('/auth', authRoutes);
  app.use('/products', productRoutes);
  app.use('/orders', orderRoutes);

  app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  });

  return app;
}

// Vercel serverless handler
module.exports = async (req, res) => {
  try {
    const app = await initializeApp();
    
    // Strip /api prefix if present for Express routing
    const originalUrl = req.url;
    if (req.url.startsWith('/api')) {
      req.url = req.url.replace('/api', '') || '/';
    }
    
    // Call Express handler
    return app(req, res);
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ message: 'Handler error', error: err.message });
  }
};
