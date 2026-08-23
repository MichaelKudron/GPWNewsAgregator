export type MatchLevel = 'NONE' | 'MENTION' | 'TOPIC';

/** Element listy artykułów powiązanych ze spółką (GET /article/company/{id}) */
export interface CompanyArticle {
  articleId: string;
  articleTitle: string;
  /** wynik analizy sentymentu, np. "neutral" */
  sentiment: string;
  matchLevel: MatchLevel;
}

export type ArticleSentiment = 'positive' | 'negative' | 'neutral' | 'mixed' | null;

/** Spółka powiązana z artykułem (chip pod newsem / na stronie artykułu) */
export interface LinkedCompany {
  isin: string;
  ticker: string;
  name: string;
}

/** Skrócony artykuł na listę newsów (GET /article/latest) */
export interface NewsItem {
  id: string;
  title: string;
  sourceCode: string;
  summary: string | null;
  publishedAt: string | null;
  /** przeważający sentyment artykułu (z dominującego powiązania spółki) */
  sentiment: ArticleSentiment;
  /** powiązane spółki (do chipów) */
  companies: LinkedCompany[];
}

/** Bilans sentymentu ostatnich artykułów (GET /article/sentiment-summary) */
export interface MarketMood {
  positive: number;
  negative: number;
  neutral: number;
}

/** Najczęściej opisywana spółka (GET /article/trending-companies) */
export interface TrendingCompany {
  name: string;
  ticker: string;
  isin: string;
  articleCount: number;
}

/** Pełny artykuł (GET /article/{id}) */
export interface Article {
  id: string;
  sourceCode: string;
  sourceType: string | null;
  url: string;
  title: string;
  summary: string | null;
  content: string | null;
  contentLength: number;
  author: string | null;
  category: string | null;
  contentSource: 'FULL_SCRAPED' | 'TRUNCATED_PAYWALL' | 'RSS_ONLY' | null;
  publishedAt: string | null;
  fetchedAt: string | null;
  processingStatus: string | null;
}
