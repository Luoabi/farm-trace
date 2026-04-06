// 订单模块
import { orderAPI, mockOrderData } from '../../api/modules/order';
import { USE_MOCK } from '../index';

const state = {
  // 订单列表
  list: [],
  // 订单详情
  detail: {},
  // 总数
  total: 0,
  // 加载状态
  loading: false
};

const getters = {
  // 获取订单列表
  orderList: state => state.list,
  // 获取订单详情
  orderDetail: state => state.detail,
  // 获取订单总数
  orderTotal: state => state.total,
  // 获取加载状态
  isOrderLoading: state => state.loading
};

const mutations = {
  // 设置订单列表
  SET_ORDER_LIST(state, { list, total }) {
    state.list = list;
    state.total = total;
  },
  // 设置订单详情
  SET_ORDER_DETAIL(state, orderDetail) {
    state.detail = orderDetail;
  },
  // 添加订单
  ADD_ORDER(state, newOrder) {
    state.list.push(newOrder);
    state.total += 1;
  },
  // 更新订单
  UPDATE_ORDER(state, updatedOrder) {
    const index = state.list.findIndex(o => o.id === updatedOrder.id);
    if (index !== -1) {
      state.list[index] = updatedOrder;
    }
    if (state.detail.id === updatedOrder.id) {
      state.detail = updatedOrder;
    }
  },
  // 删除订单
  DELETE_ORDER(state, orderId) {
    state.list = state.list.filter(o => o.id !== orderId);
    state.total -= 1;
    if (state.detail.id === orderId) {
      state.detail = {};
    }
  },
  // 设置加载状态
  SET_ORDER_LOADING(state, loading) {
    state.loading = loading;
  }
};

const actions = {
  // 获取订单列表
  async getOrderList({ commit }, params) {
    try {
      commit('SET_ORDER_LOADING', true);
      
      let orderList = [];
      let total = 0;
      
      if (USE_MOCK) {
        // 使用模拟数据
        orderList = mockOrderData.list;
        total = orderList.length;
      } else {
        // 使用真实API
        const response = await orderAPI.getOrderList(params);
        orderList = response.data.list;
        total = response.data.total;
      }
      
      commit('SET_ORDER_LIST', { list: orderList, total });
      return { success: true, data: orderList, total };
    } catch (error) {
      throw new Error(error.message || '获取订单列表失败');
    } finally {
      commit('SET_ORDER_LOADING', false);
    }
  },
  
  // 获取订单详情
  async getOrderDetail({ commit }, id) {
    try {
      commit('SET_ORDER_LOADING', true);
      
      let orderDetail = {};
      
      if (USE_MOCK) {
        // 使用模拟数据
        orderDetail = mockOrderData.detail;
      } else {
        // 使用真实API
        const response = await orderAPI.getOrderDetail(id);
        orderDetail = response.data;
      }
      
      commit('SET_ORDER_DETAIL', orderDetail);
      return { success: true, data: orderDetail };
    } catch (error) {
      throw new Error(error.message || '获取订单详情失败');
    } finally {
      commit('SET_ORDER_LOADING', false);
    }
  },
  
  // 创建订单
  async createOrder({ commit }, orderData) {
    try {
      commit('SET_ORDER_LOADING', true);
      
      let newOrder = {};
      
      if (USE_MOCK) {
        // 使用模拟数据
        newOrder = {
          ...orderData,
          id: 'order' + Date.now(),
          createTime: new Date().toLocaleString('zh-CN')
        };
        
        mockOrderData.list.push(newOrder);
      } else {
        // 使用真实API
        const response = await orderAPI.createOrder(orderData);
        newOrder = response.data;
      }
      
      commit('ADD_ORDER', newOrder);
      return { success: true, data: newOrder };
    } catch (error) {
      throw new Error(error.message || '创建订单失败');
    } finally {
      commit('SET_ORDER_LOADING', false);
    }
  },
  
  // 更新订单
  async updateOrder({ commit }, { id, data }) {
    try {
      commit('SET_ORDER_LOADING', true);
      
      let updatedOrder = {};
      
      if (USE_MOCK) {
        // 使用模拟数据
        const index = mockOrderData.list.findIndex(o => o.id === id);
        if (index !== -1) {
          updatedOrder = { ...mockOrderData.list[index], ...data };
          mockOrderData.list[index] = updatedOrder;
        }
      } else {
        // 使用真实API
        const response = await orderAPI.updateOrder(id, data);
        updatedOrder = response.data;
      }
      
      commit('UPDATE_ORDER', updatedOrder);
      return { success: true, data: updatedOrder };
    } catch (error) {
      throw new Error(error.message || '更新订单失败');
    } finally {
      commit('SET_ORDER_LOADING', false);
    }
  },
  
  // 删除订单
  async deleteOrder({ commit }, id) {
    try {
      commit('SET_ORDER_LOADING', true);
      
      if (USE_MOCK) {
        // 使用模拟数据
        mockOrderData.list = mockOrderData.list.filter(o => o.id !== id);
      } else {
        // 使用真实API
        await orderAPI.deleteOrder(id);
      }
      
      commit('DELETE_ORDER', id);
      return { success: true };
    } catch (error) {
      throw new Error(error.message || '删除订单失败');
    } finally {
      commit('SET_ORDER_LOADING', false);
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
