import type { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.model';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_change_me';

// Password complexity: 8+ characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
const isStrongPassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') return false;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
  return regex.test(password);
};

// 1. SIGNUP / REGISTER
export const signup = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const { email, password, name } = req.body;

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const defaultName = (name && typeof name === 'string' && name.trim()) || normalizedEmail.split('@')[0];

    const user: IUser = await User.create({
      name: defaultName,
      email: normalizedEmail,
      passwordHash,
      role: 'Admin'
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      userId: user._id,
      user: {
        id: user._id,
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, message: 'Server error during signup.', error: err.message });
  }
};

export const register = signup;

// 2. LOGIN

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const { email, password } = req.body;

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash +password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const tokenPayload = {
      id: user._id,
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    const accessToken = jwt.sign(tokenPayload, ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(tokenPayload, REFRESH_SECRET, {
      expiresIn: '7d',
      jwtid: crypto.randomBytes(16).toString('hex')
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      accessToken,
      token: accessToken,
      user: {
        id: user._id,
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.', error: err.message });
  }

};

// 3. REFRESH TOKEN
export const refresh = async (req: Request, res: Response): Promise<Response> => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (typeof refreshToken !== 'string' || !refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token not found.' });
    }

    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET) as jwt.JwtPayload;
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    const userId = decoded.id || decoded.userId;
    if (typeof userId !== 'string') {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const user = await User.findById(userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const tokenPayload = {
      id: user._id,
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    const newAccessToken = jwt.sign(tokenPayload, ACCESS_SECRET, { expiresIn: '15m' });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      token: newAccessToken
    });
  } catch (err: any) {
    console.error('Refresh token error:', err);
    return res.status(500).json({ success: false, message: 'Server error during token refresh.', error: err.message });
  }
};

// 4. FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const { email } = req.body;

    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Always respond with 200 to prevent account enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been generated.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiry
    await user.save();

    // In local development, the reset link is printed to the terminal:
    console.log(`\n======================================================`);
    console.log(`[Password Reset Link]: http://localhost:4200/reset-password?token=${resetToken}`);
    console.log(`======================================================\n`);

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been generated.'
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Error generating reset token.', error: err.message });
  }
};

// 5. RESET PASSWORD
export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    const { token, newPassword } = req.body;

    if (typeof token !== 'string' || !token || typeof newPassword !== 'string' || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token is invalid or has expired.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.refreshToken = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in.'
    });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Error resetting password.', error: err.message });
  }
};

// 6. LOGOUT
export const logout = async (req: Request, res: Response): Promise<Response> => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  try {
    if (typeof refreshToken === 'string' && refreshToken) {
      await User.updateOne({ refreshToken }, { $unset: { refreshToken: 1 } });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err: any) {
    console.error('Logout error:', err);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    return res.status(500).json({ success: false, message: 'Server error during logout.', error: err.message });
  }
};
