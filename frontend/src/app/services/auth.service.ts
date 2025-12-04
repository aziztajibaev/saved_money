import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      this.currentUser.set(JSON.parse(userData));
      this.isAuthenticated.set(true);
    }
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/register', data).pipe(
      tap(response => {
        if (response.success) {
          this.handleAuthSuccess(response);
        }
      })
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', data).pipe(
      tap(response => {
        if (response.success) {
          this.handleAuthSuccess(response);
        }
      })
    );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
      id: response.data.userId,
      username: response.data.username,
      email: response.data.email,
      currentBalance: response.data.currentBalance
    }));

    this.currentUser.set({
      id: response.data.userId,
      username: response.data.username,
      email: response.data.email,
      currentBalance: response.data.currentBalance || 0,
      initialBalance: 0,
      createdAt: new Date().toISOString()
    });

    this.isAuthenticated.set(true);
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  getProfile(): Observable<{ success: boolean; data: User }> {
    return this.apiService.get<{ success: boolean; data: User }>('/auth/profile').pipe(
      tap(response => {
        if (response.success) {
          this.currentUser.set(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      })
    );
  }
}
