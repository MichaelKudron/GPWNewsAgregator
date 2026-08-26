import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { switchMap, catchError, EMPTY } from 'rxjs';
import { ArticleService } from '../../core/services/article.service';
import { Article, LinkedCompany } from '../../core/models/article.model';

@Component({
  selector: 'app-article-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './article-view.component.html',
  styleUrl: './article-view.component.scss',
})
export class ArticleViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private articleService = inject(ArticleService);

  article = signal<Article | null>(null);
  companies = signal<LinkedCompany[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap(params => {
          this.loading.set(true);
          this.error.set(null);
          this.article.set(null);
          this.companies.set([]);
          this.loadCompanies(params['id']);
          return this.articleService.getArticle(params['id']).pipe(
            catchError(() => {
              this.error.set('Nie udało się załadować artykułu.');
              this.loading.set(false);
              return EMPTY;
            })
          );
        })
      )
      .subscribe(article => {
        this.article.set(article);
        this.loading.set(false);
      });
  }

  private loadCompanies(id: string): void {
    this.articleService.getArticleCompanies(id).subscribe({
      next: c => this.companies.set(c),
      error: () => this.companies.set([]),
    });
  }

  /** Treść bywa niepełna w starszych rekordach — wtedy pokazujemy streszczenie */
  get bodyParagraphs(): string[] {
    const a = this.article();
    if (!a) return [];
    const content = a.content?.trim() ?? '';
    const text = content.length > 100 ? content : (a.summary ?? '');
    return text
      .split(/\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }

  get isSummaryOnly(): boolean {
    const a = this.article();
    if (!a) return false;
    return (a.content?.trim().length ?? 0) <= 100;
  }

  get publishedFormatted(): string {
    const d = this.article()?.publishedAt;
    if (!d) return '—';
    return new Date(d).toLocaleString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  goBack(): void {
    this.location.back();
  }
}
