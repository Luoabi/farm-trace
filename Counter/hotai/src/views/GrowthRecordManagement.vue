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
        <el-form-item label="批次名称">
          <el-select
            v-model="searchForm.batchId"
            placeholder="请选择批次"
            clearable
            style="width: 200px;"
          >
            <el-option
              v-for="batch in batchOptions"
              :key="batch.id"
              :label="batch.name"
              :value="batch.id"
            />
          </el-select>
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
        <el-form-item label="记录日期">
          <el-date-picker
            v-model="searchForm.recordDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px;"
          />
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
        <el-table-column prop="id" label="记录ID" width="100" />
        <el-table-column prop="batchName" label="批次名称" min-width="180" />
        <el-table-column prop="recordDate" label="记录日期" width="120" />
        <el-table-column prop="growthStage" label="生长阶段" width="100">
          <template #default="scope">
            <el-tag :type="getGrowthStageTag(scope.row.growthStage)">{{ scope.row.growthStage }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="height" label="植株高度" width="100" />
        <el-table-column prop="condition" label="生长状况" width="100">
          <template #default="scope">
            <el-tag :type="getConditionTag(scope.row.condition)">{{ scope.row.condition }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="图片" width="100">
          <template #default="scope">
            <el-popover
              trigger="click"
              placement="top"
              :width="Math.min(scope.row.imageCount * 150, 600)"
            >
              <template #reference>
                <el-button type="link" size="small">
                  {{ scope.row.imageCount }}张
                </el-button>
              </template>
              <div class="image-gallery">
                <el-image
                  v-for="i in scope.row.imageCount"
                  :key="`${scope.row.id}-image-${i}`"
                  :src="`https://via.placeholder.com/120x80?text=Image+${i}`"
                  :preview-src-list="[`https://via.placeholder.com/400x300?text=Image+${i}`]"
                  style="width: 120px; height: 80px; margin-right: 10px;"
                  fit="cover"
                />
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="link" size="small" @click="handleViewRecord(scope.row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button type="link" size="small" @click="handleEditRecord(scope.row)">
              <el-icon><EditPen /></el-icon>
              编辑
            </el-button>
            <el-button type="link" size="small" @click="handleDeleteRecord(scope.row.id)">
              <el-icon><Delete /></el-icon>
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
          <el-descriptions-item label="批次名称">{{ currentRecord.batchName }}</el-descriptions-item>
          <el-descriptions-item label="记录日期">{{ currentRecord.recordDate }}</el-descriptions-item>
          <el-descriptions-item label="生长阶段">{{ currentRecord.growthStage }}</el-descriptions-item>
          <el-descriptions-item label="生长状况">{{ currentRecord.condition }}</el-descriptions-item>
          <el-descriptions-item label="植株高度">{{ currentRecord.height }}</el-descriptions-item>
          <el-descriptions-item label="温度">{{ currentRecord.temperature }}</el-descriptions-item>
          <el-descriptions-item label="湿度">{{ currentRecord.humidity }}</el-descriptions-item>
          <el-descriptions-item label="区块链哈希" :column="2">
            <el-tag class="hash-tag">{{ currentRecord.blockchainHash }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :column="2">{{ currentRecord.description }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentRecord.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentRecord.updatedAt }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 图片展示 -->
        <div v-if="currentRecord.images && currentRecord.images.length > 0" class="image-section">
          <h3 class="section-title">记录图片</h3>
          <el-image
            v-for="(image, index) in currentRecord.images"
            :key="index"
            :src="image"
            :preview-src-list="currentRecord.images"
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
          <el-select v-model="recordForm.batchId" placeholder="请选择批次">
            <el-option
              v-for="batch in batchOptions"
              :key="batch.id"
              :label="batch.name"
              :value="batch.id"
              @click="handleBatchSelect(batch)"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="recordDate" label="记录日期">
          <el-date-picker
            v-model="recordForm.recordDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item prop="growthStage" label="生长阶段">
          <el-select v-model="recordForm.growthStage" placeholder="请选择生长阶段">
            <el-option label="发芽期" value="发芽期" />
            <el-option label="幼苗期" value="幼苗期" />
            <el-option label="生长期" value="生长期" />
            <el-option label="成熟期" value="成熟期" />
          </el-select>
        </el-form-item>
        <el-form-item prop="height" label="植株高度">
          <el-input v-model="recordForm.height" placeholder="请输入植株高度，如：5cm" />
        </el-form-item>
        <el-form-item prop="temperature" label="温度">
          <el-input v-model="recordForm.temperature" placeholder="请输入温度，如：20°C" />
        </el-form-item>
        <el-form-item prop="humidity" label="湿度">
          <el-input v-model="recordForm.humidity" placeholder="请输入湿度，如：65%" />
        </el-form-item>
        <el-form-item prop="condition" label="生长状况">
          <el-select v-model="recordForm.condition" placeholder="请选择生长状况">
            <el-option label="良好" value="良好" />
            <el-option label="一般" value="一般" />
            <el-option label="较差" value="较差" />
            <el-option label="异常" value="异常" />
          </el-select>
        </el-form-item>
        <el-form-item prop="description" label="详细描述">
          <el-input
            v-model="recordForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入详细描述，如：浇水情况、施肥情况、病虫害防治等"
          />
        </el-form-item>
        <el-form-item label="上传图片">
          <el-upload
            v-model:file-list="uploadFileList"
            class="upload-demo"
            action="#"
            multiple
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :auto-upload="false"
            list-type="picture"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              选择图片
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传jpg/png文件，单个文件不超过2MB，最多上传5张图片
              </div>
            </template>
          </el-upload>
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

// 当前农户的id  在localStorage userInfo下的id
const farmerId = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).id : null;

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
  batchId: '',
  growthStage: '',
  recordDate: []
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
  batchName: '',
  recordDate: '',
  growthStage: '',
  height: '',
  temperature: '',
  humidity: '',
  condition: '良好',
  description: '',
  images: []
});

