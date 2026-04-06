import request from '../request';

// 驾驶舱相关API
export const dashboardAPI = {
  // 获取统计数据
  getStatistics() {
    return request({
      url: '/dashboard/statistics',
      method: 'get'
    });
  },
  // 获取图表数据
  getChartData() {
    return request({
      url: '/dashboard/chartData',
      method: 'get'
    });
  },
  // 获取最近活动
  getRecentActivities() {
    return request({
      url: '/dashboard/recentActivities',
      method: 'get'
    });
  }
};

// 模拟数据
export const mockDashboardData = {
  statistics: {
    totalBatches: 128,
    totalProducts: 35,
    totalOrders: 256,
    totalUsers: 42
  },
  chartData: {
    productionTrend: [
      { month: '1月', value: 12 },
      { month: '2月', value: 19 },
      { month: '3月', value: 15 },
      { month: '4月', value: 23 },
      { month: '5月', value: 28 },
      { month: '6月', value: 32 }
    ],
    productDistribution: [
      { name: '蔬菜类', value: 45 },
      { name: '水果类', value: 30 },
      { name: '谷物类', value: 15 },
      { name: '其他', value: 10 }
    ]
  },
  recentActivities: [
    { id: 1, user: '管理员', action: '创建了新批次', time: '10分钟前' },
    { id: 2, user: '张三', action: '更新了生长记录', time: '30分钟前' },
    { id: 3, user: '李四', action: '上架了新商品', time: '1小时前' },
    { id: 4, user: '王五', action: '处理了订单', time: '2小时前' }
  ]
};