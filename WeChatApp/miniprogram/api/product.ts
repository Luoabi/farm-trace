/**
 * 商品相关接口
 */

import { get, post } from '../utils/request';
import { Product, ProductListRequest, ProductListResponse } from '../types/product';

/**
 * 获取商品列表
 */
export async function getProductList(params: ProductListRequest): Promise<ProductListResponse> {
  console.log('=== 商品列表请求开始 ===');
  console.log('发送商品列表请求，参数:', JSON.stringify(params));
  
  const response = await post('/product/list', params);
  
  console.log('API返回的原始数据:', JSON.stringify(response));
  console.log('返回的商品数量:', response.list ? response.list.length : 0);
  
  // 映射后端字段到前端类型
  const result = {
    ...response,
    list: response.list.map((item: any) => ({
      id: item.id,
      name: item.productName || item.name,
      category: item.category,
      price: item.price,
      stock: item.stock || 999, // 如果后端没有返回库存，默认999
      unit: item.unit,
      description: item.description,
      imageUrl: item.imageUrl || item.image,
      farmerId: item.farmerId || '',
      farmerName: item.farmerName,
      status: item.status || 'ON_SALE',
      createdAt: item.createTime || item.createdAt,
      updatedAt: item.updateTime || item.updatedAt
    }))
  };
  
  console.log('映射后的商品数量:', result.list.length);
  console.log('=== 商品列表请求结束 ===');
  
  return result;
}

/**
 * 获取商品详情
 */
export async function getProductDetail(id: string): Promise<Product> {
  const item = await get(`/product/detail/${id}`);
  
  console.log('API返回的商品详情:', item);
  
  // 映射后端字段到前端类型
  return {
    id: item.id,
    name: item.productName || item.name,
    category: item.category,
    price: item.price,
    stock: item.stock || 999, // 如果后端没有返回库存，默认999
    unit: item.unit,
    description: item.description,
    imageUrl: item.imageUrl || item.image,
    farmerId: item.farmerId || '',
    farmerName: item.farmerName,
    status: item.status || 'ON_SALE',
    createdAt: item.createTime || item.createdAt,
    updatedAt: item.updateTime || item.updatedAt
  };
}

/**
 * 根据分类获取商品
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const list = await get(`/product/list-by-category/${category}`);
  
  // 映射后端字段到前端类型
  return list.map((item: any) => ({
    id: item.id,
    name: item.productName || item.name,
    category: item.category,
    price: item.price,
    stock: item.stock,
    unit: item.unit,
    description: item.description,
    imageUrl: item.image || item.imageUrl,
    farmerId: item.farmerId,
    farmerName: item.farmerName,
    status: item.status,
    createdAt: item.createTime || item.createdAt,
    updatedAt: item.updateTime || item.updatedAt
  }));
}
