<template>
  <div class="batch-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">批次管理</h1>
      <el-button link type="primary" @click="handleCreateBatch">
        <el-icon>
          <Plus />
        </el-icon>
        创建批次
      </el-button>
    </div>

    <!-- 搜索筛选区 -->
    <el-card class="search-card">
      <el-form :inline="true" class="search-form" :model="searchForm" label-width="80px">
        <el-form-item label="批次名称">
          <el-input v-model="searchForm.name" placeholder="请输入批次名称" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="产品类型">
          <el-select v-model="searchForm.productType" placeholder="请选择产品类型" style="width: 200px;">
            <el-option label="蔬菜" value="蔬菜" />
            <el-option label="水果" value="水果" />
            <el-option label="谷物" value="谷物" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" style="width: 200px;">
            <el-option label="种植中" value="种植中" />
            <el-option label="生长中" value="生长中" />
            <el-option label="收获中" value="收获中" />
            <el-option label="已收获" value="已收获" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker link v-model="searchForm.dateRange" type="daterange" range-separator="至"
            start-placeholder="开始日期" end-placeholder="结束日期" style="width: 300px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="batchList" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="批次ID" width="150" />
        <el-table-column prop="batchNumber" label="批次编号" width="150" />
        <el-table-column prop="productName" label="产品名称" width="200" />
        <el-table-column prop="farmName" label="农场名称" width="150" />
        <el-table-column prop="plantingTime" label="种植日期" width="180" />
        <el-table-column prop="harvestTime" label="收获日期" width="180" />
        <el-table-column prop="plannedQuantity" label="计划数量" width="120" />
        <el-table-column prop="actualQuantity" label="实际数量" width="120" />
        <el-table-column prop="cultivationArea" label="种植面积" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button @click="handleViewBatch(scope.row)" type="primary" size="small" style="margin-right: 5px;">
              详情
            </el-button>
            <el-button @click="handleEditBatch(scope.row)" type="success" size="small" style="margin-right: 5px;">
              编辑
            </el-button>
            <el-button @click="handleDeleteBatch(scope.row.id)" type="danger" size="small">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 -->
      <div class="pagination">
        <el-pagination background layout="prev, pager, next, jumper, sizes, total" :total="pagination.total"
          :page-size.sync="pagination.pageSize" :current-page.sync="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 批次详情对话框 -->
    <el-dialog v-model="batchDetailVisible" title="批次详情" width="60%" :close-on-click-modal="false">
      <div v-if="currentBatch" class="batch-detail">
        <el-descriptions border :column="2">
          <el-descriptions-item label="批次ID">{{ currentBatch.id }}</el-descriptions-item>
          <el-descriptions-item label="批次编号">{{ currentBatch.batchNumber }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ currentBatch.productName }}</el-descriptions-item>
          <el-descriptions-item label="农场名称">{{ currentBatch.farmName }}</el-descriptions-item>
          <el-descriptions-item label="农场地址">{{ currentBatch.farmAddress }}</el-descriptions-item>
          <el-descriptions-item label="种植日期">{{ currentBatch.plantingTime }}</el-descriptions-item>
          <el-descriptions-item label="收获日期">{{ currentBatch.harvestTime }}</el-descriptions-item>
          <el-descriptions-item label="计划数量">{{ currentBatch.plannedQuantity }}</el-descriptions-item>
          <el-descriptions-item label="实际数量">{{ currentBatch.actualQuantity }}</el-descriptions-item>
          <el-descriptions-item label="种植面积">{{ currentBatch.cultivationArea }} 平方米</el-descriptions-item>
          <el-descriptions-item label="状态">{{ getStatusText(currentBatch.status) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentBatch.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentBatch.updateTime }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentBatch.remark || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="handleCloseDetail">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 批次表单对话框 -->
    <el-dialog v-model="batchFormVisible" :title="isEdit ? '编辑批次' : '创建批次'" width="60%" :close-on-click-modal="false">
      <el-form ref="batchFormRef" class="batch-form" :model="batchForm" :rules="batchRules" label-width="120px">
        <el-form-item prop="batchNumber" label="批次编号">
          <el-input v-model="batchForm.batchNumber" placeholder="请输入批次编号" />
        </el-form-item>
        <el-form-item prop="productId" label="商品">
          <el-select v-model="batchForm.productId" placeholder="请选择商品">
            <el-option label="蔬菜" value="蔬菜" />
            <el-option label="水果" value="水果" />
            <el-option label="谷物" value="谷物" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item prop="cultivationArea" label="种植区域">
          <el-input v-model="batchForm.cultivationArea" placeholder="请输入种植区域" />
        </el-form-item>
        <el-form-item prop="plantingTime" label="种植时间">
          <el-date-picker v-model="batchForm.plantingTime" type="date" placeholder="选择日期" style="width: 100%;" />
        </el-form-item>
        <el-form-item prop="harvestTime" label="预计收获时间">
          <el-date-picker v-model="batchForm.harvestTime" type="date" placeholder="选择日期" style="width: 100%;" />
        </el-form-item>
        <el-form-item prop="plannedQuantity" label="计划产量">
          <el-input-number v-model="batchForm.plannedQuantity" :min="1" :step="10" placeholder="请输入计划产量" style="width: 100%;" />
        </el-form-item>
        <el-form-item prop="remark" label="备注">
          <el-input v-model="batchForm.remark" type="textarea" :rows="4" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseForm">取消</el-button>
        <el-button type="primary" @click="handleSaveBatch" :loading="saving">保存1</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { batchAPI } from '../api/modules/batch';
// 当前农户的id  在localStorage userInfo下的id
const farmerId = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).id : null;

