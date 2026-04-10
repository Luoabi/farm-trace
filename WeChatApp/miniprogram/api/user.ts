/**
 * 用户相关接口
 */

import { post } from '../utils/request';

export interface RegisterData {
  username: string;
  password: string;
  realName: string;
  phone: string;
  email?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface UserInfo {
  id: string;
  username: string;
  realName: string;
  phone: string;
  role: string;
  email?: string;
  token?: string;
  createTime?: string;
  updateTime?: string;
}

/**
 * 用户注册
 */
export function register(data: RegisterData): Promise<UserInfo> {
  return post('/register', {
    ...data,
    role: 'CUSTOMER' // 小程序用户默认为顾客角色
  });
}

/**
 * 用户登录
 */
export function login(data: LoginData): Promise<UserInfo> {
  return post('/login', data);
}
