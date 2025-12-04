export interface Account {
  id: number;
  userId: number;
  name: string;
  type: 'card' | 'cash';
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transfer {
  id: number;
  userId: number;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
  date: string;
  fromAccountName?: string;
  fromAccountType?: string;
  toAccountName?: string;
  toAccountType?: string;
  createdAt: string;
}

export interface CreateTransferRequest {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  date: string;
  description?: string;
}
