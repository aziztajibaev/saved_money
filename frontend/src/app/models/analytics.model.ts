import { Account } from './account.model';
import { Budget } from './budget.model';
import { Transaction } from './transaction.model';

export interface DashboardData {
  currentBalance: number;
  initialBalance: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  categoryData: CategoryData[];
  accounts: Account[];
  budgets: Budget[];
  recentTransactions: Transaction[];
  debts: {
    totalDebts: number;
    totalLoans: number;
  };
}

export interface CategoryData {
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  total: number;
  percentage?: number;
  transactionCount?: number;
}

export interface TrendData {
  period: string;
  income: number;
  expense: number;
  savings: number;
}

export interface MonthlyReport {
  period: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  categories: CategoryData[];
  dailyData: {
    date: string;
    income: number;
    expense: number;
  }[];
}
