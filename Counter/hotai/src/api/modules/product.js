import request from '../request';

// 商品管理相关API
export const productAPI = {
  // 创建商品
  createProduct(data) {
    return request({
      url: '/product/create',
      method: 'post',
      data
    });
  },
  // 获取商品详情
  getProductDetail(id) {
    return request({
      url: `/product/detail/${id}`,
      method: 'get'
    });
  },
  // 获取商品列表（分页）
  getProductList(params) {
    return request({
      url: '/product/list',
      method: 'post',
      data: params
    });
  },
  // 获取农户商品列表
  getProductListByFarmerId(farmerId, params) {
    return request({
      url: `/product/list-by-farmer/${farmerId}`,
      method: 'post',
      data: params
    });
  },
  // 根据分类查询商品
  getProductsByCategory(category) {
    return request({
      url: `/product/list-by-category/${category}`,
      method: 'get'
    });
  },
  // 更新商品信息
  updateProduct(id, data) {
    return request({
      url: `/product/update/${id}`,
      method: 'put',
      data
    });
  },
  // 删除商品
  deleteProduct(id) {
    return request({
      url: `/product/delete/${id}`,
      method: 'delete'
    });
  }
};

// 模拟数据
export const mockProductData = {
  list: [
    {
      id: 'prod001',
      name: '西昌有机白萝卜',
      batchId: 'batch001',
      batchName: '西昌萝卜-202401批',
      category: '蔬菜',
      price: 5.99,
      stock: 1200,
      unit: 'kg',
      status: '上架',
      sales: 3800,
      image: 'https://via.placeholder.com/100x100?text=白萝卜',
      blockchainHash: '0x11a22b33c44d55e66f77a88b99c00d11'
    },
    {
      id: 'prod002',
      name: '西昌草莓礼盒',
      batchId: 'batch002',
      batchName: '西昌草莓-202402批',
      category: '水果',
      price: 88.00,
      stock: 500,
      unit: '盒',
      status: '预售',
      sales: 0,
      image: 'https://via.placeholder.com/100x100?text=草莓',
      blockchainHash: '0x22b33c44d55e66f77a88b99c00d11a22'
    },
    {
      id: 'prod003',
      name: '西昌阳光玫瑰葡萄',
      batchId: 'batch003',
      batchName: '西昌葡萄-202401批',
      category: '水果',
      price: 68.00,
      stock: 800,
      unit: 'kg',
      status: '预售',
      sales: 0,
      image: 'https://via.placeholder.com/100x100?text=葡萄',
      blockchainHash: '0x33c44d55e66f77a88b99c00d11a22b33'
    }
  ],
  detail: {
    id: 'prod001',
    name: '西昌有机白萝卜',
    batchId: 'batch001',
    batchName: '西昌萝卜-202401批',
    category: '蔬菜',
    price: 5.99,
    originalPrice: 7.99,
    stock: 1200,
    unit: 'kg',
    status: '上架',
    sales: 3800,
    description: '来自西昌高原的有机白萝卜，无农药种植，口感脆甜，富含维生素和矿物质。',
    features: ['有机认证', '高原种植', '新鲜采摘', '无农药残留'],
    images: [
      'https://via.placeholder.com/400x300?text=白萝卜1',
      'https://via.placeholder.com/400x300?text=白萝卜2',
      'https://via.placeholder.com/400x300?text=白萝卜3'
    ],
    specifications: '单根约300-500g',
    packaging: '塑料网袋包装',
    shelfLife: '15天',
    storageMethod: '冷藏保存',
    blockchainHash: '0x11a22b33c44d55e66f77a88b99c00d11',
    createdAt: '2024-03-21 09:00:00',
    updatedAt: '2024-03-22 15:30:00'
  }
};