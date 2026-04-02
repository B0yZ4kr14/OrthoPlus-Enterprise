import {
  CreateVendaCommand,
  CreateVendaCommandHandler,
} from '../../src/modules/pdv/application/commands/CreateVendaCommand';
import {
  ConcluirVendaCommand,
  ConcluirVendaCommandHandler,
} from '../../src/modules/pdv/application/commands/ConcluirVendaCommand';
import { IVendaRepository, FindAllOptions } from '../../src/modules/pdv/domain/repositories/IVendaRepository';
import { Venda } from '../../src/modules/pdv/domain/entities/Venda';
import { EventBus } from '../../src/shared/events/EventBus';

// Mock repository
class MockVendaRepository implements IVendaRepository {
  private vendas: Map<string, Venda> = new Map();

  async save(venda: Venda): Promise<void> {
    this.vendas.set(venda.id, venda);
  }

  async update(venda: Venda): Promise<void> {
    this.vendas.set(venda.id, venda);
  }

  async findById(id: string): Promise<Venda | null> {
    return this.vendas.get(id) || null;
  }

  async findAll(options: FindAllOptions): Promise<{ items: Venda[]; total: number }> {
    const items = Array.from(this.vendas.values()).filter((v) => v.clinicId === options.clinicId);
    return { items, total: items.length };
  }

  // Helper for testing
  clear(): void {
    this.vendas.clear();
  }
}

// Mock EventBus
class MockEventBus extends EventBus {
  public events: any[] = [];

  async publish(event: any): Promise<void> {
    this.events.push(event);
  }

  clear(): void {
    this.events = [];
  }
}

describe('CreateVendaCommandHandler', () => {
  let repository: MockVendaRepository;
  let eventBus: MockEventBus;
  let handler: CreateVendaCommandHandler;

  beforeEach(() => {
    repository = new MockVendaRepository();
    eventBus = new MockEventBus();
    handler = new CreateVendaCommandHandler(repository, eventBus);
  });

  afterEach(() => {
    repository.clear();
    eventBus.clear();
  });

  it('creates a new venda with single item', async () => {
    const command: CreateVendaCommand = {
      caixaId: 'caixa-1',
      items: [
        {
          produtoId: 'prod-1',
          nome: 'Produto A',
          quantidade: 2,
          precoUnitario: 50,
          total: 100,
        },
      ],
      clinicId: 'clinic-1',
      createdBy: 'user-1',
    };

    const venda = await handler.execute(command);

    expect(venda).toBeDefined();
    expect(venda.clinicId).toBe('clinic-1');
    expect(venda.caixaId).toBe('caixa-1');
    expect(venda.items).toHaveLength(1);
    expect(venda.total).toBe(100);
    expect(venda.totalFinal).toBe(100);
    expect(venda.status).toBe('PENDENTE');
    expect(venda.desconto).toBe(0);
  });

  it('creates a venda with multiple items', async () => {
    const command: CreateVendaCommand = {
      caixaId: 'caixa-1',
      items: [
        {
          produtoId: 'prod-1',
          nome: 'Produto A',
          quantidade: 2,
          precoUnitario: 50,
          total: 100,
        },
        {
          produtoId: 'prod-2',
          nome: 'Produto B',
          quantidade: 1,
          precoUnitario: 75,
          total: 75,
        },
      ],
      clinicId: 'clinic-1',
      createdBy: 'user-1',
    };

    const venda = await handler.execute(command);

    expect(venda.items).toHaveLength(2);
    expect(venda.total).toBe(175);
    expect(venda.totalFinal).toBe(175);
  });

  it('saves venda to repository', async () => {
    const command: CreateVendaCommand = {
      caixaId: 'caixa-1',
      items: [
        {
          produtoId: 'prod-1',
          nome: 'Produto A',
          quantidade: 1,
          precoUnitario: 50,
          total: 50,
        },
      ],
      clinicId: 'clinic-1',
      createdBy: 'user-1',
    };

    const venda = await handler.execute(command);
    const saved = await repository.findById(venda.id);

    expect(saved).toBeDefined();
    expect(saved?.id).toBe(venda.id);
    expect(saved?.total).toBe(50);
  });

  it('publishes VendaRegistradaEvent', async () => {
    const command: CreateVendaCommand = {
      caixaId: 'caixa-1',
      items: [
        {
          produtoId: 'prod-1',
          nome: 'Produto A',
          quantidade: 1,
          precoUnitario: 50,
          total: 50,
        },
      ],
      clinicId: 'clinic-1',
      createdBy: 'user-1',
    };

    await handler.execute(command);

    expect(eventBus.events).toHaveLength(1);
    expect(eventBus.events[0].eventType).toBe('PDV.VendaRegistrada');
  });

  it('includes optional clienteId', async () => {
    const command: CreateVendaCommand = {
      caixaId: 'caixa-1',
      items: [
        {
          produtoId: 'prod-1',
          nome: 'Produto A',
          quantidade: 1,
          precoUnitario: 50,
          total: 50,
        },
      ],
      clienteId: 'cliente-123',
      clinicId: 'clinic-1',
      createdBy: 'user-1',
    };

    const venda = await handler.execute(command);

    expect(venda.clienteId).toBe('cliente-123');
  });

  it('includes optional observacoes', async () => {
    const command: CreateVendaCommand = {
      caixaId: 'caixa-1',
      items: [
        {
          produtoId: 'prod-1',
          nome: 'Produto A',
          quantidade: 1,
          precoUnitario: 50,
          total: 50,
        },
      ],
      observacoes: 'Venda com desconto especial',
      clinicId: 'clinic-1',
      createdBy: 'user-1',
    };

    const venda = await handler.execute(command);

    expect(venda.observacoes).toBe('Venda com desconto especial');
  });

  it('sets default payment method to DINHEIRO', async () => {
    const command: CreateVendaCommand = {
      caixaId: 'caixa-1',
      items: [
        {
          produtoId: 'prod-1',
          nome: 'Produto A',
          quantidade: 1,
          precoUnitario: 50,
          total: 50,
        },
      ],
      clinicId: 'clinic-1',
      createdBy: 'user-1',
    };

    const venda = await handler.execute(command);

    expect(venda.formaPagamento).toBe('DINHEIRO');
  });

  it('generates unique ID for each venda', async () => {
    const command: CreateVendaCommand = {
      caixaId: 'caixa-1',
      items: [
        {
          produtoId: 'prod-1',
          nome: 'Produto A',
          quantidade: 1,
          precoUnitario: 50,
          total: 50,
        },
      ],
      clinicId: 'clinic-1',
      createdBy: 'user-1',
    };

    const venda1 = await handler.execute(command);
    const venda2 = await handler.execute(command);

    expect(venda1.id).not.toBe(venda2.id);
  });
});

