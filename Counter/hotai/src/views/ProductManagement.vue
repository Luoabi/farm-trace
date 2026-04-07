<template>
  <div class="product-management">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h1 class="page-title">商品管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreateProduct">
          <el-icon>
            <Plus />
          </el-icon>
          添加商品
        </el-button>
        <el-button @click="handleBatchExport">
          <el-icon>
            <Download />
          </el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="hover">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入商品名称" clearable style="width: 200px;" />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="searchForm.category" placeholder="请选择商品分类" clearable style="width: 150px;">
            <el-option label="蔬菜" value="蔬菜" />
            <el-option label="水果" value="水果" />
            <el-option label="粮油" value="粮油" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select v-model="searchForm.status" placeholder="请选择商品状态" clearable style="width: 150px;">
            <el-option label="上架" value="1" />
            <el-option label="下架" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon>
              <RefreshLeft />
            </el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="hover">
      <div class="table-header">
        <span>共 {{ pagination.total }} 个商品</span>
        <el-button-group>
          <el-button type="link" size="small" @click="handleBatchPublish" :disabled="selectedProducts.length === 0">
            <el-icon>
              <Check />
            </el-icon>
            批量上架
          </el-button>
          <el-button type="link" size="small" @click="handleBatchOffline" :disabled="selectedProducts.length === 0">
            <el-icon>
              <Close />
            </el-icon>
            批量下架
          </el-button>
          <el-button type="link" size="small" @click="handleBatchDelete" :disabled="selectedProducts.length === 0">
            <el-icon>
              <Delete />
            </el-icon>
            批量删除
          </el-button>
        </el-button-group>
      </div>

      <el-table v-loading="loading" :data="productList" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="productCode" label="商品ID" width="100" />
        <el-table-column prop="name" label="商品名称" min-width="180">
          <template #default="scope">
            <div class="product-name">
              <!-- <el-image
                :src="scope.row.image"
                style="width: 40px; height: 40px; margin-right: 10px;"
                fit="cover"
              /> -->
              <span>{{ scope.row.productName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="price" label="价格(元)" width="100" />
        <el-table-column prop="productionPlace" label="产地" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === '上架' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column  prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="link" size="small" @click="handleViewProduct(scope.row)">
              查看
            </el-button>
            <el-button type="link" size="small" @click="handleEditProduct(scope.row)">
              编辑
            </el-button>
            <el-button type="link" size="small" @click="handleChangeStatus(scope.row)">
              {{ scope.row.status === '上架' ? '下架' : '上架' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="pagination.total"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 商品详情对话框 -->
    <el-dialog v-model="productDetailVisible" title="商品详情" width="70%" :before-close="handleCloseDetail">
      <div class="product-detail" v-if="currentProduct">
        <div class="detail-header">
          <el-image 
            :src="currentProduct.imageUrl || 'https://via.placeholder.com/200x200?text=暂无图片'" 
            style="width: 200px; height: 200px; border-radius: 8px;" 
            fit="cover" 
          />
          <div class="product-info">
            <h3>{{ currentProduct.productName }}</h3>
            <div class="info-item">
              <span class="label">商品编号：</span>
              <span>{{ currentProduct.productCode }}</span>
            </div>
            <div class="info-item">
              <span class="label">分类：</span>
              <el-tag>{{ currentProduct.category }}</el-tag>
            </div>
            <div class="info-item">
              <span class="label">参考价格：</span>
              <span class="price">¥{{ currentProduct.price }} / {{ currentProduct.unit }}</span>
            </div>
            <div class="info-item">
              <span class="label">状态：</span>
              <el-tag :type="currentProduct.status === 1 ? 'success' : 'danger'">
                {{ currentProduct.status === 1 ? '上架' : '下架' }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-descriptions :column="2" border style="margin-top: 20px;">
          <el-descriptions-item label="包装规格">{{ currentProduct.specification || '-' }}</el-descriptions-item>
          <el-descriptions-item label="产地">{{ currentProduct.productionPlace || '-' }}</el-descriptions-item>
          <el-descriptions-item label="商品描述" :span="2">
            {{ currentProduct.description || '暂无描述' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentProduct.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentProduct.updateTime }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="handleCloseDetail">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 创建/编辑商品对话框 -->
    <el-dialog v-model="productFormVisible" :title="isEdit ? '编辑商品' : '添加商品'" width="60%"
      :before-close="handleCloseForm">
      <el-form ref="productFormRef" :model="productForm" :rules="productRules" label-width="120px" class="product-form">
        <el-form-item prop="productCode" label="商品编号">
          <el-input v-model="productForm.productCode" placeholder="请输入商品编号，如：PC001" />
        </el-form-item>
        <el-form-item prop="name" label="商品名称">
          <el-input v-model="productForm.name" placeholder="请输入商品名称，如：西昌葡萄" />
        </el-form-item>
        <el-form-item prop="category" label="商品分类">
          <el-select v-model="productForm.category" placeholder="请选择商品分类" style="width: 100%;">
            <el-option label="蔬菜" value="蔬菜" />
            <el-option label="水果" value="水果" />
            <el-option label="粮油" value="粮油" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item prop="price" label="参考价格">
          <el-input-number v-model="productForm.price" :min="0" :precision="2" placeholder="请输入参考价格" style="width: 100%;" />
          <span style="margin-left: 10px; color: #909399;">元</span>
        </el-form-item>
        <el-form-item prop="unit" label="单位">
          <el-select v-model="productForm.unit" placeholder="请选择单位" style="width: 100%;">
            <el-option label="千克(kg)" value="kg" />
            <el-option label="斤" value="斤" />
            <el-option label="箱" value="箱" />
            <el-option label="袋" value="袋" />
            <el-option label="个" value="个" />
          </el-select> 
        </el-form-item>
        <el-form-item prop="specification" label="包装规格">
          <el-input v-model="productForm.specification" placeholder="请输入包装规格，如：5kg/箱" />
        </el-form-item>
        <el-form-item prop="productionPlace" label="产地">
          <el-input v-model="productForm.productionPlace" placeholder="请输入产地，如：四川省西昌市" />
        </el-form-item>
        <el-form-item label="商品图片">
          <el-upload 
            v-model:file-list="mainImageList" 
            class="avatar-uploader" 
            action="#" 
            :auto-upload="false"
            :limit="1" 
            :on-change="handleMainImageChange" 
            list-type="picture-card"
          >
            <el-icon><Upload /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg/png 格式，建议尺寸 800x800
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item prop="description" label="商品描述">
          <el-input 
            v-model="productForm.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入商品描述，如：产品特点、种植方式、营养价值等" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseForm">取消</el-button>
        <el-button type="primary" @click="handleSaveProduct" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Download, Search, RefreshLeft, Check, Close, Delete, View, Edit, Upload } from '@element-plus/icons-vue';
import { productAPI } from '../api/modules/product';
import { batchAPI } from '../api/modules/batch';

// 当前用户信息
const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
const farmerId = userInfo?.id || null;
const userRole = userInfo?.role || '';

// 响应式数据
const loading = ref(false);
const saving = ref(false);
const productFormRef = ref(null);
const productList = ref([]);
const selectedProducts = ref([]);
const currentProduct = ref(null);
const productDetailVisible = ref(false);
const productFormVisible = ref(false);
const isEdit = ref(false);
const mainImageList = ref([]);

// 批次选项
const batchOptions = ref([]);

// 加载批次选项
const loadBatchOptions = async () => {
  try {
    // 尝试从API获取数据
    const response = await batchAPI.getBatchList({
      category: productForm.category,
      name: '',
      page: 1,
      pageSize: 10,
      status: ''
    });
    batchOptions.value = response.list.map(batch => ({
      id: batch.id,
      name: batch.batchNumber || batch.name
    }));
  } catch (error) {
    console.error('获取批次选项失败:', error);
    ElMessage.error('获取批次选项失败: ' + (error.message || '未知错误'));
    batchOptions.value = [];
  }
};

// 搜索表单
const searchForm = reactive({
  keyword: '',    // 改为 keyword，用于搜索商品名称
  category: '',
  status: ''
});

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 商品表单
const productForm = reactive({
  id: '',
  productCode: '',
  name: '',
  categocary: '',
  description: '',
  price: 0,
  unit: '',
  specification: '',
  productionPlace: '',
  imageUrl: '',
  status: 'ACTIVE'
});

// 表单验证规则
const productRules = {
  productCode: [
    { required: true, message: '请输入商品编号', trigger: 'blur' },
    { min: 3, max: 50, message: '商品编号长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '商品名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '商品价格必须大于等于0', trigger: 'blur' }
  ],
  unit: [
    { required: true, message: '请选择单位', trigger: 'change' }
  ],
  specification: [
    { required: true, message: '请输入包装规格', trigger: 'blur' }
  ],
  productionPlace: [
    { required: true, message: '请输入产地', trigger: 'blur' }
  ]
};

// 初始化数据
const initData = async () => {
  loading.value = true;
  try {
    let response;
    
    // 超级管理员查看所有商品，农户只查看自己的商品
    if (userRole === '超级管理员') {
      response = await productAPI.getProductList({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...searchForm
      });
    } else {
      response = await productAPI.getProductListByFarmer(farmerId, {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...searchForm
      });
    }
    
    productList.value = response.list || [];
    pagination.total = response.total || 0;
  } catch (error) {
    console.error('获取商品数据失败:', error);
    productList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
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
    keyword: '',
    category: '',
    status: ''
  });
  pagination.currentPage = 1;
  initData(); // 重置后立即查询
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
  selectedProducts.value = selection;
};

// 选择批次
const handleBatchSelect = (batch) => {
  productForm.batchName = batch.name;
};

// 主图变化处理
const handleMainImageChange = (uploadFile, uploadFiles) => {
  mainImageList.value = uploadFiles.slice(0, 1);
  if (uploadFiles[0]) {
    productForm.image = `https://via.placeholder.com/300x300?text=${productForm.name || 'Product'}`;
  }
};

// 查看商品详情
const handleViewProduct = (row) => {
  // 获取商品详情（使用API）
  productAPI.getProductDetail(row.id).then((response) => {
    currentProduct.value = response;
    productDetailVisible.value = true;
  }).catch(() => {
    ElMessage.error('获取商品详情失败');
  });
};

// 关闭详情
const handleCloseDetail = () => {
  productDetailVisible.value = false;
  currentProduct.value = null;
};

// 创建商品
const handleCreateProduct = () => {
  isEdit.value = false;
  // 重置表单
  Object.assign(productForm, {
    id: '',
    productCode: '',
    name: '',
    category: '',
    description: '',
    price: 0,
    unit: '',
    specification: '',
    productionPlace: '',
    imageUrl: '',
    status: 'ACTIVE'
  });
  mainImageList.value = [];
  productFormVisible.value = true;
};

// 编辑商品
const handleEditProduct = (row) => {
  isEdit.value = true;
  // 填充表单数据
  Object.assign(productForm, {
    id: row.id,
    productCode: row.productCode,
    name: row.productName,
    category: row.category,
    description: row.description,
    price: row.price,
    unit: row.unit,
    specification: row.specification,
    productionPlace: row.productionPlace,
    imageUrl: row.imageUrl,
    status: row.status
  });
  // 模拟主图
  if (row.imageUrl) {
    mainImageList.value = [{
      name: 'main-image.jpg',
      url: row.imageUrl
    }];
  }
  productFormVisible.value = true;
};

// 关闭表单
const handleCloseForm = () => {
  productFormVisible.value = false;
  mainImageList.value = [];
  if (productFormRef.value) {
    productFormRef.value.resetFields();
  }
};

// 保存商品
const handleSaveProduct = () => {
  productFormRef.value.validate((valid) => {
    if (valid) {
      saving.value = true;
      
      // 准备提交数据（根据后端ProductRequest字段调整）
      const submitData = {
        productCode: productForm.productCode,
        productName: productForm.name,
        category: productForm.category,
        description: productForm.description,
        price: productForm.price,
        unit: productForm.unit,
        specification: productForm.specification,
        productionPlace: productForm.productionPlace,
        imageUrl: productForm.imageUrl,
        farmerId: farmerId // 使用顶部定义的 farmerId
      };
      
      if (isEdit.value) {
        // 编辑：调用updateProduct API
        productAPI.updateProduct(productForm.id, submitData).then(() => {
          ElMessage.success('商品更新成功');
          initData(); // 刷新数据
          handleCloseForm();
          saving.value = false;
        }).catch(() => {
          ElMessage.error('更新商品失败');
          saving.value = false;
        });
      } else {
        // 创建：调用createProduct API
        productAPI.createProduct(submitData).then(() => {
          ElMessage.success('商品创建成功');
          initData(); // 刷新数据
          handleCloseForm();
          saving.value = false;
        }).catch(() => {
          ElMessage.error('创建商品失败');
          saving.value = false;
        });
      }
    }
  });
};

// 改变商品状态
const handleChangeStatus = (row) => {
  const newStatus = row.status === '上架' ? '下架' : '上架';
  const newStatusValue = row.status === '上架' ? '0' : '1'; // 转换为数字字符串
  
  ElMessageBox.confirm(`确定要将商品「${row.name}」${newStatus}吗？`, '状态变更确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 调用更新商品状态API
    productAPI.updateProductStatus(row.id, newStatusValue).then(() => {
      ElMessage.success(`商品${newStatus}成功`);
      initData(); // 刷新列表
    }).catch(() => {
      ElMessage.error(`商品${newStatus}失败`);
    });
  }).catch(() => {
    // 取消操作
  });
};

// 批量上架
const handleBatchPublish = () => {
  ElMessageBox.confirm(`确定要上架选中的 ${selectedProducts.value.length} 个商品吗？`, '批量操作确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 调用API批量更新状态
    const promises = selectedProducts.value.map(item => 
      productAPI.updateProductStatus(item.id, '1')
    );
    
    Promise.all(promises).then(() => {
      ElMessage.success('批量上架成功');
      selectedProducts.value = [];
      initData(); // 刷新列表
    }).catch(() => {
      ElMessage.error('批量上架失败');
    });
  }).catch(() => {
    // 取消操作
  });
};

// 批量下架
const handleBatchOffline = () => {
  ElMessageBox.confirm(`确定要下架选中的 ${selectedProducts.value.length} 个商品吗？`, '批量操作确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 调用API批量更新状态
    const promises = selectedProducts.value.map(item => 
      productAPI.updateProductStatus(item.id, '0')
    );
    
    Promise.all(promises).then(() => {
      ElMessage.success('批量下架成功');
      selectedProducts.value = [];
      initData(); // 刷新列表
    }).catch(() => {
      ElMessage.error('批量下架失败');
    });
  }).catch(() => {
    // 取消操作
  });
};

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedProducts.value.length} 个商品吗？删除后数据将无法恢复`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(() => {
    // 调用批量删除API
    productAPI.batchDeleteUsers(selectedProducts.value.map(item => item.id)).then(() => {
      ElMessage.success('批量删除成功');
      initData(); // 刷新数据
      selectedProducts.value = [];
    }).catch(() => {
      ElMessage.error('批量删除失败');
    });
  }).catch(() => {
    // 取消删除
  });
};

// 导出数据
const handleBatchExport = () => {
  ElMessage.success('数据导出成功');
};

// 组件挂载时初始化数据
onMounted(async () => {
  await loadBatchOptions();
  await initData();
});
</script>

<style scoped>
.product-management {
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

.header-actions {
  display: flex;
  gap: 10px;
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

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

/* 商品名称样式 */
.product-name {
  display: flex;
  align-items: center;
}

/* 分页样式 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 商品详情样式 */
.detail-header {
  display: flex;
  gap: 20px;
}

.product-info {
  flex: 1;
}

.product-info h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.info-item {
  margin-bottom: 10px;
}

.info-item .label {
  font-weight: bold;
  margin-right: 5px;
}

.info-item .price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

/* 哈希文本样式 */
.hash-tag {
  font-size: 12px;
  word-break: break-all;
  white-space: normal;
}

/* 更多图片样式 */
.more-images {
  margin-top: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

/* 商品表单样式 */
.product-form {
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

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .search-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .search-form .el-form-item {
    margin-right: 0;
  }

  .detail-header {
    flex-direction: column;
  }
}
</style>