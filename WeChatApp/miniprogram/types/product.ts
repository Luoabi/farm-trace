// 商品相关类型定义

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  description?: string;
  imageUrl?: string;
  farmerId: string;
  farmerName?: string;
  status: 'ON_SALE' | 'OFF_SALE';
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListRequest {
  page: number;
  pageSize: number;
  category?: string;
  keyword?: string;
}

export interface ProductListResponse {
  list: Product[];
  total: number;
  page: number;
  pageSize: number;
}
