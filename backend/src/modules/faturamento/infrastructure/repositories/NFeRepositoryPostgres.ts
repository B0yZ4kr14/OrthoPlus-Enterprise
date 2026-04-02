import { INFeRepository } from '../../domain/repositories/INFeRepository';
import { NFe, NFeItem } from '../../domain/entities/NFe';
import { db } from '@/infrastructure/database/connection';
import { appendPagination } from '@/shared/infrastructure/paginationUtils';

interface NFeQueryOptions {
  clinicId: string;
  status?: string;
  tipo?: string;
  clienteId?: string;
  take?: number;
  skip?: number;
}

export class NFeRepositoryPostgres implements INFeRepository {
  async findById(id: string): Promise<NFe | null> {
    const result = await db.query('SELECT * FROM faturamento.nfes WHERE id = $1', [id]);
    return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
  }

  async findAll(queryOptions: NFeQueryOptions): Promise<{ items: NFe[]; total: number }> {
    const filterParams: unknown[] = [queryOptions.clinicId];
    let conditions = 'clinic_id = $1';

    if (queryOptions.status) {
      filterParams.push(queryOptions.status);
      conditions = conditions + ' AND status = $' + filterParams.length;
    }

    if (queryOptions.clienteId) {
      filterParams.push(queryOptions.clienteId);
      conditions = conditions + ' AND cliente_id = $' + filterParams.length;
    }

    const countQuery = 'SELECT COUNT(*) FROM faturamento.nfes WHERE ' + conditions;
    const dataQuery = 'SELECT * FROM faturamento.nfes WHERE ' + conditions + ' ORDER BY data_emissao DESC';

    const { query: paginatedQuery, params: paginatedParams } = appendPagination(
      dataQuery,
      filterParams,
      { take: queryOptions.take, skip: queryOptions.skip }
    );

    const [countResult, dataResult] = await Promise.all([
      db.query(countQuery, filterParams),
      db.query(paginatedQuery, paginatedParams),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    return {
      items: dataResult.rows.map(row => this.mapToEntity(row)),
      total
    };
  }

  async save(nfe: NFe): Promise<void> {
    await db.query(
      'INSERT INTO faturamento.nfes (id, clinic_id, numero, serie, chave_acesso, status, cliente_id, cliente_nome, cliente_cpf_cnpj, items, valor_total, valor_icms, valor_ipi, data_emissao, data_autorizacao, protocolo_autorizacao, observacoes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)',
      [nfe.id, nfe.clinicId, nfe.numero, nfe.serie, nfe.chaveAcesso, nfe.status, nfe.clienteId, nfe.clienteNome, nfe.clienteCpfCnpj, JSON.stringify(nfe.items), nfe.valorTotal, nfe.valorIcms, nfe.valorIpi, nfe.dataEmissao, nfe.dataAutorizacao, nfe.protocoloAutorizacao, nfe.observacoes, nfe.createdAt, nfe.updatedAt]
    );
  }

  async update(nfe: NFe): Promise<void> {
    await db.query(
      'UPDATE faturamento.nfes SET status = $1, chave_acesso = $2, protocolo_autorizacao = $3, data_autorizacao = $4, updated_at = $5 WHERE id = $6',
      [nfe.status, nfe.chaveAcesso, nfe.protocoloAutorizacao, nfe.dataAutorizacao, nfe.updatedAt, nfe.id]
    );
  }

  private mapToEntity(row: Record<string, unknown>): NFe {
    return NFe.create({
      id: row.id as string,
      clinicId: row.clinic_id as string,
      numero: row.numero as string,
      serie: row.serie as string,
      chaveAcesso: row.chave_acesso as string | null,
      status: row.status as 'RASCUNHO' | 'EMITIDA' | 'AUTORIZADA' | 'CANCELADA' | 'DENEGADA',
      clienteId: row.cliente_id as string,
      clienteNome: row.cliente_nome as string,
      clienteCpfCnpj: row.cliente_cpf_cnpj as string,
      items: row.items as NFeItem[],
      valorTotal: row.valor_total as number,
      valorIcms: row.valor_icms as number,
      valorIpi: row.valor_ipi as number,
      dataEmissao: row.data_emissao as Date,
      dataAutorizacao: row.data_autorizacao as Date | null,
      protocoloAutorizacao: row.protocolo_autorizacao as string | null,
      observacoes: row.observacoes as string | null,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date
    });
  }
}
