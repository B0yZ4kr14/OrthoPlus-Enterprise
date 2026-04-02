import express from 'express';
import request from 'supertest';

// Simple health check test without spinning up DB
describe('Health Endpoint (/health)', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.get('/health', (_req, res) => {
      res.json({ status: 'ok' });
    });
  });

  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
