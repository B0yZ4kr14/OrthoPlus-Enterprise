export interface SearchResultItem {
  id: string;
  entityType: string;
  entityId: string;
  title: string;
  snippet: string;
  score: number;
  module: string;
}

export interface SearchResponse {
  total: number;
  page: number;
  limit: number;
  results: SearchResultItem[];
}
