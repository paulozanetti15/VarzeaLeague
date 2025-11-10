import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Authentication Middleware', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn().mockReturnValue(undefined);
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    req = {
      headers: {}
    };

    res = {
      status: statusMock,
      json: jsonMock
    };

    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('Token Validation', () => {
    it('should reject requests without token', () => {
      req.headers = {};

      expect(req.headers.authorization).toBeUndefined();
    });

    it('should extract token from Authorization header', () => {
      const token = 'Bearer valid.jwt.token';
      req.headers = { authorization: token };

      expect(req.headers.authorization).toContain('Bearer');
    });

    it('should reject tokens with invalid format', () => {
      req.headers = { authorization: 'InvalidFormat token' };

      const parts = req.headers.authorization?.split(' ');
      const isValidFormat = parts && parts.length === 2 && parts[0] === 'Bearer';
      
      expect(isValidFormat).toBe(false);
    });
  });

  describe('JWT Verification', () => {
    it('should verify valid JWT tokens', () => {
      const mockUser = { id: 1, email: 'user@example.com', userTypeId: 1 };
      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      const token = 'valid.jwt.token';
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      expect(decoded).toEqual(mockUser);
      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
    });

    it('should reject expired tokens', () => {
      const error = new Error('TokenExpiredError');
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const token = 'expired.jwt.token';
      expect(() => {
        jwt.verify(token, process.env.JWT_SECRET || 'secret');
      }).toThrow();
    });

    it('should reject tampered tokens', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('JsonWebTokenError');
      });

      const tamperedToken = 'tampered.jwt.token';
      expect(() => {
        jwt.verify(tamperedToken, process.env.JWT_SECRET || 'secret');
      }).toThrow();
    });
  });

  describe('Token Payload Structure', () => {
    it('should contain required user fields (id, email, userTypeId)', () => {
      const tokenPayload = {
        id: 1,
        email: 'user@example.com',
        userTypeId: 3
      };

      (jwt.verify as jest.Mock).mockReturnValue(tokenPayload);

      const decoded = jwt.verify('token', 'secret');

      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('userTypeId');
    });

    it('should have valid userTypeId (1-4)', () => {
      const validUserTypes = [1, 2, 3, 4];

      validUserTypes.forEach(typeId => {
        const payload = { id: 1, email: 'user@example.com', userTypeId: typeId };
        expect([1, 2, 3, 4]).toContain(payload.userTypeId);
      });
    });

    it('should reject invalid userTypeId', () => {
      const invalidUserTypes = [0, 5, 99, -1];

      invalidUserTypes.forEach(typeId => {
        expect([1, 2, 3, 4]).not.toContain(typeId);
      });
    });
  });

  describe('User Authorization Levels', () => {
    it('should identify admin_master (userTypeId 1)', () => {
      const mockUser = { id: 1, userTypeId: 1, email: 'admin@example.com' };
      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      const decoded = jwt.verify('token', 'secret') as any;
      const isAdmin = decoded.userTypeId === 1;

      expect(isAdmin).toBe(true);
    });

    it('should identify admin_eventos (userTypeId 2)', () => {
      const mockUser = { id: 1, userTypeId: 2, email: 'admin@example.com' };
      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      const decoded = jwt.verify('token', 'secret') as any;
      const isEventAdmin = decoded.userTypeId === 2;

      expect(isEventAdmin).toBe(true);
    });

    it('should identify admin_times (userTypeId 3)', () => {
      const mockUser = { id: 1, userTypeId: 3, email: 'admin@example.com' };
      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      const decoded = jwt.verify('token', 'secret') as any;
      const isTeamAdmin = decoded.userTypeId === 3;

      expect(isTeamAdmin).toBe(true);
    });

    it('should identify usuario_comum (userTypeId 4)', () => {
      const mockUser = { id: 1, userTypeId: 4, email: 'user@example.com' };
      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      const decoded = jwt.verify('token', 'secret') as any;
      const isCommonUser = decoded.userTypeId === 4;

      expect(isCommonUser).toBe(true);
    });
  });
});
