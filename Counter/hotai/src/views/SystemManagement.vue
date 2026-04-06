<template>
  <div class="system-management">
    <h1>系统管理</h1>
    <div class="system-cards">
      <el-card class="system-card">
    
          <div class="card-header">
            <span>系统信息</span>
          </div>
 
        <div class="system-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="系统名称">智慧农场管理系统</el-descriptions-item>
            <el-descriptions-item label="版本号">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="当前时间">{{ currentTime }}</el-descriptions-item>
            <el-descriptions-item label="运行环境">开发环境</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>

      <el-card class="system-card">
      
          <div class="card-header">
            <span>用户统计</span>
          </div>
     
        <div class="user-stats">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ totalUsers }}</div>
                <div class="stat-label">总用户数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ farmUsers }}</div>
                <div class="stat-label">农户数量</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ operatorUsers }}</div>
                <div class="stat-label">操作员数量</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <el-card class="system-card">
  
        <div class="card-header">
          <span>操作日志</span>
        </div>
      <div class="log-management">
        <el-table :data="logList" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="user" label="操作用户" width="150"></el-table-column>
          <el-table-column prop="action" label="操作内容" width="300"></el-table-column>
          <el-table-column prop="time" label="操作时间"></el-table-column>
          <el-table-column prop="ip" label="IP地址" width="150"></el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="logTotal"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </div>
    </el-card>

    <el-card class="system-card">
 
        <div class="card-header">
          <span>系统设置</span>
        </div>
  
      <div class="system-settings">
        <el-form :model="settingsForm" label-width="120px">
          <el-form-item label="系统名称">
            <el-input v-model="settingsForm.systemName"></el-input>
          </el-form-item>
          <el-form-item label="每页显示条数">
            <el-select v-model="settingsForm.pageSize" placeholder="请选择">
              <el-option label="10" :value="10"></el-option>
              <el-option label="20" :value="20"></el-option>
              <el-option label="50" :value="50"></el-option>
              <el-option label="100" :value="100"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="数据保留天数">
            <el-input v-model.number="settingsForm.dataRetentionDays" type="number" min="1"></el-input>
          </el-form-item>
          <el-form-item label="自动备份">
            <el-switch v-model="settingsForm.autoBackup"></el-switch>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveSettings">保存设置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';

// 当前时间
const currentTime = computed(() => {
  const now = new Date();
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
});

// 用户统计数据
const totalUsers = ref(50);
const farmUsers = ref(30);
const operatorUsers = ref(19);

// 日志相关
const logList = ref([]);
const logTotal = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 系统设置
const settingsForm = ref({
  systemName: '智慧农场管理系统',
  pageSize: 20,
  dataRetentionDays: 90,
  autoBackup: true
});

// 模拟日志数据
const mockLogData = {
  list: [
    {
      id: '1',
      user: 'admin',
      action: '登录系统',
      time: '2023-06-15 09:30:45',
      ip: '192.168.1.100'
    },
    {
      id: '2',
      user: 'admin',
      action: '创建新用户：张三',
      time: '2023-06-15 10:15:30',
      ip: '192.168.1.100'
    },
    {
      id: '3',
      user: 'admin',
      action: '更新系统设置',
      time: '2023-06-15 11:20:15',
      ip: '192.168.1.100'
    },
    {
      id: '4',
      user: 'admin',
      action: '导出用户数据',
      time: '2023-06-15 14:45:10',
      ip: '192.168.1.100'
    },
    {
      id: '5',
      user: 'admin',
      action: '查看操作日志',
      time: '2023-06-15 16:30:20',
      ip: '192.168.1.100'
    }
  ],
  total: 5
};

// 初始化数据
const initData = () => {
  // 模拟异步加载日志数据
  setTimeout(() => {
    logList.value = mockLogData.list;
    logTotal.value = mockLogData.total;
  }, 500);
};

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size;
  loadLogs();
};

const handleCurrentChange = (current) => {
  currentPage.value = current;
  loadLogs();
};

// 加载日志数据
const loadLogs = () => {
  // 模拟分页加载日志
  setTimeout(() => {
    logList.value = mockLogData.list;
    logTotal.value = mockLogData.total;
  }, 300);
};

// 保存系统设置
const saveSettings = () => {
  // 模拟保存设置
  setTimeout(() => {
    ElMessage.success('系统设置保存成功');
  }, 500);
};

// 组件挂载时初始化数据
onMounted(() => {
  initData();
  // 每秒更新当前时间
  setInterval(() => {
    // 强制更新计算属性
    currentTime.value;
  }, 1000);
});
</script>

<style scoped>
.system-management {
  padding: 20px;
}

.system-management h1 {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

.system-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.system-card {
  flex: 1;
  min-width: 300px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.system-info {
  padding: 10px 0;
}

.user-stats {
  padding: 20px 0;
}

.stat-item {
  text-align: center;
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.log-management {
  padding: 10px 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.system-settings {
  padding: 10px 0;
}
</style>