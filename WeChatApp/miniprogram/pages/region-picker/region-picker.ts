// 中国省市区数据
const regionData = {
  provinces: [
    { code: '510000', name: '四川省' },
    { code: '110000', name: '北京市' },
    { code: '310000', name: '上海市' },
    { code: '500000', name: '重庆市' },
    { code: '440000', name: '广东省' },
    { code: '330000', name: '浙江省' },
    { code: '320000', name: '江苏省' },
    { code: '370000', name: '山东省' }
  ],
  cities: {
    '510000': [
      { code: '510100', name: '成都市' },
      { code: '513400', name: '凉山彝族自治州' },
      { code: '510400', name: '攀枝花市' },
      { code: '510600', name: '德阳市' },
      { code: '510700', name: '绵阳市' },
      { code: '510800', name: '广元市' },
      { code: '510900', name: '遂宁市' },
      { code: '511000', name: '内江市' },
      { code: '511100', name: '乐山市' },
      { code: '511300', name: '南充市' },
      { code: '511400', name: '眉山市' },
      { code: '511500', name: '宜宾市' },
      { code: '511600', name: '广安市' },
      { code: '511700', name: '达州市' },
      { code: '511800', name: '雅安市' },
      { code: '511900', name: '巴中市' },
      { code: '512000', name: '资阳市' }
    ],
    '110000': [{ code: '110100', name: '北京市' }],
    '310000': [{ code: '310100', name: '上海市' }],
    '500000': [{ code: '500100', name: '重庆市' }],
    '440000': [
      { code: '440100', name: '广州市' },
      { code: '440300', name: '深圳市' },
      { code: '440400', name: '珠海市' },
      { code: '440500', name: '汕头市' },
      { code: '440600', name: '佛山市' },
      { code: '440700', name: '江门市' },
      { code: '441200', name: '肇庆市' },
      { code: '441300', name: '惠州市' },
      { code: '441400', name: '梅州市' },
      { code: '441500', name: '汕尾市' },
      { code: '441600', name: '河源市' },
      { code: '441700', name: '阳江市' },
      { code: '441800', name: '清远市' },
      { code: '441900', name: '东莞市' },
      { code: '442000', name: '中山市' }
    ]
  },
  districts: {
    '513400': [
      { code: '513401', name: '西昌市' },
      { code: '513422', name: '木里藏族自治县' },
      { code: '513423', name: '盐源县' },
      { code: '513424', name: '德昌县' },
      { code: '513425', name: '会理县' },
      { code: '513426', name: '会东县' },
      { code: '513427', name: '宁南县' },
      { code: '513428', name: '普格县' },
      { code: '513429', name: '布拖县' },
      { code: '513430', name: '金阳县' },
      { code: '513431', name: '昭觉县' },
      { code: '513432', name: '喜德县' },
      { code: '513433', name: '冕宁县' },
      { code: '513434', name: '越西县' },
      { code: '513435', name: '甘洛县' },
      { code: '513436', name: '美姑县' },
      { code: '513437', name: '雷波县' }
    ],
    '510100': [
      { code: '510104', name: '锦江区' },
      { code: '510105', name: '青羊区' },
      { code: '510106', name: '金牛区' },
      { code: '510107', name: '武侯区' },
      { code: '510108', name: '成华区' },
      { code: '510112', name: '龙泉驿区' },
      { code: '510113', name: '青白江区' },
      { code: '510114', name: '新都区' },
      { code: '510115', name: '温江区' },
      { code: '510116', name: '双流区' },
      { code: '510117', name: '郫都区' },
      { code: '510121', name: '金堂县' },
      { code: '510129', name: '大邑县' },
      { code: '510131', name: '蒲江县' },
      { code: '510132', name: '新津县' },
      { code: '510181', name: '都江堰市' },
      { code: '510182', name: '彭州市' },
      { code: '510183', name: '邛崃市' },
      { code: '510184', name: '崇州市' },
      { code: '510185', name: '简阳市' }
    ],
    '110100': [
      { code: '110101', name: '东城区' },
      { code: '110102', name: '西城区' },
      { code: '110105', name: '朝阳区' },
      { code: '110106', name: '丰台区' },
      { code: '110107', name: '石景山区' },
      { code: '110108', name: '海淀区' },
      { code: '110109', name: '门头沟区' },
      { code: '110111', name: '房山区' },
      { code: '110112', name: '通州区' },
      { code: '110113', name: '顺义区' },
      { code: '110114', name: '昌平区' },
      { code: '110115', name: '大兴区' },
      { code: '110116', name: '怀柔区' },
      { code: '110117', name: '平谷区' },
      { code: '110118', name: '密云区' },
      { code: '110119', name: '延庆区' }
    ]
  }
};

