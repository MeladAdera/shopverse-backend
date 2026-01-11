// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AuthService } from '../services/authService.js';
import { catchAsync } from '../ errors/errorTypes.js';
import { ResponseHelper } from '../utils/responseHelper.js'; 

/**
 * Register a new user
 */
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  const result = await AuthService.register({ name, email, password });

  // ✅ Instead of: res.status(201).json({...})
  return ResponseHelper.created(res, 'User registered successfully', result);
});

/**
 * User login
 */
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const result = await AuthService.login({ email, password });

  // ✅ Instead of: res.json({...})
  return ResponseHelper.success(res, 'Login successful', result);
});

/**
 * Refresh token
 */
export const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;

  const result = await AuthService.refreshToken(refreshToken);

  // ✅ Instead of: res.json({...})
  return ResponseHelper.success(res, 'Tokens refreshed successfully', result);
});

/**
 * Get user profile
 */
export const getProfile = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userProfile = await AuthService.getProfile(req.user!.id);

  // ✅ Instead of: res.json({...})
  return ResponseHelper.success(res, 'Profile retrieved successfully', {
    user: userProfile
  });
});

/**
 * User logout
 */
export const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // ✅ Instead of: res.json({...})
  return ResponseHelper.successMessage(res, 'Logout successful');
});
