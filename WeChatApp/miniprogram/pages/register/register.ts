import { register } from '../../api/user';

Page({
  data: {
    realName: '',
    phone: '',
    password: '',
    confirmPassword: ''
  },

  onRealNameInput(e: any) {
    this.setData({ realName: e.detail.value });
  },

  onPhoneInput(e: any) {
    this.setData({ phone: e.detail.value });
  },

  onPasswordInput(e: any) {
    this.setData({ password: e.detail.value });
  },

  onConfirmPasswordInput(e: any) {
    this.setData({ confirmPassword: e.detail.value });
  },

  validateForm() {
    const { realName, phone, password, confirmPassword } = this.data;

    if (!realName) {
      wx.showToast({ title: '请输入真实姓名', icon: 'none' });
      return false;
    }

    if (!phone) {
      wx.showToast({ title: '请输入手机号', icon: 'none' });
      return false;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' });
      return false;
    }

    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return false;
    }

    if (password.length < 6 || password.length > 20) {
      wx.showToast({ title: '密码长度为6-20位', icon: 'none' });
      return false;
    }

    if (password !== confirmPassword) {
      wx.showToast({ title: '两次密码输入不一致', icon: 'none' });
      return false;
    }

    return true;
  },

  async handleRegister() {
    if (!this.validateForm()) {
      return;
    }

    const { realName, phone, password } = this.data;

    try {
      wx.showLoading({ title: '注册中...', mask: true });
      
      const res = await register({
        username: phone,
        password: password,
        realName: realName,
        phone: phone,
        role: 'CUSTOMER'
      });

      console.log('注册响应:', res);

      wx.hideLoading();

      wx.showModal({
        title: '注册成功',
        content: '请使用手机号和密码登录',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
    } catch (error: any) {
      wx.hideLoading();
      console.error('注册失败:', error);
      
      const errorMsg = error.message || error.msg || '注册失败，请稍后重试';
      wx.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
      });
    }
  },

  goToLogin() {
    wx.navigateBack();
  }
});
