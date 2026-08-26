import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Article,
  CompanyArticle,
  NewsItem,
  LinkedCompany,
  MarketMood,
  SentimentPoint,
  TrendingCompany,
} from '../models/article.model';
import { environment } from '../../../environments/environment';

/** ArticleService zwraca JSON w snake_case — mapujemy na camelCase */
interface CompanyArticleWire {
  article_id: string;
  article_title: string;
  sentiment: string;
  match_level: CompanyArticle['matchLevel'];
}

interface LinkedCompanyWire {
  isin: string;
  ticker: string;
  name: string;
}

interface NewsItemWire {
  id: string;
  title: string;
  source_code: string;
  summary: string | null;
  published_at: string | null;
  sentiment: NewsItem['sentiment'];
  companies: LinkedCompanyWire[] | null;
}

interface TrendingWire {
  name: string;
  ticker: string;
  isin: string;
  article_count: number;
}

interface ArticleWire {
  id: string;
  source_code: string;
  source_type: string | null;
  url: string;
  title: string;
  summary: string | null;
  content: string | null;
  content_length: number;
  author: string | null;
  category: string | null;
  content_source: Article['contentSource'];
  published_at: string | null;
  fetched_at: string | null;
  processing_status: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private http = inject(HttpClient);
  private base = `${environment.articleApiUrl}/api/v1/article`;

  getCompanyArticles(companyId: string): Observable<CompanyArticle[]> {
    return this.http.get<CompanyArticleWire[]>(`${this.base}/company/${companyId}`).pipe(
      map(list =>
        list.map(a => ({
          articleId: a.article_id,
          articleTitle: a.article_title,
          sentiment: a.sentiment,
          matchLevel: a.match_level,
        }))
      )
    );
  }

  /** Ostatnie artykuły do listy newsów (GET /article/latest). */
  getLatestArticles(): Observable<NewsItem[]> {
    return this.http.get<NewsItemWire[]>(`${this.base}/latest`).pipe(
      map(list => list.map(n => ({
        id: n.id,
        title: n.title,
        sourceCode: n.source_code,
        summary: n.summary,
        publishedAt: n.published_at,
        sentiment: n.sentiment,
        companies: n.companies ?? [],
      })))
    );
  }

  /** Najnowsze PRZEanalizowane artykuły (dominujący sentyment poz/neg) — kolumny dobre/złe wieści. */
  getClassifiedArticles(): Observable<NewsItem[]> {
    return this.http.get<NewsItemWire[]>(`${this.base}/latest-classified`).pipe(
      map(list => list.map(n => ({
        id: n.id,
        title: n.title,
        sourceCode: n.source_code,
        summary: n.summary,
        publishedAt: n.published_at,
        sentiment: n.sentiment,
        companies: n.companies ?? [],
      })))
    );
  }

  /** Spółki powiązane z danym artykułem (chipy na stronie artykułu). */
  getArticleCompanies(articleId: string): Observable<LinkedCompany[]> {
    return this.http.get<LinkedCompanyWire[]>(`${this.base}/${articleId}/companies`);
  }

  /** Bilans sentymentu ostatnich artykułów — kafelek „Nastrój rynku". */
  getMarketMood(): Observable<MarketMood> {
    return this.http.get<MarketMood>(`${this.base}/sentiment-summary`);
  }

  /** Skumulowany sentyment w czasie — cały rynek lub jedna spółka (companyId). */
  getSentimentTimeline(companyId?: string): Observable<SentimentPoint[]> {
    const url = companyId
      ? `${this.base}/sentiment-timeline?companyId=${companyId}`
      : `${this.base}/sentiment-timeline`;
    return this.http.get<SentimentPoint[]>(url);
  }

  /** Najczęściej opisywane spółki (top 5 wg liczby artykułów). */
  getTrendingCompanies(): Observable<TrendingCompany[]> {
    return this.http.get<TrendingWire[]>(`${this.base}/trending-companies`).pipe(
      map(list => list.map(c => ({
        name: c.name,
        ticker: c.ticker,
        isin: c.isin,
        articleCount: c.article_count,
      })))
    );
  }

  getArticle(id: string): Observable<Article> {
    return this.http.get<ArticleWire>(`${this.base}/${id}`).pipe(
      map(a => ({
        id: a.id,
        sourceCode: a.source_code,
        sourceType: a.source_type,
        url: a.url,
        title: a.title,
        summary: a.summary,
        content: a.content,
        contentLength: a.content_length,
        author: a.author,
        category: a.category,
        contentSource: a.content_source,
        publishedAt: a.published_at,
        fetchedAt: a.fetched_at,
        processingStatus: a.processing_status,
      }))
    );
  }
}
