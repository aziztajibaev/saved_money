import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule, InputNumberModule, CardModule, MessageModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <p-card class="w-full max-w-md">
        <ng-template pTemplate="header">
          <div class="text-center p-6">
            <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Finance Tracker</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Ro'yxatdan o'tish</p>
          </div>
        </ng-template>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          @if (errorMessage()) {
            <p-message severity="error" [text]="errorMessage()" styleClass="w-full"></p-message>
          }

          <div class="flex flex-col gap-2">
            <label for="username" class="font-semibold">Foydalanuvchi nomi</label>
            <input pInputText id="username" [(ngModel)]="username" name="username" placeholder="username" class="w-full" required />
          </div>

          <div class="flex flex-col gap-2">
            <label for="email" class="font-semibold">Email</label>
            <input pInputText id="email" [(ngModel)]="email" name="email" type="email" placeholder="email@example.com" class="w-full" required />
          </div>

          <div class="flex flex-col gap-2">
            <label for="password" class="font-semibold">Parol</label>
            <input pInputText id="password" [(ngModel)]="password" name="password" type="password" placeholder="••••••••" class="w-full" required />
          </div>

          <div class="flex flex-col gap-2">
            <label for="initialBalance" class="font-semibold">Boshlang'ich balans (UZS)</label>
            <p-inputNumber [(ngModel)]="initialBalance" name="initialBalance" inputId="initialBalance" mode="decimal" locale="uz-UZ" [minFractionDigits]="0" class="w-full"></p-inputNumber>
          </div>

          <button pButton type="submit" label="Ro'yxatdan o'tish" [loading]="loading()" class="w-full" [disabled]="loading()"></button>
        </form>

        <ng-template pTemplate="footer">
          <div class="text-center">
            <p class="text-gray-600 dark:text-gray-400">
              Hisobingiz bormi? <a routerLink="/auth/login" class="text-blue-600 hover:underline">Kirish</a>
            </p>
          </div>
        </ng-template>
      </p-card>
    </div>
  `
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  email = '';
  password = '';
  initialBalance = 0;
  loading = signal(false);
  errorMessage = signal('');

  onSubmit() {
    if (!this.username || !this.email || !this.password) {
      this.errorMessage.set('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password,
      initialBalance: this.initialBalance
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message || 'Ro\'yxatdan o\'tish xatosi');
      }
    });
  }
}
