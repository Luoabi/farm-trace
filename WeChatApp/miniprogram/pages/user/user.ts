import { getUserInfo, clearUserInfo } from '../../utils/auth';
import { User } from '../../types/user';

Page({
  data: {
    userInfo: {} as User
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const userInfo = getUserInfo();
    this.setData({ userInfo });
  },

  goToOrders(e: any) {
    const status = e.currentTarget.dataset.status;
    wx.switchTab({
      url: '/pages/order-list/order-list',
      success: () => {
        // 通过事件通知订单页面切换标签
        const pages = getCurrentPages();
        const orderPage = pages.find((page: any) => page.route === 'pages/order-list/order-list');
        if (orderPage) {
          orderPage.setData({ currentTab: status });
          (orderPage as any).loadOrders(true);
        }
      }
    });
  },

  goToAddressList() {
    wx.navigateTo({
      url: '/pages/address-list/address-list'
    });
  },

  handleScan() {
    wx.scanCode({
      success: (res) => {
        wx.navigateTo({
          url: `/pages/trace/trace?code=${res.result}`
        });
      },
      fail: () => {
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
  },

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          clearUserInfo();
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }
      }
    });
  }
});