describe('ConcluirVendaCommandHandler', () => {
  let repository: MockVendaRepository;
  let handler: ConcluirVendaCommandHandler;

  beforeEach(() => {
    repository = new MockVendaRepository();
    handler = new ConcluirVendaCommandHandler(repository);
  });

  afterEach(() => {
    repository.clear();
  });

  it('completes a pending venda', async () => {
    // Setup: Create a pending venda
    const venda = Venda.create({
      id: 'venda-1',
      clinicId: 'clinic-1',
      caixaId: 'caixa-1',
      items: [
        {
          produtoId: 'prod-1',
          nome: 'Produto A',
          quantidade: 1,
          precoUnitario: 50,
          total: 50,
        },
      ],
      total: 50,
      desconto: 0,
      totalFinal: 50,
      formaPagamento: 'DINHEIRO',
      status: 'PENDENTE',
      clienteId: null,
      observacoes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await repository.save(venda);

    const command: ConcluirVendaCommand = {
      vendaId: 'venda-1',
      formaPagamento: 'PIX',
      clinicId: 'clinic-1',
      updatedBy: 'user-1',
    };

    await handler.execute(command);

    const updated = await repository.findById('venda-1');
    expect(updated?.status).toBe('CONCLUIDA');
    expect(updated?.formaPagamento).toBe('PIX');
  });

  it('updates payment method when completing', async () => {
    const venda = Venda.create({
      id: 'venda-1',
      clinicId: 'clinic-1',
      caixaId: 'caixa-1',
      items: [
        {
          produtoId: 'prod-1',
          nome: 'Produto A',
          quantidade: 1,
          precoUnitario: 50,
          total: 50,
        },
      ],
      total: 50,
      desconto: 0,
      totalFinal: 50,
      formaPagamento: 'DINHEIRO',
      status: 'PENDENTE',
      clienteId: null,
      observacoes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await repository.save(venda);

    const command: ConcluirVendaCommand = {
      vendaId: 'venda-1',
      formaPagamento: 'CARTAO_CREDITO',
      clinicId: 'clinic-1',
      updatedBy: 'user-1',
    };

    await handler.execute(command);

    const updated = await repository.findById('venda-1');
    expect(updated?.formaPagamento).toBe('CARTAO_CREDITO');
  });

  it('throws when venda not found', async () => {
    const command: ConcluirVendaCommand = {
      vendaId: 'non-existent',
      formaPagamento: 'PIX',
      clinicId: 'clinic-1',
      updatedBy: 'user-1',
    };

    await expect(handler.execute(command)).rejects.toThrow('Venda não encontrada');
  });

  it('throws when clinicId does not match', async () => {
    const venda = Venda.create({
      id: 'venda-1',
      clinicId: 'clinic-1',
      caixaId: 'caixa-1',
      items: [
        {
          produtoId: 'prod-1',
          nome: 'Produto A',
          quantidade: 1,
          precoUnitario: 50,
          total: 50,
        },
      ],
      total: 50,
      desconto: 0,
      totalFinal: 50,
      formaPagamento: 'DINHEIRO',
      status: 'PENDENTE',
      clienteId: null,
      observacoes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await repository.save(venda);

    const command: ConcluirVendaCommand = {
      vendaId: 'venda-1',
      formaPagamento: 'PIX',
      clinicId: 'different-clinic',
      updatedBy: 'user-1',
    };

    await expect(handler.execute(command)).rejects.toThrow('Venda não encontrada');
  });

  it('throws when trying to complete already completed venda', async () => {
    const venda = Venda.create({
      id: 'venda-1',
      clinicId: 'clinic-1',
      caixaId: 'caixa-1',
      items: [
        {
          produtoId: 'prod-1',
          nome: 'Produto A',
          quantidade: 1,
          precoUnitario: 50,
          total: 50,
        },
      ],
      total: 50,
      desconto: 0,
      totalFinal: 50,
      formaPagamento: 'DINHEIRO',
      status: 'CONCLUIDA',
      clienteId: null,
      observacoes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await repository.save(venda);

    const command: ConcluirVendaCommand = {
      vendaId: 'venda-1',
      formaPagamento: 'PIX',
      clinicId: 'clinic-1',
      updatedBy: 'user-1',
    };

    await expect(handler.execute(command)).rejects.toThrow(
      'Apenas vendas pendentes podem ser concluídas'
    );
  });

  it('throws when trying to complete cancelled venda', async () => {
    const venda = Venda.create({
      id: 'venda-1',
      clinicId: 'clinic-1',
      caixaId: 'caixa-1',
      items: [
        {
          produtoId: 'prod-1',
          nome: 'Produto A',
          quantidade: 1,
          precoUnitario: 50,
          total: 50,
        },
      ],
      total: 50,
      desconto: 0,
      totalFinal: 50,
      formaPagamento: 'DINHEIRO',
      status: 'CANCELADA',
      clienteId: null,
      observacoes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await repository.save(venda);

    const command: ConcluirVendaCommand = {
      vendaId: 'venda-1',
      formaPagamento: 'PIX',
      clinicId: 'clinic-1',
      updatedBy: 'user-1',
    };

    await expect(handler.execute(command)).rejects.toThrow(
      'Apenas vendas pendentes podem ser concluídas'
    );
  });

  it('supports all payment methods', async () => {
    const methods: Array<'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'CRYPTO'> = [
      'DINHEIRO',
      'CARTAO_CREDITO',
      'CARTAO_DEBITO',
      'PIX',
      'CRYPTO',
    ];

    for (const method of methods) {
      const venda = Venda.create({
        id: `venda-${method}`,
        clinicId: 'clinic-1',
        caixaId: 'caixa-1',
        items: [
          {
            produtoId: 'prod-1',
            nome: 'Produto A',
            quantidade: 1,
            precoUnitario: 50,
            total: 50,
          },
        ],
        total: 50,
        desconto: 0,
        totalFinal: 50,
        formaPagamento: 'DINHEIRO',
        status: 'PENDENTE',
        clienteId: null,
        observacoes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await repository.save(venda);

      const command: ConcluirVendaCommand = {
        vendaId: `venda-${method}`,
        formaPagamento: method,
        clinicId: 'clinic-1',
        updatedBy: 'user-1',
      };

      await handler.execute(command);

      const updated = await repository.findById(`venda-${method}`);
      expect(updated?.formaPagamento).toBe(method);
    }
  });
});
