// 生长记录模块
import { growthRecordAPI, mockGrowthRecordData } from '../../api/modules/growthRecord';
import { USE_MOCK } from '../index';

const state = {
  // 生长记录列表
  list: [],
  // 生长记录详情
  detail: {},
  // 加载状态
  loading: false
};

const getters = {
  // 获取生长记录列表
  growthRecordList: state => state.list,
  // 获取生长记录详情
  growthRecordDetail: state => state.detail,
  // 获取加载状态
  isGrowthRecordLoading: state => state.loading
};

const mutations = {
  // 设置生长记录列表
  SET_GROWTH_RECORD_LIST(state, growthRecordList) {
    state.list = growthRecordList;
  },
  // 设置生长记录详情
  SET_GROWTH_RECORD_DETAIL(state, growthRecordDetail) {
    state.detail = growthRecordDetail;
  },
  // 添加生长记录
  ADD_GROWTH_RECORD(state, newGrowthRecord) {
    state.list.push(newGrowthRecord);
  },
  // 更新生长记录
  UPDATE_GROWTH_RECORD(state, updatedGrowthRecord) {
    const index = state.list.findIndex(g => g.id === updatedGrowthRecord.id);
    if (index !== -1) {
      state.list[index] = updatedGrowthRecord;
    }
    if (state.detail.id === updatedGrowthRecord.id) {
      state.detail = updatedGrowthRecord;
    }
  },
  // 删除生长记录
  DELETE_GROWTH_RECORD(state, growthRecordId) {
    state.list = state.list.filter(g => g.id !== growthRecordId);
    if (state.detail.id === growthRecordId) {
      state.detail = {};
    }
  },
  // 设置加载状态
  SET_GROWTH_RECORD_LOADING(state, loading) {
    state.loading = loading;
  }
};

const actions = {
  // 获取生长记录列表
  async getGrowthRecordList({ commit }, batchId) {
    try {
      commit('SET_GROWTH_RECORD_LOADING', true);
      
      let growthRecordList = [];
      
      if (USE_MOCK) {
        // 使用模拟数据
        growthRecordList = mockGrowthRecordData.list;
      } else {
        // 使用真实API
        const response = await growthRecordAPI.getGrowthRecordsByBatch(batchId);
        growthRecordList = response.data;
      }
      
      commit('SET_GROWTH_RECORD_LIST', growthRecordList);
      return { success: true, data: growthRecordList };
    } catch (error) {
      throw new Error(error.message || '获取生长记录列表失败');
    } finally {
      commit('SET_GROWTH_RECORD_LOADING', false);
    }
  },
  
  // 获取生长记录详情
  async getGrowthRecordDetail({ commit }, id) {
    try {
      commit('SET_GROWTH_RECORD_LOADING', true);
      
      let growthRecordDetail = {};
      
      if (USE_MOCK) {
        // 使用模拟数据
        growthRecordDetail = mockGrowthRecordData.detail;
      } else {
        // 使用真实API
        const response = await growthRecordAPI.getGrowthRecordDetail(id);
        growthRecordDetail = response.data;
      }
      
      commit('SET_GROWTH_RECORD_DETAIL', growthRecordDetail);
      return { success: true, data: growthRecordDetail };
    } catch (error) {
      throw new Error(error.message || '获取生长记录详情失败');
    } finally {
      commit('SET_GROWTH_RECORD_LOADING', false);
    }
  },
  
  // 创建生长记录
  async createGrowthRecord({ commit }, growthRecordData) {
    try {
      commit('SET_GROWTH_RECORD_LOADING', true);
      
      let newGrowthRecord = {};
      
      if (USE_MOCK) {
        // 使用模拟数据
        newGrowthRecord = {
          ...growthRecordData,
          id: 'growth' + Date.now(),
          createTime: new Date().toLocaleString('zh-CN')
        };
        
        mockGrowthRecordData.list.push(newGrowthRecord);
      } else {
        // 使用真实API
        const response = await growthRecordAPI.createGrowthRecord(growthRecordData);
        newGrowthRecord = response.data;
      }
      
      commit('ADD_GROWTH_RECORD', newGrowthRecord);
      return { success: true, data: newGrowthRecord };
    } catch (error) {
      throw new Error(error.message || '创建生长记录失败');
    } finally {
      commit('SET_GROWTH_RECORD_LOADING', false);
    }
  },
  
  // 更新生长记录
  async updateGrowthRecord({ commit }, { id, data }) {
    try {
      commit('SET_GROWTH_RECORD_LOADING', true);
      
      let updatedGrowthRecord = {};
      
      if (USE_MOCK) {
        // 使用模拟数据
        const index = mockGrowthRecordData.list.findIndex(g => g.id === id);
        if (index !== -1) {
          updatedGrowthRecord = { ...mockGrowthRecordData.list[index], ...data };
          mockGrowthRecordData.list[index] = updatedGrowthRecord;
        }
      } else {
        // 使用真实API
        const response = await growthRecordAPI.updateGrowthRecord(id, data);
        updatedGrowthRecord = response.data;
      }
      
      commit('UPDATE_GROWTH_RECORD', updatedGrowthRecord);
      return { success: true, data: updatedGrowthRecord };
    } catch (error) {
      throw new Error(error.message || '更新生长记录失败');
    } finally {
      commit('SET_GROWTH_RECORD_LOADING', false);
    }
  },
  
  // 删除生长记录
  async deleteGrowthRecord({ commit }, id) {
    try {
      commit('SET_GROWTH_RECORD_LOADING', true);
      
      if (USE_MOCK) {
        // 使用模拟数据
        mockGrowthRecordData.list = mockGrowthRecordData.list.filter(g => g.id !== id);
      } else {
        // 使用真实API
        await growthRecordAPI.deleteGrowthRecord(id);
      }
      
      commit('DELETE_GROWTH_RECORD', id);
      return { success: true };
    } catch (error) {
      throw new Error(error.message || '删除生长记录失败');
    } finally {
      commit('SET_GROWTH_RECORD_LOADING', false);
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
