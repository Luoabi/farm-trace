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
          <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable style="width: 200px;" />
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
            <el-option label="上架" value="上架" />
            <el-option label="下架" value="下架" />
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
        <el-table-column prop="id" label="批次ID" width="100" />
        <el-table-column prop="price" label="价格(元)" width="100" />
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="salesCount" label="销量" width="100" />
        <el-table-column prop="productionPlace" label="生产商" min-width="150" show-overflow-tooltip />
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
              <el-icon>
                <View />
              </el-icon>
              查看
            </el-button>
            <el-button type="link" size="small" @click="handleEditProduct(scope.row)">
              <el-icon>
                <Edit />
              </el-icon>
              编辑
            </el-button>
            <el-button type="link" size="small" @click="handleChangeStatus(scope.row)">
              <!-- 如果商品状态是上架，点击后下架；如果是下架，点击后上架 -->
              <el-icon v-if="scope.row.status === '上架'">
                <Close />
              </el-icon>
              <el-icon v-else>
                <Check />
              </el-icon>
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
          <el-image :src="currentProduct.image" style="width: 200px; height: 200px;" fit="cover" />
          <div class="product-info">
            <h3>{{ currentProduct.name }}</h3>
            <div class="info-item">
              <span class="label">商品ID：</span>
              <span>{{ currentProduct.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">分类：</span>
              <span>{{ currentProduct.category }}</span>
            </div>
            <div class="info-item">
              <span class="label">价格：</span>
              <span class="price">¥{{ currentProduct.price }}</span>
            </div>
            <div class="info-item">
              <span class="label">库存：</span>
              <span>{{ currentProduct.stock }} 件</span>
            </div>
            <div class="info-item">
              <span class="label">销量：</span>
              <span>{{ currentProduct.salesCount }} 件</span>
            </div>
            <div class="info-item">
              <span class="label">状态：</span>
              <el-tag :type="currentProduct.status === '上架' ? 'success' : 'danger'">
                {{ currentProduct.status }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-descriptions :column="2" border style="margin-top: 20px;">
          <el-descriptions-item label="批次ID">{{ currentProduct.batchId }}</el-descriptions-item>
          <el-descriptions-item label="批次名称">{{ currentProduct.batchName }}</el-descriptions-item>
          <el-descriptions-item label="生产商">{{ currentProduct.producer }}</el-descriptions-item>
          <el-descriptions-item label="产地">{{ currentProduct.origin }}</el-descriptions-item>
          <el-descriptions-item label="保质期">{{ currentProduct.shelfLife }}</el-descriptions-item>
          <el-descriptions-item label="包装规格">{{ currentProduct.packageSpec }}</el-descriptions-item>
          <el-descriptions-item label="区块链哈希" :column="2">
            <el-tag class="hash-tag">{{ currentProduct.blockchainHash }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="商品描述" :column="2">{{ currentProduct.description }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentProduct.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentProduct.updatedAt }}</el-descriptions-item>
        </el-descriptions>

        <!-- 更多图片 -->
        <div v-if="currentProduct.moreImages && currentProduct.moreImages.length > 0" class="more-images">
          <h4 class="section-title">商品图片</h4>
          <el-image v-for="(image, index) in currentProduct.moreImages" :key="index" :src="image"
            :preview-src-list="[currentProduct.image, ...currentProduct.moreImages]"
            style="width: 120px; height: 90px; margin-right: 10px; margin-bottom: 10px;" fit="cover" />
        </div>
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
          <el-input v-model="productForm.productCode" placeholder="请输入商品编号" />
        </el-form-item>
        <el-form-item prop="name" label="商品名称">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item prop="category" label="商品分类">
          <el-select v-model="productForm.category" placeholder="请选择商品分类">
            <el-option label="蔬菜" value="蔬菜" />
            <el-option label="水果" value="水果" />
            <el-option label="粮油" value="粮油" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item prop="price" label="商品价格">
          <el-input v-model.number="productForm.price" placeholder="请输入商品价格" prefix-icon="i-ep-cny" />
        </el-form-item>
        <el-form-item prop="unit" label="单位">
          <el-select v-model="productForm.unit" placeholder="请选择单位">
            <el-option label="kg" value="kg" />
            <el-option label="箱" value="箱" />
            <el-option label="袋" value="袋" />
          </el-select> 
        </el-form-item>
        <el-form-item prop="specification" label="包装规格">
          <el-input v-model="productForm.specification" placeholder="请输入包装规格" />
        </el-form-item>
        <el-form-item prop="productionPlace" label="产地">
          <el-input v-model="productForm.productionPlace" placeholder="请输入产地" />
        </el-form-item>
        <el-form-item prop="imageUrl" label="图片URL">
          <el-input v-model="productForm.imageUrl" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item prop="producer" label="生产商">
          <el-input v-model="productForm.producer" placeholder="请输入生产商名称" />
        </el-form-item>
        <el-form-item prop="origin" label="产地">
          <el-input v-model="productForm.origin" placeholder="请输入产地" />
        </el-form-item>
        <el-form-item prop="shelfLife" label="保质期">
          <el-input v-model="productForm.shelfLife" placeholder="请输入保质期，如：7天、3个月" />
        </el-form-item>
        <el-form-item prop="packageSpec" label="包装规格">
          <el-input v-model="productForm.packageSpec" placeholder="请输入包装规格" />
        </el-form-item>
        <el-form-item label="商品主图">
          <el-upload v-model:file-list="mainImageList" class="avatar-uploader" action="#" :auto-upload="false"
            :limit="1" :on-change="handleMainImageChange" list-type="picture">
            <el-button type="primary">
              <el-icon>
                <Upload />
              </el-icon>
              上传主图
            </el-button>
          </el-upload>
        </el-form-item>
        <el-form-item prop="description" label="商品描述">
          <el-input v-model="productForm.description" type="textarea" :rows="4" placeholder="请输入商品描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseForm">取消</el-button>
        <el-button type="primary" @click="handleSaveProduct" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 更新库存对话框 -->
    <el-dialog v-model="stockDialogVisible" title="更新库存" width="40%" :before-close="handleCloseStockDialog">
      <el-form ref="stockFormRef" :model="stockForm" :rules="stockRules" label-width="100px">
        <el-form-item prop="currentStock" label="当前库存">
          <el-input v-model="stockForm.currentStock" disabled />
        </el-form-item>
        <el-form-item prop="changeType" label="操作类型">
          <el-radio-group v-model="stockForm.changeType">
            <el-radio label="增加">增加库存</el-radio>
            <el-radio label="减少">减少库存</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="changeCount" label="变动数量">
          <el-input v-model.number="stockForm.changeCount" placeholder="请输入变动数量" />
        </el-form-item>
        <el-form-item prop="reason" label="变动原因">
          <el-input v-model="stockForm.reason" placeholder="请输入库存变动原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseStockDialog">取消</el-button>
        <el-button type="primary" @click="handleUpdateStock">确认更新</el-button>
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

// 当前农户的id  在localStorage userInfo下的id
const farmerId = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).id : null;

// 响应式数据
const loading = ref(false);
const saving = ref(false);
const productFormRef = ref(null);
const stockFormRef = ref(null);
const productList = ref([]);
const selectedProducts = ref([]);
const currentProduct = ref(null);
const productDetailVisible = ref(false);
const productFormVisible = ref(false);
const stockDialogVisible = ref(false);
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
  name: '',
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
  category: '',
  description: '',
  price: 0,
  unit: '',
  specification: '',
  productionPlace: '',
  imageUrl: '',
  status: 'ACTIVE', // ACTIVE:上架,INACTIVE:下架,DELETED:已删除
  createTime: '',
  updateTime: ''
});

