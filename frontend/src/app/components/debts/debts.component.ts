import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-debts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Qarzlar va Qarzdorlar</h1>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p class="text-gray-600 dark:text-gray-400">
            Bu yerda qarz va qarzdorlaringizni kuzatishingiz mumkin.
          </p>
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            Debt management component - Track debts and loans with payment history
          </p>
        </div>
      </div>
    </div>
  `
})
export class DebtsComponent {}
