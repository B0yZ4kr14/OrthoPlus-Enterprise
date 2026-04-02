/**
 * MÓDULO INVENTÁRIO - Repositório PostgreSQL de Produtos
 */

import { IDatabaseConnection } from '@/infrastructure/database/IDatabaseConnection';
import { FindAllOptions, IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { Produto } from '../../domain/entities/Produto';

export class ProdutoRepositoryPostgres implements IProdutoRepository {
  constructor(private db: IDatabaseConnection) {}

  async findById(id: string): Promise<Produto | null> {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM inventario.produtos WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;
    return this.mapToDomain(result.rows[0]);
  }

  async findByCodigo(codigo: string, clinicId: string): Promise<Produto | null> {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM inventario.produtos WHERE codigo = $1 AND clinic_id = $2`,
      [codigo, clinicId]
    );

    if (result.rows.length === 0) return null;
    return this.mapToDomain(result.rows[0]);
  }

  async findAll(options: FindAllOptions): Promise<{ items: Produto[]; total: number }> {
    const { clinicId, categoria, status, searchTerm, skip = 0, take = 50 } = options;
    const params: unknown[] = [clinicId];
    let paramIndex = 2;
    let where = `clinic_id = $1`;

    if (categoria) {
      where += ` AND categoria = $${paramIndex++}`;
      params.push(categoria);
    }

    if (status) {
      where += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (searchTerm) {
      where += ` AND (nome ILIKE $${paramIndex} OR codigo ILIKE $${paramIndex})`;
      params.push(`%${searchTerm}%`);
      paramIndex++;
    }

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM inventario.produtos WHERE ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataResult = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM inventario.produtos WHERE ${where} ORDER BY nome LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, take, skip]
    );

    return { items: dataResult.rows.map((r) => this.mapToDomain(r)), total };
  }

  async findEstoqueBaixo(clinicId: string, limiteMinimo?: number): Promise<Produto[]> {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM inventario.produtos WHERE clinic_id = $1
       AND quantidade_atual <= COALESCE($2, quantidade_minima)
       ORDER BY nome
       LIMIT 1000`,
      [clinicId, limiteMinimo ?? null]
    );
    return result.rows.map((r) => this.mapToDomain(r));
  }

  async save(produto: Produto): Promise<void> {
    await this.db.query(
      `INSERT INTO inventario.produtos (
        id, clinic_id, codigo, nome, descricao, categoria, unidade_medida,
        preco_custo, preco_venda, quantidade_minima, quantidade_atual, status,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        produto.id, produto.clinicId, produto.codigo, produto.nome, produto.descricao,
        produto.categoria, produto.unidadeMedida, produto.precoCusto, produto.precoVenda,
        produto.quantidadeMinima, produto.quantidadeAtual, produto.status,
        produto.createdAt, produto.updatedAt,
      ]
    );
  }

  async update(produto: Produto): Promise<void> {
    await this.db.query(
      `UPDATE inventario.produtos SET
        nome = $2, descricao = $3, categoria = $4, unidade_medida = $5,
        preco_custo = $6, preco_venda = $7, quantidade_minima = $8,
        quantidade_atual = $9, status = $10, updated_at = $11
      WHERE id = $1`,
      [
        produto.id, produto.nome, produto.descricao, produto.categoria,
        produto.unidadeMedida, produto.precoCusto, produto.precoVenda,
        produto.quantidadeMinima, produto.quantidadeAtual, produto.status,
        produto.updatedAt,
      ]
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.query(`DELETE FROM inventario.produtos WHERE id = $1`, [id]);
  }

  async findByClinic(clinicId: string, filters?: { categoriaId?: string; fornecedorId?: string; ativo?: boolean; estoqueBaixo?: boolean; search?: string }): Promise<Produto[]> {
    const { where, params } = this.buildClinicFilters(clinicId, filters);
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM inventario.produtos WHERE ${where} ORDER BY nome LIMIT 1000`,
      params
    );
    return result.rows.map((r) => this.mapToDomain(r));
  }

  async count(clinicId: string, filters?: { categoriaId?: string; fornecedorId?: string; ativo?: boolean; estoqueBaixo?: boolean; search?: string }): Promise<number> {
    const { where, params } = this.buildClinicFilters(clinicId, filters);
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM inventario.produtos WHERE ${where}`,
      params
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }

  private buildClinicFilters(clinicId: string, filters?: { categoriaId?: string; fornecedorId?: string; ativo?: boolean; estoqueBaixo?: boolean; search?: string }): { where: string; params: unknown[] } {
    const params: unknown[] = [clinicId];
    let paramIndex = 2;
    let where = `clinic_id = $1`;

    if (filters?.categoriaId) {
      where += ` AND categoria = $${paramIndex++}`;
      params.push(filters.categoriaId);
    }
    if (filters?.ativo !== undefined) {
      where += ` AND status = $${paramIndex++}`;
      params.push(filters.ativo ? 'ATIVO' : 'INATIVO');
    }
    if (filters?.estoqueBaixo) {
      where += ` AND quantidade_atual <= quantidade_minima`;
    }
    if (filters?.search) {
      where += ` AND (nome ILIKE $${paramIndex} OR codigo ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    return { where, params };
  }

  private mapToDomain(row: Record<string, unknown>): Produto {
    return Produto.create({
      id: row.id as string,
      clinicId: row.clinic_id as string,
      codigo: row.codigo as string,
      nome: row.nome as string,
      descricao: (row.descricao as string | null) ?? null,
      categoria: row.categoria as string,
      unidadeMedida: row.unidade_medida as string,
      precoCusto: Number(row.preco_custo),
      precoVenda: Number(row.preco_venda),
      quantidadeMinima: Number(row.quantidade_minima),
      quantidadeAtual: Number(row.quantidade_atual),
      status: row.status as string,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    });
  }
}
