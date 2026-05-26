import { useInfiniteQuery } from "@tanstack/react-query"
import { useDebounce } from "use-debounce"
import { search } from "@/lib/api/search"
import type { SearchResultItem } from "@orthoplus/shared-types"

export interface UseSearchReturn {
  /** Resultados achatados de todas as paginas carregadas */
  data: SearchResultItem[]
  /** Carregando a primeira pagina */
  isLoading: boolean
  /** Carregando a proxima pagina (infinite scroll) */
  isFetchingNextPage: boolean
  /** Erro da ultima requisicao */
  error: Error | null
  /** Carrega a proxima pagina */
  fetchNextPage: () => void
  /** Indica se existe uma proxima pagina */
  hasNextPage: boolean
  /** Total de resultados disponiveis no backend */
  total: number
}

/**
 * Hook de busca com debounce e suporte a infinite scroll.
 *
 * @param query  Termo de busca (debounce de 300ms automatico)
 * @param module Filtro por modulo (ex: "pacientes", "agenda", "pep")
 * @param limit  Resultados por pagina
 *
 * @example
 * const { data, isLoading, fetchNextPage, hasNextPage } = useSearch("joao", "pacientes", 20)
 */
export function useSearch(
  query: string,
  module?: string,
  limit = 20,
): UseSearchReturn {
  const [debouncedQuery] = useDebounce(query, 300)

  const {
    data,
    isLoading,
    isFetchingNextPage,
    error,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["search", debouncedQuery, module, limit],
    queryFn: async ({ pageParam = 1 }) => {
      return search(debouncedQuery, module, pageParam, limit)
    },
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1
      const totalPages = Math.ceil(lastPage.total / lastPage.limit)
      return nextPage <= totalPages ? nextPage : undefined
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 30,
    initialPageParam: 1,
  })

  const flattenedResults = data?.pages.flatMap((page) => page.results) ?? []
  const total = data?.pages[0]?.total ?? 0

  return {
    data: flattenedResults,
    isLoading,
    isFetchingNextPage,
    error,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    total,
  }
}
