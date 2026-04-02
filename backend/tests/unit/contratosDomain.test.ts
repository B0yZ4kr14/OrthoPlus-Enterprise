import { Contrato, ItemContrato } from '../../src/modules/contratos/domain/entities/Contrato';

const makeItemContrato = (overrides: Partial<ItemContrato> = {}): ItemContrato => ({
  procedimentoId: 'proc-001',
  procedimentoNome: 'Restauração',
  quantidade: 1,
  valorUnitario: 200,
  desconto: 0,
  valorTotal: 200,
  ...overrides,
});

const makeContrato = (
  overrides: Partial<Omit<Contrato, 'assinar' | 'cancelar'>> = {}
): Contrato => {
  const now = new Date('2026-03-30T10:00:00Z');
  const endDate = new Date('2026-06-30T10:00:00Z');

  return Contrato.create({
    id: 'contrato-001',
    clinicId: 'clinic-1',
    numero: 'CONT-2026-001',
    pacienteId: 'patient-1',
    pacienteNome: 'João Silva',
    items: [makeItemContrato()],
    valorTotal: 200,
    valorDesconto: 0,
    valorFinal: 200,
    status: 'RASCUNHO',
    formaPagamento: 'AVISTA',
    numeroParcelas: 1,
    dataInicio: now,
    dataFimPrevista: endDate,
    dataAssinatura: null,
    assinaturaDigital: null,
    observacoes: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });
};

