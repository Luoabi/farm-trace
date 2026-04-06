// 批次模块
import { batchAPI, mockBatchData } from '../../api/modules/batch';
import { USE_MOCK } from '../index';

const state = {
  // 批次列表
  list: [],
  // 批次详情
  detail: {},
  // 加载状态
  loading: false
};

const getters = {
  // 获取批次列表
  batchList: state => state.list,
  // 获取批次详情
  batchDetail: state => state.detail,
  // 获取加载状态
  isBatchLoading: state => state.loading
};

const mutations = {
  // 设置批次列表
  SET_BATCH_LIST(state, batchList) {
    state.list = batchList;
  },
  // 设置批次详情
  SET_BATCH_DETAIL(state, batchDetail) {
    state.detail = batchDetail;
  },
  // 添加批次
  ADD_BATCH(state, newBatch) {
    state.list.push(newBatch);
  },
  // 更新批次
  UPDATE_BATCH(state, updatedBatch) {
    const index = state.list.findIndex(b => b.id === updatedBatch.id);
    if (index !== -1) {
      state.list[index] = updatedBatch;
    }
    if (state.detail.id === updatedBatch.id) {
      state.detail = updatedBatch;
    }
  },
  // 删除批次
  DELETE_BATCH(state, batchId) {
    state.list = state.list.filter(b => b.id !== batchId);
    if (state.detail.id === batchId) {
      state.detail = {};
    }
  },
  // 设置加载状态
  SET_BATCH_LOADING(state, loading) {
    state.loading = loading;
  }
};

const actions = {
  // 获取批次列表
  async getBatchList({ commit }, params) {
    try {
      commit('SET_BATCH_LOADING', true);
      
      let batchList = [];
      
      if (USE_MOCK) {
        // 使用模拟数据
        batchList = mockBatchData.list;
      } else {
        // 使用真实API
        const response = await batchAPI.getBatchList(params);
        batchList = response.data;
      }
      
      commit('SET_BATCH_LIST', batchList);
      return { success: true, data: batchList };
    } catch (error) {
      throw new Error(error.message || '获取批次列表失败');
    } finally {
      commit('SET_BATCH_LOADING', false);
    }
  },
  
  // 获取批次详情
  async getBatchDetail({ commit }, id) {
    try {
      commit('SET_BATCH_LOADING', true);
      
      let batchDetail = {};
      
      if (USE_MOCK) {
        // 使用模拟数据
        batchDetail = mockBatchData.detail;
      } else {
        // 使用真实API
        const response = await batchAPI.getBatchDetail(id);
        batchDetail = response.data;
      }
      
      commit('SET_BATCH_DETAIL', batchDetail);
      return { success: true, data: batchDetail };
    } catch (error) {
      throw new Error(error.message || '获取批次详情失败');
    } finally {
      commit('SET_BATCH_LOADING', false);
    }
  },
  
  // 创建批次
  async createBatch({ commit }, batchData) {
    try {
      commit('SET_BATCH_LOADING', true);
      
      let newBatch = {};
      
      if (USE_MOCK) {
        // 使用模拟数据
        newBatch = {
          ...batchData,
          id: 'batch' + Date.now(),
          createTime: new Date().toLocaleString('zh-CN')
        };
        
        mockBatchData.list.push(newBatch);
      } else {
        // 使用真实API
        const response = await batchAPI.createBatch(batchData);
        newBatch = response.data;
      }
      
      commit('ADD_BATCH', newBatch);
      return { success: true, data: newBatch };
    } catch (error) {
      throw new Error(error.message || '创建批次失败');
    } finally {
      commit('SET_BATCH_LOADING', false);
    }
  },
  
  // 更新批次
  async updateBatch({ commit }, { id, data }) {
    try {
      commit('SET_BATCH_LOADING', true);
      
      let updatedBatch = {};
      
      if (USE_MOCK) {
        // 使用模拟数据
        const index = mockBatchData.list.findIndex(b => b.id === id);
        if (index !== -1) {
          updatedBatch = { ...mockBatchData.list[index], ...data };
          mockBatchData.list[index] = updatedBatch;
        }
      } else {
        // 使用真实API
        const response = await batchAPI.updateBatch(id, data);
        updatedBatch = response.data;
      }
      
      commit('UPDATE_BATCH', updatedBatch);
      return { success: true, data: updatedBatch };
    } catch (error) {
      throw new Error(error.message || '更新批次失败');
    } finally {
      commit('SET_BATCH_LOADING', false);
    }
  },
  
  // 删除批次
  async deleteBatch({ commit }, id) {
    try {
      commit('SET_BATCH_LOADING', true);
      
      if (USE_MOCK) {
        // 使用模拟数据
        mockBatchData.list = mockBatchData.list.filter(b => b.id !== id);
      } else {
        // 使用真实API
        await batchAPI.deleteBatch(id);
      }
      
      commit('DELETE_BATCH', id);
      return { success: true };
    } catch (error) {
      throw new Error(error.message || '删除批次失败');
    } finally {
      commit('SET_BATCH_LOADING', false);
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
