import {
  Component,
  Input,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';

/**
 * Kompaktowy wykres TradingView ("mini symbol overview") — sparkline do kafelków spółek.
 * Przyjmuje symbol w formacie "GPW:PKN".
 */
@Component({
  selector: 'app-tv-mini-chart',
  standalone: true,
  template: '<div #host class="tv-mini-host"></div>',
  styles: [
    ':host{display:block;height:100%;width:100%}.tv-mini-host{height:100%;width:100%}',
  ],
})
export class TvMiniChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() symbol = 'GPW:WIG';
  /** zakres dat: 1D, 1M, 3M, 12M, 60M, ALL */
  @Input() dateRange = '3M';

  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  private script: HTMLScriptElement | null = null;
  private ready = false;

  ngAfterViewInit(): void {
    this.ready = true;
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.ready && (changes['symbol'] || changes['dateRange'])) {
      this.render();
    }
  }

  private render(): void {
    const container = this.host?.nativeElement;
    if (!container || !this.symbol) return;

    container.innerHTML = '';
    this.script?.remove();

    // Oficjalna struktura osadzania TradingView — dzięki niej autosize poprawnie
    // wypełnia ramkę i wykres nie jest ucinany.
    const wrap = document.createElement('div');
    wrap.className = 'tradingview-widget-container';
    wrap.style.height = '100%';
    wrap.style.width = '100%';

    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    widget.style.height = '100%';
    widget.style.width = '100%';
    wrap.appendChild(widget);

    const config = {
      symbol: this.symbol,
      chartOnly: true,
      dateRange: this.dateRange,
      noTimeScale: true,
      colorTheme: 'dark',
      isTransparent: true,
      autosize: true,
      locale: 'pl',
    };

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    wrap.appendChild(script);

    container.appendChild(wrap);
    this.script = script;
  }

  ngOnDestroy(): void {
    this.script?.remove();
  }
}
