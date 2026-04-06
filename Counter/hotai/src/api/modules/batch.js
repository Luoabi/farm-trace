import request from '../request';

// 批次管理相关API
export const batchAPI = {
  // 创建批次（需要 farmerId 参数）
  createBatch(data, farmerId) {
    return request({
      url: '/batch/create',
      method: 'post',
      params: { farmerId },
      data
    });
  },
  
  // 获取批次详情
  getBatchDetail(id) {
    return request({
      url: `/batch/detail/${id}`,
      method: 'get'
    });
  },
  
  // 获取批次列表（分页）
  getBatchList(params) {
    return request({
      url: '/batch/list',
      method: 'post',
      data: params
    });
  },
  
  // 根据农户ID查询批次列表
  getBatchListByFarmer(params, farmerId) {
    return request({
      url: '/batch/list-by-farmer',
      method: 'post',
      params: { farmerId },
      data: params
    });
  },
  
  // 更新批次信息
  updateBatch(id, data) {
    return request({
      url: `/batch/update/${id}`,
      method: 'put',
      data
    });
  },
  
  // 更新批次状态
  updateBatchStatus(id, status) {
    return request({
      url: `/batch/update-status/${id}`,
      method: 'put',
      params: { status }
    });
  },
  
  // 更新实际产量
  updateActualQuantity(id, actualQuantity) {
    return request({
      url: `/batch/update-actual-quantity/${id}`,
      method: 'put',
      params: { actualQuantity }
    });
  },
  
  // 删除批次
  deleteBatch(id) {
    console.log( "删除批次ID:", id);
    return request({
      url: `/batch/delete/${id}`,
      method: 'delete'
    });
  }
};

// 模拟数据
export const mockBatchData = {
  list: [
    {
      id: 'batch001',
      name: '西昌萝卜-202401批',
      productType: '蔬菜',
      plantingDate: '2024-01-15',
      harvestDate: '2024-03-20',
      status: '已收获',
      quantity: 5000,
      blockchainHash: '0x7a6b5c4d3e2f1a9b8c7d6e5f4a3b2c1d'
    },
    {
      id: 'batch002',
      name: '西昌草莓-202402批',
      productType: '水果',
      plantingDate: '2024-02-10',
      harvestDate: '2024-04-15',
      status: '生长中',
      quantity: 3000,
      blockchainHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d'
    },
    {
      id: 'batch003',
      name: '西昌葡萄-202401批',
      productType: '水果',
      plantingDate: '2024-01-05',
      harvestDate: '2024-06-25',
      status: '生长中',
      quantity: 2000,
      blockchainHash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d'
    },
    {
      id: 'batch004',
      name: '西昌水稻-202401批',
      productType: '谷物',
      plantingDate: '2024-03-01',
      harvestDate: '2024-08-15',
      status: '生长中',
      quantity: 10000,
      blockchainHash: '0x5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d'
    }
  ],
  detail: {
    id: 'batch001',
    name: '西昌萝卜-202401批',
    productType: '蔬菜',
    plantingDate: '2024-01-15',
    harvestDate: '2024-03-20',
    status: '已收获',
    quantity: 5000,
    unit: 'kg',
    location: '四川省凉山州西昌市安宁镇',
    farmer: '张大爷',
    contact: '13800138000',
    description: '优质白萝卜，无农药种植',
    blockchainHash: '0x7a6b5c4d3e2f1a9b8c7d6e5f4a3b2c1d',
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-03-20 16:45:00'
  }
};