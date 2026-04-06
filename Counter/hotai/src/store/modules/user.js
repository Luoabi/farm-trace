// 用户模块
import { userAPI, mockUserData } from '../../api/modules/user';
import { USE_MOCK } from '../index';

const state = {
  // 用户信息
  info: {
    id: '',
    username: '',
    realName: '',
    role: '',
    phone: '',
    email: '',
    createTime: '',
    updateTime: '',
    organization: '',
    farmInfo: null,
    parentId: null,
    permissions: []
  },
  // 用户列表
  list: [],
  // 用户详情
  detail: {},
  // 总数
  total: 0,
  // 加载状态
  loading: false
};

const getters = {
  // 获取当前用户信息
  currentUser: state => state.info,
  // 获取用户列表
  userList: state => state.list,
  // 获取用户详情
  userDetail: state => state.detail,
  // 获取用户总数
  userTotal: state => state.total,
  // 获取用户加载状态
  isUserLoading: state => state.loading
};

const mutations = {
  // 设置当前用户
  SET_USER(state, userInfo) {
    state.info = userInfo;
  },
  // 设置用户列表
  SET_USER_LIST(state, { list, total }) {
    state.list = list;
    state.total = total;
  },
  // 设置用户详情
  SET_USER_DETAIL(state, userDetail) {
    state.detail = userDetail;
  },
  // 添加用户
  ADD_USER(state, newUser) {
    state.list.push(newUser);
    state.total += 1;
  },
  // 更新用户
  UPDATE_USER(state, updatedUser) {
    const index = state.list.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      state.list[index] = updatedUser;
    }
    if (state.detail.id === updatedUser.id) {
      state.detail = updatedUser;
    }
  },
  // 删除用户
  DELETE_USER(state, userId) {
    state.list = state.list.filter(u => u.id !== userId);
    state.total -= 1;
    if (state.detail.id === userId) {
      state.detail = {};
    }
  },
  // 设置用户加载状态
  SET_USER_LOADING(state, loading) {
    state.loading = loading;
  }
};

