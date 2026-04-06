/**
 * API 统一导出文件
 * 集中管理所有 API 模块，方便在组件中导入使用
 */

// 导出所有 API 模块
export { userAPI } from './modules/user';
export { batchAPI } from './modules/batch';
export { growthRecordAPI } from './modules/growthRecord';
export { productAPI } from './modules/product';
export { orderAPI } from './modules/order';
export { dashboardAPI } from './modules/dashboard';

// 导出 request 实例（如果需要自定义请求）
export { default as request } from './request';
