import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { userRepository } from '../repositories/userRepository.js';
import { AuthenticationError, AuthorizationError } from '../ errors/errorTypes.js';

// Extend Request type to include user property
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    name?: string;
  };
  // أضف هذه الخصائص المفقودة
  body: any;
  params: any;
  query: any;
  files?: any;
  headers: any;
}

/**
 * Middleware to verify JWT access token
 * 🆕 تم تحديثه لاستخدام getUserStatus بدلاً من findByIdWithPassword
 */
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // 1. استخراج التوكن من Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authentication token is required');
    }

    // 2. تحليل التوكن من صيغة "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('Invalid token format');
    }

    // 3. التحقق من صحة التوكن وفك التشفير
    const decoded = verifyAccessToken(token);
    
    // 🆕 4. التحقق من حالة المستخدم فقط (active) - باستخدام الدالة الجديدة
    const userStatus = await userRepository.getUserStatus(decoded.userId);
    
    if (!userStatus) {
      throw new AuthenticationError('User not found or account deleted');
    }

    // 🆕 5. التحقق من أن المستخدم نشط (غير معطل)
    if (!userStatus.active) {
      throw new AuthenticationError(
        'Your account has been blocked. Please contact the administrator.'
      );
    }

    // 6. إضافة بيانات المستخدم من التوكن (البيانات موجودة في التوكن أصلاً)
    req.user = {
      id: decoded.userId,      
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };
    
    next();
  } catch (error: any) {
    // 🆕 تحسين رسائل الخطأ
    if (error instanceof AuthenticationError) {
      next(error);
    } else if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('Token has expired'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new AuthenticationError('Invalid token'));
    } else {
      console.error('Authentication middleware error:', error);
      next(new AuthenticationError('Authentication failed'));
    }
  }
};

/**
 * Middleware to enforce admin role access
 */
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (req.user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    next();
  } catch (error: any) {
    next(error);
  }
};

/**
 * Middleware to enforce any authenticated user access
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    next();
  } catch (error: any) {
    next(error);
  }
};

/**
 * 🆕 middleware إضافي للتحقق من حالة المستخدم فقط
 * يمكن استخدامه في routes لا تحتاج إلى توكن ولكن تحتاج إلى تحقق الحالة
 */
export const checkUserActive = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    // التحقق من حالة المستخدم من قاعدة البيانات باستخدام الدالة الجديدة
    const userStatus = await userRepository.getUserStatus(req.user.id);
    
    if (!userStatus) {
      throw new AuthenticationError('User not found');
    }

    if (!userStatus.active) {
      throw new AuthenticationError('Your account has been blocked');
    }

    next();
  } catch (error: any) {
    next(error);
  }
};