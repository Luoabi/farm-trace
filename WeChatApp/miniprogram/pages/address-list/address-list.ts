import { getAddressList, deleteAddress, setDefaultAddress } from '../../api/address';
import { getUserInfo } from '../../utils/auth';
import { Address } from '../../types/address';

Page({
  data: {
    addressList: [] as Address[],
    loading: true,
    selectMode: false  // 是否是选择地址模式
  },

  onLoad(options: any) {
    if (options.select === 'true') {
      this.setData({ selectMode: true });
    }
    this.loadAddressList();
  },

  onShow() {
    // 从编辑页面返回时重新加载列表
    if (!this.data.loading) {
      this.loadAddressList();
    }
  },

  async loadAddressList() {
    try {
      const userInfo = getUserInfo();
      if (!userInfo) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      wx.showLoading({ title: '加载中...' });
      
      const list = await getAddressList(userInfo.id);
      
      this.setData({
        addressList: list || [],
        loading: false
      });
      
      wx.hideLoading();
    } catch (error: any) {
      wx.hideLoading();
      this.setData({ loading: false });
      
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    }
  },

  handleSelectAddress(e: any) {
    if (!this.data.selectMode) return;
    
    const address = e.currentTarget.dataset.address;
    
    // 通过事件通道返回选中的地址
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({ address });
    }
    
    wx.navigateBack();
  },

  handleSetDefault(e: any) {
    const { id } = e.currentTarget.dataset;
    const userInfo = getUserInfo();
    
    if (!userInfo) return;
    
    wx.showLoading({ title: '设置中...' });
    
    setDefaultAddress(id, userInfo.id)
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '设置成功',
          icon: 'success'
        });
        this.loadAddressList();
      })
      .catch((error: any) => {
        wx.hideLoading();
        wx.showToast({
          title: error.message || '设置失败',
          icon: 'none'
        });
      });
  },

  handleEdit(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/address-edit/address-edit?id=${id}`
    });
  },

  handleDelete(e: any) {
    const { id } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '提示',
      content: '确定要删除这个地址吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          
          deleteAddress(id)
            .then(() => {
              wx.hideLoading();
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
              this.loadAddressList();
            })
            .catch((error: any) => {
              wx.hideLoading();
              wx.showToast({
                title: error.message || '删除失败',
                icon: 'none'
              });
            });
        }
      }
    });
  },

  handleAdd() {
    wx.navigateTo({
      url: '/pages/address-edit/address-edit'
    });
  }
});
