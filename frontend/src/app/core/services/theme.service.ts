import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSignal = signal<Theme>(this.getStoredTheme());

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = () => this.themeSignal() === 'dark';

  constructor() {
    effect(() => {
      const theme = this.themeSignal();
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(`${theme}-theme`);
      localStorage.setItem('cirquetask-theme', theme);
    });
  }

  toggleTheme(): void {
    this.themeSignal.update(t => t === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
  }

  private getStoredTheme(): Theme {
    const stored = localStorage.getItem('cirquetask-theme') as Theme;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
