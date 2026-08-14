import { app } from '../src/app';
import { connectDB, sequelize } from '../src/db';

export default async (req: any, res: any) => {
  try {
    await connectDB();
    await sequelize.sync();
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};