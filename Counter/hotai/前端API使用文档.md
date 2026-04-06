# 前端 API 使用文档

## 📋 概述

本文档说明前端如何调用后端 API 接口。所有 API 模块已完善并与后端接口对齐。

## 🔧 配置说明

### 1. 代理配置
在 `vite.config.js` 中已配置代理：
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true
  }
}
```

### 2. 请求拦截器
在 `src/api/request.js` 中配置了：
- 自动添加 Token 到请求头
- 统一错误处理
- 401 自动跳转登录

## 📦 API 模块

### 1. 用户管理 (userAPI)

```javascript
import { userAPI } from '@/api';

// 登录
const loginData = {
  username: 'testfarmer',
  password: '123456'
};
const response = await userAPI.login(loginData);

// 注册
const registerData = {
  username: 'newfarmer',
  password: '123456',
  phone: '13800138000',
  email: 'test@example.com',
  userType: 'FARMER',
  organization: '测试农场',
  farmName: '测试农场',
  farmAddress: '四川省西昌市'
};
await userAPI.register(registerData);

// 获取农户列表（超级管理员）
const farmers = await userAPI.getFarmerList({ page: 1, pageSize: 10 });

// 获取操作员列表（农户）
const operators = await userAPI.getOperatorList({ page: 1, pageSize: 10 });

// 获取用户详情
const userDetail = await userAPI.getUserDetail('user001');

// 创建用户
const newUser = {
  username: 'operator001',
  password: '123456',
  phone: '13700137000',
  // ... 其他字段
};
await userAPI.createUser(newUser);

// 更新用户
await userAPI.updateUser('user001', { phone: '13900139001' });

// 删除用户
await userAPI.deleteUser('user001');

// 批量删除用户
await userAPI.batchDeleteUsers(['user001', 'user002']);

// 更改用户状态 (0=禁用, 1=启用)
await userAPI.changeUserStatus('user001', 1);

// 重置密码
await userAPI.resetPassword('user001', { newPassword: '654321' });

// 更新用户角色
await userAPI.updateUserRole('user001', { roleId: 'role002' });
```

### 2. 批次管理 (batchAPI)

```javascript
import { batchAPI } from '@/api';

// 创建批次（需要 farmerId）
const batchData = {
  batchNumber: 'BN20240901',
  productId: 'product-001',
  cultivationArea: 'A区大棚',
  plantingTime: '2024-09-01T08:00:00',
  harvestTime: '2025-01-15T10:00:00',
  plannedQuantity: 5000.0,
  remark: '秋季种植批次'
};
await batchAPI.createBatch(batchData, 'user002');

// 获取批次详情
const batch = await batchAPI.getBatchDetail('batch-001');

// 获取批次列表（分页）
const batches = await batchAPI.getBatchList({ 
  page: 1, 
  pageSize: 10,
  keyword: '葡萄'
});

// 根据农户ID查询批次列表
const farmerBatches = await batchAPI.getBatchListByFarmer(
  { page: 1, pageSize: 10 },
  'user002'
);

// 更新批次信息
await batchAPI.updateBatch('batch-001', {
  cultivationArea: 'B区大棚',
  plannedQuantity: 6000.0
});

// 更新批次状态
await batchAPI.updateBatchStatus('batch-001', 'HARVESTED');

// 更新实际产量
await batchAPI.updateActualQuantity('batch-001', 5500.0);

// 删除批次
await batchAPI.deleteBatch('batch-001');
```

### 3. 生长记录 (growthRecordAPI)

```javascript
import { growthRecordAPI } from '@/api';

// 创建生长记录
const recordData = {
  batchId: 'batch-001',
  recordTime: '2024-08-01T10:00:00',
  height: 150.5,
  stemThickness: 1.8,
  leafColor: '深绿',
  pestDiseaseStatus: '无病虫害',
  waterContent: 65.0,
  temperature: 28.5,
  humidity: 60.0,
  sunshineHours: 8.5,
  description: '生长良好',
  imageUrls: 'http://example.com/img1.jpg'
};
await growthRecordAPI.createGrowthRecord(recordData);

// 获取生长记录详情
const record = await growthRecordAPI.getGrowthRecordDetail('gr-001');

// 根据批次ID获取生长记录列表（分页）
const records = await growthRecordAPI.getGrowthRecordsByBatch(
  'batch-001',
  { page: 1, pageSize: 10 }
);

// 更新生长记录
await growthRecordAPI.updateGrowthRecord('gr-001', {
  height: 155.0,
  description: '生长状况良好'
});

// 删除生长记录
await growthRecordAPI.deleteGrowthRecord('gr-001');
```

### 4. 商品管理 (productAPI)

```javascript
import { productAPI } from '@/api';

// 创建商品
const productData = {
  productCode: 'PC004',
  productName: '测试商品',
  category: '水果',
  description: '这是一个测试商品',
  price: 50.00,
  unit: 'kg',
  specification: '特级',
  productionPlace: '四川西昌',
  imageUrl: 'http://example.com/test.jpg'
};
await productAPI.createProduct(productData);

// 获取商品详情
const product = await productAPI.getProductDetail('product-001');

// 获取商品列表（分页）
const products = await productAPI.getProductList({
  page: 1,
  pageSize: 10,
  keyword: '葡萄'
});

