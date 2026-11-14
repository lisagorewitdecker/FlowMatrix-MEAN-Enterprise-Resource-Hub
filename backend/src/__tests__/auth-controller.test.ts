import { beforeEach, describe, expect, it, jest } from '@jest/globals';
/// <reference types="jest" />
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  signup,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  logout
} from '../controllers/auth.controller';
import { User } from '../models/User.model';

type AnyMock = jest.Mock<(...args: any[]) => any>;

// Mock module implementations
jest.mock('../models/User.model');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Type-safe mock adapters that decouple tests from Mongoose Query internal overloads
const MockedUser = User as unknown as {
  findOne: AnyMock;
  findById: AnyMock;
  create: AnyMock;
};

const MockedBcrypt = bcrypt as unknown as {
  hash: AnyMock;
  compare: AnyMock;
  genSalt: AnyMock;
};

const MockedJwt = jwt as unknown as {
  sign: AnyMock;
  verify: AnyMock;
};

describe('Auth Controller Unit Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  const createMockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn<Response['status']>().mockReturnValue(res as Response);
    res.json = jest.fn<Response['json']>().mockReturnValue(res as Response);
    res.cookie = jest.fn<Response['cookie']>().mockReturnValue(res as Response);
    res.clearCookie = jest.fn<Response['clearCookie']>().mockReturnValue(res as Response);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRes = createMockResponse();
  });

  // ==========================================
  // 1. SIGNUP / REGISTER
  // ==========================================
  describe('signup / register', () => {
    it('should return 400 if email or password is missing', async () => {
      mockReq = { body: { email: 'test@example.com' } };

      await signup(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Email and password are required.' })
      );
    });

    it('should return 400 if password does not meet complexity requirements', async () => {
      mockReq = {
        body: {
          email: 'test@example.com',
          password: 'weak'
        }
      };

      await signup(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Password must be at least 8 characters long')
        })
      );
    });

    it('should return 400 if email is already registered', async () => {
      mockReq = {
        body: {
          email: 'existing@example.com',
          password: 'Password123!'
        }
      };

      MockedUser.findOne.mockResolvedValue({ _id: 'user_123', email: 'existing@example.com' });

      await signup(mockReq as Request, mockRes as Response);

      expect(MockedUser.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'An account with this email already exists.' })
      );
    });

    it('should hash password, create user with Contributor role, and return 201', async () => {
      mockReq = {
        body: {
          email: 'newuser@example.com',
          password: 'StrongPassword123!',
          name: 'Jane Doe'
        }
      };

      MockedUser.findOne.mockResolvedValue(null);
      MockedBcrypt.hash.mockResolvedValue('hashed_secret_password');
      MockedUser.create.mockResolvedValue({
        _id: 'mock_id_999',
        name: 'Jane Doe',
        email: 'newuser@example.com',
        role: 'Contributor'
      });

      await signup(mockReq as Request, mockRes as Response);

      expect(MockedBcrypt.hash).toHaveBeenCalledWith('StrongPassword123!', 12);
      expect(MockedUser.create).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'newuser@example.com',
        passwordHash: 'hashed_secret_password',
        role: 'Contributor'
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          userId: 'mock_id_999',
          user: expect.objectContaining({ email: 'newuser@example.com', role: 'Contributor' })
        })
      );
    });
  });

  // ==========================================
  // 2. LOGIN
  // ==========================================
  describe('login', () => {
    it('should return 400 if email or password is missing', async () => {
      mockReq = { body: { email: 'user@example.com' } };

      await login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Email and password are required.' })
      );
    });

    it('should return 401 if user does not exist', async () => {
      mockReq = { body: { email: 'missing@example.com', password: 'Password123!' } };
      MockedUser.findOne.mockReturnValue({ select: jest.fn().mockReturnValue(null) });

      await login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Invalid email or password.' })
      );
    });

    it('should return 401 if password does not match', async () => {
      mockReq = { body: { email: 'user@example.com', password: 'WrongPassword123!' } };
      const mockUser = {
        _id: 'user_1',
        email: 'user@example.com',
        comparePassword: jest.fn<(password: string) => Promise<boolean>>().mockResolvedValue(false)
      };
      MockedUser.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue(mockUser)
      });
      await login(mockReq as Request, mockRes as Response);

      expect(mockUser.comparePassword).toHaveBeenCalledWith('WrongPassword123!');
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should issue tokens, set httpOnly cookie, and return 200 upon valid credentials', async () => {
      mockReq = { body: { email: 'user@example.com', password: 'CorrectPassword123!' } };
      const mockUser = {
        _id: 'user_123',
        email: 'user@example.com',
        name: 'Alex Developer',
        role: 'Admin',
        refreshToken: '',
        comparePassword: jest.fn<(password: string) => Promise<boolean>>().mockResolvedValue(true),
        save: jest.fn<() => Promise<boolean>>().mockResolvedValue(true)
      };

      MockedUser.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue(mockUser)
      });
      MockedJwt.sign
        .mockReturnValueOnce('mock_access_token')
        .mockReturnValueOnce('mock_refresh_token');

      await login(mockReq as Request, mockRes as Response);

      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'mock_refresh_token',
        expect.objectContaining({ httpOnly: true, sameSite: 'lax' })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          accessToken: 'mock_access_token',
          user: expect.objectContaining({ role: 'Admin' })
        })
      );
    });
  });

  // ==========================================
  // 3. REFRESH TOKEN
  // ==========================================
  describe('refresh', () => {
    it('should return 401 if no refresh token is provided in cookies or body', async () => {
      mockReq = { cookies: {}, body: {} };

      await refresh(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Refresh token not found.' })
      );
    });

    it('should return 401 if refresh token is expired or invalid', async () => {
      mockReq = { cookies: { refreshToken: 'invalid_token' } };
      MockedJwt.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await refresh(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Invalid or expired refresh token.' })
      );
    });

    it('should issue a new access token when given a valid refresh token', async () => {
      mockReq = { cookies: { refreshToken: 'valid_refresh_token' } };
      MockedJwt.verify.mockReturnValue({ id: 'user_456' });
      MockedUser.findById.mockResolvedValue({
        _id: 'user_456',
        email: 'alex@company.com',
        role: 'Manager',
        name: 'Alex',
        refreshToken: 'valid_refresh_token'
      });
      MockedJwt.sign.mockReturnValue('new_access_token');

      await refresh(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, accessToken: 'new_access_token' })
      );
    });
  });

  // ==========================================
  // 4. FORGOT PASSWORD
  // ==========================================
  describe('forgotPassword', () => {
    it('should return 400 if email is missing', async () => {
      mockReq = { body: {} };

      await forgotPassword(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Email address is required.' })
      );
    });

    it('should return generic 200 success if user does not exist (prevents enumeration)', async () => {
      mockReq = { body: { email: 'nonexistent@example.com' } };
      MockedUser.findOne.mockResolvedValue(null);

      await forgotPassword(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'If an account exists with this email, a password reset link has been generated.'
        })
      );
    });

    it('should set reset token, expiry, save user, and return 200', async () => {
      mockReq = { body: { email: 'user@example.com' } };
      const mockUser = {
        email: 'user@example.com',
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
        save: jest.fn<() => Promise<boolean>>().mockResolvedValue(true)
      };

      MockedUser.findOne.mockResolvedValue(mockUser);

      await forgotPassword(mockReq as Request, mockRes as Response);

      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.resetPasswordToken).toBeDefined();
      expect(mockUser.resetPasswordExpires).toBeInstanceOf(Date);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  // ==========================================
  // 5. RESET PASSWORD
  // ==========================================
  describe('resetPassword', () => {
    it('should return 400 if token or new password is missing', async () => {
      mockReq = { body: { token: 'sample_token' } };

      await resetPassword(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Token and new password are required.' })
      );
    });

    it('should return 400 if new password does not meet strength rules', async () => {
      mockReq = { body: { token: 'valid_token', newPassword: 'plain' } };

      await resetPassword(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Password must be at least 8 characters long')
        })
      );
    });

    it('should return 400 if reset token is invalid or expired in database', async () => {
      mockReq = { body: { token: 'invalid_or_expired_token', newPassword: 'StrongPassword123!' } };
      MockedUser.findOne.mockResolvedValue(null);

      await resetPassword(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Token is invalid or has expired.' })
      );
    });

    it('should update passwordHash, wipe reset tokens, save user, and return 200', async () => {
      mockReq = { body: { token: 'valid_token_raw', newPassword: 'NewValidPassword123!' } };
      const mockUser = {
        passwordHash: 'old_hash',
        resetPasswordToken: 'some_hashed_token',
        resetPasswordExpires: new Date(Date.now() + 60000),
        save: jest.fn<() => Promise<boolean>>().mockResolvedValue(true)
      };

      MockedUser.findOne.mockResolvedValue(mockUser);
      MockedBcrypt.hash.mockResolvedValue('new_bcrypt_hash_val');

      await resetPassword(mockReq as Request, mockRes as Response);

      expect(MockedBcrypt.hash).toHaveBeenCalledWith('NewValidPassword123!', 12);
      expect(mockUser.passwordHash).toBe('new_bcrypt_hash_val');
      expect(mockUser.resetPasswordToken).toBeUndefined();
      expect(mockUser.resetPasswordExpires).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  // ==========================================
  // 6. LOGOUT
  // ==========================================
  describe('logout', () => {
    it('should clear the refreshToken cookie and return 200', async () => {
      mockReq = {};

      await logout(mockReq as Request, mockRes as Response);

      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.objectContaining({ httpOnly: true, sameSite: 'lax' })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'Logged out successfully.' });
    });
  });
});
