<template>
  <div class="order-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">订单管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleBatchExport" :disabled="selectedOrders.length === 0">
          <el-icon><Download /></el-icon>
          批量导出
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stats-cards">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalOrders }}</div>
          <div class="stat-label">总订单数</div>
        </div>
        <div class="stat-icon">
          <el-icon><Document /></el-icon>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-number">¥{{ stats.totalSales }}</div>
          <div class="stat-label">总销售额</div>
        </div>
        <div class="stat-icon primary">
          <el-icon><Money /></el-icon>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ stats.pendingPayment }}</div>
          <div class="stat-label">待付款</div>
        </div>
        <div class="stat-icon warning">
          <el-icon><Timer /></el-icon>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ stats.pendingDelivery }}</div>
          <div class="stat-label">待发货</div>
        </div>
        <div class="stat-icon danger">
          <el-icon><SoldOut /></el-icon>
        </div>
      </el-card>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" class="search-form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="订单编号">
              <el-input v-model="searchForm.orderId" placeholder="请输入订单编号" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="商品名称">
              <el-input v-model="searchForm.productName" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="订单状态">
              <el-select v-model="searchForm.status" placeholder="请选择订单状态">
                <el-option label="全部" value="" />
                <el-option label="待付款" value="待付款" />
                <el-option label="待发货" value="待发货" />
                <el-option label="待收货" value="待收货" />
                <el-option label="已完成" value="已完成" />
                <el-option label="已取消" value="已取消" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="下单时间">
              <el-date-picker
                v-model="searchForm.orderTime"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" class="text-right">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="orderList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        row-key="orderId"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="orderId" label="订单编号" min-width="180" />
        <el-table-column label="商品信息" min-width="250">
          <template #default="scope">
            <div class="product-info">
              <el-image
                :src="scope.row.productInfo.image"
                style="width: 60px; height: 60px; margin-right: 10px;"
                fit="cover"
                :placeholder="defaultImage"   
                :error="errorImage"          
              />
              <div>
                <div class="product-name">{{ scope.row.productInfo.name }}</div>
                <div class="product-details">
                  <span>数量：{{ scope.row.productInfo.quantity }}</span>
                  <span class="price">¥{{ scope.row.productInfo.price }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="totalPrice" label="订单金额" width="120">
          <template #default="scope">¥{{ scope.row.totalPrice }}</template>
        </el-table-column>
        <el-table-column prop="buyerName" label="买家" width="120" />
        <el-table-column prop="buyerPhone" label="联系电话" width="120" />
        <el-table-column prop="status" label="订单状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="link" size="small" @click="handleViewOrder(scope.row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <template v-if="scope.row.status === '待发货'">
              <el-button type="link" size="small" @click="handleShipOrder(scope.row)">
                <el-icon><Ship /></el-icon>
                发货
              </el-button>
            </template>
            <template v-else-if="scope.row.status === '待付款'">
              <el-button type="link" size="small" @click="handleCancelOrder(scope.row)">
                <el-icon><Delete /></el-icon>
                取消
              </el-button>
            </template>
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

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="orderDetailVisible"
      title="订单详情"
      width="70%"
      :before-close="handleCloseDetail"
    >
      <div class="order-detail" v-if="currentOrder">
        <!-- 订单基本信息 -->
        <el-card class="detail-card">
          <h3 class="card-title">订单信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单编号">{{ currentOrder.orderId }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="getStatusTag(currentOrder.status)">{{ currentOrder.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="下单时间">{{ currentOrder.createTime }}</el-descriptions-item>
            <el-descriptions-item label="支付时间">{{ currentOrder.payTime || '未支付' }}</el-descriptions-item>
            <el-descriptions-item label="发货时间">{{ currentOrder.shipTime || '未发货' }}</el-descriptions-item>
            <el-descriptions-item label="完成时间">{{ currentOrder.completeTime || '未完成' }}</el-descriptions-item>
            <el-descriptions-item label="交易流水号">{{ currentOrder.transactionId }}</el-descriptions-item>
            <el-descriptions-item label="区块链哈希">
              <el-tag class="hash-tag">{{ currentOrder.blockchainHash }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 商品信息 -->
        <el-card class="detail-card">
          <h3 class="card-title">商品信息</h3>
          <el-table :data="[currentOrder.productInfo]" style="width: 100%">
            <el-table-column label="商品图片" width="80">
              <template #default="scope">
                <el-image
                  :src="defaultImage"
                  style="width: 60px; height: 60px;"
                  fit="cover"
                  :placeholder="defaultImage"   
                  :error="errorImage"          
                />
              </template>
            </el-table-column>
            <el-table-column prop="name" label="商品名称" min-width="200" />
            <el-table-column prop="price" label="单价" width="100">
              <template #default="scope">¥{{ scope.row.price }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="subtotal" label="小计" width="100">
              <template #default="scope">
                <span class="price">¥{{ scope.row.subtotal }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="total-price">
            <span class="label">订单总金额：</span>
            <span class="total">¥{{ currentOrder.totalPrice }}</span>
          </div>
        </el-card>

        <!-- 收货地址 -->
        <el-card class="detail-card">
          <h3 class="card-title">收货信息</h3>
          <div class="address-info">
            <div class="info-item">
              <span class="label">收货人：</span>
              <span>{{ currentOrder.buyerName }}</span>
            </div>
            <div class="info-item">
              <span class="label">联系电话：</span>
              <span>{{ currentOrder.buyerPhone }}</span>
            </div>
            <div class="info-item">
              <span class="label">收货地址：</span>
              <span>{{ currentOrder.address }}</span>
            </div>
          </div>
        </el-card>

        <!-- 物流信息 -->
        <el-card v-if="currentOrder.status !== '待发货' && currentOrder.status !== '待付款' && currentOrder.status !== '已取消'" class="detail-card">
          <h3 class="card-title">物流信息</h3>
          <div v-if="currentOrder.logisticsInfo" class="logistics-info">
            <div class="logistics-header">
              <span class="logistics-company">{{ currentOrder.logisticsInfo.company }}</span>
              <span class="logistics-number">{{ currentOrder.logisticsInfo.trackingNumber }}</span>
            </div>
            <div class="logistics-timeline">
              <el-timeline>
                <el-timeline-item
                  v-for="(item, index) in currentOrder.logisticsInfo.timeline"
                  :key="index"
                  :timestamp="item.time"
                  :type="index === 0 ? 'success' : ''"
                  :icon="index === 0 ? 'el-icon-check' : ''"
                >
                  {{ item.description }}
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
          <div v-else class="no-logistics">暂无物流信息</div>
        </el-card>
      </div>
      <template #footer>
        <el-button @click="handleCloseDetail">关闭</el-button>
        <template v-if="currentOrder && currentOrder.status === '待发货'">
          <el-button type="primary" @click="handleShipOrder(currentOrder)">发货</el-button>
        </template>
      </template>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog
      v-model="shipDialogVisible"
      title="订单发货"
      width="50%"
      :before-close="handleCloseShipDialog"
    >
      <el-form
        ref="shipFormRef"
        :model="shipForm"
        :rules="shipRules"
        label-width="120px"
      >
        <el-form-item label="订单编号">
          <el-input v-model="shipForm.orderId" disabled />
        </el-form-item>
        <el-form-item label="商品信息">
          <div class="ship-product-info" v-if="shipOrderInfo">
            <el-image
              :src="shipOrderInfo.productImage"
              style="width: 60px; height: 60px; margin-right: 10px;"
              fit="cover"
              :placeholder="shipOrderInfo.productImage"   
              :error="errorImage"          
            />
            <div>
              <div>{{ shipOrderInfo.productName }}</div>
              <div>数量：{{ shipOrderInfo.quantity }}</div>
            </div>
          </div>
        </el-form-item>
        <el-form-item prop="logisticsCompany" label="物流公司">
          <el-input v-model="shipForm.logisticsCompany" placeholder="请输入物流公司名称" />
        </el-form-item>
        <el-form-item prop="trackingNumber" label="物流单号">
          <el-input v-model="shipForm.trackingNumber" placeholder="请输入物流单号" />
        </el-form-item>
        <el-form-item prop="remark" label="发货备注">
          <el-input v-model="shipForm.remark" type="textarea" placeholder="请输入发货备注" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseShipDialog">取消</el-button>
        <el-button type="primary" @click="handleConfirmShip" :loading="shipping">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 引入默认图
import defaultImage from '../assets/default-product.jpg';
import errorImage from '../assets/error-product.jpg';
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Download, Refresh, Document, Money, Timer, SoldOut, View, Close } from '@element-plus/icons-vue';
import { orderAPI } from '../api/modules/order';

// 状态定义
const loading = ref(false);
const shipping = ref(false);
const shipFormRef = ref(null);
const orderList = ref([]);
const selectedOrders = ref([]);
const currentOrder = ref(null);
const shipOrderInfo = ref(null);
const orderDetailVisible = ref(false);
const shipDialogVisible = ref(false);

// 订单统计数据
const stats = reactive({
  totalOrders: 8,
  totalSales: 24560,
  pendingPayment: 2,
  pendingDelivery: 3
});

// 搜索表单
const searchForm = reactive({
  orderId: '',
  productName: '',
  status: '',
  orderTime: []
});

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 发货表单
const shipForm = reactive({
  orderId: '',
  logisticsCompany: '',
  trackingNumber: '',
  remark: ''
});

// 发货表单验证规则
const shipRules = {
  logisticsCompany: [
    { required: true, message: '请输入物流公司名称', trigger: 'blur' }
  ],
  trackingNumber: [
    { required: true, message: '请输入物流单号', trigger: 'blur' }
  ]
};

// 初始化数据
const initData = async () => {
  loading.value = true;
  try {
    // 尝试从API获取数据
    const response = await orderAPI.getOrderList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...searchForm
    });
    orderList.value = response.list || [];
    pagination.total = response.total || 0;
  } catch (error) {
    console.error('获取订单数据失败:', error);
    orderList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 获取状态标签类型
const getStatusTag = (status) => {
  const statusMap = {
    '待付款': 'warning',
    '待发货': 'danger',
    '待收货': 'primary',
    '已完成': 'success',
    '已取消': 'info'
  };
  return statusMap[status] || 'default';
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
    orderId: '',
    productName: '',
    status: '',
    orderTime: []
  });
  pagination.currentPage = 1;
};

// 刷新
const handleRefresh = () => {
  initData();
  ElMessage.success('刷新成功');
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
  selectedOrders.value = selection;
};

// 查看订单详情
const handleViewOrder = async (row) => {
  try {
    const response = await orderAPI.getOrderDetail(row.id);
    currentOrder.value = response;
    orderDetailVisible.value = true;
  } catch (error) {
    console.error('获取订单详情失败:', error);
    ElMessage.error('获取订单详情失败: ' + (error.message || '未知错误'));
  }
};

// 关闭详情
const handleCloseDetail = () => {
  orderDetailVisible.value = false;
  currentOrder.value = null;
};

// 打开发货对话框
const handleShipOrder = (order) => {
  shipOrderInfo.value = order;
  Object.assign(shipForm, {
    orderId: order.orderId,
    logisticsCompany: '',
    trackingNumber: '',
    remark: ''
  });
  shipDialogVisible.value = true;
};

// 关闭发货对话框
const handleCloseShipDialog = () => {
  shipDialogVisible.value = false;
  shipOrderInfo.value = null;
  if (shipFormRef.value) {
    shipFormRef.value.resetFields();
  }
};

// 确认发货
const handleConfirmShip = () => {
  shipFormRef.value.validate((valid) => {
    if (valid) {
      shipping.value = true;
      setTimeout(() => {
        // 更新订单状态
        const index = orderList.value.findIndex(item => item.orderId === shipForm.orderId);
        if (index > -1) {
          orderList.value[index].status = '待收货';
          orderList.value[index].shipTime = new Date().toLocaleString('zh-CN');
        }
        
        // 更新统计数据
        stats.pendingDelivery--;
        
        ElMessage.success('发货成功');
        handleCloseShipDialog();
        shipping.value = false;
      }, 1000);
    }
  });
};

// 取消订单
const handleCancelOrder = (row) => {
  ElMessageBox.confirm(`确定要取消订单「${row.orderId}」吗？`, '取消订单确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = '已取消';
    // 更新统计数据
    stats.pendingPayment--;
    ElMessage.success('订单取消成功');
  }).catch(() => {
    // 取消操作
  });
};

