/**
 * 配置文件
 */

// API 基础地址
export const API_BASE_URL = 'http://localhost:8080/api';

// 超时时间（毫秒）
export const REQUEST_TIMEOUT = 10000;

// Token 存储 key
export const TOKEN_KEY = 'token';

// 用户信息存储 key
export const USER_INFO_KEY = 'userInfo';

// 购物车存储 key
export const CART_KEY = 'cart';

// 默认分页大小
export const DEFAULT_PAGE_SIZE = 10;

// 图片上传地址
export const UPLOAD_URL = `${API_BASE_URL}/upload`;

// 订单状态映射
export const ORDER_STATUS_MAP: Record<number, string> = {
  1: '待支付',
  2: '待发货',
  3: '已发货',
  4: '已完成',
  5: '已取消'
};

// 订单状态颜色
export const ORDER_STATUS_COLOR: Record<number, string> = {
  1: '#f56c6c',
  2: '#e6a23c',
  3: '#409eff',
  4: '#67c23a',
  5: '#909399'
};
