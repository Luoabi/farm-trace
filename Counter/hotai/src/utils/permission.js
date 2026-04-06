/**
 * 权限工具函数
 */

import store from '../store';

/**
 * 检查用户是否有指定角色
 * @param {string|Array} roles - 角色或角色数组
 * @returns {boolean}
 */
export function hasRole(roles) {
  const userInfo = store.state.user.info;
  if (!userInfo || !userInfo.role) {
    return false;
  }
  
  if (Array.isArray(roles)) {
    return roles.includes(userInfo.role);
  }
  
  return userInfo.role === roles;
}

/**
 * 检查用户是否有指定权限
 * @param {string|Array} permissions - 权限或权限数组
 * @returns {boolean}
 */
export function hasPermission(permissions) {
  const userInfo = store.state.user.info;
  if (!userInfo || !userInfo.permissions) {
    return false;
  }
  
  // 超级管理员拥有所有权限
  if (userInfo.permissions.includes('all')) {
    return true;
  }
  
  if (Array.isArray(permissions)) {
    return permissions.some(permission => userInfo.permissions.includes(permission));
  }
  
  return userInfo.permissions.includes(permissions);
}

/**
 * 检查是否是超级管理员
 * @returns {boolean}
 */
export function isSuperAdmin() {
  return hasRole('超级管理员');
}

/**
 * 检查是否是农户
 * @returns {boolean}
 */
export function isFarmer() {
  return hasRole('农户');
}

/**
 * 检查是否是操作员
 * @returns {boolean}
 */
export function isOperator() {
  return hasRole('操作员');
}

/**
 * 获取当前用户信息
 * @returns {Object}
 */
export function getCurrentUser() {
  return store.state.user.info;
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
export function isLoggedIn() {
  const token = store.state.token || localStorage.getItem('token');
  return !!token;
}
