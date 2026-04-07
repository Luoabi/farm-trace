import request from '../request';

// 订单管理相关API
export const orderAPI = {
  // 创建订单
  createOrder(data) {
    return request({
      url: '/order/create',
      method: 'post',
      data
    });
  },
  
  // 获取订单详情
  getOrderDetail(id) {
    return request({
      url: `/order/detail/${id}`,
      method: 'get'
    });
  },
  
  // 根据订单编号查询订单
  getOrderByNumber(orderNumber) {
    return request({
      url: `/order/detail-by-number/${orderNumber}`,
      method: 'get'
    });
  },
  
  // 获取订单列表（分页）
  getOrderList(params) {
    return request({
      url: '/order/list',
      method: 'post',
      data: params
    });
  },
  
  // 根据客户ID查询订单列表
  getOrdersByCustomer(params, customerId) {
    return request({
      url: '/order/list-by-customer',
      method: 'post',
      params: { customerId },
      data: params
    });
  },
  
  // 根据农户ID查询订单列表
  getOrdersByFarmer(params, farmerId) {
    return request({
      url: '/order/list-by-farmer',
      method: 'post',
      params: { farmerId },
      data: params
    });
  },
  
  // 更新订单状态
  updateOrderStatus(id, status) {
    return request({
      url: `/order/update-status/${id}`,
      method: 'put',
      params: { status }
    });
  },
  
  // 更新物流信息
  updateShippingInfo(id, logisticsCompany, logisticsNumber) {
    return request({
      url: `/order/update-shipping/${id}`,
      method: 'put',
      params: { 
        logisticsCompany,
        logisticsNumber
      }
    });
  },
  
  // 取消订单
  cancelOrder(id, reason) {
    return request({
      url: `/order/cancel/${id}`,
      method: 'put',
      params: { reason }
    });
  },
  
  // 删除订单
  deleteOrder(id) {
    return request({
      url: `/order/delete/${id}`,
      method: 'delete'
    });
  }
};

// 模拟数据
export const mockOrderData = {
  list: [
    {
      id: 'order001',
      orderNo: 'XCNM202403200001',
      customerName: '张三',
      customerPhone: '138****1234',
      totalAmount: 119.80,
      status: '已完成',
      createTime: '2024-03-20 10:30:00',
      payTime: '2024-03-20 10:35:00',
      deliveryTime: '2024-03-20 14:00:00',
      completionTime: '2024-03-22 16:20:00',
      productCount: 2
    },
    {
      id: 'order002',
      orderNo: 'XCNM202403210002',
      customerName: '李四',
      customerPhone: '139****5678',
      totalAmount: 88.00,
      status: '待发货',
      createTime: '2024-03-21 11:45:00',
      payTime: '2024-03-21 11:50:00',
      productCount: 1
    },
    {
      id: 'order003',
      orderNo: 'XCNM202403220003',
      customerName: '王五',
      customerPhone: '137****9012',
      totalAmount: 175.99,
      status: '已发货',
      createTime: '2024-03-22 16:30:00',
      payTime: '2024-03-22 16:35:00',
      deliveryTime: '2024-03-23 09:00:00',
      productCount: 3
    },
    {
      id: 'order004',
      orderNo: 'XCNM202403230004',
      customerName: '赵六',
      customerPhone: '136****3456',
      totalAmount: 5.99,
      status: '待付款',
      createTime: '2024-03-23 14:20:00',
      productCount: 1
    }
  ],
  detail: {
    id: 'order001',
    orderNo: 'XCNM202403200001',
    customerInfo: {
      name: '张三',
      phone: '13812341234',
      address: '四川省成都市高新区天府大道123号',
      email: 'zhangsan@example.com'
    },
    items: [
      {
        productId: 'prod001',
        productName: '西昌有机白萝卜',
        unitPrice: 5.99,
        quantity: 20,
        totalPrice: 119.80,
        image: 'https://via.placeholder.com/80x80?text=白萝卜'
      }
    ],
    totalQuantity: 20,
    totalAmount: 119.80,
    shippingFee: 0,
    paymentMethod: '微信支付',
    status: '已完成',
    createTime: '2024-03-20 10:30:00',
    payTime: '2024-03-20 10:35:00',
    deliveryTime: '2024-03-20 14:00:00',
    completionTime: '2024-03-22 16:20:00',
    logisticsInfo: {
      company: '顺丰速运',
      trackingNo: 'SF1234567890',
      status: '已签收'
    },
    notes: '请尽快发货',
    blockchainHash: '0x44d55e66f77a88b99c00d11a22b33c44'
  }
};