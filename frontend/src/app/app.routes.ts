import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'transactions',
    canActivate: [authGuard],
    loadComponent: () => import('./components/transactions/transactions.component').then(m => m.TransactionsComponent)
  },
  {
    path: 'budgets',
    canActivate: [authGuard],
    loadComponent: () => import('./components/budgets/budgets.component').then(m => m.BudgetsComponent)
  },
  {
    path: 'debts',
    canActivate: [authGuard],
    loadComponent: () => import('./components/debts/debts.component').then(m => m.DebtsComponent)
  },
  {
    path: 'accounts',
    canActivate: [authGuard],
    loadComponent: () => import('./components/accounts/accounts.component').then(m => m.AccountsComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
