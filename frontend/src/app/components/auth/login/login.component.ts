import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule, CardModule, MessageModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <p-card class="w-full max-w-md">
        <ng-template pTemplate="header">
          <div class="text-center p-6">
            <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Finance Tracker</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Kirish</p>
          </div>
        </ng-template>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          @if (errorMessage()) {
            <p-message severity="error" [text]="errorMessage()" styleClass="w-full"></p-message>
          }

          <div class="flex flex-col gap-2">
            <label for="email" class="font-semibold">Email</label>
            <input pInputText id="email" [(ngModel)]="email" name="email" type="email" placeholder="email@example.com" class="w-full" required />
          </div>

          <div class="flex flex-col gap-2">
            <label for="password" class="font-semibold">Parol</label>
            <input pInputText id="password" [(ngModel)]="password" name="password" type="password" placeholder="••••••••" class="w-full" required />
          </div>

          <button pButton type="submit" label="Kirish" [loading]="loading()" class="w-full" [disabled]="loading()"></button>
        </form>

        <ng-template pTemplate="footer">
          <div class="text-center">
            <p class="text-gray-600 dark:text-gray-400">
              Hisobingiz yo'qmi? <a routerLink="/auth/register" class="text-blue-600 hover:underline">Ro'yxatdan o'tish</a>
            </p>
          </div>
        </ng-template>
      </p-card>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message || 'Kirish xatosi');
      }
    });
  }
}
