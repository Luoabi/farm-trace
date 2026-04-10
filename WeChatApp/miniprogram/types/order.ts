// 订单相关类型定义

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'WAITING_PAYMENT' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: string;
  shippingMethod: string;
  remark?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  shippingMethod: string;
  remark?: string;
}

export interface OrderListRequest {
  page: number;
  pageSize: number;
}

export interface OrderListResponse {
  list: Order[];
  total: number;
  page: number;
  pageSize: number;
}
