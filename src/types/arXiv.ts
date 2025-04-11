export interface ArXivAuthor {
  name: string;
  affiliation?: string;
}

export interface ArXivCategory {
  term: string;
  scheme?: string;
  label?: string;
}

export interface ArXivLink {
  href: string;
  rel: string;
  title?: string;
  type?: string;
}

export interface ArXivArticle {
  id: string;
  title: string;
  summary: string;
  published: string; // ISO date string
  updated: string; // ISO date string
  authors: ArXivAuthor[];
  categories: ArXivCategory[];
  links: ArXivLink[];
  doi?: string;
  journal_ref?: string;
  comment?: string;
  primary_category: ArXivCategory;
}

export interface ArXivApiResponse {
  feed: {
    entry: ArXivArticle[];
    totalResults?: number;
    startIndex?: number;
    itemsPerPage?: number;
  };
}

export interface SearchParams {
  searchQuery: string;
  sortBy: 'relevance' | 'lastUpdated' | 'submitted';
  sortOrder: 'ascending' | 'descending';
  startIndex: number;
  maxResults: number;
  categories?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface AIInsight {
  summary: string;
  keyFindings: string[];
  relatedArticles?: ArXivArticle[];
}

export interface UserFavorite {
  articleId: string;
  savedAt: number; // timestamp
  notes?: string;
}

export interface UserReadingHistory {
  articleId: string;
  readAt: number; // timestamp
  completionPercentage?: number;
}

export interface UserAlert {
  id: string;
  categories: string[];
  keywords: string[];
  createdAt: number; // timestamp
  lastTriggered?: number; // timestamp
  enabled: boolean;
}