// 表单验证规则
const recordRules = {
  batchId: [
    { required: true, message: '请选择批次', trigger: 'change' }
  ],
  recordDate: [
    { required: true, message: '请选择记录日期', trigger: 'change' }
  ],
  growthStage: [
    { required: true, message: '请选择生长阶段', trigger: 'change' }
  ],
  height: [
    { required: true, message: '请输入植株高度', trigger: 'blur' }
  ],
  condition: [
    { required: true, message: '请选择生长状况', trigger: 'change' }
  ]
};

// 初始化数据
const initData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...searchForm
    };
    // 使用农户ID查询该农户的生长记录
    const response = await growthRecordAPI.getGrowthRecordsByFarmer(farmerId, params);
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
    batchId: '',
    growthStage: '',
    recordDate: []
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
    batchName: '',
    recordDate: '',
    growthStage: '',
    height: '',
    temperature: '',
    humidity: '',
    condition: '良好',
    description: '',
    images: []
  });
  uploadFileList.value = [];
  recordFormVisible.value = true;
};

// 编辑记录
const handleEditRecord = (row) => {
  isEdit.value = true;
  // 填充表单数据
  Object.assign(recordForm, {
    ...row,
    images: row.images || []
  });
  // 模拟文件列表
  if (row.imageCount > 0) {
    uploadFileList.value = Array.from({ length: row.imageCount }, (_, i) => ({
      name: `image${i + 1}.jpg`,
      url: row.images?.[i] || `https://via.placeholder.com/300x200?text=Image+${i + 1}`
    }));
  }
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
      const savePromise = isEdit.value 
        ? growthRecordAPI.updateGrowthRecord(recordForm.id, recordForm) 
        : growthRecordAPI.createGrowthRecord(recordForm);
      
      savePromise.then(() => {
        ElMessage.success(isEdit.value ? '记录更新成功' : '记录创建成功');
        handleCloseForm();
        initData(); // Refresh data after save
      }).catch((error) => {
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