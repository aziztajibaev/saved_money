export interface User {
  id: number;
  username: string;
  email: string;
  initialBalance: number;
  currentBalance: number;
  createdAt: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  initialBalance?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    userId: number;
    username: string;
    email: string;
    currentBalance?: number;
    token: string;
  };
}
