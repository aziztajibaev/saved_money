import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Category, CreateCategoryRequest } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiService = inject(ApiService);

  getCategories(type?: 'income' | 'expense'): Observable<{ success: boolean; data: Category[] }> {
    const params = type ? { type } : undefined;
    return this.apiService.get('/categories', params);
  }

  createCategory(data: CreateCategoryRequest): Observable<{ success: boolean; message: string; data: Category }> {
    return this.apiService.post('/categories', data);
  }

  updateCategory(id: number, data: Partial<CreateCategoryRequest>): Observable<{ success: boolean; message: string }> {
    return this.apiService.put(`/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<{ success: boolean; message: string }> {
    return this.apiService.delete(`/categories/${id}`);
  }
}
