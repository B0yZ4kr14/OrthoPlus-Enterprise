import { pep_tratamentos, prontuarios, PrismaClient } from "@prisma/client"
import { BaseIndexer, SearchIndexEntry } from "./BaseIndexer"

type HistoricoClinico = {
  id: string
  prontuario_id: string
  titulo: string
  descricao: string
  tipo: string
}

type PepEvolucao = {
  id: string
  tratamento_id: string
  descricao: string
  tipo: string
}

type ProntuarioWithData = prontuarios & {
  tratamentos: pep_tratamentos[]
  historicos: HistoricoClinico[]
  evolucoes: PepEvolucao[]
}

/**
 * PepIndexer - Servico batch de indexacao full-text para prontuarios (PEP).
 *
 * Responsabilidade: sincronizar registros da tabela `prontuarios` e dados
 * relacionados (tratamentos, historico clinico, evolucoes) com a tabela
 * `search_index` para busca full-text via PostgreSQL tsvector.
 */
export class PepIndexer extends BaseIndexer<ProntuarioWithData> {
  protected entityType = "prontuario"
  protected module = "pep"

  constructor(prisma: PrismaClient) {
    super(prisma)
  }

  protected async queryBatch(cursor?: string, since?: Date): Promise<ProntuarioWithData[]> {
    const prontuariosBatch = await this.prisma.prontuarios.findMany({
      take: this.batchSize,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: "asc" },
      where: since ? { updated_at: { gt: since } } : undefined,
      include: { tratamentos: true },
    })

    if (prontuariosBatch.length === 0) {
      return []
    }

    const prontuarioIds = prontuariosBatch.map((p) => p.id)
    const tratamentoIds = prontuariosBatch.flatMap((p) => p.tratamentos.map((t) => t.id))

    const [historicosRaw, evolucoesRaw] = await Promise.all([
      (this.prisma as any).historico_clinico.findMany({
        where: { prontuario_id: { in: prontuarioIds } },
        select: { id: true, prontuario_id: true, titulo: true, descricao: true, tipo: true },
      }) as Promise<HistoricoClinico[]>,
      (this.prisma as any).pep_evolucoes.findMany({
        where: { tratamento_id: { in: tratamentoIds } },
        select: { id: true, tratamento_id: true, descricao: true, tipo: true },
      }) as Promise<PepEvolucao[]>,
    ])

    const historicosByProntuario = groupBy(historicosRaw, (h) => h.prontuario_id)
    const evolucoesByTratamento = groupBy(evolucoesRaw, (e) => e.tratamento_id)

    return prontuariosBatch.map((p) => ({
      ...p,
      historicos: historicosByProntuario.get(p.id) ?? [],
      evolucoes: p.tratamentos.flatMap(
        (t) => evolucoesByTratamento.get(t.id) ?? []
      ),
    }))
  }

  protected extractData(entity: ProntuarioWithData): Promise<ProntuarioWithData> {
    // Dados ja enriquecidos em queryBatch
    return Promise.resolve(entity)
  }

  protected buildIndexEntry(entity: ProntuarioWithData): SearchIndexEntry {
    const title = `${entity.patient_name} - Prontuario`

    const tratamentosText = entity.tratamentos
      .flatMap((t) => [t.titulo, t.descricao, t.observacoes])
      .filter(Boolean)

    const historicosText = entity.historicos
      .flatMap((h) => [h.titulo, h.descricao])
      .filter(Boolean)

    const evolucoesText = entity.evolucoes
      .map((e) => e.descricao)
      .filter(Boolean)

    const contentParts = [
      entity.patient_name,
      ...tratamentosText,
      ...historicosText,
      ...evolucoesText,
    ]

    return {
      entity_type: this.entityType,
      entity_id: entity.id,
      clinic_id: entity.clinic_id,
      title,
      content: contentParts.join(" "),
      module: this.module,
    }
  }

  protected getEntityId(entity: ProntuarioWithData): string {
    return entity.id
  }

  /**
   * Reindexa um unico prontuario por ID.
   * Busca o prontuario com seus relacionamentos, remove a entrada anterior
   * e reinsere com dados atualizados.
   */
  async reindexById(prontuarioId: string): Promise<void> {
    const prontuario = await this.prisma.prontuarios.findUnique({
      where: { id: prontuarioId },
      include: { tratamentos: true },
    }) as ProntuarioWithData | null

    if (!prontuario) return

    const [historicosRaw, evolucoesRaw] = await Promise.all([
      (this.prisma as any).historico_clinico.findMany({
        where: { prontuario_id: prontuarioId },
        select: { id: true, prontuario_id: true, titulo: true, descricao: true, tipo: true },
      }) as Promise<HistoricoClinico[]>,
      (this.prisma as any).pep_evolucoes.findMany({
        where: { tratamento_id: { in: prontuario.tratamentos.map((t) => t.id) } },
        select: { id: true, tratamento_id: true, descricao: true, tipo: true },
      }) as Promise<PepEvolucao[]>,
    ])

    const entity: ProntuarioWithData = {
      ...prontuario,
      historicos: historicosRaw,
      evolucoes: prontuario.tratamentos.flatMap(
        (t) => evolucoesRaw.filter((e) => e.tratamento_id === t.id)
      ),
    }

    await this.prisma.search_index.deleteMany({
      where: {
        entity_type: this.entityType,
        entity_id: entity.id,
      },
    })

    const entry = this.buildIndexEntry(entity)
    await this.prisma.search_index.create({ data: entry })
  }
}

function groupBy<T, K>(items: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>()
  for (const item of items) {
    const key = keyFn(item)
    const list = map.get(key) ?? []
    list.push(item)
    map.set(key, list)
  }
  return map
}
