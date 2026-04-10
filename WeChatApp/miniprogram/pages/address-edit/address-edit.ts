import { createAddress, updateAddress, getAddressDetail } from '../../api/address';
import { getUserInfo } from '../../utils/auth';

Page({
  data: {
    id: '',
    addressId: '', // 用于导航栏标题判断
    receiverName: '',
    receiverPhone: '',
    province: '四川省',
    city: '凉山彝族自治州',
    district: '西昌市',
    detailAddress: '',
    isDefault: false,
    isEdit: false,
    submitting: false
  },

  onLoad(options: any) {
    if (options.id) {
      this.setData({ id: options.id, addressId: options.id, isEdit: true });
      this.loadAddressDetail(options.id);
    }
  },

  async loadAddressDetail(id: string) {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const address = await getAddressDetail(id);
      
      this.setData({
        receiverName: address.receiverName,
        receiverPhone: address.receiverPhone,
        province: address.province,
        city: address.city,
        district: address.district,
        detailAddress: address.detailAddress,
        isDefault: address.isDefault
      });
      
      wx.hideLoading();
    } catch (error: any) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    }
  },

  onReceiverNameInput(e: any) {
    this.setData({ receiverName: e.detail.value });
  },

  onReceiverPhoneInput(e: any) {
    this.setData({ receiverPhone: e.detail.value });
  },

  onDetailAddressInput(e: any) {
    this.setData({ detailAddress: e.detail.value });
  },

  handleDefaultChange(e: any) {
    this.setData({ isDefault: e.detail.value });
  },

  validateForm() {
    const { receiverName, receiverPhone, detailAddress } = this.data;

    if (!receiverName) {
      wx.showToast({ title: '请输入收货人姓名', icon: 'none' });
      return false;
    }

    if (!receiverPhone) {
      wx.showToast({ title: '请输入手机号', icon: 'none' });
      return false;
    }

    if (!/^1[3-9]\d{9}$/.test(receiverPhone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' });
      return false;
    }

    if (!detailAddress) {
      wx.showToast({ title: '请输入详细地址', icon: 'none' });
      return false;
    }

    return true;
  },

  async handleSubmit() {
    if (!this.validateForm()) {
      return;
    }

    if (this.data.submitting) return;

    const userInfo = getUserInfo();
    if (!userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    const addressData = {
      userId: userInfo.id,
      receiverName: this.data.receiverName,
      receiverPhone: this.data.receiverPhone,
      province: this.data.province,
      city: this.data.city,
      district: this.data.district,
      detailAddress: this.data.detailAddress,
      isDefault: this.data.isDefault
    };

    try {
      wx.showLoading({ title: this.data.isEdit ? '保存中...' : '添加中...', mask: true });

      if (this.data.isEdit) {
        await updateAddress(this.data.id, addressData);
      } else {
        await createAddress(addressData);
      }

      wx.hideLoading();

      wx.showToast({
        title: this.data.isEdit ? '保存成功' : '添加成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error: any) {
      wx.hideLoading();
      this.setData({ submitting: false });

      wx.showToast({
        title: error.message || '操作失败',
        icon: 'none'
      });
    }
  }
});
