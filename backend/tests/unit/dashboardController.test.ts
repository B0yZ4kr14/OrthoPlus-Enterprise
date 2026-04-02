import { Request, Response } from 'express';
import { DashboardController } from '../../src/modules/dashboard/controllers/DashboardController';
import { IDatabaseConnection, QueryResult, Transaction } from '../../src/infrastructure/database/IDatabaseConnection';

// Mock database connection
const makeQueryResult = (rows: Record<string, unknown>[]): QueryResult => ({
  rows,
  rowCount: rows.length,
});

const mockDb = (): IDatabaseConnection & { query: jest.Mock } => ({
  query: jest.fn(),
  beginTransaction: jest.fn().mockResolvedValue({} as Transaction),
  queryWithRetry: jest.fn(),
  healthCheck: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(undefined),
  getPool: jest.fn().mockReturnValue(null),
});

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockReq = (user?: { clinicId?: string }): Partial<Request> => ({
  user: user as Request['user'],
});

describe('DashboardController', () => {
  describe('getOverview', () => {
    it('returns 400 when clinicId is missing', async () => {
      const db = mockDb();
      const controller = new DashboardController(db);
      const req = mockReq();
      const res = mockRes();

      await controller.getOverview(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Clinic ID is required' });
      expect(db.query).not.toHaveBeenCalled();
    });

    it('returns dashboard data when clinicId is present', async () => {
      const db = mockDb();
      // All 9 queries (6 stats + appointmentsData + revenueData + treatmentsByStatus)
      db.query
        .mockResolvedValueOnce(makeQueryResult([{ count: '42' }]))          // totalPatients
        .mockResolvedValueOnce(makeQueryResult([{ count: '3' }]))           // todayAppointments
        .mockResolvedValueOnce(makeQueryResult([{ total: '15000.50' }]))    // monthlyRevenue
        .mockResolvedValueOnce(makeQueryResult([{ completed: '8', total: '10' }])) // occupancy
        .mockResolvedValueOnce(makeQueryResult([{ count: '5' }]))           // pendingTreatments
        .mockResolvedValueOnce(makeQueryResult([{ count: '12' }]))          // completedTreatments
        .mockResolvedValueOnce(makeQueryResult([]))                         // appointmentsData
        .mockResolvedValueOnce(makeQueryResult([]))                         // revenueData
        .mockResolvedValueOnce(makeQueryResult([]));                        // treatmentsByStatus

      const controller = new DashboardController(db);
      const req = mockReq({ clinicId: 'clinic-123' });
      const res = mockRes();

      await controller.getOverview(req as Request, res);

      expect(res.json).toHaveBeenCalledWith({
        stats: {
          totalPatients: 42,
          todayAppointments: 3,
          monthlyRevenue: 15000.5,
          occupancyRate: 80,
          pendingTreatments: 5,
          completedTreatments: 12,
        },
        appointmentsData: [],
        revenueData: [],
        treatmentsByStatus: [],
      });
    });

    it('executes all stat queries in parallel (Promise.all)', async () => {
      const db = mockDb();
      const callOrder: number[] = [];
      let resolvers: Array<() => void> = [];

      // The Promise.all in getStats fires 6 queries in this order:
      // 0: totalPatients, 1: todayAppointments, 2: monthlyRevenue,
      // 3: occupancyResult (needs {completed, total}), 4: pendingTreatments, 5: completedTreatments
      // Then getAppointmentsData (6), getRevenueData (7), getTreatmentsByStatus (8)
      const OCCUPANCY_QUERY_INDEX = 3;
      db.query.mockImplementation(() => {
        const idx = callOrder.length;
        callOrder.push(idx);
        return new Promise<QueryResult>((resolve) => {
          resolvers.push(() =>
            resolve(
              makeQueryResult(
                idx === OCCUPANCY_QUERY_INDEX
                  ? [{ completed: '0', total: '0' }]
                  : [{ count: '0', total: '0' }],
              ),
            ),
          );
        });
      });

      const controller = new DashboardController(db);
      const req = mockReq({ clinicId: 'clinic-parallel' });
      const res = mockRes();

      const overviewPromise = controller.getOverview(req as Request, res);

      // All 9 queries should have been initiated before any resolves (parallel)
      // Give the event loop a tick to start all promises
      await new Promise((r) => setImmediate(r));
      expect(db.query.mock.calls.length).toBe(9);

      // Now resolve all
      resolvers.forEach((r) => r());
      await overviewPromise;

      expect(res.json).toHaveBeenCalled();
    });

    it('returns 500 on database error', async () => {
      const db = mockDb();
      db.query.mockRejectedValue(new Error('DB connection lost'));

      const controller = new DashboardController(db);
      const req = mockReq({ clinicId: 'clinic-err' });
      const res = mockRes();

      await controller.getOverview(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch dashboard data' });
    });
  });
});
