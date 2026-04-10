import { getProductDetail } from '../../api/product';
import { Product } from '../../types/product';

Page({
  data: {
    product: null as Product | null,
    quantity: 1,
    loading: true
  },

  onLoad(options: any) {
    const { id } = options;
    if (id) {
      this.loadProductDetail(id);
    }
  },

  async loadProductDetail(id: string) {
    console.log('开始加载商品详情，ID:', id);
    
    try {
      wx.showLoading({ title: '加载中...' });
      
      const product = await getProductDetail(id);
      
      console.log('商品详情加载成功:', product);
      
      this.setData({
        product,
        loading: false
      });
      
      wx.hideLoading();
    } catch (error: any) {
      console.error('商品详情加载失败:', error);
      
      wx.hideLoading();
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none',
        duration: 2000
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }
  },

  handleQuantityChange(e: any) {
    const { type } = e.currentTarget.dataset;
    let quantity = this.data.quantity;
    
    if (type === 'minus' && quantity > 1) {
      quantity -= 1;
    } else if (type === 'plus' && quantity < (this.data.product?.stock || 999)) {
      quantity += 1;
    }
    
    this.setData({ quantity });
  },

  addToCart() {
    const { product, quantity } = this.data;
    
    if (!product) return;
    
    // 获取购物车
    let cart = wx.getStorageSync('cart') || [];
    
    // 查找是否已存在
    const index = cart.findIndex((c: any) => c.productId === product.id);
    
    if (index > -1) {
      cart[index].quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: quantity,
        unit: product.unit,
        imageUrl: product.imageUrl,
        stock: product.stock,
        selected: true
      });
    }
    
    wx.setStorageSync('cart', cart);
    
    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    });
  },

  buyNow() {
    const { product, quantity } = this.data;
    
    if (!product) return;
    
    const items = [{
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: quantity,
      unit: product.unit,
      imageUrl: product.imageUrl,
      stock: product.stock,
      selected: true
    }];
    
    wx.navigateTo({
      url: `/pages/order-confirm/order-confirm?items=${encodeURIComponent(JSON.stringify(items))}`
    });
  }
});
