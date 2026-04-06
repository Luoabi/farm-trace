<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">驾驶舱</h1>
      <div class="page-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateRangeChange"
          class="date-picker"
        />
        <el-button type="primary" @click="refreshData">
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
          <div class="stats-trend">
            <span class="trend-up">+12%</span>
            <small>较上月</small>
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
          <div class="stats-trend">
            <span class="trend-up">+8%</span>
            <small>较上月</small>
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
          <div class="stats-trend">
            <span class="trend-up">+15%</span>
            <small>较上月</small>
          </div>
        </div>
      </el-card>

      <el-card class="stats-card" shadow="hover">
        <div class="stats-card-content">
          <div class="stats-icon danger">
            <el-icon><User /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ statistics.totalUsers }}</div>
            <div class="stats-label">用户数量</div>
          </div>
          <div class="stats-trend">
            <span class="trend-down">-2%</span>
            <small>较上月</small>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>生产趋势</span>
            <el-select v-model="chartType" size="small">
              <el-option label="月度" value="month" />
              <el-option label="季度" value="quarter" />
            </el-select>
          </div>
        </template>
        <div class="chart-content">
          <canvas id="productionChart" ref="productionChartRef"></canvas>
        </div>
      </el-card>

      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>产品分布</span>
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

    <!-- 待处理任务区域 -->
    <div class="pending-tasks">
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
import { dashboardAPI } from '../api/modules/dashboard';
import { mockDashboardData } from '../api/modules/dashboard';

import Chart from 'chart.js/auto';

// 状态定义
const dateRange = ref([]);
const chartType = ref('month');
const productionChartRef = ref(null);
const distributionChartRef = ref(null);
let productionChart = null;
let distributionChart = null;

// 统计数据
const statistics = reactive({
  totalBatches: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalUsers: 0
});

// 最近活动
const recentActivities = ref([]);

// 待处理任务
const pendingTasks = ref([
  {
    id: 1,
    title: '审核新批次创建申请',
    description: '西昌草莓-202402批',
    type: '审核',
    completed: false
  },
  {
    id: 2,
    title: '处理待发货订单',
    description: '订单号：XCNM202403210002',
    type: '订单',
    completed: false
  },
  {
    id: 3,
    title: '更新商品库存信息',
    description: '西昌有机白萝卜库存不足',
    type: '库存',
    completed: false
  }
]);

// 初始化数据
const initData = async () => {
  try {
    // 尝试从API获取数据
    const response = mockDashboardData;
    statistics.totalBatches = response.statistics.totalBatches;
    statistics.totalProducts = response.statistics.totalProducts;
    statistics.totalOrders = response.statistics.totalOrders;
    statistics.totalUsers = response.statistics.totalUsers;
    
    recentActivities.value = response.recentActivities;
    
    // 更新图表数据
    if (productionChart) {
      productionChart.data.labels = response.chartData.productionTrend.map(item => item.month);
      productionChart.data.datasets[0].data = response.chartData.productionTrend.map(item => item.value);
      productionChart.update();
    }
    
    if (distributionChart) {
      distributionChart.data.labels = response.chartData.productDistribution.map(item => item.name);
      distributionChart.data.datasets[0].data = response.chartData.productDistribution.map(item => item.value);
      distributionChart.update();
    }
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    ElMessage.error('获取仪表盘数据失败: ' + (error.message || '未知错误'));
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

      // 生产趋势图表
      productionChart = new Chart(productionCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: '批次数量',
            data: [],
            borderColor: '#409eff',
            backgroundColor: 'rgba(64, 158, 255, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      // 产品分布图表
      distributionChart = new Chart(distributionCtx, {
        type: 'pie',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: [
              '#409eff',
              '#67c23a',
              '#e6a23c',
              '#f56c6c'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
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
  ElMessage.success('数据刷新成功');
  initData();
  initCharts();
};

// 处理任务完成
const handleTaskComplete = (task) => {
  if (task.completed) {
    ElMessage.success(`任务 "${task.title}" 已完成`);
  }
};

// 监听图表类型变化
watch(chartType, () => {
  initCharts();
});

// 组件挂载时初始化
onMounted(() => {
  initData();
  initCharts();
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