// 库存表单
const stockForm = reactive({
  currentStock: 0,
  changeType: '增加',
  changeCount: '',
  reason: ''
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

const stockRules = {
  changeCount: [
    { required: true, message: '请输入变动数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '变动数量必须大于0', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入变动原因', trigger: 'blur' }
  ]
};

// 初始化数据
const initData = async () => {
  loading.value = true;
  try {
    // 使用农户ID查询该农户的商品
    const response = await productAPI.getProductListByFarmer(farmerId, {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...searchForm
    });
    
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
    name: '',
    category: '',
    status: ''
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
    name: '',
    category: '',
    batchId: '',
    batchName: '',
    price: '',
    stock: '',
    salesCount: 0,
    producer: '',
    origin: '',
    shelfLife: '',
    packageSpec: '',
    image: '',
    description: '',
    status: '上架'
  });
  mainImageList.value = [];
  productFormVisible.value = true;
};

// 编辑商品
const handleEditProduct = (row) => {
  isEdit.value = true;
  // 填充表单数据
  Object.assign(productForm, {
    ...row,
    batchName: row.batchName || ''
  });
  // 模拟主图
  if (row.image) {
    mainImageList.value = [{
      name: 'main-image.jpg',
      url: row.image
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
      // 获取当前登录农户ID
      const farmerId = localStorage.getItem('farmerId');
      
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
        farmerId: farmerId // 关联农户ID
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
  ElMessageBox.confirm(`确定要将商品「${row.name}」${newStatus}吗？`, '状态变更确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 调用更新商品状态API
    productAPI.updateProductStatus(row.id, newStatus).then(() => {
      row.status = newStatus;
      ElMessage.success(`商品${newStatus}成功`);
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
    selectedProducts.value.forEach(item => {
      item.status = '上架';
    });
    selectedProducts.value = [];
    ElMessage.success('批量上架成功');
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
    selectedProducts.value.forEach(item => {
      item.status = '下架';
    });
    selectedProducts.value = [];
    ElMessage.success('批量下架成功');
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

// 打开库存更新对话框
const handleOpenStockDialog = (row) => {
  currentProduct.value = row;
  Object.assign(stockForm, {
    currentStock: row.stock,
    changeType: '增加',
    changeCount: '',
    reason: ''
  });
  stockDialogVisible.value = true;
};

// 关闭库存对话框
const handleCloseStockDialog = () => {
  stockDialogVisible.value = false;
  if (stockFormRef.value) {
    stockFormRef.value.resetFields();
  }
};

// 更新库存
const handleUpdateStock = () => {
  stockFormRef.value.validate((valid) => {
    if (valid) {
      // 计算新库存
      let newStock = stockForm.currentStock;
      if (stockForm.changeType === '增加') {
        newStock += stockForm.changeCount;
      } else {
        // 检查库存是否足够
        if (stockForm.changeCount > stockForm.currentStock) {
          ElMessage.error('库存不足，无法减少');
          return;
        }
        newStock -= stockForm.changeCount;
      }

      // 更新库存
      if (currentProduct.value) {
        const index = productList.value.findIndex(p => p.id === currentProduct.value.id);
        if (index > -1) {
          productList.value[index].stock = newStock;
        }
      }

      ElMessage.success('库存更新成功');
      handleCloseStockDialog();
    }
  });
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