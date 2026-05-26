import { apiClient } from "@/lib/api/apiClient"
import type { SearchResponse } from "@orthoplus/shared-types"

export interface ReindexResponse {
  message: string
  indexed: number
  durationMs: number
}

/**
 * Realiza busca full-text no backend via SearchIndex.
 *
 * @param query   Termo de busca (minimo 2 caracteres recomendado)
 * @param module  Filtro por modulo (ex: "pacientes", "agenda", "pep")
 * @param page    Pagina atual (inicia em 1)
 * @param limit   Resultados por pagina (max 100 no backend)
 */
export function search(
  query: string,
  module?: string,
  page = 1,
  limit = 20,
): Promise<SearchResponse> {
  const params = new URLSearchParams()
  params.set("q", query)
  if (module) params.set("module", module)
  params.set("page", String(page))
  params.set("limit", String(limit))
  return apiClient.get<SearchResponse>(`/search-index?${params.toString()}`)
}

/**
 * Reindexa todos os pacientes no indice de busca.
 *
 * @param force Forca reindexacao completa
 * @param since Data ISO para reindexacao incremental
 */
export function reindexPacientes(
  force?: boolean,
  since?: string,
): Promise<ReindexResponse> {
  if (!force && !since) {
    throw new Error("Especifique force=true ou since=<data_iso>")
  }
  return apiClient.post<ReindexResponse>("/search-index/reindex/pacientes", {
    force,
    since,
  })
}

/**
 * Reindexa todos os agendamentos no indice de busca.
 *
 * @param force Forca reindexacao completa
 * @param since Data ISO para reindexacao incremental
 */
export function reindexAgenda(
  force?: boolean,
  since?: string,
): Promise<ReindexResponse> {
  if (!force && !since) {
    throw new Error("Especifique force=true ou since=<data_iso>")
  }
  return apiClient.post<ReindexResponse>("/search-index/reindex/agenda", {
    force,
    since,
  })
}

/**
 * Reindexa todos os prontuarios (PEP) no indice de busca.
 *
 * @param force Forca reindexacao completa
 * @param since Data ISO para reindexacao incremental
 */
export function reindexPep(
  force?: boolean,
  since?: string,
): Promise<ReindexResponse> {
  if (!force && !since) {
    throw new Error("Especifique force=true ou since=<data_iso>")
  }
  return apiClient.post<ReindexResponse>("/search-index/reindex/pep", {
    force,
    since,
  })
}
