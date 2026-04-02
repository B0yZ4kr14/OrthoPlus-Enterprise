import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthController } from '../../src/modules/auth/api/AuthController';

// Mock the Prisma client so tests run without a real database
jest.mock('../../src/infrastructure/database/prismaClient', () => ({
  prisma: {
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
    profiles: {
      findUnique: jest.fn(),
    },
    clinics: {
      findUnique: jest.fn(),
    },
    user_module_permissions: {
      findMany: jest.fn(),
    },
    module_catalog: {
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from '../../src/infrastructure/database/prismaClient';

const controller = new AuthController();

// Mock express request/response
const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockReq = (body = {}, headers = {}, params = {}): Partial<Request> => ({
  body,
  headers: headers as Request['headers'],
  params: params as Request['params'],
});

const JWT_SECRET = 'supersecretmockjwt';
process.env.JWT_SECRET = JWT_SECRET;

// ── Mock-mode tests (AUTH_ALLOW_MOCK=true) ─────────────────────────────────
describe('Auth Controller (mock mode)', () => {
  beforeAll(() => {
    process.env.AUTH_ALLOW_MOCK = 'true';
  });

  afterAll(() => {
    delete process.env.AUTH_ALLOW_MOCK;
  });

  // ── login ─────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('returns 400 when email is missing', async () => {
      const req = mockReq({ password: '123' });
      const res = mockRes();
      await controller.login(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email and password required' });
    });

    it('returns 400 when password is missing', async () => {
      const req = mockReq({ email: 'a@b.com' });
      const res = mockRes();
      await controller.login(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 401 for known-bad credentials', async () => {
      const req = mockReq({ email: 'invalido@email.com', password: 'any' });
      const res = mockRes();
      await controller.login(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Credenciais inválidas' });
    });

    it('returns JWT on valid mock credentials', async () => {
      const req = mockReq({ email: 'admin@clinic.com', password: 'correct' });
      const res = mockRes();
      await controller.login(req as Request, res);
      expect(res.json).toHaveBeenCalled();
      const payload = (res.json as jest.Mock).mock.calls[0][0];
      expect(payload).toHaveProperty('access_token');
      expect(payload).toHaveProperty('token_type', 'bearer');
      expect(payload).toHaveProperty('expires_in', 3600);
      expect(payload.user.email).toBe('admin@clinic.com');
      // token must be verifiable
      const decoded = jwt.verify(payload.access_token, JWT_SECRET) as { role: string };
      expect(decoded.role).toBe('authenticated');
    });
  });

  // ── getUserMetadata (mock mode) ───────────────────────────────────────────
  describe('getUserMetadata', () => {
    it('returns admin role and clinic data in mock mode when no profile in DB', async () => {
      // No real profile → falls back to mock
      (prisma.profiles.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const req = mockReq({}, {}, { id: 'any-user-id' });
      const res = mockRes();
      await controller.getUserMetadata(req as Request, res);
      const payload = (res.json as jest.Mock).mock.calls[0][0];
      expect(payload.roleData.role).toBe('ADMIN');
      expect(payload.clinicData).toHaveProperty('id');
      expect(payload.permissionsData).toContain('ALL');
    });
  });
});

// ── Real-auth tests (AUTH_ALLOW_MOCK unset) ────────────────────────────────
describe('Auth Controller (real auth mode)', () => {
  beforeAll(() => {
    delete process.env.AUTH_ALLOW_MOCK;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('returns 400 when email is missing', async () => {
      const req = mockReq({ password: 'pw' });
      const res = mockRes();
      await controller.login(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 401 when user not found in database', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      const req = mockReq({ email: 'nouser@clinic.com', password: 'pw' });
      const res = mockRes();
      await controller.login(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Credenciais inválidas' });
    });

    it('returns 401 when password does not match', async () => {
      // Return a user row but with a bcrypt hash that won't match 'wrong-pw'
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{
        id: 'uid-1',
        email: 'user@clinic.com',
        // bcrypt hash of 'correct-password'
        password_hash: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        role: 'ADMIN',
        clinic_id: 'clinic-1',
      }]);
      const req = mockReq({ email: 'user@clinic.com', password: 'wrong-pw' });
      const res = mockRes();
      await controller.login(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 500 when database throws', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
      const req = mockReq({ email: 'user@clinic.com', password: 'pw' });
      const res = mockRes();
      await controller.login(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── getUserMetadata (real mode) ───────────────────────────────────────────
  describe('getUserMetadata', () => {
    it('returns 400 when userId is missing', async () => {
      const req = mockReq({}, {}, {});
      const res = mockRes();
      await controller.getUserMetadata(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when profile not found', async () => {
      (prisma.profiles.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const req = mockReq({}, {}, { id: 'uid-unknown' });
      const res = mockRes();
      await controller.getUserMetadata(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns profile and clinic data for a known user', async () => {
      (prisma.profiles.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'uid-1',
        app_role: 'ADMIN',
        clinic_id: 'clinic-1',
        avatar_url: null,
        full_name: 'Dr. Test',
      });
      (prisma.clinics.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-1',
        name: 'Test Clinic',
      });
      const req = mockReq({}, {}, { id: 'uid-1' });
      const res = mockRes();
      await controller.getUserMetadata(req as Request, res);
      const payload = (res.json as jest.Mock).mock.calls[0][0];
      expect(payload.roleData.role).toBe('ADMIN');
      expect(payload.clinicData).toMatchObject({ id: 'clinic-1', name: 'Test Clinic' });
      expect(payload.permissionsData).toContain('ALL');
    });

    it('returns MEMBER role with empty permissions for non-admin profile', async () => {
      (prisma.profiles.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'uid-2',
        app_role: 'MEMBER',
        clinic_id: 'clinic-2',
        avatar_url: null,
        full_name: 'Jane Doe',
      });
      (prisma.clinics.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-2',
        name: 'Clinic B',
      });
      (prisma.user_module_permissions.findMany as jest.Mock).mockResolvedValueOnce([]);
      const req = mockReq({}, {}, { id: 'uid-2' });
      const res = mockRes();
      await controller.getUserMetadata(req as Request, res);
      const payload = (res.json as jest.Mock).mock.calls[0][0];
      expect(payload.roleData.role).toBe('MEMBER');
      expect(payload.permissionsData).toEqual([]);
    });
  });
});

// ── Shared tests (independent of auth mode) ────────────────────────────────
describe('Auth Controller (shared)', () => {
  // ── getUser ───────────────────────────────────────────────────────────────
  describe('getUser', () => {
    it('returns 401 when no authorization header', async () => {
      const req = mockReq({}, {});
      const res = mockRes();
      await controller.getUser(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 401 for invalid token', async () => {
      const req = mockReq({}, { authorization: 'Bearer invalidtoken' });
      const res = mockRes();
      await controller.getUser(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });

    it('returns user data for valid token', async () => {
      const token = jwt.sign(
        { sub: 'uid-123', email: 'test@clinic.com', role: 'authenticated' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      const req = mockReq({}, { authorization: `Bearer ${token}` });
      const res = mockRes();
      await controller.getUser(req as Request, res);
      expect(res.json).toHaveBeenCalled();
      const payload = (res.json as jest.Mock).mock.calls[0][0];
      expect(payload.user.email).toBe('test@clinic.com');
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('returns 204 no content', async () => {
      const req = mockReq();
      const res = mockRes();
      await controller.logout(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  // ── patientAuth ──────────────────────────────────────────────────────────
  describe('patientAuth', () => {
    it('returns 400 when cpf/birthDate missing', async () => {
      const req = mockReq({ cpf: '12345678901' }); // no birthDate
      const res = mockRes();
      await controller.patientAuth(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns JWT for valid cpf + birthDate (DB patient found)', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{
        id: 'patient-abc',
        clinic_id: 'clinic-xyz',
        birth_date: new Date('1990-01-01'),
      }]);
      const req = mockReq({ cpf: '12345678901', birthDate: '1990-01-01' });
      const res = mockRes();
      await controller.patientAuth(req as Request, res);
      const payload = (res.json as jest.Mock).mock.calls[0][0];
      expect(payload).toHaveProperty('access_token');
      expect(payload.user.role).toBe('patient');
      expect(payload.user.id).toBe('patient-abc');
    });

    it('returns 401 when cpf not found in DB', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      const req = mockReq({ cpf: '99999999999', birthDate: '1990-01-01' });
      const res = mockRes();
      await controller.patientAuth(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 401 when birthDate does not match', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{
        id: 'patient-abc',
        clinic_id: 'clinic-xyz',
        birth_date: new Date('1985-05-15'),
      }]);
      const req = mockReq({ cpf: '12345678901', birthDate: '1990-01-01' });
      const res = mockRes();
      await controller.patientAuth(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});

