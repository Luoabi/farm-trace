// 用户相关类型定义

export interface User {
  id: string;
  username: string;
  realName: string;
  phone: string;
  role: 'CUSTOMER' | 'FARMER' | 'SUPER_ADMIN';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  realName: string;
  phone: string;
  role: 'CUSTOMER';
}

export interface LoginResponse {
  token: string;
  user: User;
}
