/**
 * 登录状态管理
 */

import { TOKEN_KEY, USER_INFO_KEY } from './config';

export interface UserInfo {
  id: string;
  username: string;
  realName: string;
  phone: string;
  role: string;
  email?: string;
  avatar?: string;
  token?: string;
}

/**
 * 检查是否已登录
 */
export function checkLogin(): boolean {
  const userInfo = wx.getStorageSync(USER_INFO_KEY);
  // 只要有用户信息就认为已登录（暂时不检查 token）
  return !!userInfo;
}

/**
 * 检查是否已登录（别名）
 */
export function isLoggedIn(): boolean {
  return checkLogin();
}

/**
 * 要求登录（未登录则跳转到登录页）
 */
export function requireLogin(): boolean {
  if (!checkLogin()) {
    wx.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 2000
    });
    setTimeout(() => {
      wx.redirectTo({ url: '/pages/login/login' });
    }, 2000);
    return false;
  }
  return true;
}

/**
 * 获取 Token
 */
export function getToken(): string | null {
  try {
    return wx.getStorageSync(TOKEN_KEY) || null;
  } catch (error) {
    console.error('获取 Token 失败:', error);
    return null;
  }
}

/**
 * 获取用户信息
 */
export function getUserInfo(): UserInfo | null {
  try {
    const userInfoStr = wx.getStorageSync(USER_INFO_KEY);
    if (!userInfoStr) return null;
    
    // 如果已经是对象，直接返回
    if (typeof userInfoStr === 'object') {
      return userInfoStr as UserInfo;
    }
    
    // 如果是字符串，解析后返回
    return JSON.parse(userInfoStr);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

/**
 * 保存用户信息
 */
export function saveUserInfo(data: any): void {
  try {
    console.log('开始保存用户信息，原始数据:', data);
    
    // 处理后端返回的数据结构
    let userInfo: any;
    let token: string | undefined;
    
    // 情况1: { code: 200, data: { id, username, ... } }
    if (data.code !== undefined && data.data) {
      userInfo = data.data;
      token = data.data.token;
    }
    // 情况2: { id, username, userType, ... } 直接返回用户信息
    else if (data.id && data.username) {
      userInfo = data;
      token = data.token;
    }
    // 情况3: { user: {...}, token: '...' }
    else if (data.user) {
      userInfo = data.user;
      token = data.token;
    }
    // 其他情况
    else {
      userInfo = data;
      token = data.token;
    }
    
    // 保存 token（如果有）
    if (token) {
      wx.setStorageSync(TOKEN_KEY, token);
      console.log('Token 已保存');
    } else {
      console.warn('警告：后端未返回 token，使用用户ID作为临时标识');
      // 如果没有 token，使用用户ID作为临时标识
      if (userInfo.id) {
        wx.setStorageSync(TOKEN_KEY, `temp_${userInfo.id}`);
      }
    }
    
    // 保存用户信息
    wx.setStorageSync(USER_INFO_KEY, JSON.stringify(userInfo));
    
    console.log('用户信息保存成功:', userInfo);
    console.log('Storage 中的数据:', {
      token: wx.getStorageSync(TOKEN_KEY),
      userInfo: wx.getStorageSync(USER_INFO_KEY)
    });
  } catch (error) {
    console.error('保存用户信息失败:', error);
    throw error;
  }
}

/**
 * 清除用户信息（退出登录）
 */
export function clearUserInfo(): void {
  try {
    wx.removeStorageSync(TOKEN_KEY);
    wx.removeStorageSync(USER_INFO_KEY);
  } catch (error) {
    console.error('清除用户信息失败:', error);
  }
}

/**
 * 退出登录
 */
export function logout(): void {
  wx.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        clearUserInfo();
        wx.showToast({
          title: '已退出登录',
          icon: 'success',
          duration: 2000
        });
        setTimeout(() => {
          wx.reLaunch({ url: '/pages/login/login' });
        }, 2000);
      }
    }
  });
}

/**
 * 获取用户 ID
 */
export function getUserId(): string | null {
  const userInfo = getUserInfo();
  return userInfo ? userInfo.id : null;
}

/**
 * 获取用户角色
 */
export function getUserRole(): string | null {
  const userInfo = getUserInfo();
  return userInfo ? userInfo.role : null;
}

/**
 * 判断是否是顾客角色
 */
export function isCustomer(): boolean {
  const role = getUserRole();
  return role === 'CUSTOMER';
}