const actions = {
  // 登录
  async login({ commit }, { username, password, remember }) {
    try {
      commit('SET_USER_LOADING', true);
      
      let userInfo = null;
      if (USE_MOCK) {
        // 使用模拟数据验证登录
        const user = mockUserData.list.find(u => u.username === username && u.password === password);
        
        if (!user) {
          throw new Error('用户名或密码错误');
        }
        
        if (user.status !== '启用') {
          throw new Error('用户已被禁用');
        }
        
        const token = 'token_' + Date.now();
        commit('SET_TOKEN', token, { root: true });
        
        // 获取完整的用户信息
        const userDetail = user.role === '超级管理员' ? mockUserData.detail : user;
        userInfo = {
          ...userDetail,
          permissions: user.role === '超级管理员' ? ['all'] : 
                      user.role === '农户' ? ['dashboard', 'batch', 'growth', 'product', 'order', 'user'] :
                      ['dashboard', 'batch', 'growth', 'product', 'order']
        };
      } else {
        // 使用真实API登录
        const response = await userAPI.login({ username, password });
        
        console.log('后端登录响应:', response);
        
        // 后端返回格式：{ code: 200, message: "success", data: { id, username, ... } }
        if (response.code === 200 && response.data) {
          const user = response.data;
          
          console.log('后端返回的用户数据:', user);
          
          // 后端使用 userType 字段而不是 role 字段
          const backendRole = user.role || user.userType;
          console.log('后端返回的角色:', backendRole);
          
          // 生成 token（如果后端没有返回，使用临时token）
          const token = user.token || 'token_' + Date.now();
          commit('SET_TOKEN', token, { root: true });
          
          // 映射后端角色到前端角色
          const roleMap = {
            'SUPER_ADMIN': '超级管理员',
            'FARMER': '农户',
            'OPERATOR': '操作员'
          };
          
          // 映射后端状态到前端状态
          const statusMap = {
            'ACTIVE': '启用',
            'INACTIVE': '禁用',
            '1': '启用',
            '0': '禁用'
          };
          
          // 映射角色
          const mappedRole = roleMap[backendRole] || backendRole;
          console.log('映射后的角色:', mappedRole);
          
          // 构建用户信息
          userInfo = {
            id: user.id,
            username: user.username,
            realName: user.realName || user.username,
            role: mappedRole,  // 使用映射后的角色
            phone: user.phone || '',
            email: user.email || '',
            createTime: user.createTime || '',
            updateTime: user.updateTime || '',
            organization: user.organization || '',
            farmInfo: user.farmInfo || null,
            parentId: user.parentId || null,
            status: statusMap[user.status] || user.status || '启用',
            permissions: backendRole === 'SUPER_ADMIN' ? ['all'] : 
                        backendRole === 'FARMER' ? ['dashboard', 'batch', 'growth', 'product', 'order', 'user'] :
                        ['dashboard', 'batch', 'growth', 'product', 'order']
          };
          
          console.log('构建的用户信息:', userInfo);
        } else {
          throw new Error(response.message || '登录失败');
        }
      }
      
      commit('SET_USER', userInfo);
      // 保存用户信息到localStorage，用于路由守卫的权限验证
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      console.log('=== 登录成功 ===');
      console.log('保存的用户信息:', userInfo);
      console.log('用户角色:', userInfo.role);
      console.log('用户权限:', userInfo.permissions);
      
      // 如果用户选择记住用户名，保存到localStorage
      if (remember) {
        localStorage.setItem('rememberUsername', 'true');
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberUsername');
        localStorage.removeItem('rememberedUsername');
      }
      
      return { success: true };
    } catch (error) {
      console.error('登录错误:', error);
      throw new Error(error.message || '登录失败');
    } finally {
      commit('SET_USER_LOADING', false);
    }
  },
  
  // 注册
  async register({ commit, state }, userData) {
    try {
      commit('SET_USER_LOADING', true);
      
      let newUser = null;
      if (USE_MOCK) {
        // 检查用户名是否已存在
        const existingUser = mockUserData.list.find(u => u.username === userData.username);
        if (existingUser) {
          throw new Error('用户名已存在');
        }
        
        // 创建新用户
        newUser = {
          ...userData,
          id: 'user' + Date.now(),
          status: '启用',
          createTime: new Date().toLocaleString('zh-CN'),
          lastLoginTime: '',
          parentId: state.info.role === '农户' ? state.info.id : 'user000' // 农户创建的用户归属于该农户
        };
        
        mockUserData.list.push(newUser);
      } else {
        // 使用真实API注册
        // 构建注册数据，映射前端字段到后端字段
        const registerData = {
          username: userData.username,
          password: userData.password,
          realName: userData.realName || userData.username,
          email: userData.email || '',
          phone: userData.phone,
          role: 'FARMER', // 默认注册为农户
          organization: userData.organization || userData.farmName,
          farmName: userData.farmName,
          farmAddress: userData.farmLocation || userData.farmAddress,
          parentId: userData.parentId || null
        };
        
        const response = await userAPI.register(registerData);
        
        // 后端返回格式：{ code: 200, message: "success", data: { id, username, ... } }
        if (response.code === 200 && response.data) {
          newUser = response.data;
        } else {
          throw new Error(response.message || '注册失败');
        }
      }
      
      commit('ADD_USER', newUser);
      return { success: true, data: newUser };
    } catch (error) {
      console.error('注册错误:', error);
      throw new Error(error.message || '注册失败');
    } finally {
      commit('SET_USER_LOADING', false);
    }
  },
  
  // 登出
  logout({ commit }) {
    console.log('=== 执行登出操作 ===');
    
    // 清除 token
    console.log('清除 token');
    commit('CLEAR_TOKEN', null, { root: true });
    
    // 重置用户信息
    console.log('重置用户信息');
    commit('SET_USER', {
      id: '',
      username: '',
      realName: '',
      role: '',
      phone: '',
      email: '',
      createTime: '',
      updateTime: '',
      organization: '',
      farmInfo: null,
      parentId: null,
      permissions: []
    });
    
    // 清空标签页列表
    console.log('清空标签页列表');
    commit('SET_TABS_LIST', [], { root: true });
    
    // 清除 localStorage 中的用户信息
    console.log('清除 localStorage');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    
    // 注意：不清除 rememberedUsername，保留"记住我"功能
    console.log('登出操作完成');
  },
  
  // 获取用户列表
  async getUserList({ commit }, params) {
    try {
      commit('SET_USER_LOADING', true);
      
      let userList = [];
      let total = 0;
      
      if (USE_MOCK) {
        // 使用模拟数据
        userList = mockUserData.list;
        total = userList.length;
      } else {
        // 使用真实API
        const response = await userAPI.getUserList(params);
        userList = response.data.list;
        total = response.data.total;
      }
      
      commit('SET_USER_LIST', { list: userList, total });
      return { success: true, data: userList, total };
    } catch (error) {
      throw new Error(error.message || '获取用户列表失败');
    } finally {
      commit('SET_USER_LOADING', false);
    }
  },
  
  // 获取用户详情
  async getUserDetail({ commit }, id) {
    try {
      commit('SET_USER_LOADING', true);
      
      let userDetail = {};
      
      if (USE_MOCK) {
        // 使用模拟数据
        userDetail = mockUserData.detail;
      } else {
        // 使用真实API
        const response = await userAPI.getUserDetail(id);
        userDetail = response.data;
      }
      
      commit('SET_USER_DETAIL', userDetail);
      return { success: true, data: userDetail };
    } catch (error) {
      throw new Error(error.message || '获取用户详情失败');
    } finally {
      commit('SET_USER_LOADING', false);
    }
  },
  
  // 更新用户
  async updateUser({ commit }, { id, data }) {
    try {
      commit('SET_USER_LOADING', true);
      
      let updatedUser = {};
      
      if (USE_MOCK) {
        // 使用模拟数据
        const index = mockUserData.list.findIndex(u => u.id === id);
        if (index !== -1) {
          updatedUser = { ...mockUserData.list[index], ...data };
          mockUserData.list[index] = updatedUser;
        }
      } else {
        // 使用真实API
        const response = await userAPI.updateUser(id, data);
        updatedUser = response.data;
      }
      
      commit('UPDATE_USER', updatedUser);
      return { success: true, data: updatedUser };
    } catch (error) {
      throw new Error(error.message || '更新用户失败');
    } finally {
      commit('SET_USER_LOADING', false);
    }
  },
  
  // 删除用户
  async deleteUser({ commit }, id) {
    try {
      commit('SET_USER_LOADING', true);
      
      if (USE_MOCK) {
        // 使用模拟数据
        mockUserData.list = mockUserData.list.filter(u => u.id !== id);
      } else {
        // 使用真实API
        await userAPI.deleteUser(id);
      }
      
      commit('DELETE_USER', id);
      return { success: true };
    } catch (error) {
      throw new Error(error.message || '删除用户失败');
    } finally {
      commit('SET_USER_LOADING', false);
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
