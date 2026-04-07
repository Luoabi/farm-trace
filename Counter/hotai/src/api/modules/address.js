import request from '../request';

// 收货地址管理相关API
export const addressAPI = {
  // 创建收货地址
  createAddress(data) {
    return request({
      url: '/user/address/create',
      method: 'post',
      data
    });
  },
  
  // 获取地址详情
  getAddressDetail(id) {
    return request({
      url: `/user/address/detail/${id}`,
      method: 'get'
    });
  },
  
  // 获取用户的地址列表
  getAddressList(userId) {
    return request({
      url: '/user/address/list',
      method: 'get',
      params: { userId }
    });
  },
  
  // 获取默认地址
  getDefaultAddress(userId) {
    return request({
      url: '/user/address/default',
      method: 'get',
      params: { userId }
    });
  },
  
  // 更新收货地址
  updateAddress(id, data) {
    return request({
      url: `/user/address/update/${id}`,
      method: 'put',
      data
    });
  },
  
  // 删除收货地址
  deleteAddress(id) {
    return request({
      url: `/user/address/delete/${id}`,
      method: 'delete'
    });
  },
  
  // 设置默认地址
  setDefaultAddress(id, userId) {
    return request({
      url: `/user/address/set-default/${id}`,
      method: 'put',
      params: { userId }
    });
  }
};

// 模拟数据
export const mockAddressData = {
  list: [
    {
      id: 'addr001',
      userId: 'user001',
      receiverName: '张三',
      receiverPhone: '13800138000',
      province: '四川省',
      city: '成都市',
      district: '高新区',
      detailAddress: '天府大道123号',
      fullAddress: '四川省成都市高新区天府大道123号',
      isDefault: 1,
      createTime: '2024-04-01 10:00:00',
      updateTime: '2024-04-01 10:00:00'
    },
    {
      id: 'addr002',
      userId: 'user001',
      receiverName: '李四',
      receiverPhone: '13900139000',
      province: '四川省',
      city: '成都市',
      district: '武侯区',
      detailAddress: '人民南路456号',
      fullAddress: '四川省成都市武侯区人民南路456号',
      isDefault: 0,
      createTime: '2024-04-02 11:00:00',
      updateTime: '2024-04-02 11:00:00'
    }
  ]
};
