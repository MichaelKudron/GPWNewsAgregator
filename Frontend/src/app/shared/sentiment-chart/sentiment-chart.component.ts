import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SentimentPoint } from '../../core/models/article.model';

/**
 * Skumulowany wykres sentymentu (własny SVG, bez zależności zewnętrznych).
 * Linia = biegnący bilans (+1 za pozytywny news, -1 za negatywny).
 * Kolor wg końcowego wyniku: zielony (≥0) / czerwony (<0).
 */
@Component({
  selector: 'app-sentiment-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sentiment-chart.component.html',
  styleUrl: './sentiment-chart.component.scss',
})
export class SentimentChartComponent {
  points = input.required<SentimentPoint[]>();

  /** klik w dzień — emituje wybrany punkt (do drilldownu newsów) */
  pointClick = output<SentimentPoint>();

  hoverIndex = signal<number | null>(null);

  // stała przestrzeń rysowania; SVG skaluje się do kontenera
  readonly W = 700;
  readonly H = 200;
  private readonly padY = 18;

  private scores = computed(() => this.points().map(p => p.score));

  private lo = computed(() => Math.min(0, ...this.scores()));
  private hi = computed(() => Math.max(0, ...this.scores()));

  private x = (i: number): number => {
    const n = this.points().length;
    return n <= 1 ? this.W / 2 : (i / (n - 1)) * this.W;
  };

  private y = (v: number): number => {
    const range = (this.hi() - this.lo()) || 1;
    return this.H - this.padY - ((v - this.lo()) / range) * (this.H - 2 * this.padY);
  };

  zeroY = computed(() => this.y(0));

  /** ścieżka linii */
  linePath = computed(() => {
    const pts = this.points();
    if (!pts.length) return '';
    return pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${this.x(i).toFixed(1)} ${this.y(p.score).toFixed(1)}`)
      .join(' ');
  });

  /** ścieżka wypełnienia pod linią do poziomu 0 */
  areaPath = computed(() => {
    const pts = this.points();
    if (pts.length < 2) return '';
    const z = this.zeroY().toFixed(1);
    const first = `M ${this.x(0).toFixed(1)} ${z}`;
    const line = pts.map((p, i) => `L ${this.x(i).toFixed(1)} ${this.y(p.score).toFixed(1)}`).join(' ');
    const back = `L ${this.x(pts.length - 1).toFixed(1)} ${z} Z`;
    return `${first} ${line} ${back}`;
  });

  last = computed(() => (this.points().length ? this.points()[this.points().length - 1].score : 0));

  /** kolor wg trendu */
  positive = computed(() => this.last() >= 0);

  singlePoint = computed(() => this.points().length === 1);
  singleX = computed(() => this.x(0));
  singleY = computed(() => (this.points().length ? this.y(this.points()[0].score) : this.H / 2));

  /** klikalne pasy (jeden na dzień) — pełna wysokość, szerokość = odstęp między dniami */
  bands = computed(() => {
    const pts = this.points();
    const n = pts.length;
    const bw = n > 1 ? this.W / (n - 1) : this.W;
    return pts.map((p, i) => ({
      i,
      point: p,
      x: Math.max(0, this.x(i) - bw / 2),
      w: bw,
    }));
  });

  hoverX = computed(() => {
    const i = this.hoverIndex();
    return i === null ? null : this.x(i);
  });

  hoverY = computed(() => {
    const i = this.hoverIndex();
    return i === null ? null : this.y(this.points()[i].score);
  });

  onEnter(i: number): void { this.hoverIndex.set(i); }
  onLeave(): void { this.hoverIndex.set(null); }
  onClick(p: SentimentPoint): void { this.pointClick.emit(p); }
}
