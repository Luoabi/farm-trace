// 仪表盘模块
import { dashboardAPI, mockDashboardData } from '../../api/modules/dashboard';
import { USE_MOCK } from '../index';

const state = {
  // 统计数据
  statistics: {},
  // 图表数据
  chartData: {},
  // 最近活动
  recentActivities: [],
  // 加载状态
  loading: false
};

const getters = {
  // 获取统计数据
  dashboardStatistics: state => state.statistics,
  // 获取图表数据
  dashboardChartData: state => state.chartData,
  // 获取最近活动
  recentActivities: state => state.recentActivities,
  // 获取加载状态
  isDashboardLoading: state => state.loading
};

const mutations = {
  // 设置统计数据
  SET_DASHBOARD_STATISTICS(state, statistics) {
    state.statistics = statistics;
  },
  // 设置图表数据
  SET_DASHBOARD_CHART_DATA(state, chartData) {
    state.chartData = chartData;
  },
  // 设置最近活动
  SET_RECENT_ACTIVITIES(state, recentActivities) {
    state.recentActivities = recentActivities;
  },
  // 设置加载状态
  SET_DASHBOARD_LOADING(state, loading) {
    state.loading = loading;
  }
};

const actions = {
  // 获取仪表盘数据
  async getDashboardData({ commit }) {
    try {
      commit('SET_DASHBOARD_LOADING', true);
      
      let statistics = {};
      let chartData = {};
      let recentActivities = [];
      
      if (USE_MOCK) {
        // 使用模拟数据
        statistics = mockDashboardData.statistics;
        chartData = mockDashboardData.chartData;
        recentActivities = mockDashboardData.recentActivities;
      } else {
        // 使用真实API
        const statsResponse = await dashboardAPI.getStatistics();
        const chartResponse = await dashboardAPI.getChartData();
        const activitiesResponse = await dashboardAPI.getRecentActivities();
        
        statistics = statsResponse.data;
        chartData = chartResponse.data;
        recentActivities = activitiesResponse.data;
      }
      
      commit('SET_DASHBOARD_STATISTICS', statistics);
      commit('SET_DASHBOARD_CHART_DATA', chartData);
      commit('SET_RECENT_ACTIVITIES', recentActivities);
      
      return { success: true, data: { statistics, chartData, recentActivities } };
    } catch (error) {
      throw new Error(error.message || '获取仪表盘数据失败');
    } finally {
      commit('SET_DASHBOARD_LOADING', false);
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