// 响应式数据
const loading = ref(false);
const saving = ref(false);
const batchFormRef = ref(null);
const batchList = ref([]);
const selectedBatches = ref([]);
const currentBatch = ref(null);
const batchDetailVisible = ref(false);
const batchFormVisible = ref(false);
const isEdit = ref(false);

// 搜索表单
const searchForm = reactive({
  name: '',
  productType: '',
  status: '',
  dateRange: []
});

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 批次表单
const batchForm = reactive({
  id: '',
  batchNumber: '',
  productId: '',
  productName: '',
  farmerId: '',
  organization: '',
  farmName: '',
  farmAddress: '',
  cultivationArea: '',
  plantingTime: '',
  harvestTime: '',
  plannedQuantity: 0,
  actualQuantity: 0,
  status: 'PLANTING',
  remark: ''
});

// 表单验证规则
const batchRules = {
  batchNumber: [
    { required: true, message: '请输入批次编号', trigger: 'blur' },
    { min: 3, max: 50, message: '批次编号长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  productId: [
    { required: true, message: '请选择商品', trigger: 'change' }
  ],
  plantingTime: [
    { required: true, message: '请选择种植时间', trigger: 'change' }
  ],
  harvestTime: [
    { required: true, message: '请选择预计收获时间', trigger: 'change' }
  ],
  plannedQuantity: [
    { required: true, message: '请输入计划产量', trigger: 'blur' },
    { type: 'number', min: 0, message: '计划产量必须大于等于0', trigger: 'blur' }
  ],
  cultivationArea: [
    { required: true, message: '请输入种植区域', trigger: 'blur' }
  ]
};

// 初始化数据
const initData = async () => {
  loading.value = true;
  try {
    // API获取数据
    const response = await batchAPI.getBatchList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...searchForm
    });

    batchList.value = response.list || [];
    pagination.total = response.total || 0;
  } catch (error) {
    console.error('获取批次数据失败:', error);
    batchList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 获取产品类型标签
const getProductTypeTag = (type) => {
  const typeMap = {
    '蔬菜': 'success',
    '水果': 'warning',
    '谷物': 'info',
    '其他': 'default'
  };
  return typeMap[type] || 'default';
};

// 获取状态标签
const getStatusTag = (status) => {
  const statusMap = {
    'PLANTING': 'info',
    'GROWING': 'primary',
    'HARVESTING': 'warning',
    'HARVESTED': 'success'
  };
  return statusMap[status] || 'default';
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'PLANTING': '种植中',
    'GROWING': '生长中',
    'HARVESTING': '收获中',
    'HARVESTED': '已收获'
  };
  return statusMap[status] || status;
};

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1;
  initData();
  ElMessage.success('搜索成功');
};

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    productType: '',
    status: '',
    dateRange: []
  });
  pagination.currentPage = 1;
};

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  initData();
};

// 当前页变化
const handleCurrentChange = (current) => {
  pagination.currentPage = current;
  initData();
};

