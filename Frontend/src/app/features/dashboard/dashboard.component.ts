import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TvChartComponent } from '../../shared/tv-chart/tv-chart.component';
import { TvWidgetComponent } from '../../shared/tv-widget/tv-widget.component';
import { SentimentChartComponent } from '../../shared/sentiment-chart/sentiment-chart.component';
import { ArticleService } from '../../core/services/article.service';
import { NewsItem, MarketMood, TrendingCompany, SentimentPoint } from '../../core/models/article.model';
import { getMarketStatus, MarketStatus } from '../../core/market-status';

interface IndexTab {
  label: string;
  symbol: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, TvChartComponent, TvWidgetComponent, SentimentChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private articleService = inject(ArticleService);

  indices: IndexTab[] = [
    { label: 'WIG', symbol: 'GPW:WIG' },
    { label: 'WIG20', symbol: 'GPW:WIG20' },
    { label: 'mWIG40', symbol: 'GPW:MWIG40' },
    { label: 'sWIG80', symbol: 'GPW:SWIG80' },
  ];
  activeIndex = signal<IndexTab>(this.indices[0]);

  market = signal<MarketStatus>(getMarketStatus());
  news = signal<NewsItem[]>([]);
  newsLoading = signal(true);

  mood = signal<MarketMood | null>(null);
  trending = signal<TrendingCompany[]>([]);

  sentimentTimeline = signal<SentimentPoint[]>([]);
  sentimentScore = computed(() => {
    const t = this.sentimentTimeline();
    return t.length ? t[t.length - 1].score : 0;
  });

  // podział newsów na dobre/złe wieści
  goodNews = computed(() => this.news().filter(n => n.sentiment === 'positive'));
  badNews = computed(() => this.news().filter(n => n.sentiment === 'negative'));

  moodLabel = computed(() => {
    const m = this.mood();
    if (!m) return '';
    if (m.positive > m.negative * 1.2) return 'Przewaga optymizmu';
    if (m.negative > m.positive * 1.2) return 'Przewaga pesymizmu';
    return 'Rynek neutralny';
  });

  // ── Pasek notowań TradingView — w pełni polski (indeksy + blue chipy + PLN) ──
  readonly tickerTapeSrc =
    'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
  readonly tickerTapeConfig = {
    symbols: [
      { proName: 'GPW:WIG', title: 'WIG' },
      { proName: 'GPW:WIG20', title: 'WIG20' },
      { proName: 'GPW:MWIG40', title: 'mWIG40' },
      { proName: 'GPW:SWIG80', title: 'sWIG80' },
      { proName: 'GPW:PKN', title: 'Orlen' },
      { proName: 'GPW:PKO', title: 'PKO BP' },
      { proName: 'GPW:PEO', title: 'Pekao' },
      { proName: 'GPW:PZU', title: 'PZU' },
      { proName: 'GPW:KGH', title: 'KGHM' },
      { proName: 'FX_IDC:EURPLN', title: 'EUR/PLN' },
      { proName: 'FX_IDC:USDPLN', title: 'USD/PLN' },
    ],
    showSymbolLogo: true,
    colorTheme: 'dark',
    isTransparent: true,
    displayMode: 'adaptive',
    locale: 'pl',
  };

  private clock: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    // odśwież status sesji co minutę
    this.clock = setInterval(() => this.market.set(getMarketStatus()), 60_000);

    this.articleService.getClassifiedArticles().subscribe({
      next: list => {
        this.news.set(list);
        this.newsLoading.set(false);
      },
      error: () => this.newsLoading.set(false),
    });

    this.articleService.getMarketMood().subscribe(m => this.mood.set(m));
    this.articleService.getTrendingCompanies().subscribe(t => this.trending.set(t));
    this.articleService.getSentimentTimeline().subscribe(t => this.sentimentTimeline.set(t));
  }

  selectIndex(tab: IndexTab): void {
    this.activeIndex.set(tab);
  }

  ngOnDestroy(): void {
    if (this.clock) clearInterval(this.clock);
  }
}
