// 通用类型定义

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PageRequest {
  page: number;
  pageSize: number;
}

export interface PageResponse<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
  stock: number;
  selected: boolean;
}