Page({
  data: {
    currentTab: 0, // 0-省, 1-市, 2-区
    provinces: regionData.provinces,
    cities: [] as any[],
    districts: [] as any[],
    
    selectedProvince: null as any,
    selectedCity: null as any,
    selectedDistrict: null as any,
    
    provinceIndex: -1,
    cityIndex: -1,
    districtIndex: -1
  },

  onLoad(options: any) {
    // 如果有传入默认值，设置选中状态
    if (options.province) {
      const province = regionData.provinces.find(p => p.name === options.province);
      if (province) {
        this.selectProvince(province, regionData.provinces.indexOf(province));
        
        if (options.city) {
          const cities = regionData.cities[province.code] || [];
          const city = cities.find(c => c.name === options.city);
          if (city) {
            this.selectCity(city, cities.indexOf(city));
            
            if (options.district) {
              const districts = regionData.districts[city.code] || [];
              const district = districts.find(d => d.name === options.district);
              if (district) {
                this.selectDistrict(district, districts.indexOf(district));
              }
            }
          }
        }
      }
    }
  },

  // 切换标签页
  switchTab(e: any) {
    const tab = e.currentTarget.dataset.tab;
    
    // 如果点击市，但没有选择省，不允许切换
    if (tab === 1 && !this.data.selectedProvince) {
      wx.showToast({
        title: '请先选择省份',
        icon: 'none'
      });
      return;
    }
    
    // 如果点击区，但没有选择市，不允许切换
    if (tab === 2 && !this.data.selectedCity) {
      wx.showToast({
        title: '请先选择城市',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ currentTab: tab });
  },

  // 选择省份
  handleProvinceSelect(e: any) {
    const index = e.currentTarget.dataset.index;
    const province = this.data.provinces[index];
    this.selectProvince(province, index);
  },

  selectProvince(province: any, index: number) {
    const cities = regionData.cities[province.code] || [];
    
    this.setData({
      selectedProvince: province,
      provinceIndex: index,
      cities: cities,
      districts: [],
      selectedCity: null,
      selectedDistrict: null,
      cityIndex: -1,
      districtIndex: -1,
      currentTab: 1 // 自动切换到市
    });
  },

  // 选择城市
  handleCitySelect(e: any) {
    const index = e.currentTarget.dataset.index;
    const city = this.data.cities[index];
    this.selectCity(city, index);
  },

  selectCity(city: any, index: number) {
    const districts = regionData.districts[city.code] || [];
    
    this.setData({
      selectedCity: city,
      cityIndex: index,
      districts: districts,
      selectedDistrict: null,
      districtIndex: -1
    });
    
    // 如果有区县数据，切换到区县选择
    if (districts.length > 0) {
      this.setData({ currentTab: 2 });
    } else {
      // 如果没有区县数据，直接完成选择
      this.confirmSelection();
    }
  },

  // 选择区县
  handleDistrictSelect(e: any) {
    const index = e.currentTarget.dataset.index;
    const district = this.data.districts[index];
    this.selectDistrict(district, index);
  },

  selectDistrict(district: any, index: number) {
    this.setData({
      selectedDistrict: district,
      districtIndex: index
    });
    
    // 自动完成选择
    setTimeout(() => {
      this.confirmSelection();
    }, 300);
  },

  // 确认选择
  confirmSelection() {
    if (!this.data.selectedProvince) {
      wx.showToast({
        title: '请选择省份',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.selectedCity) {
      wx.showToast({
        title: '请选择城市',
        icon: 'none'
      });
      return;
    }
    
    // 返回上一页并传递数据
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    if (prevPage) {
      const regionData = {
        province: this.data.selectedProvince.name,
        city: this.data.selectedCity.name,
        district: this.data.selectedDistrict ? this.data.selectedDistrict.name : ''
      };
      
      // 如果上一页有处理地区选择的方法，调用它
      if (typeof prevPage.handleRegionSelected === 'function') {
        prevPage.handleRegionSelected(regionData);
      }
    }
    
    wx.navigateBack();
  },

  // 取消选择
  handleCancel() {
    wx.navigateBack();
  }
});
