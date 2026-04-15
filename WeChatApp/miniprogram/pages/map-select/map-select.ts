Page({
  data: {
    latitude: 27.8964, // 西昌市中心纬度
    longitude: 102.2584, // 西昌市中心经度
    markers: [] as any[],
    address: '',
    name: '',
    selectedLocation: null as any
  },

  onLoad() {
    // 获取用户当前位置
    this.getUserLocation();
  },

  getUserLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log('当前位置:', res);
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          markers: [{
            id: 1,
            latitude: res.latitude,
            longitude: res.longitude,
            width: 30,
            height: 30
          }]
        });
      },
      fail: (err) => {
        console.error('获取位置失败:', err);
        wx.showToast({
          title: '获取位置失败，使用默认位置',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 地图点击事件
  onMapTap(e: any) {
    const { latitude, longitude } = e.detail;
    console.log('点击位置:', latitude, longitude);
    
    this.setData({
      latitude,
      longitude,
      markers: [{
        id: 1,
        latitude,
        longitude,
        width: 30,
        height: 30
      }],
      address: `纬度: ${latitude.toFixed(6)}, 经度: ${longitude.toFixed(6)}`,
      name: '选中位置',
      selectedLocation: {
        latitude,
        longitude,
        address: `纬度: ${latitude.toFixed(6)}, 经度: ${longitude.toFixed(6)}`,
        name: '选中位置'
      }
    });

    wx.showToast({
      title: '位置已选中',
      icon: 'success',
      duration: 1000
    });
  },

  // 地图区域改变事件（拖动地图）
  onRegionChange(e: any) {
    if (e.type === 'end' && e.causedBy === 'drag') {
      // 获取地图中心点
      const mapContext = wx.createMapContext('map', this);
      mapContext.getCenterLocation({
        success: (res) => {
          console.log('地图中心:', res);
          this.setData({
            latitude: res.latitude,
            longitude: res.longitude,
            markers: [{
              id: 1,
              latitude: res.latitude,
              longitude: res.longitude,
              width: 30,
              height: 30
            }],
            address: `纬度: ${res.latitude.toFixed(6)}, 经度: ${res.longitude.toFixed(6)}`,
            name: '选中位置',
            selectedLocation: {
              latitude: res.latitude,
              longitude: res.longitude,
              address: `纬度: ${res.latitude.toFixed(6)}, 经度: ${res.longitude.toFixed(6)}`,
              name: '选中位置'
            }
          });
        }
      });
    }
  },

  // 使用微信自带的位置选择器（推荐）
  useWxChooseLocation() {
    wx.chooseLocation({
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      success: (res) => {
        console.log('选择的位置:', res);
        
        // 返回上一页并传递数据
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        
        if (prevPage) {
          // 如果上一页有处理位置选择的方法，调用它
          if (typeof prevPage.handleLocationSelected === 'function') {
            prevPage.handleLocationSelected(res);
          }
        }
        
        wx.navigateBack();
      },
      fail: (err) => {
        console.error('选择位置失败:', err);
        if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({
            title: '选择位置失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 确认选择
  confirmLocation() {
    if (!this.data.selectedLocation) {
      wx.showToast({
        title: '请先在地图上点击选择位置',
        icon: 'none'
      });
      return;
    }

    // 返回上一页并传递数据
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    if (prevPage) {
      // 如果上一页有处理位置选择的方法，调用它
      if (typeof prevPage.handleLocationSelected === 'function') {
        prevPage.handleLocationSelected(this.data.selectedLocation);
      }
    }
    
    wx.navigateBack();
  },

  // 重新定位到当前位置
  relocate() {
    this.getUserLocation();
    wx.showToast({
      title: '重新定位中...',
      icon: 'loading',
      duration: 1000
    });
  }
});
