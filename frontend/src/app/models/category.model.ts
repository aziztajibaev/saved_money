export interface Category {
  id: number;
  userId: number;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}
