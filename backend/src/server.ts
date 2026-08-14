import { app } from './app';
import { connectDB, sequelize } from './db';
import dotenv from 'dotenv';

dotenv.config();

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 8000;

  const startServer = async () => {
    try {
      // Connect to database
      await connectDB();
      
      // Sync database models (create tables if they don't exist)
      await sequelize.sync();
      console.log('Database synchronized successfully.');

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
}

// For Vercel serverless deployment
export default async (req: any, res: any) => {
  // Initialize database connection for each request
  await connectDB();
  await sequelize.sync();
  
  // Handle the request with Express app
  return app(req, res);
};
