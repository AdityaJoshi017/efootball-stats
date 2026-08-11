import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-admin-token'] as string || 
                req.headers.authorization?.replace('Bearer ', '') as string;

  if (!token) {
    return res.status(401).json({ error: 'Admin token required' });
  }

  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Invalid admin token' });
  }

  next();
};
