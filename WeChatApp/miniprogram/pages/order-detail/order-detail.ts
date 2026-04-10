import { getOrderDetail, cancelOrder, updateOrderStatus } from '../../api/order';
import { Order } from '../../types/order';

Page({
  data: {
    order: null as Order | null,
    loading: true,
    statusMap: {
      'WAITING_PAYMENT': '待支付',
      'PAID': '待发货',
      'SHIPPED': '待收货',
      'DELIVERED': '已完成',
      'CANCELLED': '已取消'
    }
  },

  onLoad(options: any) {
    const { id } = options;
    if (id) {
      this.loadOrderDetail(id);
    }
  },

  async loadOrderDetail(id: string) {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const order = await getOrderDetail(id);
      
      this.setData({
        order,
        loading: false
      });
      
      wx.hideLoading();
    } catch (error: any) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  handleCancelOrder() {
    const { order } = this.data;
    if (!order) return;
    
    wx.showModal({
      title: '提示',
      content: '确定要取消订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '取消中...' });
            
            await cancelOrder(order.id, '用户取消');
            
            wx.hideLoading();
            wx.showToast({
              title: '订单已取消',
              icon: 'success'
            });
            
            // 重新加载订单详情
            this.loadOrderDetail(order.id);
          } catch (error: any) {
            wx.hideLoading();
            wx.showToast({
              title: error.message || '取消失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  handleConfirmReceipt() {
    const { order } = this.data;
    if (!order) return;
    
    wx.showModal({
      title: '提示',
      content: '确认已收到货物吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '确认中...' });
            
            await updateOrderStatus(order.id, 'DELIVERED');
            
            wx.hideLoading();
            wx.showToast({
              title: '确认收货成功',
              icon: 'success'
            });
            
            // 重新加载订单详情
            this.loadOrderDetail(order.id);
          } catch (error: any) {
            wx.hideLoading();
            wx.showToast({
              title: error.message || '确认失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

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
  }
});
