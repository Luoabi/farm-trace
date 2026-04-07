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
          <el-input v-model="searchForm.name" placeholder="请输入批次名称或商品名称" clearable style="width: 250px;" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px;">
            <el-option label="种植中" :value="1" />
            <el-option label="已收获" :value="2" />
            <el-option label="已售罄" :value="3" />
          </el-select>
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
        <el-table-column prop="plantingTime" label="种植日期" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.plantingTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="harvestTime" label="收获日期" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.harvestTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="plannedQuantity" label="计划数量" width="120" />
        <el-table-column prop="actualQuantity" label="实际数量" width="120" />
        <el-table-column prop="cultivationArea" label="种植面积" width="130" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="link" size="small" @click="handleViewBatch(scope.row)">
              详情
            </el-button>
            <el-button type="link" size="small" @click="handleEditBatch(scope.row)">
              编辑
            </el-button>
            <el-button type="link" size="small" @click="handleDeleteBatch(scope.row.id)">
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
          <el-descriptions-item label="农场地址" :span="2">{{ currentBatch.farmAddress }}</el-descriptions-item>
          <el-descriptions-item label="种植日期">{{ formatDate(currentBatch.plantingTime) }}</el-descriptions-item>
          <el-descriptions-item label="收获日期">{{ formatDate(currentBatch.harvestTime) }}</el-descriptions-item>
          <el-descriptions-item label="计划数量">{{ currentBatch.plannedQuantity }}</el-descriptions-item>
          <el-descriptions-item label="实际数量">{{ currentBatch.actualQuantity }}</el-descriptions-item>
          <el-descriptions-item label="种植面积">{{ currentBatch.cultivationArea }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTag(currentBatch.status)">{{ getStatusText(currentBatch.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="上链状态">
            <el-tag :type="currentBatch.chainStatus === 1 ? 'success' : 'info'">
              {{ currentBatch.chainStatus === 1 ? '已上链' : '未上链' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="区块链哈希" :span="2">
            <el-tag v-if="currentBatch.txHash" class="hash-tag">{{ currentBatch.txHash }}</el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="上链时间" :span="2">
            {{ currentBatch.chainTime ? formatDate(currentBatch.chainTime) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentBatch.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(currentBatch.updateTime) }}</el-descriptions-item>
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
          <el-select v-model="batchForm.productId" placeholder="请选择商品" filterable>
            <el-option 
              v-for="product in productList" 
              :key="product.id" 
              :label="product.productName" 
              :value="product.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="cultivationArea" label="种植面积">
          <el-input v-model="batchForm.cultivationArea" placeholder="请输入种植面积，如：100平方米" />
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
        <el-form-item v-if="isEdit" prop="actualQuantity" label="实际产量">
          <el-input-number v-model="batchForm.actualQuantity" :min="0" :step="10" placeholder="请输入实际产量" style="width: 100%;" />
        </el-form-item>
        <el-form-item v-if="isEdit" prop="status" label="批次状态">
          <el-select v-model="batchForm.status" placeholder="请选择状态" style="width: 100%;">
            <el-option label="种植中" :value="1" />
            <el-option label="已收获" :value="2" />
            <el-option label="已售罄" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item prop="remark" label="备注">
          <el-input v-model="batchForm.remark" type="textarea" :rows="4" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseForm">取消</el-button>
        <el-button type="primary" @click="handleSaveBatch" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { batchAPI } from '../api/modules/batch';
import { productAPI } from '../api/modules/product';

// 当前用户信息
const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
const farmerId = userInfo?.id || null;
const userRole = userInfo?.role || '';

// 响应式数据
const loading = ref(false);
const saving = ref(false);
const batchFormRef = ref(null);
const batchList = ref([]);
const productList = ref([]); // 商品列表
const selectedBatches = ref([]);
const currentBatch = ref(null);
const batchDetailVisible = ref(false);
const batchFormVisible = ref(false);
const isEdit = ref(false);

// 搜索表单
const searchForm = reactive({
  name: '',
  status: null
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
  cultivationArea: '', // 文本类型
  plantingTime: '',
  harvestTime: '',
  plannedQuantity: 0,
  actualQuantity: 0,
  status: 1, // 1-种植中，2-已收获，3-已售罄
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
    { required: true, message: '请输入种植面积', trigger: 'blur' }
  ]
};

// 初始化数据
const initData = async () => {
  loading.value = true;
  try {
    // 构建查询参数，只传递有值的字段
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    };
    
    // 只有当有值时才添加筛选条件
    if (searchForm.name && searchForm.name.trim()) {
      params.keyword = searchForm.name.trim();
    }
    
    if (searchForm.status !== null && searchForm.status !== undefined) {
      params.status = searchForm.status;
    }
    
    console.log('=== 批次查询参数（前端） ===');
    console.log('farmerId:', farmerId);
    console.log('userRole:', userRole);
    console.log('params:', params);
    console.log('========================');
    
    let response;
    
    // 超级管理员查看所有批次，农户只查看自己的批次
    if (userRole === '超级管理员') {
      response = await batchAPI.getBatchList(params);
    } else {
      response = await batchAPI.getBatchListByFarmer(farmerId, params);
    }

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

// 获取商品列表
const loadProductList = async () => {
  try {
    let response;
    
    // 超级管理员获取所有商品，农户只获取自己的商品
    if (userRole === '超级管理员') {
      response = await productAPI.getProductList({
        page: 1,
        pageSize: 1000,
        status: 1
      });
    } else {
      response = await productAPI.getProductListByFarmer(farmerId, {
        page: 1,
        pageSize: 1000,
        status: 1
      });
    }
    
    productList.value = response.list || [];
  } catch (error) {
    console.error('获取商品列表失败:', error);
    productList.value = [];
  }
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
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
    1: 'info',      // 种植中
    2: 'success',   // 已收获
    3: 'warning'    // 已售罄
  };
  return statusMap[status] || 'default';
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    1: '种植中',
    2: '已收获',
    3: '已售罄'
  };
  return statusMap[status] || '未知';
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
    status: null
  });
  pagination.currentPage = 1;
  initData();
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
const handleViewBatch = async (row) => {
  try {
    loading.value = true;
    const response = await batchAPI.getBatchDetail(row.id);
    currentBatch.value = response;
    batchDetailVisible.value = true;
  } catch (error) {
    console.error('获取批次详情失败:', error);
    ElMessage.error('获取批次详情失败');
  } finally {
    loading.value = false;
  }
};

// 关闭详情
const handleCloseDetail = () => {
  batchDetailVisible.value = false;
  currentBatch.value = null;
};

// 创建批次
const handleCreateBatch = async () => {
  isEdit.value = false;
  // 加载商品列表
  await loadProductList();
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
    cultivationArea: '', // 文本类型
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
const handleEditBatch = async (row) => {
  isEdit.value = true;
  // 加载商品列表
  await loadProductList();
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
      
      // 格式化日期为 ISO 字符串（后端 LocalDateTime 可以接收）
      const formatDateTime = (date) => {
        if (!date) return null;
        if (typeof date === 'string') return date;
        return new Date(date).toISOString();
      };
      
      // 准备提交数据（根据后端BatchRequest字段调整）
      const submitData = {
        batchNumber: batchForm.batchNumber,
        productId: batchForm.productId,
        cultivationArea: batchForm.cultivationArea,
        plantingTime: formatDateTime(batchForm.plantingTime),
        harvestTime: formatDateTime(batchForm.harvestTime),
        plannedQuantity: batchForm.plannedQuantity,
        remark: batchForm.remark
      };
      
      // 编辑时包含实际产量
      if (isEdit.value) {
        submitData.actualQuantity = batchForm.actualQuantity || 0;
      }
      
      if (isEdit.value) {
        // 编辑：调用updateBatch API
        batchAPI.updateBatch(batchForm.id, submitData).then(() => {
          ElMessage.success('批次更新成功');
          initData(); // 刷新数据
          handleCloseForm();
          saving.value = false;
        }).catch((error) => {
          console.error('更新批次失败:', error);
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
        }).catch((error) => {
          console.error('创建批次失败:', error);
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
  loadProductList(); // 预加载商品列表
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