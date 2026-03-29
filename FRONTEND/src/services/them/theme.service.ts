import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private themeKey = 'app-theme';

  constructor() {
    this.loadTheme();
  }

  setTheme(theme: 'light' | 'dark' | 'marron'): void {
    document.body.classList.remove('light-mode', 'dark-mode', 'marron-mode');
    document.body.classList.add(`${theme}-mode`);
    localStorage.setItem(this.themeKey, theme);
  }

  toggleDarkMode(): void {
    const currentTheme = localStorage.getItem(this.themeKey);
    this.setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  toggleMarronMode(): void {
    const currentTheme = localStorage.getItem(this.themeKey);
    this.setTheme(currentTheme === 'marron' ? 'light' : 'marron');
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.themeKey) || 'light';
    this.setTheme(savedTheme as 'light' | 'dark' | 'marron');
  }
}
