export interface PaginationOptions {
  take?: number;
  skip?: number;
}

export function appendPagination(
  query: string,
  params: unknown[],
  options: PaginationOptions
): { query: string; params: unknown[] } {
  const paginatedParams = [...params];
  let paginatedQuery = query;

  if (options.take) {
    paginatedParams.push(options.take);
    paginatedQuery += ` LIMIT $${paginatedParams.length}`;
  }

  if (options.skip) {
    paginatedParams.push(options.skip);
    paginatedQuery += ` OFFSET $${paginatedParams.length}`;
  }

  return { query: paginatedQuery, params: paginatedParams };
}
