export interface Transaction {
  id: number;
  userId: number;
  accountId: number;
  categoryId?: number;
  budgetId?: number;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  date: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  accountName?: string;
  accountType?: 'card' | 'cash';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  type: 'income' | 'expense';
  amount: number;
  date: string;
  accountId: number;
  categoryId?: number;
  budgetId?: number;
  description?: string;
}
