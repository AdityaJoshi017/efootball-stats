import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, sequelize } from './db';
import { requireAdmin } from './middleware/auth';
import * as playerController from './controllers/playerController';
import * as matchController from './controllers/matchController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'https://efootball-stats-six.vercel.app'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check (no database required)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    hasDatabase: !!process.env.DATABASE_URL || !!process.env.POSTGRES_URL
  });
});

// Simple test endpoint (no database required)
app.get('/test', (req, res) => {
  res.json({ message: 'Serverless function is working!' });
});

// Public routes
app.get('/api/players', playerController.listPlayers);
app.get('/api/players/:id', playerController.getPlayer);
app.get('/api/players/:id/matches', matchController.getPlayerMatches);

// Admin-protected routes (no file upload middleware - using image URLs instead)
app.post('/api/players', requireAdmin, playerController.createPlayer);
app.put('/api/players/:id', requireAdmin, playerController.updatePlayer);
app.delete('/api/players/:id', requireAdmin, playerController.deletePlayer);

app.post('/api/players/:id/matches', requireAdmin, matchController.addMatch);
app.put('/api/matches/:id', requireAdmin, matchController.updateMatch);
app.delete('/api/matches/:id', requireAdmin, matchController.deleteMatch);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export { app };
