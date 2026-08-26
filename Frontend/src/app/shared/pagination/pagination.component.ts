import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Prosty, wielokrotnego użytku pager (0-indeksowany).
 * Pokazuje pierwszą/ostatnią stronę, okno wokół bieżącej i „…" tam, gdzie trzeba.
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  /** liczba pozycji łącznie */
  total = input.required<number>();
  /** ile na stronę */
  pageSize = input.required<number>();
  /** bieżąca strona (0-indeksowana) */
  page = input.required<number>();

  pageChange = output<number>();

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  /** lista przycisków: numery stron (0-indeks) oraz '…' */
  items = computed<(number | '…')[]>(() => {
    const last = this.totalPages() - 1;
    const cur = this.page();
    if (last <= 6) {
      return Array.from({ length: last + 1 }, (_, i) => i);
    }
    const out: (number | '…')[] = [0];
    const start = Math.max(1, cur - 1);
    const end = Math.min(last - 1, cur + 1);
    if (start > 1) out.push('…');
    for (let i = start; i <= end; i++) out.push(i);
    if (end < last - 1) out.push('…');
    out.push(last);
    return out;
  });

  go(p: number): void {
    if (p < 0 || p > this.totalPages() - 1 || p === this.page()) return;
    this.pageChange.emit(p);
  }

  isDots(item: number | '…'): item is '…' {
    return item === '…';
  }
}
