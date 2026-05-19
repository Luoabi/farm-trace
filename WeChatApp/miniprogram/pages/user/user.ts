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
    // 显示选择对话框：扫码或手动输入
    wx.showActionSheet({
      itemList: ['扫码查询', '输入批次号查询'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 扫码查询
          this.scanQRCode();
        } else if (res.tapIndex === 1) {
          // 手动输入批次号
          this.inputBatchNumber();
        }
      }
    });
  },

  // 扫码查询
  scanQRCode() {
    wx.scanCode({
      success: (res) => {
        console.log('扫码结果:', res.result);
        
        // 解析扫码结果
        // 格式可能是: pages/trace/trace?batchNumber=xxx
        // 或者直接是批次号
        let batchNumber = '';
        
        if (res.result.includes('batchNumber=')) {
          // 从URL中提取批次号
          const match = res.result.match(/batchNumber=([^&]+)/);
          if (match) {
            batchNumber = match[1];
          }
        } else {
          // 直接使用扫码结果作为批次号
          batchNumber = res.result;
        }
        
        if (batchNumber) {
          wx.navigateTo({
            url: `/pages/trace/trace?batchNumber=${batchNumber}`
          });
        } else {
          wx.showToast({
            title: '无效的二维码',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
  },

  // 手动输入批次号
  inputBatchNumber() {
    wx.showModal({
      title: '输入批次号',
      editable: true,
      placeholderText: '请输入批次号',
      success: (res) => {
        if (res.confirm && res.content) {
          const batchNumber = res.content.trim();
          if (batchNumber) {
            wx.navigateTo({
              url: `/pages/trace/trace?batchNumber=${batchNumber}`
            });
          } else {
            wx.showToast({
              title: '请输入有效的批次号',
              icon: 'none'
            });
          }
        }
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