// 导出订单
const handleBatchExport = () => {
  ElMessage.success('订单导出成功');
};

// 组件挂载时初始化数据
onMounted(() => {
  initData();
});
</script>

<style scoped>
.order-management {
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

/* 统计卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.stat-icon {
  font-size: 32px;
  color: #409eff;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #ecf5ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.primary {
  background-color: #e1f3d8;
  color: #67c23a;
}

.stat-icon.warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.danger {
  background-color: #fef0f0;
  color: #f56c6c;
}

/* 表格卡片样式 */
.table-card {
  margin-bottom: 20px;
}

/* 商品信息样式 */
.product-info {
  display: flex;
  align-items: center;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

/* 分页样式 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 订单详情样式 */
.detail-card {
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  margin-top: 0;
}

/* 哈希文本样式 */
.hash-tag {
  font-size: 12px;
  word-break: break-all;
  white-space: normal;
}

/* 收货地址样式 */
.address-info .info-item {
  margin-bottom: 10px;
}

.address-info .label {
  font-weight: bold;
  margin-right: 5px;
}

/* 总价格样式 */
.total-price {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
}

.total-price .total {
  color: #f56c6c;
  margin-left: 10px;
}

/* 物流信息样式 */
.logistics-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.logistics-company {
  font-weight: bold;
}

.logistics-number {
  color: #606266;
}

.logistics-timeline {
  margin-top: 20px;
}

.no-logistics {
  text-align: center;
  padding: 20px;
  color: #909399;
}

/* 发货对话框商品信息样式 */
.ship-product-info {
  display: flex;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
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