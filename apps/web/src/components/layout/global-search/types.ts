export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

export interface SearchResults {
  patients?: SearchResult[];
  budgets?: SearchResult[];
  appointments?: SearchResult[];
}

export interface SearchGroupProps {
  heading: string;
  results: SearchResult[];
  icon: React.ReactNode;
  onSelect: (url: string) => void;
}
