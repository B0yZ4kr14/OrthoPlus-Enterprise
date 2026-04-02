import { Produto } from '../../src/modules/inventario/domain/entities/Produto';

const makeProduto = (overrides: Partial<Parameters<typeof Produto.create>[0]> = {}): Produto => {
  const now = new Date('2025-01-01T10:00:00Z');
  return Produto.create({
    id: 'prod-001',
    clinicId: 'clinic-1',
    nome: 'Luva Descartável',
    codigo: 'LUV-001',
    descricao: 'Luva de látex',
    categoria: 'Descartáveis',
    unidadeMedida: 'CAIXA',
    precoCusto: 15.0,
    precoVenda: 25.0,
    quantidadeMinima: 5,
    quantidadeAtual: 20,
    status: 'ATIVO',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });
};

describe('Produto Domain Entity', () => {
  describe('create', () => {
    it('creates a produto with the given values', () => {
      const p = makeProduto();
      expect(p.id).toBe('prod-001');
      expect(p.nome).toBe('Luva Descartável');
      expect(p.codigo).toBe('LUV-001');
      expect(p.quantidadeAtual).toBe(20);
      expect(p.quantidadeMinima).toBe(5);
      expect(p.precoCusto).toBe(15.0);
      expect(p.precoVenda).toBe(25.0);
      expect(p.status).toBe('ATIVO');
    });

    it('allows null descricao', () => {
      const p = makeProduto({ descricao: null });
      expect(p.descricao).toBeNull();
    });
  });

  describe('adicionarEstoque', () => {
    it('increases quantidadeAtual by the given amount', () => {
      const p = makeProduto({ quantidadeAtual: 10 });
      p.adicionarEstoque(5);
      expect(p.quantidadeAtual).toBe(15);
    });

    it('updates updatedAt', () => {
      const past = new Date('2020-01-01');
      const p = makeProduto({ quantidadeAtual: 10, updatedAt: past });
      p.adicionarEstoque(1);
      expect(p.updatedAt.getTime()).toBeGreaterThan(past.getTime());
    });

    it('throws when quantidade is zero', () => {
      const p = makeProduto();
      expect(() => p.adicionarEstoque(0)).toThrow('Quantidade deve ser positiva');
    });

    it('throws when quantidade is negative', () => {
      const p = makeProduto();
      expect(() => p.adicionarEstoque(-3)).toThrow('Quantidade deve ser positiva');
    });
  });

  describe('removerEstoque', () => {
    it('decreases quantidadeAtual by the given amount', () => {
      const p = makeProduto({ quantidadeAtual: 20 });
      p.removerEstoque(8);
      expect(p.quantidadeAtual).toBe(12);
    });

    it('allows removing exactly all stock', () => {
      const p = makeProduto({ quantidadeAtual: 5 });
      p.removerEstoque(5);
      expect(p.quantidadeAtual).toBe(0);
    });

    it('updates updatedAt', () => {
      const past = new Date('2020-01-01');
      const p = makeProduto({ quantidadeAtual: 10, updatedAt: past });
      p.removerEstoque(1);
      expect(p.updatedAt.getTime()).toBeGreaterThan(past.getTime());
    });

    it('throws when quantidade is zero', () => {
      const p = makeProduto();
      expect(() => p.removerEstoque(0)).toThrow('Quantidade deve ser positiva');
    });

    it('throws when quantidade is negative', () => {
      const p = makeProduto();
      expect(() => p.removerEstoque(-1)).toThrow('Quantidade deve ser positiva');
    });

    it('throws when removing more than available stock', () => {
      const p = makeProduto({ quantidadeAtual: 3 });
      expect(() => p.removerEstoque(4)).toThrow('Estoque insuficiente');
    });
  });

  describe('ajustarEstoque', () => {
    it('sets quantidadeAtual to the exact given value', () => {
      const p = makeProduto({ quantidadeAtual: 20 });
      p.ajustarEstoque(7);
      expect(p.quantidadeAtual).toBe(7);
    });

    it('allows adjusting to zero', () => {
      const p = makeProduto({ quantidadeAtual: 20 });
      p.ajustarEstoque(0);
      expect(p.quantidadeAtual).toBe(0);
    });

    it('updates updatedAt', () => {
      const past = new Date('2020-01-01');
      const p = makeProduto({ quantidadeAtual: 10, updatedAt: past });
      p.ajustarEstoque(5);
      expect(p.updatedAt.getTime()).toBeGreaterThan(past.getTime());
    });

    it('throws when novaQuantidade is negative', () => {
      const p = makeProduto();
      expect(() => p.ajustarEstoque(-1)).toThrow('Quantidade não pode ser negativa');
    });
  });

  describe('estaEmEstoqueBaixo', () => {
    it('returns true when quantidadeAtual equals quantidadeMinima', () => {
      const p = makeProduto({ quantidadeAtual: 5, quantidadeMinima: 5 });
      expect(p.estaEmEstoqueBaixo()).toBe(true);
    });

    it('returns true when quantidadeAtual is below quantidadeMinima', () => {
      const p = makeProduto({ quantidadeAtual: 3, quantidadeMinima: 5 });
      expect(p.estaEmEstoqueBaixo()).toBe(true);
    });

    it('returns false when quantidadeAtual exceeds quantidadeMinima', () => {
      const p = makeProduto({ quantidadeAtual: 10, quantidadeMinima: 5 });
      expect(p.estaEmEstoqueBaixo()).toBe(false);
    });
  });

  describe('atualizarPrecos', () => {
    it('updates precoCusto and precoVenda', () => {
      const p = makeProduto({ precoCusto: 10, precoVenda: 20 });
      p.atualizarPrecos(12, 24);
      expect(p.precoCusto).toBe(12);
      expect(p.precoVenda).toBe(24);
    });

    it('updates updatedAt', () => {
      const past = new Date('2020-01-01');
      const p = makeProduto({ updatedAt: past });
      p.atualizarPrecos(1, 2);
      expect(p.updatedAt.getTime()).toBeGreaterThan(past.getTime());
    });
  });

  describe('toObject', () => {
    it('returns a plain object with all fields', () => {
      const p = makeProduto();
      const obj = p.toObject();
      expect(obj).toMatchObject({
        id: 'prod-001',
        clinicId: 'clinic-1',
        nome: 'Luva Descartável',
        codigo: 'LUV-001',
        categoria: 'Descartáveis',
        unidadeMedida: 'CAIXA',
        precoCusto: 15.0,
        precoVenda: 25.0,
        quantidadeMinima: 5,
        quantidadeAtual: 20,
        status: 'ATIVO',
      });
    });
  });
});
