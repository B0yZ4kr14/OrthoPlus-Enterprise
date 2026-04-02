import { IVendaRepository, FindAllOptions } from '../../domain/repositories/IVendaRepository';
import { Venda } from '../../domain/entities/Venda';
import { db } from '@/infrastructure/database/connection';

export class VendaRepositoryPostgres implements IVendaRepository {
  async findById(id: string): Promise<Venda | null> {
    const result = await db.query('SELECT * FROM pdv.vendas WHERE id = $1', [id]);
    return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
  }

  async findAll(options: FindAllOptions): Promise<{ items: Venda[]; total: number }> {
    const params: (string | number | boolean | Date | null)[] = [options.clinicId];
    let conditions = 'clinic_id = $1';

    if (options.caixaId) {
      params.push(options.caixaId);
      conditions = conditions + ' AND caixa_id = $' + params.length;
    }

    if (options.status) {
      params.push(options.status);
      conditions = conditions + ' AND status = $' + params.length;
    }

    const countQuery = 'SELECT COUNT(*) FROM pdv.vendas WHERE ' + conditions;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    let query = 'SELECT * FROM pdv.vendas WHERE ' + conditions + ' ORDER BY created_at DESC';
    
    if (options.take) {
      params.push(options.take);
      query = query + ' LIMIT $' + params.length;
    }
    
    if (options.skip) {
      params.push(options.skip);
      query = query + ' OFFSET $' + params.length;
    }

    const result = await db.query(query, params);
    return {
      items: result.rows.map((row: Record<string, unknown>) => this.mapToEntity(row)),
      total
    };
  }

  async save(venda: Venda): Promise<void> {
    await db.query(
      'INSERT INTO pdv.vendas (id, clinic_id, caixa_id, items, total, desconto, total_final, forma_pagamento, status, cliente_id, observacoes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
      [venda.id, venda.clinicId, venda.caixaId, JSON.stringify(venda.items), venda.total, venda.desconto, venda.totalFinal, venda.formaPagamento, venda.status, venda.clienteId, venda.observacoes, venda.createdAt, venda.updatedAt]
    );
  }

  async update(venda: Venda): Promise<void> {
    await db.query(
      'UPDATE pdv.vendas SET items = $1, total = $2, desconto = $3, total_final = $4, forma_pagamento = $5, status = $6, updated_at = $7 WHERE id = $8',
      [JSON.stringify(venda.items), venda.total, venda.desconto, venda.totalFinal, venda.formaPagamento, venda.status, venda.updatedAt, venda.id]
    );
  }

  private mapToEntity(row: Record<string, unknown>): Venda {
    return Venda.create({
      id: row.id as string,
      clinicId: row.clinic_id as string,
      caixaId: row.caixa_id as string,
      items: row.items as import('../../domain/entities/Venda').ItemVenda[],
      total: row.total as number,
      desconto: row.desconto as number,
      totalFinal: row.total_final as number,
      formaPagamento: row.forma_pagamento as 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'CRYPTO',
      status: row.status as 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA',
      clienteId: row.cliente_id as string,
      observacoes: row.observacoes as string,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    });
  }
}
