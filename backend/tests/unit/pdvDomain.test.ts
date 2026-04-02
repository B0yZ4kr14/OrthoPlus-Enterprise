import { Venda, ItemVenda } from '../../src/modules/pdv/domain/entities/Venda';

const makeItemVenda = (overrides: Partial<ItemVenda> = {}): ItemVenda => ({
  produtoId: 'prod-001',
  nome: 'Produto Teste',
  quantidade: 1,
  precoUnitario: 100,
  total: 100,
  ...overrides,
});

const makeVenda = (overrides: Partial<Omit<Venda, 'adicionarItem' | 'removerItem' | 'aplicarDesconto' | 'concluir' | 'cancelar'>> = {}): Venda => {
  const now = new Date('2026-01-15T10:00:00Z');
  return Venda.create({
    id: 'venda-001',
    clinicId: 'clinic-1',
    caixaId: 'caixa-1',
    items: [makeItemVenda()],
    total: 100,
    desconto: 0,
    totalFinal: 100,
    formaPagamento: 'DINHEIRO',
    status: 'PENDENTE',
    clienteId: 'cliente-1',
    observacoes: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });
};

describe('Venda Domain Entity', () => {
  describe('create', () => {
    it('creates a venda with the given values', () => {
      const v = makeVenda();
      expect(v.id).toBe('venda-001');
      expect(v.clinicId).toBe('clinic-1');
      expect(v.caixaId).toBe('caixa-1');
      expect(v.items).toHaveLength(1);
      expect(v.total).toBe(100);
      expect(v.desconto).toBe(0);
      expect(v.totalFinal).toBe(100);
      expect(v.formaPagamento).toBe('DINHEIRO');
      expect(v.status).toBe('PENDENTE');
      expect(v.clienteId).toBe('cliente-1');
    });

    it('allows null clienteId', () => {
      const v = makeVenda({ clienteId: null });
      expect(v.clienteId).toBeNull();
    });

    it('allows null observacoes', () => {
      const v = makeVenda({ observacoes: null });
      expect(v.observacoes).toBeNull();
    });

    it('supports all payment methods', () => {
      const methods: Array<'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'CRYPTO'> = [
        'DINHEIRO',
        'CARTAO_CREDITO',
        'CARTAO_DEBITO',
        'PIX',
        'CRYPTO',
      ];

      methods.forEach((method) => {
        const v = makeVenda({ formaPagamento: method });
        expect(v.formaPagamento).toBe(method);
      });
    });

    it('supports all status values', () => {
      const statuses: Array<'PENDENTE' | 'CONCLUIDA' | 'CANCELADA'> = [
        'PENDENTE',
        'CONCLUIDA',
        'CANCELADA',
      ];

      statuses.forEach((status) => {
        const v = makeVenda({ status });
        expect(v.status).toBe(status);
      });
    });
  });

  describe('adicionarItem', () => {
    it('adds an item to the venda', () => {
      const v = makeVenda({ items: [] });
      const item = makeItemVenda({ total: 50 });
      v.adicionarItem(item);
      expect(v.items).toHaveLength(1);
      expect(v.items[0]).toEqual(item);
    });

    it('recalculates total when adding item', () => {
      const v = makeVenda({ items: [], total: 0, totalFinal: 0 });
      v.adicionarItem(makeItemVenda({ total: 50 }));
      expect(v.total).toBe(50);
      expect(v.totalFinal).toBe(50);
    });

    it('adds multiple items and calculates correct total', () => {
      const v = makeVenda({ items: [], total: 0, totalFinal: 0 });
      v.adicionarItem(makeItemVenda({ total: 50 }));
      v.adicionarItem(makeItemVenda({ total: 75 }));
      v.adicionarItem(makeItemVenda({ total: 25 }));
      expect(v.items).toHaveLength(3);
      expect(v.total).toBe(150);
      expect(v.totalFinal).toBe(150);
    });

    it('updates updatedAt', () => {
      const past = new Date('2020-01-01');
      const v = makeVenda({ updatedAt: past });
      v.adicionarItem(makeItemVenda());
      expect(v.updatedAt.getTime()).toBeGreaterThan(past.getTime());
    });

    it('respects existing discount when adding items', () => {
      const v = makeVenda({ items: [], total: 0, totalFinal: 0, desconto: 10 });
      v.adicionarItem(makeItemVenda({ total: 100 }));
      expect(v.total).toBe(100);
      expect(v.totalFinal).toBe(90); // 10% discount applied
    });
  });

  describe('removerItem', () => {
    it('removes an item by index', () => {
      const item1 = makeItemVenda({ produtoId: 'prod-1', total: 50 });
      const item2 = makeItemVenda({ produtoId: 'prod-2', total: 75 });
      const v = makeVenda({ items: [item1, item2], total: 125, totalFinal: 125 });

      v.removerItem(0);

      expect(v.items).toHaveLength(1);
      expect(v.items[0].produtoId).toBe('prod-2');
      expect(v.total).toBe(75);
      expect(v.totalFinal).toBe(75);
    });

    it('removes the last item', () => {
      const item1 = makeItemVenda({ total: 50 });
      const item2 = makeItemVenda({ total: 75 });
      const v = makeVenda({ items: [item1, item2], total: 125, totalFinal: 125 });

      v.removerItem(1);

      expect(v.items).toHaveLength(1);
      expect(v.total).toBe(50);
    });

    it('does nothing when index is out of bounds (negative)', () => {
      const v = makeVenda();
      const originalLength = v.items.length;
      v.removerItem(-1);
      expect(v.items).toHaveLength(originalLength);
    });

    it('does nothing when index is out of bounds (too large)', () => {
      const v = makeVenda();
      const originalLength = v.items.length;
      v.removerItem(100);
      expect(v.items).toHaveLength(originalLength);
    });

    it('updates updatedAt', () => {
      const past = new Date('2020-01-01');
      const v = makeVenda({ updatedAt: past });
      v.removerItem(0);
      expect(v.updatedAt.getTime()).toBeGreaterThan(past.getTime());
    });

    it('respects existing discount when removing items', () => {
      const v = makeVenda({
        items: [makeItemVenda({ total: 100 }), makeItemVenda({ total: 50 })],
        total: 150,
        totalFinal: 135,
        desconto: 10
      });

      v.removerItem(1);

      expect(v.total).toBe(100);
      expect(v.totalFinal).toBe(90); // 10% discount still applied
    });
  });

  describe('aplicarDesconto', () => {
    it('applies discount percentage to total', () => {
      const v = makeVenda({ total: 100, totalFinal: 100 });
      v.aplicarDesconto(10);
      expect(v.desconto).toBe(10);
      expect(v.totalFinal).toBe(90);
    });

    it('applies 0% discount', () => {
      const v = makeVenda({ total: 100, totalFinal: 100 });
      v.aplicarDesconto(0);
      expect(v.desconto).toBe(0);
      expect(v.totalFinal).toBe(100);
    });

    it('applies 100% discount', () => {
      const v = makeVenda({ total: 100, totalFinal: 100 });
      v.aplicarDesconto(100);
      expect(v.desconto).toBe(100);
      expect(v.totalFinal).toBe(0);
    });

    it('applies 50% discount', () => {
      const v = makeVenda({ total: 200, totalFinal: 200 });
      v.aplicarDesconto(50);
      expect(v.desconto).toBe(50);
      expect(v.totalFinal).toBe(100);
    });

    it('updates updatedAt', () => {
      const past = new Date('2020-01-01');
      const v = makeVenda({ updatedAt: past });
      v.aplicarDesconto(10);
      expect(v.updatedAt.getTime()).toBeGreaterThan(past.getTime());
    });

    it('throws when discount is negative', () => {
      const v = makeVenda();
      expect(() => v.aplicarDesconto(-5)).toThrow('Desconto deve estar entre 0 e 100');
    });

    it('throws when discount is above 100', () => {
      const v = makeVenda();
      expect(() => v.aplicarDesconto(101)).toThrow('Desconto deve estar entre 0 e 100');
    });
  });

  describe('concluir', () => {
    it('changes status to CONCLUIDA', () => {
      const v = makeVenda({ status: 'PENDENTE' });
      v.concluir('PIX');
      expect(v.status).toBe('CONCLUIDA');
    });

    it('sets the payment method', () => {
      const v = makeVenda({ status: 'PENDENTE' });
      v.concluir('CARTAO_CREDITO');
      expect(v.formaPagamento).toBe('CARTAO_CREDITO');
    });

    it('updates updatedAt', () => {
      const past = new Date('2020-01-01');
      const v = makeVenda({ status: 'PENDENTE', updatedAt: past });
      v.concluir('DINHEIRO');
      expect(v.updatedAt.getTime()).toBeGreaterThan(past.getTime());
    });

    it('throws when status is not PENDENTE (CONCLUIDA)', () => {
      const v = makeVenda({ status: 'CONCLUIDA' });
      expect(() => v.concluir('PIX')).toThrow('Apenas vendas pendentes podem ser concluídas');
    });

    it('throws when status is not PENDENTE (CANCELADA)', () => {
      const v = makeVenda({ status: 'CANCELADA' });
      expect(() => v.concluir('PIX')).toThrow('Apenas vendas pendentes podem ser concluídas');
    });

    it('supports all payment methods', () => {
      const methods: Array<'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'CRYPTO'> = [
        'DINHEIRO',
        'CARTAO_CREDITO',
        'CARTAO_DEBITO',
        'PIX',
        'CRYPTO',
      ];

      methods.forEach((method) => {
        const v = makeVenda({ status: 'PENDENTE' });
        v.concluir(method);
        expect(v.formaPagamento).toBe(method);
      });
    });
  });

  describe('cancelar', () => {
    it('changes status to CANCELADA from PENDENTE', () => {
      const v = makeVenda({ status: 'PENDENTE' });
      v.cancelar();
      expect(v.status).toBe('CANCELADA');
    });

    it('throws when trying to cancel CONCLUIDA venda', () => {
      const v = makeVenda({ status: 'CONCLUIDA' });
      expect(() => v.cancelar()).toThrow('Não é possível cancelar uma venda concluída');
    });

    it('allows cancelling an already CANCELADA venda', () => {
      const v = makeVenda({ status: 'CANCELADA' });
      expect(() => v.cancelar()).not.toThrow();
      expect(v.status).toBe('CANCELADA');
    });

    it('updates updatedAt', () => {
      const past = new Date('2020-01-01');
      const v = makeVenda({ status: 'PENDENTE', updatedAt: past });
      v.cancelar();
      expect(v.updatedAt.getTime()).toBeGreaterThan(past.getTime());
    });
  });

  describe('complex scenarios', () => {
    it('handles complete sale workflow', () => {
      const v = makeVenda({ items: [], total: 0, totalFinal: 0 });

      // Add items
      v.adicionarItem(makeItemVenda({ total: 100 }));
      v.adicionarItem(makeItemVenda({ total: 50 }));
      expect(v.total).toBe(150);

      // Apply discount
      v.aplicarDesconto(10);
      expect(v.totalFinal).toBe(135);

      // Complete sale
      v.concluir('CARTAO_CREDITO');
      expect(v.status).toBe('CONCLUIDA');
      expect(v.formaPagamento).toBe('CARTAO_CREDITO');
    });

    it('handles item modification and recalculation', () => {
      const v = makeVenda({
        items: [
          makeItemVenda({ total: 100 }),
          makeItemVenda({ total: 50 }),
          makeItemVenda({ total: 25 })
        ],
        total: 175,
        totalFinal: 175
      });

      // Remove one item
      v.removerItem(1);
      expect(v.total).toBe(125);

      // Apply discount
      v.aplicarDesconto(20);
      expect(v.totalFinal).toBe(100);

      // Add another item
      v.adicionarItem(makeItemVenda({ total: 75 }));
      expect(v.total).toBe(200);
      expect(v.totalFinal).toBe(160); // 20% discount maintained
    });

    it('prevents operations after completion', () => {
      const v = makeVenda({ status: 'PENDENTE' });
      v.concluir('PIX');

      // Cannot cancel completed sale
      expect(() => v.cancelar()).toThrow();

      // Cannot complete again
      expect(() => v.concluir('DINHEIRO')).toThrow();
    });

    it('prevents operations after cancellation', () => {
      const v = makeVenda({ status: 'PENDENTE' });
      v.cancelar();

      // Cannot complete cancelled sale
      expect(() => v.concluir('PIX')).toThrow();
    });
  });
});
