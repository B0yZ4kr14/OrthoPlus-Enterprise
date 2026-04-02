import { IModuloRepository } from '../../domain/repositories/IModuloRepository';
import { Modulo } from '../../domain/entities/Modulo';
import { db } from '@/infrastructure/database/connection';

export class ModuloRepositoryPostgres implements IModuloRepository {
  async findById(id: string): Promise<Modulo | null> {
    const result = await db.query('SELECT * FROM modulos.modulos WHERE id = $1', [id]);
    return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
  }

  async findAll(options: { status?: string; categoria?: string; skip?: number; take?: number }): Promise<{ items: Modulo[]; total: number }> {
    let query = 'SELECT * FROM modulos.modulos WHERE 1=1';
    const params: (string | number | boolean | Date | null)[] = [];
    let paramCount = 0;

    if (options.status) {
      paramCount++;
      query += ' AND status = $' + paramCount;
      params.push(options.status);
    }

    if (options.categoria) {
      paramCount++;
      query += ' AND categoria = $' + paramCount;
      params.push(options.categoria);
    }

    const countQuery = 'SELECT COUNT(*) FROM (' + query + ') AS count_query';
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    query += ' ORDER BY ordem ASC';
    
    if (options.skip) {
      paramCount++;
      query += ' OFFSET $' + paramCount;
      params.push(options.skip);
    }
    
    if (options.take) {
      paramCount++;
      query += ' LIMIT $' + paramCount;
      params.push(options.take);
    }

    const result = await db.query(query, params);
    return {
      items: result.rows.map((row: Record<string, unknown>) => this.mapToEntity(row)),
      total
    };
  }

  async save(modulo: Modulo): Promise<void> {
    await db.query(
      'INSERT INTO modulos.modulos (id, nome, descricao, icone, cor, ordem, categoria, status, permissoes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [modulo.id, modulo.nome, modulo.descricao, modulo.icone, modulo.cor, modulo.ordem,
       modulo.categoria, modulo.status, JSON.stringify(modulo.permissoes), modulo.createdAt, modulo.updatedAt]
    );
  }

  private mapToEntity(row: Record<string, unknown>): Modulo {
    return Modulo.create({
      id: row.id as string,
      nome: row.nome as string,
      descricao: row.descricao as string,
      icone: row.icone as string,
      cor: row.cor as string,
      ordem: row.ordem as number,
      categoria: row.categoria as string,
      status: row.status as string,
      permissoes: row.permissoes,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    });
  }
}
