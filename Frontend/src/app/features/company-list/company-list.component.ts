import { Component, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError, of, takeUntil, map } from 'rxjs';
import { CompanyService } from '../../core/services/company.service';
import { CompanyView } from '../../core/models/company.model';
import { CompanySearchParams } from '../../core/models/search.model';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { TvMiniChartComponent } from '../../shared/tv-mini-chart/tv-mini-chart.component';

type ViewMode = 'grid' | 'list';
const VIEW_KEY = 'signalhub.companyView';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, TvMiniChartComponent],
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.scss',
})
export class CompanyListComponent implements OnInit, OnDestroy {
  private companyService = inject(CompanyService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  // jeden trigger dla wyszukiwania I sortowania — buduje pełne parametry,
  // a dedup działa na całości (nie tylko na tekście), więc sort łapie zawsze.
  private reload$ = new Subject<void>();

  companies = signal<CompanyView[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  query = '';
  sortBy = 'ticker';
  sortDirection: 'asc' | 'desc' = 'asc';

  sortOptions = [
    { value: 'ticker', label: 'Ticker — A do Z', direction: 'asc' as const },
    { value: 'ticker', label: 'Ticker — Z do A', direction: 'desc' as const },
    { value: 'name', label: 'Nazwa — A do Z', direction: 'asc' as const },
    { value: 'name', label: 'Nazwa — Z do A', direction: 'desc' as const },
  ];
  selectedSort = 0;

  // widok kafelki/lista — zapamiętywany w localStorage
  view = signal<ViewMode>(this.loadView());

  // paginacja (client-side po pełnej liście); w kaflach mniej na stronę —
  // każdy kafel ma wykres TradingView, więc nie chcemy ich za dużo naraz.
  pageSize = computed(() => (this.view() === 'grid' ? 12 : 20));
  page = signal(0);

  pageItems = computed(() => {
    const start = this.page() * this.pageSize();
    return this.companies().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.reload$
      .pipe(
        debounceTime(250),
        map(() => this.buildParams(this.query)),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        switchMap(params => {
          this.loading.set(true);
          this.error.set(null);
          return this.companyService.searchCompanies(params).pipe(
            catchError(() => {
              this.error.set('Nie udało się załadować listy spółek.');
              this.loading.set(false);
              return of([]);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(results => {
        this.companies.set(results);
        this.page.set(0);
        this.loading.set(false);
      });

    this.reload$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onQueryChange(): void {
    this.reload$.next();
  }

  onSortChange(index: number): void {
    this.selectedSort = index;
    const opt = this.sortOptions[index];
    this.sortBy = opt.value;
    this.sortDirection = opt.direction;
    this.reload$.next();
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

  goToCompany(isin: string): void {
    this.router.navigate(['/company', isin]);
  }

  private loadView(): ViewMode {
    try {
      return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
    } catch {
      return 'grid';
    }
  }

  private buildParams(q: string): CompanySearchParams {
    return {
      query: q,
      market: 'Gpw',
      page: 0,
      size: 1000,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
    };
  }
}
