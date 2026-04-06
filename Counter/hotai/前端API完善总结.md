# 前端 API 完善总结

## ✅ 已完成的工作

### 1. API 模块更新

#### 批次管理 (batch.js)
- ✅ 更新 `createBatch` - 添加 farmerId 参数
- ✅ 更新 `getBatchListByFarmer` - 添加 farmerId 参数
- ✅ 新增 `updateBatchStatus` - 更新批次状态
- ✅ 新增 `updateActualQuantity` - 更新实际产量
- ✅ 新增 `deleteBatch` - 删除批次

#### 生长记录 (growthRecord.js)
- ✅ 更新所有接口路径为 `/api/growth-record/*`
- ✅ 更新 `getGrowthRecordsByBatch` - 支持分页参数

#### 商品管理 (product.js)
- ✅ 接口已对齐，无需修改

#### 订单管理 (order.js)
- ✅ 更新 `getOrdersByCustomer` - 添加 customerId 参数
- ✅ 更新 `getOrdersByFarmer` - 添加 farmerId 参数
- ✅ 更新 `updateShippingInfo` - 修改参数格式

#### 用户管理 (user.js)
- ✅ 接口已完善，包含所有用户管理功能

### 2. 新增文件

#### API 统一导出 (index.js)
```javascript
export { userAPI } from './modules/user';
export { batchAPI } from './modules/batch';
export { growthRecordAPI } from './modules/growthRecord';
export { productAPI } from './modules/product';
export { orderAPI } from './modules/order';
export { dashboardAPI } from './modules/dashboard';
export { default as request } from './request';
```

#### API 测试组件 (ApiTest.vue)
- 提供可视化的接口测试界面
- 支持测试登录、用户列表、商品列表等接口
- 实时显示接口响应结果

#### 使用文档 (前端API使用文档.md)
- 详细的 API 调用示例
- Vue 组件中的使用方法
- 常见问题解答

## 📋 API 接口对照表

### 认证接口
| 功能 | 前端方法 | 后端接口 | 状态 |
|------|---------|---------|------|
| 用户注册 | `userAPI.register()` | `POST /api/register` | ✅ |
| 用户登录 | `userAPI.login()` | `POST /api/login` | ✅ |

### 用户管理
| 功能 | 前端方法 | 后端接口 | 状态 |
|------|---------|---------|------|
| 获取农户列表 | `userAPI.getFarmerList()` | `POST /api/user/f/list` | ✅ |
| 获取操作员列表 | `userAPI.getOperatorList()` | `POST /api/user/o/list` | ✅ |
| 获取用户详情 | `userAPI.getUserDetail()` | `GET /api/user/detail/{id}` | ✅ |
| 创建用户 | `userAPI.createUser()` | `POST /api/user/create` | ✅ |
| 更新用户 | `userAPI.updateUser()` | `PUT /api/user/update/{id}` | ✅ |
| 删除用户 | `userAPI.deleteUser()` | `DELETE /api/user/delete/{id}` | ✅ |
| 批量删除 | `userAPI.batchDeleteUsers()` | `POST /api/user/batch-delete` | ✅ |
| 更改状态 | `userAPI.changeUserStatus()` | `PUT /api/user/change-status/{id}/{status}` | ✅ |
| 重置密码 | `userAPI.resetPassword()` | `PUT /api/user/reset-password/{id}` | ✅ |
| 更新角色 | `userAPI.updateUserRole()` | `PUT /api/user/update-role/{id}` | ✅ |

### 批次管理
| 功能 | 前端方法 | 后端接口 | 状态 |
|------|---------|---------|------|
| 创建批次 | `batchAPI.createBatch()` | `POST /api/create?farmerId=xxx` | ✅ |
| 获取详情 | `batchAPI.getBatchDetail()` | `GET /api/batch/detail/{id}` | ✅ |
| 获取列表 | `batchAPI.getBatchList()` | `POST /api/list` | ✅ |
| 按农户查询 | `batchAPI.getBatchListByFarmer()` | `POST /api/list-by-farmer?farmerId=xxx` | ✅ |
| 更新批次 | `batchAPI.updateBatch()` | `PUT /api/update/{id}` | ✅ |
| 更新状态 | `batchAPI.updateBatchStatus()` | `PUT /api/update-status/{id}` | ✅ |
| 更新产量 | `batchAPI.updateActualQuantity()` | `PUT /api/update-actual-quantity/{id}` | ✅ |
| 删除批次 | `batchAPI.deleteBatch()` | `DELETE /api/delete/{id}` | ✅ |

### 生长记录
| 功能 | 前端方法 | 后端接口 | 状态 |
|------|---------|---------|------|
| 创建记录 | `growthRecordAPI.createGrowthRecord()` | `POST /api/growth-record/create` | ✅ |
| 获取详情 | `growthRecordAPI.getGrowthRecordDetail()` | `GET /api/growth-record/detail/{id}` | ✅ |
| 按批次查询 | `growthRecordAPI.getGrowthRecordsByBatch()` | `POST /api/growth-record/list-by-batch/{batchId}` | ✅ |
| 更新记录 | `growthRecordAPI.updateGrowthRecord()` | `PUT /api/growth-record/update/{id}` | ✅ |
| 删除记录 | `growthRecordAPI.deleteGrowthRecord()` | `DELETE /api/growth-record/delete/{id}` | ✅ |

