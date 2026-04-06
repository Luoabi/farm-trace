import request from '../request';

// 生长记录管理相关API
export const growthRecordAPI = {
  // 创建生长记录
  createGrowthRecord(data) {
    return request({
      url: '/growth-record/create',
      method: 'post',
      data
    });
  },
  
  // 获取生长记录详情
  getGrowthRecordDetail(id) {
    return request({
      url: `/growth-record/detail/${id}`,
      method: 'get'
    });
  },
  
  // 获取生长记录列表（分页）
  getGrowthRecordList(params) {
    return request({
      url: '/growth-record/list',
      method: 'post',
      data: params
    });
  },
  
  // 根据批次ID获取生长记录列表（分页）
  getGrowthRecordsByBatch(batchId, params) {
    return request({
      url: `/growth-record/list-by-batch/${batchId}`,
      method: 'post',
      data: params
    });
  },
  
  // 根据农户ID获取生长记录列表（分页）
  getGrowthRecordsByFarmer(farmerId, params) {
    return request({
      url: '/growth-record/list-by-farmer',
      method: 'post',
      params: { farmerId },
      data: params
    });
  },
  
  // 更新生长记录
  updateGrowthRecord(id, data) {
    return request({
      url: `/growth-record/update/${id}`,
      method: 'put',
      data
    });
  },
  
  // 删除生长记录
  deleteGrowthRecord(id) {
    return request({
      url: `/growth-record/delete/${id}`,
      method: 'delete'
    });
  }
};

// 模拟数据
export const mockGrowthRecordData = {
  list: [
    {
      id: 'gr001',
      batchId: 'batch001',
      batchName: '西昌萝卜-202401批',
      recordDate: '2024-01-20',
      growthStage: '发芽期',
      height: '5cm',
      condition: '良好',
      description: '种子已全部发芽，生长状况良好',
      imageCount: 2,
      blockchainHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'
    },
    {
      id: 'gr002',
      batchId: 'batch001',
      batchName: '西昌萝卜-202401批',
      recordDate: '2024-02-10',
      growthStage: '生长期',
      height: '15cm',
      condition: '良好',
      description: '植株生长健壮，叶片翠绿',
      imageCount: 3,
      blockchainHash: '0xf6e5d4c3b2a1f2e3d4c5b6a7f8e9d0c1'
    },
    {
      id: 'gr003',
      batchId: 'batch002',
      batchName: '西昌草莓-202402批',
      recordDate: '2024-02-20',
      growthStage: '幼苗期',
      height: '8cm',
      condition: '良好',
      description: '幼苗生长正常，开始分株',
      imageCount: 2,
      blockchainHash: '0x12a34b56c78d90e12f34a56b78c90d1e'
    }
  ],
  detail: {
    id: 'gr001',
    batchId: 'batch001',
    batchName: '西昌萝卜-202401批',
    recordDate: '2024-01-20',
    growthStage: '发芽期',
    height: '5cm',
    temperature: '20°C',
    humidity: '65%',
    condition: '良好',
    description: '种子已全部发芽，生长状况良好。今日浇水一次，土壤湿度适中。',
    images: [
      'https://via.placeholder.com/300x200?text=Growth+Record+1',
      'https://via.placeholder.com/300x200?text=Growth+Record+2'
    ],
    blockchainHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
    createdAt: '2024-01-20 14:30:00',
    updatedAt: '2024-01-20 14:30:00'
  }
};