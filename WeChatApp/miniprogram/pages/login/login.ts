import { login } from '../../api/user';
import { saveUserInfo } from '../../utils/auth';

Page({
  data: {
    phone: '',
    password: ''
  },

  onPhoneInput(e: any) {
    this.setData({ phone: e.detail.value });
  },

  onPasswordInput(e: any) {
    this.setData({ password: e.detail.value });
  },

  async handleLogin() {
    const { phone, password } = this.data;

    // 表单验证
    if (!phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      });
      return;
    }

    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }

    if (password.length < 6) {
      wx.showToast({
        title: '密码长度不能少于6位',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '登录中...', mask: true });
      
      const res = await login({
        username: phone,
        password: password
      });

      console.log('登录响应:', res);

      // 保存用户信息
      saveUserInfo(res);

      wx.hideLoading();

      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        wx.switchTab({ 
          url: '/pages/index/index',
          fail: (err) => {
            console.error('跳转失败:', err);
            // 如果 switchTab 失败，尝试 reLaunch
            wx.reLaunch({ url: '/pages/index/index' });
          }
        });
      }, 1500);
    } catch (error: any) {
      wx.hideLoading();
      console.error('登录失败:', error);
      
      const errorMsg = error.message || error.msg || '登录失败，请检查用户名和密码';
      wx.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
      });
    }
  },

  goToRegister() {
    wx.navigateTo({ url: '/pages/register/register' });
  }
});