describe('Contrato Domain Entity', () => {
  describe('create', () => {
    it('creates a contrato with the given values', () => {
      const contrato = makeContrato();

      expect(contrato.id).toBe('contrato-001');
      expect(contrato.clinicId).toBe('clinic-1');
      expect(contrato.numero).toBe('CONT-2026-001');
      expect(contrato.pacienteId).toBe('patient-1');
      expect(contrato.pacienteNome).toBe('João Silva');
      expect(contrato.status).toBe('RASCUNHO');
    });

    it('supports all status values', () => {
      const statuses: Array<
        'RASCUNHO' | 'PENDENTE_ASSINATURA' | 'ASSINADO' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'CANCELADO'
      > = ['RASCUNHO', 'PENDENTE_ASSINATURA', 'ASSINADO', 'EM_EXECUCAO', 'CONCLUIDO', 'CANCELADO'];

      statuses.forEach((status) => {
        const contrato = makeContrato({ status });
        expect(contrato.status).toBe(status);
      });
    });

    it('supports all payment methods', () => {
      const methods: Array<'AVISTA' | 'PARCELADO' | 'MENSALIDADE'> = [
        'AVISTA',
        'PARCELADO',
        'MENSALIDADE',
      ];

      methods.forEach((formaPagamento) => {
        const contrato = makeContrato({ formaPagamento });
        expect(contrato.formaPagamento).toBe(formaPagamento);
      });
    });

    it('creates contrato with multiple items', () => {
      const items = [
        makeItemContrato({ procedimentoId: 'proc-1', valorTotal: 200 }),
        makeItemContrato({ procedimentoId: 'proc-2', valorTotal: 300 }),
        makeItemContrato({ procedimentoId: 'proc-3', valorTotal: 150 }),
      ];

      const contrato = makeContrato({
        items,
        valorTotal: 650,
        valorFinal: 650,
      });

      expect(contrato.items).toHaveLength(3);
      expect(contrato.valorTotal).toBe(650);
    });

    it('handles contrato with discount', () => {
      const contrato = makeContrato({
        valorTotal: 1000,
        valorDesconto: 100,
        valorFinal: 900,
      });

      expect(contrato.valorTotal).toBe(1000);
      expect(contrato.valorDesconto).toBe(100);
      expect(contrato.valorFinal).toBe(900);
    });

    it('initializes with null signature fields', () => {
      const contrato = makeContrato();

      expect(contrato.dataAssinatura).toBeNull();
      expect(contrato.assinaturaDigital).toBeNull();
    });

    it('allows null observacoes', () => {
      const contrato = makeContrato({ observacoes: null });
      expect(contrato.observacoes).toBeNull();
    });

    it('allows defined observacoes', () => {
      const contrato = makeContrato({ observacoes: 'Contrato especial' });
      expect(contrato.observacoes).toBe('Contrato especial');
    });
  });

  describe('assinar', () => {
    it('signs a PENDENTE_ASSINATURA contrato', () => {
      const contrato = makeContrato({ status: 'PENDENTE_ASSINATURA' });
      const assinatura = 'digital-signature-hash-123';

      contrato.assinar(assinatura);

      expect(contrato.status).toBe('ASSINADO');
      expect(contrato.assinaturaDigital).toBe(assinatura);
      expect(contrato.dataAssinatura).toBeInstanceOf(Date);
    });

    it('updates updatedAt when signing', () => {
      const past = new Date('2020-01-01');
      const contrato = makeContrato({ status: 'PENDENTE_ASSINATURA', updatedAt: past });

      contrato.assinar('signature');

      expect(contrato.updatedAt.getTime()).toBeGreaterThan(past.getTime());
    });

    it('throws when trying to sign RASCUNHO contrato', () => {
      const contrato = makeContrato({ status: 'RASCUNHO' });

      expect(() => contrato.assinar('signature')).toThrow(
        'Contrato não está pendente de assinatura'
      );
    });

    it('throws when trying to sign already ASSINADO contrato', () => {
      const contrato = makeContrato({ status: 'ASSINADO' });

      expect(() => contrato.assinar('signature')).toThrow(
        'Contrato não está pendente de assinatura'
      );
    });

    it('throws when trying to sign EM_EXECUCAO contrato', () => {
      const contrato = makeContrato({ status: 'EM_EXECUCAO' });

      expect(() => contrato.assinar('signature')).toThrow(
        'Contrato não está pendente de assinatura'
      );
    });

    it('throws when trying to sign CONCLUIDO contrato', () => {
      const contrato = makeContrato({ status: 'CONCLUIDO' });

      expect(() => contrato.assinar('signature')).toThrow(
        'Contrato não está pendente de assinatura'
      );
    });

    it('throws when trying to sign CANCELADO contrato', () => {
      const contrato = makeContrato({ status: 'CANCELADO' });

      expect(() => contrato.assinar('signature')).toThrow(
        'Contrato não está pendente de assinatura'
      );
    });

    it('sets dataAssinatura to current date', () => {
      const contrato = makeContrato({ status: 'PENDENTE_ASSINATURA' });
      const before = new Date();

      contrato.assinar('signature');

      expect(contrato.dataAssinatura).toBeDefined();
      expect(contrato.dataAssinatura!.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('cancelar', () => {
    it('cancels a RASCUNHO contrato', () => {
      const contrato = makeContrato({ status: 'RASCUNHO' });

      contrato.cancelar();

      expect(contrato.status).toBe('CANCELADO');
    });

    it('cancels a PENDENTE_ASSINATURA contrato', () => {
      const contrato = makeContrato({ status: 'PENDENTE_ASSINATURA' });

      contrato.cancelar();

      expect(contrato.status).toBe('CANCELADO');
    });

    it('cancels an ASSINADO contrato', () => {
      const contrato = makeContrato({ status: 'ASSINADO' });

      contrato.cancelar();

      expect(contrato.status).toBe('CANCELADO');
    });

    it('cancels an EM_EXECUCAO contrato', () => {
      const contrato = makeContrato({ status: 'EM_EXECUCAO' });

      contrato.cancelar();

      expect(contrato.status).toBe('CANCELADO');
    });

    it('throws when trying to cancel CONCLUIDO contrato', () => {
      const contrato = makeContrato({ status: 'CONCLUIDO' });

      expect(() => contrato.cancelar()).toThrow(
        'Não é possível cancelar um contrato concluído'
      );
    });

    it('allows cancelling already CANCELADO contrato (idempotent)', () => {
      const contrato = makeContrato({ status: 'CANCELADO' });

      expect(() => contrato.cancelar()).not.toThrow();
      expect(contrato.status).toBe('CANCELADO');
    });

    it('updates updatedAt when cancelling', () => {
      const past = new Date('2020-01-01');
      const contrato = makeContrato({ status: 'RASCUNHO', updatedAt: past });

      contrato.cancelar();

      expect(contrato.updatedAt.getTime()).toBeGreaterThan(past.getTime());
    });
  });

  describe('payment scenarios', () => {
    it('handles AVISTA payment', () => {
      const contrato = makeContrato({
        formaPagamento: 'AVISTA',
        numeroParcelas: 1,
      });

      expect(contrato.formaPagamento).toBe('AVISTA');
      expect(contrato.numeroParcelas).toBe(1);
    });

    it('handles PARCELADO payment with multiple installments', () => {
      const contrato = makeContrato({
        formaPagamento: 'PARCELADO',
        numeroParcelas: 12,
        valorTotal: 1200,
        valorFinal: 1200,
      });

      expect(contrato.formaPagamento).toBe('PARCELADO');
      expect(contrato.numeroParcelas).toBe(12);

      // Each installment would be 100 (valorFinal / numeroParcelas)
      const valorParcela = contrato.valorFinal / contrato.numeroParcelas;
      expect(valorParcela).toBe(100);
    });

    it('handles MENSALIDADE payment', () => {
      const contrato = makeContrato({
        formaPagamento: 'MENSALIDADE',
        numeroParcelas: 6,
      });

      expect(contrato.formaPagamento).toBe('MENSALIDADE');
      expect(contrato.numeroParcelas).toBe(6);
    });
  });

  describe('workflow scenarios', () => {
    it('supports standard workflow: RASCUNHO -> PENDENTE_ASSINATURA -> ASSINADO -> EM_EXECUCAO -> CONCLUIDO', () => {
      const contrato = makeContrato({ status: 'RASCUNHO' });

      // Prepare for signature
      contrato.status = 'PENDENTE_ASSINATURA';
      expect(contrato.status).toBe('PENDENTE_ASSINATURA');

      // Sign
      contrato.assinar('signature-hash');
      expect(contrato.status).toBe('ASSINADO');

      // Start execution
      contrato.status = 'EM_EXECUCAO';
      expect(contrato.status).toBe('EM_EXECUCAO');

      // Complete
      contrato.status = 'CONCLUIDO';
      expect(contrato.status).toBe('CONCLUIDO');
    });

    it('supports cancellation at any point before completion', () => {
      // From RASCUNHO
      const c1 = makeContrato({ status: 'RASCUNHO' });
      c1.cancelar();
      expect(c1.status).toBe('CANCELADO');

      // From PENDENTE_ASSINATURA
      const c2 = makeContrato({ status: 'PENDENTE_ASSINATURA' });
      c2.cancelar();
      expect(c2.status).toBe('CANCELADO');

      // From ASSINADO
      const c3 = makeContrato({ status: 'ASSINADO' });
      c3.cancelar();
      expect(c3.status).toBe('CANCELADO');

      // From EM_EXECUCAO
      const c4 = makeContrato({ status: 'EM_EXECUCAO' });
      c4.cancelar();
      expect(c4.status).toBe('CANCELADO');
    });

    it('prevents cancellation after completion', () => {
      const contrato = makeContrato({ status: 'CONCLUIDO' });

      expect(() => contrato.cancelar()).toThrow();
    });

    it('handles complete contract with multiple procedures', () => {
      const items: ItemContrato[] = [
        {
          procedimentoId: 'proc-1',
          procedimentoNome: 'Limpeza',
          quantidade: 1,
          valorUnitario: 150,
          desconto: 0,
          valorTotal: 150,
        },
        {
          procedimentoId: 'proc-2',
          procedimentoNome: 'Restauração',
          quantidade: 2,
          valorUnitario: 200,
          desconto: 10,
          valorTotal: 390, // (200 * 2) - 10
        },
        {
          procedimentoId: 'proc-3',
          procedimentoNome: 'Clareamento',
          quantidade: 1,
          valorUnitario: 500,
          desconto: 50,
          valorTotal: 450,
        },
      ];

      const valorTotal = items.reduce((sum, item) => sum + item.valorTotal, 0);

      const contrato = makeContrato({
        items,
        valorTotal,
        valorDesconto: 0,
        valorFinal: valorTotal,
        formaPagamento: 'PARCELADO',
        numeroParcelas: 10,
      });

      expect(contrato.items).toHaveLength(3);
      expect(contrato.valorFinal).toBe(990);
    });
  });

  describe('edge cases', () => {
    it('handles contrato with zero items', () => {
      const contrato = makeContrato({
        items: [],
        valorTotal: 0,
        valorFinal: 0,
      });

      expect(contrato.items).toHaveLength(0);
      expect(contrato.valorTotal).toBe(0);
    });

    it('handles contrato with 100% discount', () => {
      const contrato = makeContrato({
        valorTotal: 1000,
        valorDesconto: 1000,
        valorFinal: 0,
      });

      expect(contrato.valorFinal).toBe(0);
    });

    it('handles long-term contract (1 year)', () => {
      const start = new Date('2026-01-01');
      const end = new Date('2027-01-01');

      const contrato = makeContrato({
        dataInicio: start,
        dataFimPrevista: end,
        formaPagamento: 'MENSALIDADE',
        numeroParcelas: 12,
      });

      const duration = end.getTime() - start.getTime();
      const days = duration / (1000 * 60 * 60 * 24);

      expect(Math.round(days)).toBe(365);
      expect(contrato.numeroParcelas).toBe(12);
    });

    it('preserves all item details', () => {
      const item: ItemContrato = {
        procedimentoId: 'proc-xyz',
        procedimentoNome: 'Procedimento Especial',
        quantidade: 3,
        valorUnitario: 333.33,
        desconto: 50,
        valorTotal: 949.99,
      };

      const contrato = makeContrato({
        items: [item],
        valorTotal: 949.99,
        valorFinal: 949.99,
      });

      expect(contrato.items[0]).toEqual(item);
    });
  });
});