### 商品管理
| 功能 | 前端方法 | 后端接口 | 状态 |
|------|---------|---------|------|
| 创建商品 | `productAPI.createProduct()` | `POST /api/product/create` | ✅ |
| 获取详情 | `productAPI.getProductDetail()` | `GET /api/product/detail/{id}` | ✅ |
| 获取列表 | `productAPI.getProductList()` | `POST /api/product/list` | ✅ |
| 按分类查询 | `productAPI.getProductsByCategory()` | `GET /api/product/list-by-category/{category}` | ✅ |
| 更新商品 | `productAPI.updateProduct()` | `PUT /api/product/update/{id}` | ✅ |
| 删除商品 | `productAPI.deleteProduct()` | `DELETE /api/product/delete/{id}` | ✅ |

### 订单管理
| 功能 | 前端方法 | 后端接口 | 状态 |
|------|---------|---------|------|
| 创建订单 | `orderAPI.createOrder()` | `POST /api/order/create` | ✅ |
| 获取详情 | `orderAPI.getOrderDetail()` | `GET /api/order/detail/{id}` | ✅ |
| 按编号查询 | `orderAPI.getOrderByNumber()` | `GET /api/order/detail-by-number/{orderNumber}` | ✅ |
| 获取列表 | `orderAPI.getOrderList()` | `POST /api/order/list` | ✅ |
| 按客户查询 | `orderAPI.getOrdersByCustomer()` | `POST /api/order/list-by-customer?customerId=xxx` | ✅ |
| 按农户查询 | `orderAPI.getOrdersByFarmer()` | `POST /api/order/list-by-farmer?farmerId=xxx` | ✅ |
| 更新状态 | `orderAPI.updateOrderStatus()` | `PUT /api/order/update-status/{id}` | ✅ |
| 更新物流 | `orderAPI.updateShippingInfo()` | `PUT /api/order/update-shipping/{id}` | ✅ |
| 删除订单 | `orderAPI.deleteOrder()` | `DELETE /api/order/delete/{id}` | ✅ |

## 🎯 使用方式

### 方式 1：直接导入使用
```javascript
import { userAPI, productAPI } from '@/api';

// 使用
const response = await userAPI.login({ username: 'test', password: '123' });
```

### 方式 2：按需导入
```javascript
import { userAPI } from '@/api/modules/user';
import { productAPI } from '@/api/modules/product';
```

### 方式 3：在组件中使用
```vue
<script setup>
import { ref } from 'vue';
import { productAPI } from '@/api';

const products = ref([]);

const fetchProducts = async () => {
  const response = await productAPI.getProductList({ page: 1, pageSize: 10 });
  products.value = response.list;
};
</script>
```

## 🧪 测试方法

### 1. 使用 API 测试组件
```bash
# 访问测试页面
http://localhost:5173/api-test
```

### 2. 使用浏览器控制台
```javascript
// 在浏览器控制台中测试
import { userAPI } from '@/api';
const result = await userAPI.login({ username: 'test', password: '123' });
console.log(result);
```

### 3. 使用 Swagger UI
```bash
# 访问后端 Swagger UI
http://localhost:8080/swagger-ui/index.html
```

## 📝 注意事项

### 1. 请求参数格式
- **分页参数**: `{ page: 1, pageSize: 10 }`
- **查询参数**: 使用 `params` 传递
- **请求体**: 使用 `data` 传递

### 2. 响应数据格式
```javascript
// 单个对象
{
  code: 200,
  message: 'success',
  data: { ... }
}

// 列表（分页）
{
  list: [...],
  total: 100,
  page: 1,
  pageSize: 10,
  totalPages: 10
}
```

### 3. 错误处理
所有接口调用都应该使用 try-catch：
```javascript
try {
  const response = await userAPI.login(loginData);
  // 处理成功
} catch (error) {
  // 处理错误
  ElMessage.error(error.message || '操作失败');
}
```

### 4. Token 管理
- Token 会自动从 Vuex store 中获取
- 401 错误会自动跳转登录页
- 无需手动处理 Token

## 🚀 下一步

1. **测试所有接口**
   - 使用 API 测试组件验证每个接口
   - 确保前后端数据格式一致

2. **完善业务组件**
   - 在实际业务组件中集成 API
   - 添加加载状态和错误处理

3. **优化用户体验**
   - 添加加载动画
   - 优化错误提示
   - 实现数据缓存

4. **性能优化**
   - 实现请求防抖
   - 添加请求取消功能
   - 优化大数据列表渲染

## 📞 技术支持

如有问题，请检查：
1. 后端服务是否正常运行
2. 代理配置是否正确
3. 请求参数格式是否正确
4. 浏览器控制台的网络请求详情

祝开发顺利！🎉
