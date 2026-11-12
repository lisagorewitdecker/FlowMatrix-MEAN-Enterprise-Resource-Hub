import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });
    return;
  }

  const token = authHeader.slice('Bearer '.length);
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret') as { userId: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    const status = error instanceof jwt.TokenExpiredError ? 401 : 403;
    res.status(status).json({ success: false, message: 'Invalid or Expired Access Token' });
  }
};
