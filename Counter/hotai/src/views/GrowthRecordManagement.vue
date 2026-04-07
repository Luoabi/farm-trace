<template>
  <div class="growth-record-management">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h1 class="page-title">生长记录管理</h1>
      <el-button type="primary" @click="handleCreateRecord">
        <el-icon><Plus /></el-icon>
        添加记录
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="hover">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="批次编号">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入批次编号或商品名称"
            clearable
            style="width: 250px;"
          />
        </el-form-item>
        <el-form-item label="生长阶段">
          <el-select
            v-model="searchForm.growthStage"
            placeholder="请选择生长阶段"
            clearable
            style="width: 150px;"
          >
            <el-option label="发芽期" value="发芽期" />
            <el-option label="幼苗期" value="幼苗期" />
            <el-option label="生长期" value="生长期" />
            <el-option label="成熟期" value="成熟期" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="hover">
      <el-table
        v-loading="loading"
        :data="recordList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="记录ID" width="120" show-overflow-tooltip />
        <el-table-column prop="batchNumber" label="批次编号" width="150" />
        <el-table-column prop="productName" label="商品名称" width="150" />
        <el-table-column prop="recordTime" label="记录时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.recordTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="growthStage" label="生长阶段" width="100">
          <template #default="scope">
            <el-tag :type="getGrowthStageTag(scope.row.growthStage)">{{ scope.row.growthStage }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="growthCondition" label="生长状况" width="100">
          <template #default="scope">
            <el-tag :type="getConditionTag(scope.row.growthCondition)">{{ scope.row.growthCondition }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="height" label="植株高度(cm)" width="120" />
        <el-table-column prop="temperature" label="温度(°C)" width="100" />
        <el-table-column prop="humidity" label="湿度(%)" width="100" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="link" size="small" @click="handleViewRecord(scope.row)">
              详情
            </el-button>
            <el-button type="link" size="small" @click="handleEditRecord(scope.row)">
              编辑
            </el-button>
            <el-button type="link" size="small" @click="handleDeleteRecord(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 记录详情对话框 -->
    <el-dialog
      v-model="recordDetailVisible"
      title="生长记录详情"
      width="70%"
      :before-close="handleCloseDetail"
    >
      <div class="record-detail" v-if="currentRecord">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录ID">{{ currentRecord.id }}</el-descriptions-item>
          <el-descriptions-item label="批次ID">{{ currentRecord.batchId }}</el-descriptions-item>
          <el-descriptions-item label="批次编号">{{ currentRecord.batchNumber }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ currentRecord.productName }}</el-descriptions-item>
          <el-descriptions-item label="记录时间">{{ formatDate(currentRecord.recordTime) }}</el-descriptions-item>
          <el-descriptions-item label="生长阶段">
            <el-tag :type="getGrowthStageTag(currentRecord.growthStage)">{{ currentRecord.growthStage }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="生长状况">
            <el-tag :type="getConditionTag(currentRecord.growthCondition)">{{ currentRecord.growthCondition }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="植株高度(cm)">{{ currentRecord.height || '-' }}</el-descriptions-item>
          <el-descriptions-item label="茎粗(cm)">{{ currentRecord.stemThickness || '-' }}</el-descriptions-item>
          <el-descriptions-item label="叶片颜色">{{ currentRecord.leafColor || '-' }}</el-descriptions-item>
          <el-descriptions-item label="病虫害情况">{{ currentRecord.pestDiseaseStatus || '-' }}</el-descriptions-item>
          <el-descriptions-item label="土壤含水量(%)">{{ currentRecord.waterContent || '-' }}</el-descriptions-item>
          <el-descriptions-item label="环境温度(°C)">{{ currentRecord.temperature || '-' }}</el-descriptions-item>
          <el-descriptions-item label="环境湿度(%)">{{ currentRecord.humidity || '-' }}</el-descriptions-item>
          <el-descriptions-item label="光照时长(小时)">{{ currentRecord.sunshineHours || '-' }}</el-descriptions-item>
          <el-descriptions-item label="上链状态">
            <el-tag :type="currentRecord.chainStatus === 1 ? 'success' : 'info'">
              {{ currentRecord.chainStatus === 1 ? '已上链' : '未上链' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="区块链哈希" :span="2">
            <el-tag v-if="currentRecord.txHash" class="hash-tag">{{ currentRecord.txHash }}</el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="上链时间" :span="2">
            {{ currentRecord.chainTime ? formatDate(currentRecord.chainTime) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentRecord.description || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentRecord.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(currentRecord.updateTime) }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 图片展示 -->
        <div v-if="currentRecord.imageUrls" class="image-section">
          <h3 class="section-title">记录图片</h3>
          <el-image
            v-for="(image, index) in currentRecord.imageUrls.split(',')"
            :key="index"
            :src="image.trim()"
            :preview-src-list="currentRecord.imageUrls.split(',').map(url => url.trim())"
            style="width: 150px; height: 100px; margin-right: 10px; margin-bottom: 10px;"
            fit="cover"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="handleCloseDetail">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 创建/编辑记录对话框 -->
    <el-dialog
      v-model="recordFormVisible"
      :title="isEdit ? '编辑生长记录' : '添加生长记录'"
      width="60%"
      :before-close="handleCloseForm"
    >
      <el-form
        ref="recordFormRef"
        :model="recordForm"
        :rules="recordRules"
        label-width="120px"
        class="record-form"
      >
        <el-form-item prop="batchId" label="选择批次">
          <el-select v-model="recordForm.batchId" placeholder="请选择批次" style="width: 100%;">
            <el-option
              v-for="batch in batchOptions"
              :key="batch.id"
              :label="batch.name"
              :value="batch.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="recordTime" label="记录时间">
          <el-date-picker
            v-model="recordForm.recordTime"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item prop="growthStage" label="生长阶段">
          <el-select v-model="recordForm.growthStage" placeholder="请选择生长阶段" style="width: 100%;">
            <el-option label="发芽期" value="发芽期" />
            <el-option label="幼苗期" value="幼苗期" />
            <el-option label="生长期" value="生长期" />
            <el-option label="成熟期" value="成熟期" />
          </el-select>
        </el-form-item>
        <el-form-item prop="growthCondition" label="生长状况">
          <el-select v-model="recordForm.growthCondition" placeholder="请选择生长状况" style="width: 100%;">
            <el-option label="良好" value="良好" />
            <el-option label="一般" value="一般" />
            <el-option label="较差" value="较差" />
            <el-option label="异常" value="异常" />
          </el-select>
        </el-form-item>
        <el-form-item prop="height" label="植株高度(cm)">
          <el-input-number v-model="recordForm.height" :min="0" :step="0.1" placeholder="请输入植株高度" style="width: 100%;" />
        </el-form-item>
        <el-form-item prop="stemThickness" label="茎粗(cm)">
          <el-input-number v-model="recordForm.stemThickness" :min="0" :step="0.1" placeholder="请输入茎粗" style="width: 100%;" />
        </el-form-item>
        <el-form-item prop="leafColor" label="叶片颜色">
          <el-input v-model="recordForm.leafColor" placeholder="请输入叶片颜色，如：深绿色" />
        </el-form-item>
        <el-form-item prop="pestDiseaseStatus" label="病虫害情况">
          <el-input v-model="recordForm.pestDiseaseStatus" placeholder="请输入病虫害情况，如：无" />
        </el-form-item>
        <el-form-item prop="waterContent" label="土壤含水量(%)">
          <el-input-number v-model="recordForm.waterContent" :min="0" :max="100" :step="0.1" placeholder="请输入土壤含水量" style="width: 100%;" />
        </el-form-item>
        <el-form-item prop="temperature" label="环境温度(°C)">
          <el-input-number v-model="recordForm.temperature" :step="0.1" placeholder="请输入环境温度" style="width: 100%;" />
        </el-form-item>
        <el-form-item prop="humidity" label="环境湿度(%)">
          <el-input-number v-model="recordForm.humidity" :min="0" :max="100" :step="0.1" placeholder="请输入环境湿度" style="width: 100%;" />
        </el-form-item>
        <el-form-item prop="sunshineHours" label="光照时长(小时)">
          <el-input-number v-model="recordForm.sunshineHours" :min="0" :step="0.1" placeholder="请输入光照时长" style="width: 100%;" />
        </el-form-item>
        <el-form-item prop="description" label="详细描述">
          <el-input
            v-model="recordForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入详细描述，如：浇水情况、施肥情况等"
          />
        </el-form-item>
        <el-form-item label="图片URL">
          <el-input
            v-model="recordForm.imageUrls"
            type="textarea"
            :rows="2"
            placeholder="请输入图片URL，多个URL用逗号分隔"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseForm">取消</el-button>
        <el-button type="primary" @click="handleSaveRecord" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, RefreshLeft, View, EditPen, Delete, Upload } from '@element-plus/icons-vue';
import { growthRecordAPI } from '../api/modules/growthRecord';
import { batchAPI } from '../api/modules/batch';

// 当前用户信息
const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
const farmerId = userInfo?.id || null;
const userRole = userInfo?.role || '';

// 状态定义
const loading = ref(false);
const saving = ref(false);
const recordFormRef = ref(null);
const recordList = ref([]);
const selectedRecords = ref([]);
const currentRecord = ref(null);
const recordDetailVisible = ref(false);
const recordFormVisible = ref(false);
const isEdit = ref(false);
const uploadFileList = ref([]);

// 批次选项（从批次数据中获取）
const batchOptions = ref([]);

// 获取批次列表
const getBatchOptions = async () => {
  try {
    const response = await batchAPI.getBatchList({ page: 1, pageSize: 100 });
    batchOptions.value = response.list.map(batch => ({
      id: batch.id,
      name: batch.batchNumber || batch.name
    }));
  } catch (error) {
    ElMessage.error('获取批次列表失败: ' + (error.message || '未知错误'));
  }
};

// 搜索表单
const searchForm = reactive({
  keyword: '',
  growthStage: ''
});

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 记录表单
const recordForm = reactive({
  id: '',
  batchId: '',
  growthStage: '',
  growthCondition: '良好',
  recordTime: '',
  height: null,
  stemThickness: null,
  leafColor: '',
  pestDiseaseStatus: '',
  waterContent: null,
  temperature: null,
  humidity: null,
  sunshineHours: null,
  description: '',
  imageUrls: ''
});

// 表单验证规则
const recordRules = {
  batchId: [
    { required: true, message: '请选择批次', trigger: 'change' }
  ],
  recordTime: [
    { required: true, message: '请选择记录时间', trigger: 'change' }
  ],
  growthStage: [
    { required: true, message: '请选择生长阶段', trigger: 'change' }
  ],
  growthCondition: [
    { required: true, message: '请选择生长状况', trigger: 'change' }
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
    if (searchForm.keyword && searchForm.keyword.trim()) {
      params.keyword = searchForm.keyword.trim();
    }
    
    if (searchForm.growthStage) {
      params.growthStage = searchForm.growthStage;
    }
    
    console.log('=== 生长记录查询参数（前端） ===');
    console.log('farmerId:', farmerId);
    console.log('userRole:', userRole);
    console.log('params:', params);
    console.log('========================');
    
    let response;
    
    // 超级管理员查看所有生长记录，农户只查看自己的生长记录
    if (userRole === '超级管理员') {
      response = await growthRecordAPI.getGrowthRecordList(params);
    } else {
      response = await growthRecordAPI.getGrowthRecordsByFarmer(farmerId, params);
    }
    
    console.log(response);
    
    recordList.value = response.list || [];
    pagination.total = response.total || 0;
  } catch (error) {
    console.error('获取生长记录失败:', error);
    ElMessage.error('获取生长记录失败: ' + (error.message || '未知错误'));
    recordList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
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

// 获取生长阶段标签
const getGrowthStageTag = (stage) => {
  const stageMap = {
    '发芽期': 'success',
    '幼苗期': 'primary',
    '生长期': 'warning',
    '成熟期': 'info'
  };
  return stageMap[stage] || 'default';
};

// 获取生长状况标签
const getConditionTag = (condition) => {
  const conditionMap = {
    '良好': 'success',
    '一般': 'info',
    '较差': 'warning',
    '异常': 'danger'
  };
  return conditionMap[condition] || 'default';
};

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1;
  initData();
};

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    growthStage: ''
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
  selectedRecords.value = selection;
};

// 选择批次
const handleBatchSelect = (batch) => {
  recordForm.batchName = batch.name;
};

// 文件变化处理
const handleFileChange = (uploadFile, uploadFiles) => {
  uploadFileList.value = uploadFiles;
};

// 文件移除处理
const handleFileRemove = (uploadFile, uploadFiles) => {
  uploadFileList.value = uploadFiles;
};

// 查看记录详情
const handleViewRecord = async (row) => {
  try {
    const response = await growthRecordAPI.getGrowthRecordDetail(row.id);
    currentRecord.value = response;
    recordDetailVisible.value = true;
  } catch (error) {
    ElMessage.error('获取记录详情失败: ' + (error.message || '未知错误'));
  }
};

// 关闭详情
const handleCloseDetail = () => {
  recordDetailVisible.value = false;
  currentRecord.value = null;
};

// 创建记录
const handleCreateRecord = () => {
  isEdit.value = false;
  // 重置表单
  Object.assign(recordForm, {
    id: '',
    batchId: '',
    growthStage: '',
    growthCondition: '良好',
    recordTime: new Date(),
    height: null,
    stemThickness: null,
    leafColor: '',
    pestDiseaseStatus: '',
    waterContent: null,
    temperature: null,
    humidity: null,
    sunshineHours: null,
    description: '',
    imageUrls: ''
  });
  uploadFileList.value = [];
  recordFormVisible.value = true;
};

// 编辑记录
const handleEditRecord = (row) => {
  isEdit.value = true;
  // 填充表单数据
  Object.assign(recordForm, {
    id: row.id,
    batchId: row.batchId,
    growthStage: row.growthStage,
    growthCondition: row.growthCondition,
    recordTime: row.recordTime,
    height: row.height,
    stemThickness: row.stemThickness,
    leafColor: row.leafColor,
    pestDiseaseStatus: row.pestDiseaseStatus,
    waterContent: row.waterContent,
    temperature: row.temperature,
    humidity: row.humidity,
    sunshineHours: row.sunshineHours,
    description: row.description,
    imageUrls: row.imageUrls || ''
  });
  recordFormVisible.value = true;
};

// 关闭表单
const handleCloseForm = () => {
  recordFormVisible.value = false;
  uploadFileList.value = [];
  if (recordFormRef.value) {
    recordFormRef.value.resetFields();
  }
};

// 保存记录
const handleSaveRecord = () => {
  recordFormRef.value.validate((valid) => {
    if (valid) {
      saving.value = true;
      
      // 格式化日期为 ISO 字符串（后端 LocalDateTime 可以接收）
      const formatDateTime = (date) => {
        if (!date) return null;
        if (typeof date === 'string') return date;
        return new Date(date).toISOString();
      };
      
      // 准备提交数据（根据后端 GrowthRecordRequest 字段调整）
      const submitData = {
        batchId: recordForm.batchId,
        growthStage: recordForm.growthStage,
        growthCondition: recordForm.growthCondition,
        recordTime: formatDateTime(recordForm.recordTime),
        height: recordForm.height,
        stemThickness: recordForm.stemThickness,
        leafColor: recordForm.leafColor,
        pestDiseaseStatus: recordForm.pestDiseaseStatus,
        waterContent: recordForm.waterContent,
        temperature: recordForm.temperature,
        humidity: recordForm.humidity,
        sunshineHours: recordForm.sunshineHours,
        description: recordForm.description,
        imageUrls: recordForm.imageUrls
      };
      
      const savePromise = isEdit.value 
        ? growthRecordAPI.updateGrowthRecord(recordForm.id, submitData) 
        : growthRecordAPI.createGrowthRecord(submitData);
      
      savePromise.then(() => {
        ElMessage.success(isEdit.value ? '记录更新成功' : '记录创建成功');
        handleCloseForm();
        initData(); // Refresh data after save
      }).catch((error) => {
        console.error('保存失败:', error);
        ElMessage.error('保存失败: ' + (error.message || '未知错误'));
      }).finally(() => {
        saving.value = false;
      });
    }
  });
};

// 删除记录
const handleDeleteRecord = (id) => {
  ElMessageBox.confirm('确定要删除这个生长记录吗？删除后数据将无法恢复', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    growthRecordAPI.deleteGrowthRecord(id).then(() => {
      ElMessage.success('记录删除成功');
      initData(); // Refresh data after delete
    }).catch((error) => {
      ElMessage.error('删除失败: ' + (error.message || '未知错误'));
    });
  }).catch(() => {
    // 取消删除
  });
};

// 组件挂载时初始化数据
onMounted(async () => {
  await getBatchOptions(); // Get batch options first
  initData();
});
</script>

<style scoped>
.growth-record-management {
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
.hash-tag {
  font-size: 12px;
  word-break: break-all;
  white-space: normal;
}

/* 图片展示样式 */
.image-gallery {
  display: flex;
  flex-wrap: wrap;
}

.image-section {
  margin-top: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

/* 记录表单样式 */
.record-form {
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