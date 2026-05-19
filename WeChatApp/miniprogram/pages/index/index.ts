import { getProductList } from '../../api/product';
import { Product } from '../../types/product';
import { isLoggedIn } from '../../utils/auth';

Page({
  data: {
    keyword: '',
    currentCategory: '',
    productList: [] as Product[],
    page: 1,
    pageSize: 10,
    loading: false,
    noMore: false
  },

  onLoad() {
    this.loadProducts();
  },

  onShow() {
    // 检查登录状态
    if (!isLoggedIn()) {
      console.log('未登录，跳转到登录页');
      wx.redirectTo({ url: '/pages/login/login' });
    }
  },

  checkLogin() {
    if (!isLoggedIn()) {
      console.log('未登录，跳转到登录页');
      wx.redirectTo({ url: '/pages/login/login' });
      return false;
    }
    return true;
  },

  async loadProducts(refresh = false) {
    // 如果正在加载，跳过（但 refresh 时允许）
    if (this.data.loading && !refresh) return;
    
    // 如果没有更多数据且不是刷新操作，跳过
    if (this.data.noMore && !refresh) return;

    if (refresh) {
      this.setData({
        page: 1,
        productList: [],
        noMore: false,
        loading: false  // 重置 loading 状态
      });
    }

    this.setData({ loading: true });

    try {
      // 构建请求参数 - 只有非空字符串才传递
      const params: any = {
        page: refresh ? 1 : this.data.page,
        pageSize: this.data.pageSize
      };
      
      // 只有当 category 不为空字符串时才添加
      if (this.data.currentCategory && this.data.currentCategory.trim() !== '') {
        params.category = this.data.currentCategory;
      }
      
      // 只有当 keyword 不为空字符串时才添加
      if (this.data.keyword && this.data.keyword.trim() !== '') {
        params.keyword = this.data.keyword;
      }
      
      console.log('发送请求参数:', params);
      
      const res = await getProductList(params);
      
      console.log('收到响应数据:', res);

      const newList = refresh ? res.list : [...this.data.productList, ...res.list];
      
      this.setData({
        productList: newList,
        loading: false,
        noMore: res.list.length < this.data.pageSize,
        page: refresh ? 2 : this.data.page + 1
      });
      
      console.log('更新后的商品列表数量:', newList.length);
    } catch (error: any) {
      this.setData({ loading: false });
      console.error('加载商品失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    }
  },

  onKeywordInput(e: any) {
    this.setData({ keyword: e.detail.value });
  },

  handleSearch() {
    console.log('搜索关键词:', this.data.keyword);
    
    if (!this.data.keyword.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    
    // 使用回调确保 setData 完成后再加载
    this.setData({
      currentCategory: '' // 搜索时清空分类
    }, () => {
      this.loadProducts(true);
    });
  },

  handleClearSearch() {
    console.log('清空搜索');
    this.setData({ 
      keyword: '',
      currentCategory: ''
    }, () => {
      this.loadProducts(true);
    });
  },

  handleCategoryChange(e: any) {
    const category = e.currentTarget.dataset.category;
    console.log('选择分类:', category);
    console.log('当前状态 - keyword:', this.data.keyword, 'currentCategory:', this.data.currentCategory);
    
    this.setData({ 
      currentCategory: category,
      keyword: '' // 切换分类时清空搜索
    }, () => {
      console.log('设置后的状态 - currentCategory:', this.data.currentCategory);
      this.loadProducts(true);
    });
  },

  loadMore() {
    this.loadProducts();
  },

  goToDetail(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    });
  },

  addToCart(e: any) {
    const id = e.currentTarget.dataset.id;
    
    // 从商品列表中找到对应的商品
    const item = this.data.productList.find(p => p.id === id);
    
    if (!item) {
      wx.showToast({
        title: '商品不存在',
        icon: 'none'
      });
      return;
    }
    
    // 获取购物车
    let cart = wx.getStorageSync('cart') || [];
    
    // 查找是否已存在
    const index = cart.findIndex((c: any) => c.productId === item.id);
    
    if (index > -1) {
      cart[index].quantity += 1;
    } else {
      cart.push({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: 1,
        unit: item.unit,
        imageUrl: item.imageUrl,
        stock: item.stock,
        selected: true
      });
    }
    
    wx.setStorageSync('cart', cart);
    
    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    });
  },

  handleScan() {
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
          // 直接跳转到溯源页面
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

  onPullDownRefresh() {
    this.loadProducts(true);
    wx.stopPullDownRefresh();
  }
});
