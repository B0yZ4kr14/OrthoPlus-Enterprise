export interface SearchRow {
  id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  content: string;
  module: string;
  score: number;
}

export interface ISearchIndexRepository {
  search(
    query: string,
    clinicId: string,
    moduleFilter: string | undefined,
    limit: number,
    offset: number,
  ): Promise<SearchRow[]>;

  count(
    query: string,
    clinicId: string,
    moduleFilter: string | undefined,
  ): Promise<[{ count: bigint }]>;

  ping(): Promise<unknown>;
  countByClinic(clinicId: string): Promise<[{ count: bigint }]>;
  maxUpdatedByClinic(clinicId: string): Promise<[{ max_updated: Date | null }]>;
}
