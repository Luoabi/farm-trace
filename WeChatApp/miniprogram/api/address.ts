/**
 * 收货地址相关接口
 */

import { get, post, put, del } from '../utils/request';
import { Address } from '../types/address';

export interface AddressData {
  userId: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  isDefault?: number;
}

/**
 * 获取地址列表
 */
export async function getAddressList(userId: string): Promise<Address[]> {
  console.log('获取地址列表，userId:', userId);
  
  const list = await get('/user/address/list', { userId });
  
  console.log('地址列表返回:', list);
  
  // 映射后端字段到前端类型
  return (list || []).map((item: any) => ({
    id: item.id,
    userId: item.userId,
    receiverName: item.receiverName,
    receiverPhone: item.receiverPhone,
    province: item.province,
    city: item.city,
    district: item.district,
    detailAddress: item.detailAddress,
    fullAddress: item.fullAddress || `${item.province}${item.city}${item.district}${item.detailAddress}`,
    isDefault: item.isDefault === 1 || item.isDefault === true,
    createdAt: item.createTime || item.createdAt,
    updatedAt: item.updateTime || item.updatedAt
  }));
}

/**
 * 获取地址详情
 */
export async function getAddressDetail(id: string): Promise<Address> {
  const item = await get(`/user/address/detail/${id}`);
  
  return {
    id: item.id,
    userId: item.userId,
    receiverName: item.receiverName,
    receiverPhone: item.receiverPhone,
    province: item.province,
    city: item.city,
    district: item.district,
    detailAddress: item.detailAddress,
    fullAddress: item.fullAddress || `${item.province}${item.city}${item.district}${item.detailAddress}`,
    isDefault: item.isDefault === 1 || item.isDefault === true,
    createdAt: item.createTime || item.createdAt,
    updatedAt: item.updateTime || item.updatedAt
  };
}

/**
 * 获取默认地址
 */
export async function getDefaultAddress(userId: string): Promise<Address | null> {
  try {
    const item = await get('/user/address/default', { userId });
    
    if (!item) return null;
    
    return {
      id: item.id,
      userId: item.userId,
      receiverName: item.receiverName,
      receiverPhone: item.receiverPhone,
      province: item.province,
      city: item.city,
      district: item.district,
      detailAddress: item.detailAddress,
      fullAddress: item.fullAddress || `${item.province}${item.city}${item.district}${item.detailAddress}`,
      isDefault: item.isDefault === 1 || item.isDefault === true,
      createdAt: item.createTime || item.createdAt,
      updatedAt: item.updateTime || item.updatedAt
    };
  } catch (error) {
    return null;
  }
}

/**
 * 创建地址
 */
export function createAddress(data: AddressData): Promise<Address> {
  return post('/user/address/create', data);
}

/**
 * 更新地址
 */
export function updateAddress(id: string, data: AddressData): Promise<Address> {
  return put(`/user/address/update/${id}`, data);
}

/**
 * 删除地址
 */
export function deleteAddress(id: string): Promise<boolean> {
  return del(`/user/address/delete/${id}`);
}

/**
 * 设置默认地址
 */
export function setDefaultAddress(id: string, userId: string): Promise<Address> {
  return put(`/user/address/set-default/${id}`, null, {
    params: { userId }
  });
}
