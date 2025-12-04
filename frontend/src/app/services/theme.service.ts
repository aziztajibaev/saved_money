import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal<boolean>(false);

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.enableDarkMode();
    } else if (savedTheme === 'light') {
      this.disableDarkMode();
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        this.enableDarkMode();
      }
    }
  }

  toggleTheme(): void {
    if (this.isDarkMode()) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }

  private enableDarkMode(): void {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    this.isDarkMode.set(true);
  }

  private disableDarkMode(): void {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    this.isDarkMode.set(false);
  }
}
