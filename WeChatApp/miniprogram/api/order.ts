/**
 * 订单相关接口
 */

import { get, post, put, del } from '../utils/request';

export interface CreateOrderData {
  customerId: string;
  customerName: string;
  productId: string;
  batchId: string;
  quantity: number;
  deliveryAddress: string;
  deliveryType?: string;
  remark?: string;
}

export interface OrderListParams {
  page: number;
  pageSize: number;
  status?: number;
}

export interface OrderInfo {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  farmerId: string;
  farmerName: string;
  productId: string;
  productName: string;
  productPrice: number;
  batchId: string;
  batchNumber: string;
  quantity: number;
  totalPrice: number;
  orderStatus: string;
  deliveryAddress: string;
  deliveryType?: string;
  logisticsCompany?: string;
  logisticsNumber?: string;
  orderTime: string;
  paymentTime?: string;
  deliveryTime?: string;
  receiptTime?: string;
  remark?: string;
  createTime: string;
  updateTime: string;
}

export interface OrderListResponse {
  list: OrderInfo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 创建订单
 */
export function createOrder(data: CreateOrderData): Promise<OrderInfo> {
  return post('/order/create', data);
}

/**
 * 获取订单列表
 */
export function getOrderList(params: OrderListParams, customerId: string): Promise<OrderListResponse> {
  return post('/order/list-by-customer', params, {
    params: { customerId }
  });
}

/**
 * 获取订单详情
 */
export function getOrderDetail(id: string): Promise<OrderInfo> {
  return get(`/order/detail/${id}`);
}

/**
 * 根据订单号获取订单
 */
export function getOrderByNumber(orderNumber: string): Promise<OrderInfo> {
  return get(`/order/detail-by-number/${orderNumber}`);
}

/**
 * 取消订单
 */
export function cancelOrder(id: string, reason?: string): Promise<OrderInfo> {
  return put(`/order/cancel/${id}`, null, {
    params: { reason }
  });
}

/**
 * 更新订单状态（确认收货）
 */
export function updateOrderStatus(id: string, status: string): Promise<OrderInfo> {
  return put(`/order/update-status/${id}`, null, {
    params: { status }
  });
}

/**
 * 支付订单
 */
export function payOrder(id: string): Promise<OrderInfo> {
  return post(`/order/pay/${id}`);
}

/**
 * 删除订单
 */
export function deleteOrder(id: string): Promise<boolean> {
  return del(`/order/delete/${id}`);
}
