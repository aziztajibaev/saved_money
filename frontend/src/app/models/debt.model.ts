export interface Debt {
  id: number;
  userId: number;
  type: 'debt' | 'loan';
  personName: string;
  amount: number;
  remainingAmount: number;
  description?: string;
  dueDate?: string;
  status: 'active' | 'paid' | 'partial';
  totalPaid?: number;
  payments?: DebtPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface DebtPayment {
  id: number;
  debtId: number;
  amount: number;
  paymentDate: string;
  note?: string;
  createdAt: string;
}

export interface CreateDebtRequest {
  type: 'debt' | 'loan';
  personName: string;
  amount: number;
  description?: string;
  dueDate?: string;
}

export interface AddPaymentRequest {
  amount: number;
  paymentDate: string;
  note?: string;
}
