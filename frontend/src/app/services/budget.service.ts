import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Budget, CreateBudgetRequest } from '../models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiService = inject(ApiService);

  getBudgets(params?: any): Observable<{ success: boolean; data: Budget[] }> {
    return this.apiService.get('/budgets', params);
  }

  getBudgetById(id: number): Observable<{ success: boolean; data: Budget }> {
    return this.apiService.get(`/budgets/${id}`);
  }

  createBudget(data: CreateBudgetRequest): Observable<{ success: boolean; message: string; data: Budget }> {
    return this.apiService.post('/budgets', data);
  }

  updateBudget(id: number, data: Partial<CreateBudgetRequest>): Observable<{ success: boolean; message: string }> {
    return this.apiService.put(`/budgets/${id}`, data);
  }

  deleteBudget(id: number): Observable<{ success: boolean; message: string }> {
    return this.apiService.delete(`/budgets/${id}`);
  }
}
