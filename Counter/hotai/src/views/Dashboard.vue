<template>
  <div class="dashboard" v-loading="loading">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">驾驶舱</h1>
      <div class="page-actions">
        <el-button type="primary" @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-card-container">
      <el-card class="stats-card" shadow="hover">
        <div class="stats-card-content">
          <div class="stats-icon primary">
            <el-icon><Box /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ statistics.totalBatches }}</div>
            <div class="stats-label">产品批次</div>
          </div>
        </div>
      </el-card>

      <el-card class="stats-card" shadow="hover">
        <div class="stats-card-content">
          <div class="stats-icon success">
            <el-icon><Goods /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ statistics.totalProducts }}</div>
            <div class="stats-label">商品种类</div>
          </div>
        </div>
      </el-card>

      <el-card class="stats-card" shadow="hover">
        <div class="stats-card-content">
          <div class="stats-icon warning">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ statistics.totalOrders }}</div>
            <div class="stats-label">订单数量</div>
          </div>
        </div>
      </el-card>

      <el-card class="stats-card" shadow="hover">
        <div class="stats-card-content">
          <div class="stats-icon danger">
            <el-icon><User /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">¥{{ statistics.totalSales.toFixed(2) }}</div>
            <div class="stats-label">销售总额</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>批次状态分布</span>
          </div>
        </template>
        <div class="chart-content">
          <canvas id="productionChart" ref="productionChartRef"></canvas>
        </div>
      </el-card>

      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>订单状态分布</span>
          </div>
        </template>
        <div class="chart-content">
          <canvas id="distributionChart" ref="distributionChartRef"></canvas>
        </div>
      </el-card>
    </div>

    <!-- 最近活动区域 -->
    <div class="recent-activities">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>最近活动</span>
            <el-button link size="small">查看全部</el-button>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in recentActivities"
            :key="activity.id"
            :timestamp="activity.time"
            :type="getTimelineType(index)"
            placement="top"
          >
            <div class="activity-content">
              <span class="activity-user">{{ activity.user }}</span>
              <span class="activity-action">{{ activity.action }}</span>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>

    <!-- 待处理任务区域（仅超级管理员） -->
    <div class="pending-tasks" v-if="getUserInfo()?.role === '超级管理员'">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>待处理任务</span>
            <el-badge :value="pendingTasks.length" type="danger" />
          </div>
        </template>
        <el-empty v-if="pendingTasks.length === 0" description="暂无待处理任务" />
        <div v-else class="task-list">
          <div v-for="task in pendingTasks" :key="task.id" class="task-item">
            <el-checkbox v-model="task.completed" @change="handleTaskComplete(task)">
              <span class="task-title">{{ task.title }}</span>
              <small class="task-desc">{{ task.description }}</small>
            </el-checkbox>
            <el-tag :type="getTaskType(task.type)">{{ task.type }}</el-tag>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh, Box, Goods, Document, User } from '@element-plus/icons-vue';
import { batchAPI } from '../api/modules/batch';
import { productAPI } from '../api/modules/product';
import { orderAPI } from '../api/modules/order';
import { growthRecordAPI } from '../api/modules/growthRecord';

import Chart from 'chart.js/auto';

// 状态定义
const dateRange = ref([]);
const chartType = ref('month');
const productionChartRef = ref(null);
const distributionChartRef = ref(null);
let productionChart = null;
let distributionChart = null;
const loading = ref(false);

// 统计数据
const statistics = reactive({
  totalBatches: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalSales: 0
});

// 最近活动
const recentActivities = ref([]);

// 待处理任务
const pendingTasks = ref([]);

// 获取用户信息
const getUserInfo = () => {
  const userInfoStr = localStorage.getItem('userInfo');
  if (userInfoStr) {
    return JSON.parse(userInfoStr);
  }
  return null;
};

