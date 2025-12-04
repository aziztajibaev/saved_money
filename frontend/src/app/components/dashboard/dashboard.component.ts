import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p class="text-sm text-gray-600 dark:text-gray-400">Joriy Balans</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">0 UZS</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p class="text-sm text-gray-600 dark:text-gray-400">Kirim</p>
            <p class="text-2xl font-bold text-green-600 mt-2">+0 UZS</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p class="text-sm text-gray-600 dark:text-gray-400">Chiqim</p>
            <p class="text-2xl font-bold text-red-600 mt-2">-0 UZS</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p class="text-sm text-gray-600 dark:text-gray-400">Jamg'arma</p>
            <p class="text-2xl font-bold text-blue-600 mt-2">0 UZS</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
          <div class="flex gap-4">
            <a routerLink="/transactions" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Tranzaksiya qo'shish
            </a>
            <a routerLink="/budgets" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
              Budget yaratish
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {}
