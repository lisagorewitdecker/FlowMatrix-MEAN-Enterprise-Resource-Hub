import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have the required permissions for this action.'
      });
      return;
    }

    next();
  };
};
