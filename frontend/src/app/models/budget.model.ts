export interface Budget {
  id: number;
  userId: number;
  categoryId?: number;
  name: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  alertThreshold: number;
  spent?: number;
  percentage?: number;
  remaining?: number;
  isOverBudget?: boolean;
  isNearLimit?: boolean;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetRequest {
  name: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  categoryId?: number;
  alertThreshold?: number;
}
