import { Transaction } from '../../src/modules/financeiro/domain/entities/Transaction';

const makeTransaction = (
  overrides: Partial<Parameters<typeof Transaction.create>[0]> = {},
): Transaction => {
  const now = new Date('2025-01-15T08:00:00Z');
  return Transaction.create({
    id: 'txn-001',
    clinicId: 'clinic-1',
    type: 'RECEITA',
    category: 'Consulta',
    amount: 300,
    description: 'Consulta odontológica',
    dueDate: new Date('2025-02-01'),
    status: 'PENDENTE',
    patientId: 'patient-1',
    appointmentId: null,
    paymentMethod: null,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });
};

describe('Transaction Domain Entity (backend)', () => {
  describe('create', () => {
    it('creates a transaction with the provided values', () => {
      const t = makeTransaction();
      expect(t.id).toBe('txn-001');
      expect(t.clinicId).toBe('clinic-1');
      expect(t.type).toBe('RECEITA');
      expect(t.status).toBe('PENDENTE');
      expect(t.amount).toBe(300);
      expect(t.paymentMethod).toBeNull();
      expect(t.paidAt).toBeNull();
    });

    it('supports DESPESA type', () => {
      const t = makeTransaction({ type: 'DESPESA' });
      expect(t.type).toBe('DESPESA');
    });
  });

  describe('markAsPaid', () => {
    it('changes status to PAGO and records paymentMethod', () => {
      const t = makeTransaction();
      t.markAsPaid('PIX');
      expect(t.status).toBe('PAGO');
      expect(t.paymentMethod).toBe('PIX');
      expect(t.paidAt).toBeInstanceOf(Date);
    });

    it('updates updatedAt', () => {
      const past = new Date('2020-01-01');
      const t = makeTransaction({ updatedAt: past });
      t.markAsPaid('DINHEIRO');
      expect(t.updatedAt.getTime()).toBeGreaterThan(past.getTime());
    });

    it('throws when transaction is CANCELADO', () => {
      const t = makeTransaction({ status: 'CANCELADO' });
      expect(() => t.markAsPaid('PIX')).toThrow('Não é possível pagar uma transação cancelada');
    });

    it('can pay an already PAGO transaction (no guard against double-pay)', () => {
      const t = makeTransaction();
      t.markAsPaid('PIX');
      // The entity does not currently guard against double payment
      expect(() => t.markAsPaid('CARTÃO')).not.toThrow();
      expect(t.paymentMethod).toBe('CARTÃO');
    });
  });

  describe('cancel', () => {
    it('changes status to CANCELADO', () => {
      const t = makeTransaction();
      t.cancel();
      expect(t.status).toBe('CANCELADO');
    });

    it('updates updatedAt', () => {
      const past = new Date('2020-01-01');
      const t = makeTransaction({ updatedAt: past });
      t.cancel();
      expect(t.updatedAt.getTime()).toBeGreaterThan(past.getTime());
    });

    it('throws when transaction is already PAGO', () => {
      const t = makeTransaction({ status: 'PAGO' });
      expect(() => t.cancel()).toThrow('Não é possível cancelar uma transação paga');
    });

    it('allows cancelling an already CANCELADO transaction', () => {
      const t = makeTransaction({ status: 'CANCELADO' });
      expect(() => t.cancel()).not.toThrow();
    });
  });
});