// 初始化数据
const initData = async () => {
  loading.value = true;
  try {
    const userInfo = getUserInfo();
    const userRole = userInfo?.role || '';
    const userId = userInfo?.id || '';
    
    console.log('驾驶舱 - 用户信息:', userInfo);
    console.log('驾驶舱 - 用户角色:', userRole);
    console.log('驾驶舱 - 用户ID:', userId);
    
    // 1. 获取统计数据
    if (userRole === '超级管理员') {
      // 超级管理员：查看所有数据
      await loadAdminStatistics();
    } else if (userRole === '农户') {
      // 农户：只查看自己的数据
      await loadFarmerStatistics(userId);
    }
    
    // 2. 获取分布数据（用于饼图）
    await loadDistributionData(userRole, userId);
    
    // 3. 获取最近活动
    await loadRecentActivities(userRole, userId);
    
    // 4. 获取待处理任务
    await loadPendingTasks(userRole, userId);
    
  } catch (error) {
    console.error('加载驾驶舱数据失败:', error);
    ElMessage.error('加载数据失败: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 加载超级管理员统计数据
const loadAdminStatistics = async () => {
  try {
    // 批次数
    const batchRes = await batchAPI.getBatchList({ page: 1, pageSize: 1 });
    statistics.totalBatches = batchRes.total || 0;
    
    // 商品数
    const productRes = await productAPI.getProductList({ page: 1, pageSize: 1 });
    statistics.totalProducts = productRes.total || 0;
    
    // 订单数
    const orderRes = await orderAPI.getOrderList({ page: 1, pageSize: 1 });
    statistics.totalOrders = orderRes.total || 0;
    
    // 销售额（获取所有已完成订单）
    const allOrdersRes = await orderAPI.getOrderList({ page: 1, pageSize: 9999 });
    const orders = allOrdersRes.list || [];
    statistics.totalSales = orders
      .filter(o => o.orderStatus >= 3)  // 已发货和已完成
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  } catch (error) {
    console.error('加载管理员统计数据失败:', error);
  }
};

// 加载农户统计数据
const loadFarmerStatistics = async (farmerId) => {
  try {
    // 我的批次数
    const batchRes = await batchAPI.getBatchListByFarmer(farmerId, { page: 1, pageSize: 1 });
    statistics.totalBatches = batchRes.total || 0;
    
    // 我的商品数
    const productRes = await productAPI.getProductListByFarmer(farmerId, { page: 1, pageSize: 1 });
    statistics.totalProducts = productRes.total || 0;
    
    // 我的订单数
    const orderRes = await orderAPI.getOrdersByFarmer({ page: 1, pageSize: 1 }, farmerId);
    statistics.totalOrders = orderRes.total || 0;
    
    // 我的销售额
    const allOrdersRes = await orderAPI.getOrdersByFarmer({ page: 1, pageSize: 9999 }, farmerId);
    const orders = allOrdersRes.list || [];
    statistics.totalSales = orders
      .filter(o => o.orderStatus >= 3)
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  } catch (error) {
    console.error('加载农户统计数据失败:', error);
  }
};

// 加载分布数据
const loadDistributionData = async (userRole, userId) => {
  try {
    let batchList = [];
    let orderList = [];
    let productList = [];
    
    if (userRole === '超级管理员') {
      // 获取所有数据
      const batchRes = await batchAPI.getBatchList({ page: 1, pageSize: 9999 });
      batchList = batchRes.list || [];
      
      const orderRes = await orderAPI.getOrderList({ page: 1, pageSize: 9999 });
      orderList = orderRes.list || [];
      
      const productRes = await productAPI.getProductList({ page: 1, pageSize: 9999 });
      productList = productRes.list || [];
    } else if (userRole === '农户') {
      // 获取农户数据
      const batchRes = await batchAPI.getBatchListByFarmer(userId, { page: 1, pageSize: 9999 });
      batchList = batchRes.list || [];
      
      const orderRes = await orderAPI.getOrdersByFarmer({ page: 1, pageSize: 9999 }, userId);
      orderList = orderRes.list || [];
      
      const productRes = await productAPI.getProductListByFarmer(userId, { page: 1, pageSize: 9999 });
      productList = productRes.list || [];
    }
    
    // 统计批次状态分布
    const batchStatusCount = { 1: 0, 2: 0, 3: 0 };
    batchList.forEach(batch => {
      if (batch.status in batchStatusCount) {
        batchStatusCount[batch.status]++;
      }
    });
    
    // 统计订单状态分布
    const orderStatusCount = { 1: 0, 2: 0, 3: 0, 4: 0 };
    orderList.forEach(order => {
      if (order.orderStatus in orderStatusCount) {
        orderStatusCount[order.orderStatus]++;
      }
    });
    
    // 统计商品分类分布
    const categoryCount = {};
    productList.forEach(product => {
      const category = product.category || '其他';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    // 更新图表
    updateCharts(batchStatusCount, orderStatusCount, categoryCount);
  } catch (error) {
    console.error('加载分布数据失败:', error);
  }
};

// 更新图表
const updateCharts = (batchStatusCount, orderStatusCount, categoryCount) => {
  if (productionChart) {
    // 批次状态分布饼图
    productionChart.data.labels = ['种植中', '已收获', '已售罄'];
    productionChart.data.datasets[0].data = [
      batchStatusCount[1] || 0,
      batchStatusCount[2] || 0,
      batchStatusCount[3] || 0
    ];
    productionChart.update();
  }
  
  if (distributionChart) {
    // 订单状态分布饼图
    distributionChart.data.labels = ['待支付', '待发货', '已发货', '已完成'];
    distributionChart.data.datasets[0].data = [
      orderStatusCount[1] || 0,
      orderStatusCount[2] || 0,
      orderStatusCount[3] || 0,
      orderStatusCount[4] || 0
    ];
    distributionChart.update();
  }
};

// 加载最近活动
const loadRecentActivities = async (userRole, userId) => {
  try {
    let batchList = [];
    let orderList = [];
    
    if (userRole === '超级管理员') {
      const batchRes = await batchAPI.getBatchList({ page: 1, pageSize: 5 });
      batchList = batchRes.list || [];
      
      const orderRes = await orderAPI.getOrderList({ page: 1, pageSize: 5 });
      orderList = orderRes.list || [];
    } else if (userRole === '农户') {
      const batchRes = await batchAPI.getBatchListByFarmer(userId, { page: 1, pageSize: 5 });
      batchList = batchRes.list || [];
      
      const orderRes = await orderAPI.getOrdersByFarmer({ page: 1, pageSize: 5 }, userId);
      orderList = orderRes.list || [];
    }
    
    // 合并活动
    const activities = [
      ...batchList.map(b => ({
        id: `batch-${b.id}`,
        user: b.farmerName || '农户',
        action: `创建了批次：${b.batchNumber}`,
        time: b.createTime
      })),
      ...orderList.map(o => ({
        id: `order-${o.id}`,
        user: o.customerName || '顾客',
        action: `创建了订单：${o.orderNumber}`,
        time: o.createTime
      }))
    ];
    
    // 按时间排序
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    recentActivities.value = activities.slice(0, 10);
  } catch (error) {
    console.error('加载最近活动失败:', error);
  }
};

// 加载待处理任务（仅超级管理员）
const loadPendingTasks = async (userRole, userId) => {
  try {
    const tasks = [];
    
    if (userRole === '超级管理员') {
      // 1. 待发货订单（所有农户的）
      const orderRes = await orderAPI.getOrderList({ page: 1, pageSize: 100 });
      const pendingOrders = (orderRes.list || []).filter(o => o.orderStatus === 2);
      
      pendingOrders.slice(0, 5).forEach(order => {
        tasks.push({
          id: `order-${order.id}`,
          title: '待发货订单',
          description: `订单号：${order.orderNumber}`,
          type: '订单',
          completed: false
        });
      });
      
      // 2. 即将收获的批次（所有农户的）
      const batchRes = await batchAPI.getBatchList({ page: 1, pageSize: 100 });
      const batches = batchRes.list || [];
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      batches.forEach(batch => {
        if (batch.status === 1 && batch.harvestTime) {
          const harvestDate = new Date(batch.harvestTime);
          if (harvestDate >= now && harvestDate <= sevenDaysLater) {
            tasks.push({
              id: `batch-${batch.id}`,
              title: '即将收获的批次',
              description: `${batch.batchNumber} - ${batch.harvestTime}`,
              type: '批次',
              completed: false
            });
          }
        }
      });
      
      // 3. 待支付订单
      const unpaidOrders = (orderRes.list || []).filter(o => o.orderStatus === 1);
      unpaidOrders.slice(0, 3).forEach(order => {
        tasks.push({
          id: `unpaid-${order.id}`,
          title: '待支付订单',
          description: `订单号：${order.orderNumber}`,
          type: '订单',
          completed: false
        });
      });
    }
    
    pendingTasks.value = tasks.slice(0, 10);
  } catch (error) {
    console.error('加载待处理任务失败:', error);
  }
};

// 初始化图表
function initCharts() {
  nextTick(() => {
    try {
      // 先销毁现有图表，确保完全清除
      if (productionChart) {
        productionChart.destroy();
        productionChart = null;
      }
      if (distributionChart) {
        distributionChart.destroy();
        distributionChart = null;
      }

      // 确保canvas元素存在
      const productionCanvas = document.getElementById('productionChart');
      const distributionCanvas = document.getElementById('distributionChart');
      
      if (!productionCanvas || !distributionCanvas) {
        console.warn('Chart canvas elements not found');
        return;
      }

      // 清除canvas内容
      const productionCtx = productionCanvas.getContext('2d');
      const distributionCtx = distributionCanvas.getContext('2d');
      productionCtx.clearRect(0, 0, productionCanvas.width, productionCanvas.height);
      distributionCtx.clearRect(0, 0, distributionCanvas.width, distributionCanvas.height);

      // 批次状态分布图表
      productionChart = new Chart(productionCtx, {
        type: 'pie',
        data: {
          labels: ['种植中', '已收获', '已售罄'],
          datasets: [{
            data: [0, 0, 0],
            backgroundColor: [
              '#409eff',
              '#67c23a',
              '#e6a23c'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            },
            title: {
              display: false
            }
          }
        }
      });

      // 订单状态分布图表
      distributionChart = new Chart(distributionCtx, {
        type: 'pie',
        data: {
          labels: ['待支付', '待发货', '已发货', '已完成'],
          datasets: [{
            data: [0, 0, 0, 0],
            backgroundColor: [
              '#f56c6c',
              '#e6a23c',
              '#409eff',
              '#67c23a'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            },
            title: {
              display: false
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initializing charts:', error);
    }
  });
};

// 获取时间线类型
const getTimelineType = (index) => {
  const types = ['primary', 'success', 'warning', 'danger', 'info'];
  return types[index % types.length];
};

// 获取任务类型标签
const getTaskType = (type) => {
  const typeMap = {
    '审核': 'warning',
    '订单': 'primary',
    '库存': 'danger',
    '系统': 'info'
  };
  return typeMap[type] || 'default';
};

// 处理日期范围变化
const handleDateRangeChange = (value) => {
  console.log('日期范围变化:', value);
  // 这里可以根据日期范围刷新数据
};

// 刷新数据
const refreshData = () => {
  initData();
};

// 处理任务完成
const handleTaskComplete = (task) => {
  if (task.completed) {
    ElMessage.success(`任务 "${task.title}" 已完成`);
  }
};

// 监听图表类型变化
watch(chartType, () => {
  // 图表类型变化时可以重新加载数据
  const userInfo = getUserInfo();
  if (userInfo) {
    loadDistributionData(userInfo.role, userInfo.id);
  }
});

// 组件挂载时初始化
onMounted(() => {
  initCharts();
  initData();
});

// 组件卸载时销毁图表
onUnmounted(() => {
  if (productionChart) {
    productionChart.destroy();
    productionChart = null;
  }
  if (distributionChart) {
    distributionChart.destroy();
    distributionChart = null;
  }
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

/* 页面标题样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.date-picker {
  width: 240px;
}

/* 统计卡片样式 */
.stats-card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stats-card {
  transition: transform 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
}

.stats-card-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.stats-icon.primary {
  background-color: #409eff;
}

.stats-icon.success {
  background-color: #67c23a;
}

.stats-icon.warning {
  background-color: #e6a23c;
}

.stats-icon.danger {
  background-color: #f56c6c;
}

.stats-info {
  flex: 1;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stats-label {
  font-size: 14px;
  color: #909399;
}

.stats-trend {
  text-align: right;
}

.trend-up {
  color: #67c23a;
  font-weight: bold;
}

.trend-down {
  color: #f56c6c;
  font-weight: bold;
}

/* 图表容器样式 */
.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  height: 300px;
}

.chart-content {
  height: calc(100% - 50px);
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 最近活动样式 */
.recent-activities {
  margin-bottom: 20px;
}

.activity-content {
  display: flex;
  gap: 8px;
}

.activity-user {
  font-weight: bold;
  color: #409eff;
}

.activity-action {
  color: #606266;
}

/* 待处理任务样式 */
.pending-tasks {
  margin-bottom: 20px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.task-title {
  font-weight: 500;
  margin-right: 10px;
}

.task-desc {
  color: #909399;
  margin-left: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .page-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .date-picker {
    width: 200px;
  }
}
</style>