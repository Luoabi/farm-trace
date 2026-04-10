import { createOrder } from '../../api/order';
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
      wx.showLoading({ title: '提交中...', mask: true });
      
      // 构建订单数据
      const orderData = {
        customerId: userInfo.id,
        customerName: userInfo.realName,
        customerPhone: userInfo.phone,
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit
        })),
        totalAmount,
        shippingAddress: `${address.province}${address.city}${address.district}${address.detailAddress}`,
        shippingMethod: '快递配送',
        remark: remark || undefined
      };
      
      const order = await createOrder(orderData);
      
      wx.hideLoading();
      
      // 清除购物车中已购买的商品
      let cart = wx.getStorageSync('cart') || [];
      const itemIds = items.map(item => item.productId);
      cart = cart.filter((c: CartItem) => !itemIds.includes(c.productId));
      wx.setStorageSync('cart', cart);
      
      wx.showToast({
        title: '下单成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/order-detail/order-detail?id=${order.id}`
        });
      }, 1500);
    } catch (error: any) {
      wx.hideLoading();
      this.setData({ submitting: false });
      
      wx.showToast({
        title: error.message || '下单失败',
        icon: 'none'
      });
    }
  }
});
