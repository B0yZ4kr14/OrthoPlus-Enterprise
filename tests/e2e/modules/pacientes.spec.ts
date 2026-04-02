import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

test.describe('Módulo PACIENTES - E2E Tests', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Login to get auth token
    const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
      data: {
        email: 'admin@orthoplus.com',
        password: 'Admin123!',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    authToken = data.token;
  });

  test('should create a new patient', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/pacientes`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        fullName: 'João da Silva',
        cpf: '12345678901',
        email: 'joao.silva@example.com',
        phone: '11987654321',
        birthDate: '1990-01-15',
        origem: 'SITE',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.patient).toBeDefined();
    expect(data.patient.fullName).toBe('João da Silva');
    expect(data.patient.currentStatus).toBe('NOVO_LEAD');
  });

  test('should list patients with pagination', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/pacientes?page=1&limit=10`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.patients).toBeInstanceOf(Array);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.total).toBeGreaterThanOrEqual(0);
  });

  test('should change patient status', async ({ request }) => {
    // First create a patient
    const createResponse = await request.post(`${API_BASE_URL}/api/pacientes`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        fullName: 'Maria Santos',
        cpf: '98765432109',
        email: 'maria.santos@example.com',
        phone: '11987654322',
        birthDate: '1985-05-20',
        origem: 'INDICACAO',
      },
    });

    const createData = await createResponse.json();
    const patientId = createData.patient.id;

    // Then change status
    const statusResponse = await request.patch(
      `${API_BASE_URL}/api/pacientes/${patientId}/status`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          newStatus: 'PRIMEIRO_CONTATO',
          notes: 'Teste de mudança de status',
        },
      }
    );

    expect(statusResponse.ok()).toBeTruthy();
    const statusData = await statusResponse.json();
    expect(statusData.patient.currentStatus).toBe('PRIMEIRO_CONTATO');
  });

  test('should prevent duplicate CPF', async ({ request }) => {
    const patientData = {
      fullName: 'Duplicate Test',
      cpf: '11111111111',
      email: 'duplicate1@example.com',
      phone: '11987654323',
      birthDate: '1995-03-10',
      origem: 'SITE',
    };

    // Create first patient
    await request.post(`${API_BASE_URL}/api/pacientes`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: patientData,
    });

    // Try to create duplicate
    const duplicateResponse = await request.post(`${API_BASE_URL}/api/pacientes`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        ...patientData,
        email: 'duplicate2@example.com', // Different email but same CPF
      },
    });

    expect(duplicateResponse.status()).toBe(400);
    const data = await duplicateResponse.json();
    expect(data.error).toContain('CPF já cadastrado');
  });

  test('should get stats by status', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/pacientes/stats/by-status`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.stats).toBeInstanceOf(Array);
    data.stats.forEach((stat: any) => {
      expect(stat).toHaveProperty('status');
      expect(stat).toHaveProperty('count');
    });
  });
});