// 选择变化
const handleSelectionChange = (selection) => {
  selectedBatches.value = selection;
};

// 查看批次详情
const handleViewBatch = (row) => {
  currentBatch.value = row;
  batchDetailVisible.value = true;
};

// 关闭详情
const handleCloseDetail = () => {
  batchDetailVisible.value = false;
  currentBatch.value = null;
};

// 创建批次
const handleCreateBatch = () => {
  isEdit.value = false;
  // 重置表单
  Object.assign(batchForm, {
    id: '',
    batchNumber: '',
    productId: '',
    productName: '',
    farmerId: '',
    organization: '',
    farmName: '',
    farmAddress: '',
    cultivationArea: '',
    plantingTime: '',
    harvestTime: '',
    plannedQuantity: 0,
    actualQuantity: 0,
    status: 'PLANTING',
    remark: ''
  });
  batchFormVisible.value = true;
};

// 编辑批次
  
const handleEditBatch = (row) => {
  isEdit.value = true;
  // 填充表单数据
  Object.assign(batchForm, {
    id: row.id,
    batchNumber: row.batchNumber,
    productId: row.productId,
    productName: row.productName,
    farmerId: row.farmerId,
    organization: row.organization,
    farmName: row.farmName,
    farmAddress: row.farmAddress,
    cultivationArea: row.cultivationArea,
    plantingTime: row.plantingTime,
    harvestTime: row.harvestTime,
    plannedQuantity: row.plannedQuantity,
    actualQuantity: row.actualQuantity,
    status: row.status,
    remark: row.remark
  });
  batchFormVisible.value = true;
};
 

// 关闭表单
const handleCloseForm = () => {
  batchFormVisible.value = false;
  if (batchFormRef.value) {
    batchFormRef.value.resetFields();
  }
};

 
// 保存批次
const handleSaveBatch = () => {
  batchFormRef.value.validate((valid) => {
    if (valid) {
      saving.value = true;
      // 准备提交数据（根据后端BatchRequest字段调整）
      const submitData = {
        batchNumber: batchForm.batchNumber,
        productId: batchForm.productId,
        cultivationArea: batchForm.cultivationArea,
        plantingTime: batchForm.plantingTime,
        harvestTime: batchForm.harvestTime,
        plannedQuantity: batchForm.plannedQuantity,
        remark: batchForm.remark
      };
      
      if (isEdit.value) {
        // 编辑：调用updateBatch API
        batchAPI.updateBatch(batchForm.id, submitData).then(() => {
          ElMessage.success('批次更新成功');
          initData(); // 刷新数据
          handleCloseForm();
          saving.value = false;
        }).catch(() => {
          ElMessage.error('更新批次失败');
          saving.value = false;
        });
      } else {
        // 创建：调用createBatch API（需要获取当前登录农户ID）
        batchAPI.createBatch(submitData, farmerId).then(() => {
          ElMessage.success('批次创建成功');
          initData(); // 刷新数据
          handleCloseForm();
          saving.value = false;
        }).catch(() => {
          ElMessage.error('创建批次失败');
          saving.value = false;
        });
      }
    }
  });
};

// 删除批次
const handleDeleteBatch = (id) => {
  ElMessageBox.confirm('确定要删除这个批次吗？删除后数据将无法恢复', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 调用删除接口
    console.log(id);
    batchAPI.deleteBatch(id).then(() => {
      // 删除成功后刷新数据
      initData();
      ElMessage.success('批次删除成功');
    }).catch(() => {
      ElMessage.error('删除批次失败');
    });
  }).catch(() => {
    // 取消删除
    ElMessage.info('已取消删除');
  });
};

// 组件挂载时初始化数据
onMounted(() => {
  initData();
});
</script>

<style scoped>
.batch-management {
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

/* 搜索卡片样式 */
.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

/* 表格卡片样式 */
.table-card {
  margin-bottom: 20px;
}

/* 分页样式 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 哈希文本样式 */
.hash-text {
  color: #409eff;
  cursor: pointer;
}

.hash-tag {
  font-size: 12px;
  word-break: break-all;
  white-space: normal;
}

/* 批次表单样式 */
.batch-form {
  max-height: 60vh;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .search-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .search-form .el-form-item {
    margin-right: 0;
  }
}
</style>