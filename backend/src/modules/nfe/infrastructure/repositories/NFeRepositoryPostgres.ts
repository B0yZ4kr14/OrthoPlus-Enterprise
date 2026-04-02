import { INFeRepository } from '../../domain/repositories/INFeRepository';
import { NFe } from '../../domain/entities/NFe';
import { db } from '@/infrastructure/database/connection';

interface FindAllNFeOptions {
  clinicId: string;
  status?: string;
  tipo?: string;
  clienteId?: string;
  skip?: number;
  take?: number;
}

interface NFeRow {
  id: string;
  clinic_id: string;
  numero: string;
  serie: string;
  tipo: string;
  status: string;
  chave_acesso: string | null;
  xml: string | null;
  pdf_url: string | null;
  cliente_id: string;
  cliente_nome: string;
  valor_total: number;
  data_emissao: Date;
  protocolo: string | null;
  created_at: Date;
  updated_at: Date;
}

export class NFeRepositoryPostgres implements INFeRepository {
  private static readonly BASE_COLUMNS =
    'id, clinic_id, numero, serie, tipo, status, chave_acesso, xml, pdf_url, ' +
    'cliente_id, cliente_nome, valor_total, data_emissao, protocolo, created_at, updated_at';

  private static readonly ALLOWED_LOOKUP_COLUMNS: ReadonlySet<string> = new Set(['id', 'numero']);

  private addParameter(params: unknown[], value: unknown): string {
    params.push(value);
    return `$${params.length}`;
  }

  private async findOneByColumn(column: string, value: string): Promise<NFe | null> {
    if (!NFeRepositoryPostgres.ALLOWED_LOOKUP_COLUMNS.has(column)) {
      throw new Error(`Invalid lookup column: ${column}`);
    }
    const queryResult = await db.query(
      `SELECT ${NFeRepositoryPostgres.BASE_COLUMNS} FROM fiscal.nfes WHERE ${column} = $1`,
      [value]
    );
    return queryResult.rows[0] ? this.mapToEntity(queryResult.rows[0] as NFeRow) : null;
  }

  async findById(id: string): Promise<NFe | null> {
    return this.findOneByColumn('id', id);
  }

  async findByNumero(numero: string): Promise<NFe | null> {
    return this.findOneByColumn('numero', numero);
  }

  async findAll(options: FindAllNFeOptions): Promise<{ items: NFe[]; total: number }> {
    const filterParams: unknown[] = [options.clinicId];
    let filterClauses = '';

    if (options.status) {
      filterClauses += ` AND status = ${this.addParameter(filterParams, options.status)}`;
    }

    if (options.tipo) {
      filterClauses += ` AND tipo = ${this.addParameter(filterParams, options.tipo)}`;
    }

    if (options.clienteId) {
      filterClauses += ` AND cliente_id = ${this.addParameter(filterParams, options.clienteId)}`;
    }

    const countQuery = `SELECT COUNT(*) FROM fiscal.nfes WHERE clinic_id = $1${filterClauses}`;

    let dataQuery =
      `SELECT ${NFeRepositoryPostgres.BASE_COLUMNS} FROM fiscal.nfes ` +
      `WHERE clinic_id = $1${filterClauses} ORDER BY created_at DESC`;
    const paginatedParams = [...filterParams];

    dataQuery += ` LIMIT ${this.addParameter(paginatedParams, options.take ?? 1000)}`;

    if (options.skip !== undefined) {
      dataQuery += ` OFFSET ${this.addParameter(paginatedParams, options.skip)}`;
    }

    const [countResult, dataResult] = await Promise.all([
      db.query(countQuery, filterParams),
      db.query(dataQuery, paginatedParams),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    return {
      items: dataResult.rows.map((databaseRow) => this.mapToEntity(databaseRow as NFeRow)),
      total,
    };
  }

  async save(nfe: NFe): Promise<void> {
    await db.query(
      `INSERT INTO fiscal.nfes (
        id, clinic_id, numero, serie, tipo, status, chave_acesso, xml, pdf_url,
        cliente_id, cliente_nome, valor_total, data_emissao, protocolo, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [nfe.id, nfe.clinicId, nfe.numero, nfe.serie, nfe.tipo, nfe.status, nfe.chaveAcesso,
       nfe.xml, nfe.pdfUrl, nfe.clienteId, nfe.clienteNome, nfe.valorTotal, nfe.dataEmissao,
       nfe.protocolo, nfe.createdAt, nfe.updatedAt]
    );
  }

  async update(nfe: NFe): Promise<void> {
    await db.query(
      'UPDATE fiscal.nfes SET status = $1, chave_acesso = $2, xml = $3, pdf_url = $4, ' +
      'protocolo = $5, updated_at = $6 WHERE id = $7',
      [nfe.status, nfe.chaveAcesso, nfe.xml, nfe.pdfUrl, nfe.protocolo, nfe.updatedAt, nfe.id]
    );
  }

  private mapToEntity(databaseRow: NFeRow): NFe {
    return NFe.create({
      id: databaseRow.id,
      clinicId: databaseRow.clinic_id,
      numero: databaseRow.numero,
      serie: databaseRow.serie,
      tipo: databaseRow.tipo,
      status: databaseRow.status,
      chaveAcesso: databaseRow.chave_acesso,
      xml: databaseRow.xml,
      pdfUrl: databaseRow.pdf_url,
      clienteId: databaseRow.cliente_id,
      clienteNome: databaseRow.cliente_nome,
      valorTotal: databaseRow.valor_total,
      dataEmissao: databaseRow.data_emissao,
      protocolo: databaseRow.protocolo,
      createdAt: databaseRow.created_at,
      updatedAt: databaseRow.updated_at,
    });
  }
}
