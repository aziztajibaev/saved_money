import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Debt, CreateDebtRequest, AddPaymentRequest } from '../models/debt.model';

@Injectable({
  providedIn: 'root'
})
export class DebtService {
  private apiService = inject(ApiService);

  getDebts(params?: any): Observable<{ success: boolean; data: Debt[] }> {
    return this.apiService.get('/debts', params);
  }

  getDebtById(id: number): Observable<{ success: boolean; data: Debt }> {
    return this.apiService.get(`/debts/${id}`);
  }

  createDebt(data: CreateDebtRequest): Observable<{ success: boolean; message: string; data: Debt }> {
    return this.apiService.post('/debts', data);
  }

  addPayment(debtId: number, data: AddPaymentRequest): Observable<{ success: boolean; message: string }> {
    return this.apiService.post(`/debts/${debtId}/payments`, data);
  }

  updateDebt(id: number, data: Partial<CreateDebtRequest>): Observable<{ success: boolean; message: string }> {
    return this.apiService.put(`/debts/${id}`, data);
  }

  deleteDebt(id: number): Observable<{ success: boolean; message: string }> {
    return this.apiService.delete(`/debts/${id}`);
  }
}
