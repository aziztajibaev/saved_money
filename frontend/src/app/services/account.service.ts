import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Account, Transfer, CreateTransferRequest } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiService = inject(ApiService);

  getAccounts(): Observable<{ success: boolean; data: Account[] }> {
    return this.apiService.get('/accounts');
  }

  createAccount(data: { name: string; type: 'card' | 'cash'; balance?: number }): Observable<{ success: boolean; message: string; data: Account }> {
    return this.apiService.post('/accounts', data);
  }

  updateAccount(id: number, data: { name: string }): Observable<{ success: boolean; message: string }> {
    return this.apiService.put(`/accounts/${id}`, data);
  }

  deleteAccount(id: number): Observable<{ success: boolean; message: string }> {
    return this.apiService.delete(`/accounts/${id}`);
  }

  getTransfers(params?: any): Observable<{ success: boolean; data: Transfer[]; count: number }> {
    return this.apiService.get('/transfers', params);
  }

  createTransfer(data: CreateTransferRequest): Observable<{ success: boolean; message: string; data: Transfer }> {
    return this.apiService.post('/transfers', data);
  }

  deleteTransfer(id: number): Observable<{ success: boolean; message: string }> {
    return this.apiService.delete(`/transfers/${id}`);
  }
}
