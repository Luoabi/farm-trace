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
    if (this.data.loading || this.data.noMore) return;

    if (refresh) {
      this.setData({
        page: 1,
        productList: [],
        noMore: false
      });
    }

    this.setData({ loading: true });

    try {
      const res = await getProductList({
        page: this.data.page,
        pageSize: this.data.pageSize,
        category: this.data.currentCategory || undefined,
        keyword: this.data.keyword || undefined
      });

      const newList = refresh ? res.list : [...this.data.productList, ...res.list];
      
      this.setData({
        productList: newList,
        loading: false,
        noMore: res.list.length < this.data.pageSize,
        page: this.data.page + 1
      });
    } catch (error: any) {
      this.setData({ loading: false });
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
    this.loadProducts(true);
  },

  handleCategoryChange(e: any) {
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category });
    this.loadProducts(true);
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
        // 扫码成功，跳转到溯源页面
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

  onPullDownRefresh() {
    this.loadProducts(true);
    wx.stopPullDownRefresh();
  }
});
