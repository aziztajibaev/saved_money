import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Transaction, CreateTransactionRequest } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiService = inject(ApiService);

  getTransactions(params?: any): Observable<{ success: boolean; data: Transaction[]; count: number }> {
    return this.apiService.get('/transactions', params);
  }

  getTransactionById(id: number): Observable<{ success: boolean; data: Transaction }> {
    return this.apiService.get(`/transactions/${id}`);
  }

  createTransaction(data: CreateTransactionRequest): Observable<{ success: boolean; message: string; data: Transaction }> {
    return this.apiService.post('/transactions', data);
  }

  updateTransaction(id: number, data: Partial<CreateTransactionRequest>): Observable<{ success: boolean; message: string }> {
    return this.apiService.put(`/transactions/${id}`, data);
  }

  deleteTransaction(id: number): Observable<{ success: boolean; message: string }> {
    return this.apiService.delete(`/transactions/${id}`);
  }
}
