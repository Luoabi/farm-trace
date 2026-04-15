import { getOrderList, cancelOrder, updateOrderStatus, payOrder, deleteOrder } from '../../api/order';
import { getUserInfo } from '../../utils/auth';

// 订单状态映射
const STATUS_MAP: Record<string, string> = {
  '0': '待支付',
  '1': '待发货',
  '2': '待收货',
  '3': '已完成',
  '4': '已取消'
};

// 订单状态对应的标签
const STATUS_TABS: Record<string, string> = {
  'ALL': '全部',
  '0': '待支付',
  '1': '待发货',
  '2': '待收货',
  '3': '已完成'
};

Page({
  data: {
    currentTab: 'ALL',
    orderList: [] as any[],
    page: 1,
    pageSize: 10,
    loading: false,
    noMore: false,
    statusMap: STATUS_MAP
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    // 从订单详情页返回时刷新列表
    if (this.data.orderList.length > 0) {
      this.loadOrders(true);
    }
  },

  async loadOrders(refresh = false) {
    if (this.data.loading || (!refresh && this.data.noMore)) return;

    if (refresh) {
      this.setData({
        page: 1,
        orderList: [],
        noMore: false
      });
    }

    this.setData({ loading: true });

    try {
      const userInfo = getUserInfo();
      if (!userInfo) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      const res = await getOrderList({
        page: refresh ? 1 : this.data.page,
        pageSize: this.data.pageSize
      }, userInfo.id);

      console.log('订单列表数据:', res);

      let list = res.list || [];
      
      // 根据当前标签筛选
      if (this.data.currentTab !== 'ALL') {
        list = list.filter((order: any) => order.orderStatus === this.data.currentTab);
      }

      const newList = refresh ? list : [...this.data.orderList, ...list];
      
      this.setData({
        orderList: newList,
        loading: false,
        noMore: list.length < this.data.pageSize,
        page: refresh ? 2 : this.data.page + 1
      });
    } catch (error: any) {
      this.setData({ loading: false });
      console.error('加载订单失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    }
  },

  handleTabChange(e: any) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.loadOrders(true);
  },

  goToDetail(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${id}`
    });
  },

  // 取消订单
  handleCancelOrder(e: any) {
    const id = e.currentTarget.dataset.id;
    const orderNumber = e.currentTarget.dataset.number;
    
    wx.showModal({
      title: '提示',
      content: `确定要取消订单 ${orderNumber} 吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '取消中...', mask: true });
            await cancelOrder(id);
            wx.hideLoading();
            
            wx.showToast({
              title: '订单已取消',
              icon: 'success'
            });
            
            // 刷新列表
            this.loadOrders(true);
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

  // 支付订单
  handlePayOrder(e: any) {
    const id = e.currentTarget.dataset.id;
    const price = e.currentTarget.dataset.price;
    
    wx.showModal({
      title: '确认支付',
      content: `订单金额：¥${price}`,
      confirmText: '确认支付',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '发起支付...', mask: true });
            
            // 调用支付接口（模拟支付）
            await payOrder(id);
            
            wx.hideLoading();
            
            // 模拟微信支付成功
            wx.showModal({
              title: '支付成功',
              content: '订单支付成功，农户将尽快为您发货',
              showCancel: false,
              success: () => {
                // 刷新列表
                this.loadOrders(true);
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
                  this.handlePayOrder(e);
                }
              }
            });
          }
        }
      }
    });
  },

  // 确认收货
  handleConfirmReceipt(e: any) {
    const id = e.currentTarget.dataset.id;
    const orderNumber = e.currentTarget.dataset.number;
    
    wx.showModal({
      title: '提示',
      content: `确认收到订单 ${orderNumber} 的商品了吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '确认中...', mask: true });
            await updateOrderStatus(id, '3'); // 3-已完成
            wx.hideLoading();
            
            wx.showToast({
              title: '确认收货成功',
              icon: 'success'
            });
            
            // 刷新列表
            this.loadOrders(true);
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

  // 删除订单
  handleDeleteOrder(e: any) {
    const id = e.currentTarget.dataset.id;
    const orderNumber = e.currentTarget.dataset.number;
    
    wx.showModal({
      title: '删除订单',
      content: `确定要删除订单 ${orderNumber} 吗？删除后将无法恢复！`,
      confirmText: '确定删除',
      cancelText: '取消',
      confirmColor: '#ff0000',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...', mask: true });
            
            await deleteOrder(id);
            
            wx.hideLoading();
            
            wx.showToast({
              title: '订单已删除',
              icon: 'success'
            });
            
            // 刷新列表
            this.loadOrders(true);
          } catch (error: any) {
            wx.hideLoading();
            console.error('删除订单失败:', error);
            wx.showToast({
              title: error.message || '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  onPullDownRefresh() {
    this.loadOrders(true);
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    this.loadOrders();
  }
});
