import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Budgetlar</h1>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p class="text-gray-600 dark:text-gray-400">
            Bu yerda oylik va kunlik budgetlaringizni boshqarishingiz mumkin.
          </p>
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            Budget management component - Create and track budgets with alerts
          </p>
        </div>
      </div>
    </div>
  `
})
export class BudgetsComponent {}
