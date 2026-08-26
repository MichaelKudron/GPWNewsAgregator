import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { CompanyService } from '../../core/services/company.service';
import { NewsItem } from '../../core/models/article.model';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

type ViewMode = 'grid' | 'list';
const VIEW_KEY = 'signalhub.newsView';

interface CompanyHeader {
  isin: string;
  ticker: string;
  name: string;
}

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, PaginationComponent],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.scss',
})
export class NewsListComponent implements OnInit {
  private articleService = inject(ArticleService);
  private companyService = inject(CompanyService);
  private route = inject(ActivatedRoute);

  news = signal<NewsItem[]>([]);
  loading = signal(true);
  error = signal(false);

  // gdy podstrona jest zawężona do spółki
  company = signal<CompanyHeader | null>(null);

  view = signal<ViewMode>(this.loadView());

  // w kaflach mieści się więcej na stronę (4 kolumny) niż w liście
  pageSize = computed(() => (this.view() === 'grid' ? 12 : 10));
  page = signal(0);

  pageItems = computed(() => {
    const start = this.page() * this.pageSize();
    return this.news().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    const isin = this.route.snapshot.paramMap.get('isin');
    if (isin) {
      this.loadCompanyNews(isin);
    } else {
      this.loadLatest();
    }
  }

  private loadLatest(): void {
    this.articleService.getLatestArticles().subscribe({
      next: list => { this.news.set(list); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  private loadCompanyNews(isin: string): void {
    this.companyService.getCompanyView(isin).subscribe({
      next: view => {
        this.company.set({
          isin: view.company.isin,
          ticker: view.company.ticker,
          name: view.company.name,
        });
        this.articleService.getCompanyArticlesList(view.company.id).subscribe({
          next: list => { this.news.set(list); this.loading.set(false); },
          error: () => { this.error.set(true); this.loading.set(false); },
        });
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  setView(mode: ViewMode): void {
    if (mode === this.view()) return;
    this.view.set(mode);
    this.page.set(0); // różne rozmiary stron — wracamy na początek
    try {
      localStorage.setItem(VIEW_KEY, mode);
    } catch { /* prywatny tryb / brak dostępu — trudno */ }
  }

  onPageChange(p: number): void {
    this.page.set(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private loadView(): ViewMode {
    try {
      return localStorage.getItem(VIEW_KEY) === 'grid' ? 'grid' : 'list';
    } catch {
      return 'list';
    }
  }
}
