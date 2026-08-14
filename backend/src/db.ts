import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Database configuration - supports both SQLite (local) and PostgreSQL (Vercel)
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const sequelize = databaseUrl 
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? { 
          require: true,
          rejectUnauthorized: false 
        } : false,
      },
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: process.env.DATABASE_PATH ?? './data.db',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    });

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error; // Throw instead of exit for serverless
  }
};
