import { createStore } from 'vuex';

// 是否使用模拟数据
export const USE_MOCK = false;

// 导入模块
import user from './modules/user';
import dashboard from './modules/dashboard';
import product from './modules/product';
import order from './modules/order';
import batch from './modules/batch';
import growthRecord from './modules/growthRecord';

export default createStore({
  state: {
    // token
    token: localStorage.getItem('token') || '',
    // 侧边栏状态
    sidebarCollapse: false,
    // 活跃菜单
    activeMenu: '',
    // 标签页列表（初始为空，登录后自动添加）
    tabsList: []
  },
  getters: {
    // 全局状态
    getToken: state => state.token,
    isSidebarCollapse: state => state.sidebarCollapse,
    getActiveMenu: state => state.activeMenu,
    getTabsList: state => state.tabsList,
    // 用户信息
    getUser: (state, getters) => getters['user/currentUser'],
    // 权限检查（需要从user模块获取当前用户）
    hasPermission: (state, getters) => (permission) => {
      const currentUser = getters['user/currentUser'];
      return currentUser.permissions.includes('all') || currentUser.permissions.includes(permission);
    },
    // 检查用户角色（需要从user模块获取当前用户）
    isRootAdmin: (state, getters) => getters['user/currentUser'].role === '超级管理员',
    isFarmer: (state, getters) => getters['user/currentUser'].role === '农户'
  },
  mutations: {
    // token相关
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem('token', token);
    },
    CLEAR_TOKEN(state) {
      state.token = '';
      localStorage.removeItem('token');
    },
    // 侧边栏
    TOGGLE_SIDEBAR(state) {
      state.sidebarCollapse = !state.sidebarCollapse;
    },
    // 活跃菜单
    SET_ACTIVE_MENU(state, menu) {
      state.activeMenu = menu;
    },
    // 标签页
    ADD_TAB(state, tab) {
      const existingTab = state.tabsList.find(t => t.path === tab.path);
      if (!existingTab) {
        state.tabsList.push(tab);
      }
    },
    REMOVE_TAB(state, tabPath) {
      state.tabsList = state.tabsList.filter(tab => tab.path !== tabPath);
    },
    SET_TABS_LIST(state, tabs) {
      state.tabsList = tabs;
    }
  },
  actions: {
    // 界面相关
    toggleSidebar({ commit }) {
      commit('TOGGLE_SIDEBAR');
    },
    setActiveMenu({ commit }, menu) {
      commit('SET_ACTIVE_MENU', menu);
    },
    addTab({ commit }, tab) {
      commit('ADD_TAB', tab);
    },
    removeTab({ commit }, tabPath) {
      commit('REMOVE_TAB', tabPath);
    }
  },
  // 注册模块
  modules: {
    user,
    dashboard,
    product,
    order,
    batch,
    growthRecord
  }
});