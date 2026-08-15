import { app } from './app';
import { connectDB, sequelize } from './db';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import fs from 'fs';

dotenv.config();

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Sync database models (create tables if they don't exist)
    await sequelize.sync();
    console.log('Database synchronized successfully.');

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Created uploads directory');
    }

    // Serve static files from uploads directory
    app.use('/uploads', express.static(uploadsDir));

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
