/**
 * 用户管理模块 - 权限控制实现
 * 
 * 本模块实现了基于角色和层级关系的用户权限控制系统
 * 角色层级：超级管理员 > 农户（农场主） > 操作员
 * 主要功能：
 * 1. 用户API接口定义
 * 2. 基于角色的数据权限过滤
 * 3. 用户层级关系管理（超级管理员管理农户，农户管理操作员）
 * 4. 数据访问权限验证
 */

import request from '../request';

// 用户API接口
/**
 * 用户管理API
 * 提供用户CRUD操作的接口定义
 * 实际权限验证在请求拦截器和后端服务中实现
 */
export const userAPI = {
  // 登录
  login(data) {
    return request({
      url: '/login',
      method: 'post',
      data
    })
  },

  // 注册
  register(data) {
    return request({
      url: '/register',
      method: 'post',
      data
    });
  },
  // 获取所有用户
  getUserList(params) {
    return request({
      url: '/user/all/list',
      method: 'post',
      data: params
    });
  },
  // 获取农户列表
  getFarmerList(params) {
    return request({
      url: '/user/f/list',
      method: 'post',
      data: params
    });
  },

  // 获取操作员列表
  getOperatorList(params) {
    return request({
      url: '/user/o/list',
      method: 'post',
      data: params
    });
  },

  // 获取用户详情
  getUserDetail(id) {
    return request({
      url: `/user/detail/${id}`,
      method: 'get'
    });
  },

  // 创建用户
  createUser(data) {
    return request({
      url: '/user/create',
      method: 'post',
      data
    });
  },

  // 更新用户
  updateUser(id, data) {
    return request({
      url: `/user/update/${id}`,
      method: 'put',
      data
    });
  },

  // 删除用户
  deleteUser(id) {
    return request({
      url: `/user/delete/${id}`,
      method: 'delete'
    });
  },

  // 批量删除用户
  batchDeleteUsers(ids) {
    return request({
      url: '/user/batch-delete',
      method: 'post',
      data: ids
    });
  },

  // 更改用户状态
  changeUserStatus(id, status) {
    return request({
      url: `/user/change-status/${id}/${status}`,
      method: 'put'
    });
  },

  // 重置密码
  resetPassword(id, data) {
    return request({
      url: `/user/reset-password/${id}`,
      method: 'put',
      data
    });
  },

  // 更新用户角色
  updateUserRole(id, data) {
    return request({
      url: `/user/update-role/${id}`,
      method: 'put',
      data
    });
  }
};

// 模拟数据
export const mockUserData = {
 
};

/**
 * 获取带有权限控制的用户列表
 * 权限过滤规则：
 * 1. 超级管理员可以查看所有用户
 * 2. 农户（农场主）可以查看自己和自己创建的操作员
 * 3. 操作员只能查看自己的信息
 * 
 * @param {string} currentUserId - 当前登录用户ID
 * @returns {Array} 有权限访问的用户列表
 */
export const getUserListWithPermission = (currentUserId) => {
  const currentUser = mockUserData.list.find(user => user.id === currentUserId);

  if (!currentUser) return [];

  // 超级管理员可以查看所有用户
  if (currentUser.role === '超级管理员') {
    return mockUserData.list;
  }

  // 农户（农场主）可以查看自己和自己创建的操作员
  if (currentUser.role === '农户') {
    return mockUserData.list.filter(user =>
      user.id === currentUserId || // 自己
      (user.parentId === currentUserId && user.role === '操作员') // 自己创建的操作员
    );
  }

  // 操作员只能查看自己
  if (currentUser.role === '操作员') {
    return mockUserData.list.filter(user => user.id === currentUserId);
  }

  // 默认返回空数组（应该不会执行到这里）
  return [];
};

/**
 * 获取带有权限控制的用户详情
 * 权限过滤规则：
 * 1. 超级管理员可以查看所有用户详情
 * 2. 农户（农场主）可以查看自己和自己创建的操作员详情
 * 3. 操作员只能查看自己的详情
 * 
 * @param {string} userId - 要查询的用户ID
 * @param {string} currentUserId - 当前登录用户ID
 * @returns {Object|null} 有权限访问的用户详情或null
 */
export const getUserDetailWithPermission = (userId, currentUserId) => {
  const currentUser = mockUserData.list.find(user => user.id === currentUserId);
  const targetUser = mockUserData.list.find(user => user.id === userId);

  if (!currentUser || !targetUser) return null;

  // 超级管理员可以查看所有用户详情
  if (currentUser.role === '超级管理员') {
    return targetUser;
  }

  // 农户（农场主）可以查看自己和自己创建的操作员详情
  if (currentUser.role === '农户') {
    if (targetUser.id === currentUserId ||
      (targetUser.parentId === currentUserId && targetUser.role === '操作员')) {
      return targetUser;
    }
    return null;
  }

  // 操作员只能查看自己的详情
  if (currentUser.role === '操作员') {
    return targetUser.id === currentUserId ? targetUser : null;
  }

  // 默认返回null
  return null;
};

/**
 * 获取用户层级关系
 * 构建用户组织结构树，用于权限检查和数据隔离
 * 
 * @param {string} userId - 用户ID
 * @returns {Object} 用户层级信息，包含父用户和子用户
 */
export const getUserHierarchy = (userId) => {
  const user = mockUserData.list.find(u => u.id === userId);
  if (!user) return null;

  // 构建用户层级对象
  const hierarchy = {
    user,
    subordinates: []
  };

  // 查找直接下属（操作员）
  const directSubordinates = mockUserData.list.filter(
    u => u.parentId === userId && u.role === '操作员'
  );

  // 递归获取下属的层级关系
  hierarchy.subordinates = directSubordinates.map(sub => getUserHierarchy(sub.id));

  return hierarchy;
};

/**
 * 检查用户是否可以管理指定用户
 * 权限判断规则：
 * 1. 超级管理员可以管理所有农户（农场主）和操作员
 * 2. 农户（农场主）可以管理该农场的操作员
 * 3. 操作员没有管理其他用户的权限
 * 
 * @param {string} currentUserId - 当前用户ID
 * @param {string} targetUserId - 目标用户ID
 * @returns {boolean} 是否有权限管理
 */
export const canManageUser = (currentUserId, targetUserId) => {
  const currentUser = mockUserData.list.find(u => u.id === currentUserId);
  const targetUser = mockUserData.list.find(u => u.id === targetUserId);

  if (!currentUser || !targetUser) return false;

  // 超级管理员可以管理所有用户（除了自己）
  if (currentUser.role === '超级管理员') {
    // 超级管理员不能管理自己
    return currentUserId !== targetUserId;
  }

  // 农户（农场主）可以管理自己创建的操作员
  if (currentUser.role === '农户') {
    return targetUser.parentId === currentUserId && targetUser.role === '操作员';
  }

  // 操作员没有管理其他用户的权限
  if (currentUser.role === '操作员') {
    return false;
  }

  // 默认返回false
  return false;
};