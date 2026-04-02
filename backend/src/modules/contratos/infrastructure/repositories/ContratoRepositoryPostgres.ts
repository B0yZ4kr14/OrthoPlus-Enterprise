import { IContratoRepository } from '../../domain/repositories/IContratoRepository';
import { Contrato } from '../../domain/entities/Contrato';
import { db } from '@/infrastructure/database/connection';

export class ContratoRepositoryPostgres implements IContratoRepository {
  async findById(id: string): Promise<Contrato | null> {
    const result = await db.query('SELECT * FROM contratos.contratos WHERE id = $1', [id]);
    return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
  }

  async findAll(options: { clinicId: string; pacienteId?: string; status?: string; skip?: number; take?: number }): Promise<{ items: Contrato[]; total: number }> {
    const params: (string | number | boolean | Date | null)[] = [options.clinicId];
    let conditions = 'clinic_id = $1';

    if (options.pacienteId) {
      params.push(options.pacienteId);
      conditions = conditions + ' AND paciente_id = $' + params.length;
    }

    if (options.status) {
      params.push(options.status);
      conditions = conditions + ' AND status = $' + params.length;
    }

    const countQuery = 'SELECT COUNT(*) FROM contratos.contratos WHERE ' + conditions;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    let query = 'SELECT * FROM contratos.contratos WHERE ' + conditions + ' ORDER BY created_at DESC';
    
    if (options.skip) {
      params.push(options.skip);
      query = query + ' OFFSET $' + params.length;
    }
    
    if (options.take) {
      params.push(options.take);
      query = query + ' LIMIT $' + params.length;
    }

    const result = await db.query(query, params);
    return {
      items: result.rows.map((row: Record<string, unknown>) => this.mapToEntity(row)),
      total
    };
  }

  async save(contrato: Contrato): Promise<void> {
    await db.query(
      'INSERT INTO contratos.contratos (id, clinic_id, numero, paciente_id, paciente_nome, items, valor_total, valor_desconto, valor_final, status, forma_pagamento, numero_parcelas, data_inicio, data_fim_prevista, data_assinatura, assinatura_digital, observacoes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)',
      [contrato.id, contrato.clinicId, contrato.numero, contrato.pacienteId, contrato.pacienteNome, JSON.stringify(contrato.items), contrato.valorTotal, contrato.valorDesconto, contrato.valorFinal, contrato.status, contrato.formaPagamento, contrato.numeroParcelas, contrato.dataInicio, contrato.dataFimPrevista, contrato.dataAssinatura, contrato.assinaturaDigital, contrato.observacoes, contrato.createdAt, contrato.updatedAt]
    );
  }

  async update(contrato: Contrato): Promise<void> {
    await db.query(
      'UPDATE contratos.contratos SET status = $1, data_assinatura = $2, assinatura_digital = $3, updated_at = $4 WHERE id = $5',
      [contrato.status, contrato.dataAssinatura, contrato.assinaturaDigital, contrato.updatedAt, contrato.id]
    );
  }

  private mapToEntity(row: Record<string, unknown>): Contrato {
    return Contrato.create({
      id: row.id as string,
      clinicId: row.clinic_id as string,
      numero: row.numero as string,
      pacienteId: row.paciente_id as string,
      pacienteNome: row.paciente_nome as string,
      items: row.items as import('../../domain/entities/Contrato').ItemContrato[],
      valorTotal: row.valor_total as number,
      valorDesconto: row.valor_desconto as number,
      valorFinal: row.valor_final as number,
      status: row.status as 'RASCUNHO' | 'PENDENTE_ASSINATURA' | 'ASSINADO' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'CANCELADO',
      formaPagamento: row.forma_pagamento as 'AVISTA' | 'PARCELADO' | 'MENSALIDADE',
      numeroParcelas: row.numero_parcelas as number,
      dataInicio: row.data_inicio as Date,
      dataFimPrevista: row.data_fim_prevista as Date,
      dataAssinatura: row.data_assinatura as Date,
      assinaturaDigital: row.assinatura_digital as string,
      observacoes: row.observacoes as string,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    });
  }
}
