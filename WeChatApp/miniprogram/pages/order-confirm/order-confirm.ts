import { createOrder, payOrder } from '../../api/order';
import { getDefaultAddress, getAddressList } from '../../api/address';
import { getUserInfo } from '../../utils/auth';
import { Address } from '../../types/address';
import { CartItem } from '../../types/common';

Page({
  data: {
    items: [] as CartItem[],
    address: null as Address | null,
    totalAmount: 0,
    remark: '',
    submitting: false
  },

  onLoad(options: any) {
    if (options.items) {
      try {
        const items = JSON.parse(decodeURIComponent(options.items));
        const totalAmount = items.reduce((sum: number, item: CartItem) => 
          sum + item.price * item.quantity, 0
        );
        
        this.setData({
          items,
          totalAmount
        });
      } catch (error) {
        console.error('解析商品信息失败:', error);
        wx.showToast({
          title: '数据错误',
          icon: 'none'
        });
      }
    }
    
    this.loadDefaultAddress();
  },

  async loadDefaultAddress() {
    try {
      const userInfo = getUserInfo();
      if (!userInfo) return;
      
      const address = await getDefaultAddress(userInfo.id);
      this.setData({ address });
    } catch (error: any) {
      console.log('获取默认地址失败:', error);
      // 如果没有默认地址，尝试获取第一个地址
      this.loadFirstAddress();
    }
  },

  async loadFirstAddress() {
    try {
      const userInfo = getUserInfo();
      if (!userInfo) return;
      
      const list = await getAddressList(userInfo.id);
      if (list && list.length > 0) {
        this.setData({ address: list[0] });
      }
    } catch (error) {
      console.log('获取地址列表失败:', error);
    }
  },

  selectAddress() {
    wx.navigateTo({
      url: '/pages/address-list/address-list?select=true'
    });
  },

  onRemarkInput(e: any) {
    this.setData({ remark: e.detail.value });
  },

  async handleSubmit() {
    const { address, items, totalAmount, remark, submitting } = this.data;
    
    if (submitting) return;
    
    if (!address) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      });
      return;
    }
    
    if (items.length === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      });
      return;
    }
    
    const userInfo = getUserInfo();
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ submitting: true });
    
    try {
      wx.showLoading({ title: `提交中(0/${items.length})...`, mask: true });
      
      // 构建收货地址
      const shippingAddress = `${address.province}${address.city}${address.district}${address.detailAddress}`;
      
      // 按顺序为每个商品创建订单（避免并发导致ID冲突）
      const orders = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        wx.showLoading({ 
          title: `提交中(${i + 1}/${items.length})...`, 
          mask: true 
        });
        
        const orderData = {
          customerId: userInfo.id,
          customerName: userInfo.realName,
          productId: item.productId,
          batchId: '',  // 空字符串，后端会从商品信息中获取农户ID
          quantity: item.quantity,
          deliveryAddress: shippingAddress,
          deliveryType: '快递配送',
          remark: remark || undefined
        };
        
        console.log(`创建第${i + 1}个订单:`, orderData);
        
        try {
          const order = await createOrder(orderData);
          orders.push(order);
          console.log(`第${i + 1}个订单创建成功:`, order.orderNumber);
        } catch (error: any) {
          console.error(`第${i + 1}个订单创建失败:`, error);
          throw new Error(`商品"${item.productName}"下单失败: ${error.message}`);
        }
      }
      
      wx.hideLoading();
      
      // 清除购物车中已购买的商品
      let cart = wx.getStorageSync('cart') || [];
      const itemIds = items.map(item => item.productId);
      cart = cart.filter((c: CartItem) => !itemIds.includes(c.productId));
      wx.setStorageSync('cart', cart);
      
      wx.showToast({
        title: `成功创建${orders.length}个订单`,
        icon: 'success',
        duration: 1500
      });
      
      // 如果只有一个订单，直接发起支付
      if (orders.length === 1) {
        setTimeout(() => {
          this.handlePayment(orders[0].id);
        }, 1500);
      } else {
        // 多个订单，跳转到订单列表
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/order-list/order-list'
          });
        }, 1500);
      }
    } catch (error: any) {
      wx.hideLoading();
      this.setData({ submitting: false });
      
      console.error('下单失败:', error);
      wx.showToast({
        title: error.message || '下单失败',
        icon: 'none',
        duration: 3000
      });
    }
  },

  // 发起支付
  async handlePayment(orderId: string) {
    try {
      wx.showLoading({ title: '发起支付...', mask: true });
      
      // 调用支付接口（模拟支付）
      await payOrder(orderId);
      
      wx.hideLoading();
      
      // 模拟微信支付
      // 在实际生产环境中，这里应该调用 wx.requestPayment()
      wx.showModal({
        title: '支付成功',
        content: '订单支付成功，农户将尽快为您发货',
        showCancel: false,
        success: () => {
          // 跳转到订单详情页
          wx.redirectTo({
            url: `/pages/order-detail/order-detail?id=${orderId}`
          });
        }
      });
    } catch (error: any) {
      wx.hideLoading();
      console.error('支付失败:', error);
      
      wx.showModal({
        title: '支付失败',
        content: error.message || '支付失败，请稍后重试',
        confirmText: '重试',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 重试支付
            this.handlePayment(orderId);
          } else {
            // 跳转到订单列表
            wx.switchTab({
              url: '/pages/order-list/order-list'
            });
          }
        }
      });
    }
  }
});
