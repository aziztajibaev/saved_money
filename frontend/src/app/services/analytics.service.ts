import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardData, TrendData, CategoryData, MonthlyReport } from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiService = inject(ApiService);

  getDashboard(params?: { startDate?: string; endDate?: string }): Observable<{ success: boolean; data: DashboardData }> {
    return this.apiService.get('/analytics/dashboard', params);
  }

  getTrends(params?: { startDate?: string; endDate?: string; groupBy?: 'day' | 'month' | 'year' }): Observable<{ success: boolean; data: TrendData[] }> {
    return this.apiService.get('/analytics/trends', params);
  }

  getCategoryBreakdown(params?: { type?: 'income' | 'expense'; startDate?: string; endDate?: string }): Observable<{ success: boolean; data: { categories: CategoryData[]; total: number } }> {
    return this.apiService.get('/analytics/category-breakdown', params);
  }

  getMonthlyReport(year: number, month: number): Observable<{ success: boolean; data: MonthlyReport }> {
    return this.apiService.get('/analytics/monthly-report', { year, month });
  }
}
