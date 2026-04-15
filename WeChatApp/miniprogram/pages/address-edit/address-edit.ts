import { createAddress, updateAddress, getAddressDetail } from '../../api/address';
import { getUserInfo } from '../../utils/auth';

Page({
  data: {
    id: '',
    addressId: '', // 用于导航栏标题判断
    receiverName: '',
    receiverPhone: '',
    province: '',
    city: '',
    district: '',
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
        isDefault: address.isDefault === 1  // 转换为 boolean 类型
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

  // 选择地区
  handleRegionPicker() {
    // 跳转到地区选择页面
    wx.navigateTo({
      url: `/pages/region-picker/region-picker?province=${this.data.province}&city=${this.data.city}&district=${this.data.district}`
    });
  },

  // 处理地区选择返回的数据
  handleRegionSelected(region: any) {
    console.log('收到选择的地区:', region);
    
    this.setData({
      province: region.province,
      city: region.city,
      district: region.district
    });
    
    wx.showToast({
      title: '地区选择成功',
      icon: 'success',
      duration: 1500
    });
  },

  // 选择地图位置
  handleChooseLocation() {
    // 跳转到地图选点页面
    wx.navigateTo({
      url: '/pages/map-select/map-select'
    });
  },

  // 处理地图选点返回的数据
  handleLocationSelected(location: any) {
    console.log('收到选择的位置:', location);
    
    // 解析地址信息
    const address = location.address || '';
    const name = location.name || '';
    
    // 更新省市区（从 address 中提取）
    this.parseAddress(address);
    
    // 更新详细地址 - 优先使用 name，如果没有则使用完整地址
    let detailAddress = '';
    if (name) {
      // 如果有地点名称，组合名称和地址
      detailAddress = address ? `${name}（${address}）` : name;
    } else {
      detailAddress = address;
    }
    
    this.setData({
      detailAddress: detailAddress
    });
    
    wx.showToast({
      title: '位置选择成功',
      icon: 'success',
      duration: 1500
    });
  },

  // 解析地址字符串，提取省市区
  parseAddress(address: string) {
    // 更智能的地址解析逻辑
    let province = this.data.province;
    let city = this.data.city;
    let district = this.data.district;
    
    // 匹配省份
    const provinceMatch = address.match(/([\u4e00-\u9fa5]{2,}省)/);
    if (provinceMatch) {
      province = provinceMatch[1];
    }
    
    // 匹配市/自治州
    const cityMatch = address.match(/([\u4e00-\u9fa5]{2,}(市|自治州|地区|盟))/);
    if (cityMatch) {
      city = cityMatch[1];
    }
    
    // 匹配区/县
    const districtMatch = address.match(/([\u4e00-\u9fa5]{2,}(区|县|市))/);
    if (districtMatch) {
      district = districtMatch[1];
    }
    
    // 特殊处理凉山州
    if (address.includes('凉山') && !city.includes('凉山')) {
      city = '凉山彝族自治州';
    }
    
    this.setData({
      province: province,
      city: city,
      district: district
    });
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
      isDefault: this.data.isDefault ? 1 : 0  // 转换为 Integer 类型
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
