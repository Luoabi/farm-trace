import { getOrderDetail, cancelOrder, updateOrderStatus, deleteOrder } from '../../api/order';
import { pay } from '../../api/payment';

// 订单状态映射
const STATUS_MAP: Record<string, string> = {
  '0': '待支付',
  '1': '待发货',
  '2': '待收货',
  '3': '已完成',
  '4': '已取消'
};

Page({
  data: {
    order: null as any,
    loading: true,
    statusMap: STATUS_MAP
  },

  onLoad(options: any) {
    const { id } = options;
    if (id) {
      this.loadOrderDetail(id);
    } else {
      wx.showToast({
        title: '订单ID不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  async loadOrderDetail(id: string) {
    try {
      wx.showLoading({ title: '加载中...', mask: true });
      
      console.log('加载订单详情，ID:', id);
      const order = await getOrderDetail(id);
      console.log('订单详情数据:', order);
      
      this.setData({
        order,
        loading: false
      });
      
      wx.hideLoading();
    } catch (error: any) {
      wx.hideLoading();
      console.error('加载订单详情失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none',
        duration: 2000
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }
  },

  // 取消订单
  handleCancelOrder() {
    const { order } = this.data;
    if (!order) return;
    
    wx.showModal({
      title: '取消订单',
      content: `确定要取消订单 ${order.orderNumber} 吗？`,
      confirmText: '确定取消',
      cancelText: '再想想',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '取消中...', mask: true });
            
            await cancelOrder(order.id, '用户主动取消');
            
            wx.hideLoading();
            wx.showToast({
              title: '订单已取消',
              icon: 'success',
              duration: 2000
            });
            
            // 重新加载订单详情
            setTimeout(() => {
              this.loadOrderDetail(order.id);
            }, 500);
          } catch (error: any) {
            wx.hideLoading();
            console.error('取消订单失败:', error);
            wx.showToast({
              title: error.message || '取消失败',
              icon: 'none',
              duration: 2000
            });
          }
        }
      }
    });
  },

  // 支付订单
  async handlePayOrder() {
    const { order } = this.data;
    if (!order) return;
    
    try {
      // 使用统一支付方法（自动判断模拟支付或微信支付）
      await pay(order.id);
      
      // 支付成功，重新加载订单详情
      wx.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 2000
      });
      
      setTimeout(() => {
        this.loadOrderDetail(order.id);
      }, 500);
      
    } catch (error: any) {
      console.error('支付失败:', error);
      
      // 如果不是用户取消支付，显示错误信息
      if (error.message !== '用户取消支付') {
        wx.showModal({
          title: '支付失败',
          content: error.message || '支付失败，请稍后重试',
          confirmText: '重试',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              // 重试支付
              this.handlePayOrder();
            }
          }
        });
      }
    }
  },

  // 确认收货
  handleConfirmReceipt() {
    const { order } = this.data;
    if (!order) return;
    
    wx.showModal({
      title: '确认收货',
      content: '确认已收到货物吗？确认后订单将完成。',
      confirmText: '确认收货',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '确认中...', mask: true });
            
            await updateOrderStatus(order.id, '3'); // 3-已完成
            
            wx.hideLoading();
            wx.showToast({
              title: '确认收货成功',
              icon: 'success',
              duration: 2000
            });
            
            // 重新加载订单详情
            setTimeout(() => {
              this.loadOrderDetail(order.id);
            }, 500);
          } catch (error: any) {
            wx.hideLoading();
            console.error('确认收货失败:', error);
            wx.showToast({
              title: error.message || '确认失败',
              icon: 'none',
              duration: 2000
            });
          }
        }
      }
    });
  },

  // 复制订单号
  copyOrderNumber() {
    const { order } = this.data;
    if (!order) return;
    
    wx.setClipboardData({
      data: order.orderNumber,
      success: () => {
        wx.showToast({
          title: '已复制订单号',
          icon: 'success'
        });
      }
    });
  },

  // 联系农户
  callFarmer() {
    const { order } = this.data;
    if (!order || !order.farmerPhone) {
      wx.showToast({
        title: '农户电话不存在',
        icon: 'none'
      });
      return;
    }
    
    wx.makePhoneCall({
      phoneNumber: order.farmerPhone,
      fail: () => {
        wx.showToast({
          title: '拨号失败',
          icon: 'none'
        });
      }
    });
  },

  // 删除订单
  handleDeleteOrder() {
    const { order } = this.data;
    if (!order) return;
    
    wx.showModal({
      title: '删除订单',
      content: `确定要删除订单 ${order.orderNumber} 吗？删除后将无法恢复！`,
      confirmText: '确定删除',
      cancelText: '取消',
      confirmColor: '#ff0000',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...', mask: true });
            
            await deleteOrder(order.id);
            
            wx.hideLoading();
            
            wx.showToast({
              title: '订单已删除',
              icon: 'success',
              duration: 2000
            });
            
            // 返回订单列表
            setTimeout(() => {
              wx.navigateBack();
            }, 2000);
          } catch (error: any) {
            wx.hideLoading();
            console.error('删除订单失败:', error);
            wx.showToast({
              title: error.message || '删除失败',
              icon: 'none',
              duration: 2000
            });
          }
        }
      }
    });
  }
});
