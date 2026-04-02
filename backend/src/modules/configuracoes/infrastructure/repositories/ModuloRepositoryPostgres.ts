import { IModuloRepository } from '../../domain/repositories/IModuloRepository';
import { Modulo } from '../../domain/entities/Modulo';
import { db } from '@/infrastructure/database/connection';

export class ModuloRepositoryPostgres implements IModuloRepository {
  async findByModuleKey(moduleKey: string, clinicId: string): Promise<Modulo | null> {
    const result = await db.query(
      'SELECT * FROM configuracoes.modulos WHERE module_key = $1 AND clinic_id = $2',
      [moduleKey, clinicId]
    );
    return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
  }

  async findAll(options: { clinicId: string; categoria?: string; onlyActive?: boolean }): Promise<{ items: Modulo[]; total: number }> {
    const params: (string | number | boolean | Date | null)[] = [options.clinicId];
    let conditions = 'clinic_id = $1';

    if (options.categoria) {
      params.push(options.categoria);
      conditions = conditions + ' AND categoria = $' + params.length;
    }

    if (options.onlyActive) {
      params.push(true);
      conditions = conditions + ' AND is_active = $' + params.length;
    }

    const countQuery = 'SELECT COUNT(*) FROM configuracoes.modulos WHERE ' + conditions;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await db.query('SELECT * FROM configuracoes.modulos WHERE ' + conditions + ' ORDER BY nome ASC', params);
    return {
      items: result.rows.map((row: Record<string, unknown>) => this.mapToEntity(row)),
      total
    };
  }

  async save(modulo: Modulo): Promise<void> {
    await db.query(
      'INSERT INTO configuracoes.modulos (id, clinic_id, module_key, nome, descricao, categoria, is_active, dependencies, configuracoes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [modulo.id, modulo.clinicId, modulo.moduleKey, modulo.nome, modulo.descricao, modulo.categoria, modulo.isActive, JSON.stringify(modulo.dependencies), JSON.stringify(modulo.configuracoes), modulo.createdAt, modulo.updatedAt]
    );
  }

  async update(modulo: Modulo): Promise<void> {
    await db.query(
      'UPDATE configuracoes.modulos SET nome = $1, descricao = $2, is_active = $3, configuracoes = $4, updated_at = $5 WHERE id = $6',
      [modulo.nome, modulo.descricao, modulo.isActive, JSON.stringify(modulo.configuracoes), modulo.updatedAt, modulo.id]
    );
  }

  private mapToEntity(row: Record<string, unknown>): Modulo {
    return Modulo.create({
      id: row.id as string,
      clinicId: row.clinic_id as string,
      moduleKey: row.module_key as string,
      nome: row.nome as string,
      descricao: row.descricao as string,
      categoria: row.categoria as 'CLINICA' | 'FINANCEIRO' | 'MARKETING' | 'COMPLIANCE' | 'INOVACAO',
      isActive: row.is_active as boolean,
      dependencies: row.dependencies as import('../../domain/entities/Modulo').ModuloDependency[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      configuracoes: row.configuracoes as Record<string, any>,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    });
  }
}