// 根据分类查询商品
const fruitProducts = await productAPI.getProductsByCategory('水果');

// 更新商品信息
await productAPI.updateProduct('product-001', {
  price: 55.00,
  description: '更新后的描述'
});

// 删除商品
await productAPI.deleteProduct('product-001');
```

### 5. 订单管理 (orderAPI)

```javascript
import { orderAPI } from '@/api';

// 创建订单
const orderData = {
  customerId: 'user004',
  customerName: '张三',
  productId: 'product-001',
  batchId: 'batch-001',
  quantity: 10.0,
  deliveryAddress: '成都市锦江区测试路100号',
  deliveryType: '快递',
  remark: '请尽快发货'
};
await orderAPI.createOrder(orderData);

// 获取订单详情
const order = await orderAPI.getOrderDetail('order-001');

// 根据订单编号查询订单
const orderByNo = await orderAPI.getOrderByNumber('ON20240720001');

// 获取订单列表（分页）
const orders = await orderAPI.getOrderList({
  page: 1,
  pageSize: 10,
  keyword: '张三'
});

// 根据客户ID查询订单列表
const customerOrders = await orderAPI.getOrdersByCustomer(
  { page: 1, pageSize: 10 },
  'user004'
);

// 根据农户ID查询订单列表
const farmerOrders = await orderAPI.getOrdersByFarmer(
  { page: 1, pageSize: 10 },
  'user002'
);

// 更新订单状态
await orderAPI.updateOrderStatus('order-001', 'SHIPPED');

// 更新物流信息
await orderAPI.updateShippingInfo(
  'order-001',
  '顺丰速运',
  'SF1234567890'
);

// 删除订单
await orderAPI.deleteOrder('order-001');
```

## 🎯 在 Vue 组件中使用

### 示例 1：登录组件

```vue
<script setup>
import { ref } from 'vue';
import { userAPI } from '@/api';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();

const loginForm = ref({
  username: '',
  password: ''
});

const handleLogin = async () => {
  try {
    const response = await userAPI.login(loginForm.value);
    
    // 保存用户信息到 store
    store.commit('setUser', response.data);
    
    ElMessage.success('登录成功');
    router.push('/dashboard');
  } catch (error) {
    ElMessage.error(error.message || '登录失败');
  }
};
</script>
```

### 示例 2：批次列表组件

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { batchAPI } from '@/api';
import { ElMessage } from 'element-plus';

const batchList = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
});

// 获取批次列表
const fetchBatchList = async () => {
  loading.value = true;
  try {
    const response = await batchAPI.getBatchList({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    });
    
    batchList.value = response.list;
    pagination.value.total = response.total;
  } catch (error) {
    ElMessage.error('获取批次列表失败');
  } finally {
    loading.value = false;
  }
};

// 删除批次
const handleDelete = async (id) => {
  try {
    await batchAPI.deleteBatch(id);
    ElMessage.success('删除成功');
    fetchBatchList(); // 刷新列表
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

onMounted(() => {
  fetchBatchList();
});
</script>
```

## 🔐 权限控制

### Token 管理

Token 会自动从 Vuex store 中获取并添加到请求头：

```javascript
// 在 request.js 中已配置
const token = store.getters.getToken;
if (token) {
  config.headers['Authorization'] = `Bearer ${token}`;
}
```

### 401 处理

当 Token 过期或无效时，会自动：
1. 清除本地 Token
2. 跳转到登录页

```javascript
case 401:
  store.dispatch('logout');
  window.location.href = '/login';
  break;
```

## 📝 响应格式

所有接口统一返回格式：

```javascript
{
  code: 200,           // 状态码
  message: 'success',  // 消息
  data: {}            // 数据
}
```

分页接口返回格式：

```javascript
{
  list: [],      // 数据列表
  total: 100,    // 总条数
  page: 1,       // 当前页
  pageSize: 10,  // 每页大小
  totalPages: 10 // 总页数
}
```

## ⚠️ 注意事项

1. **所有请求都会经过拦截器处理**
   - 自动添加 Token
   - 统一错误处理
   - 自动处理 401 跳转

2. **分页参数**
   - `page`: 页码（从 1 开始）
   - `pageSize`: 每页大小
   - `keyword`: 搜索关键词（可选）

3. **日期时间格式**
   - 使用 ISO 8601 格式：`2024-09-01T08:00:00`

4. **文件上传**
   - 图片 URL 字段：`imageUrl` 或 `imageUrls`
   - 多个图片用逗号分隔

5. **错误处理**
   - 使用 try-catch 捕获错误
   - 显示友好的错误提示

## 🚀 快速开始

### 1. 启动后端
```bash
cd Backend/xichang-interface
mvn spring-boot:run
```

### 2. 启动前端
```bash
cd Counter/hotai
npm run dev
```

### 3. 访问应用
```
http://localhost:5173
```

## 📞 常见问题

### Q: 跨域问题？
A: 已在 `vite.config.js` 中配置代理，开发环境不会有跨域问题

### Q: 接口返回 401？
A: 检查 Token 是否有效，或重新登录

### Q: 接口返回 500？
A: 检查后端服务是否正常运行，查看后端日志

### Q: 如何调试接口？
A: 
1. 打开浏览器开发者工具 → Network
2. 查看请求和响应详情
3. 检查请求参数和响应数据

祝开发顺利！🎉
