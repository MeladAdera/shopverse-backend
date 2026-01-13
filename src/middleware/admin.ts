// 📁 src/middleware/admin.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../ errors/AppError.js';

export const adminGuard = (req: Request, res: Response, next: NextFunction) => {
  // Ensure user is logged in and has Admin privileges
  if (!req.user) {
    throw new AppError('Unauthorized - Please log in', 401);
  }

  if (req.user.role !== 'admin') {
    throw new AppError('Unauthorized - Insufficient permissions', 403);
  }

  next();
};