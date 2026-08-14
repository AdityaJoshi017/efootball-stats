import { app } from '../src/app';
import { connectDB, sequelize } from '../src/db';

export default async (req: any, res: any) => {
  console.log('Function invoked:', req.method, req.url);
  
  // Simple test without database for debugging
  if (req.url === '/test') {
    return res.json({ 
      message: 'Serverless function is working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  }

  if (req.url === '/health') {
    return res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      hasDatabase: !!process.env.DATABASE_URL || !!process.env.POSTGRES_URL
    });
  }

  console.log('Environment check:', {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    nodeEnv: process.env.NODE_ENV
  });

  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');
    
    console.log('Syncing database...');
    await sequelize.sync();
    console.log('Database synced successfully');
    
    console.log('Routing to Express app...');
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }
};