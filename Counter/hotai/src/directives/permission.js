/**
 * 权限指令
 * 用法：
 * v-permission="['超级管理员', '农户']"  // 角色权限
 * v-permission:role="'超级管理员'"       // 单个角色
 */

import { hasRole, hasPermission } from '../utils/permission';

export default {
  mounted(el, binding) {
    const { value, arg } = binding;
    
    if (!value) {
      return;
    }
    
    let hasAuth = false;
    
    // 根据参数类型判断是角色还是权限
    if (arg === 'role') {
      hasAuth = hasRole(value);
    } else if (arg === 'permission') {
      hasAuth = hasPermission(value);
    } else {
      // 默认检查角色
      hasAuth = hasRole(value);
    }
    
    // 如果没有权限，移除元素
    if (!hasAuth) {
      el.parentNode && el.parentNode.removeChild(el);
    }
  }
};
