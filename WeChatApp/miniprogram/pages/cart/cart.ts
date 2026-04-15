import { CartItem } from '../../types/common';

Page({
  data: {
    cartList: [] as CartItem[],
    totalPrice: 0,
    allSelected: false
  },

  onShow() {
    console.log('购物车页面显示');
    this.loadCart();
  },

  loadCart() {
    const cart = wx.getStorageSync('cart') || [];
    console.log('加载购物车数据:', cart);
    
    const allSelected = cart.length > 0 && cart.every((item: CartItem) => item.selected);
    const totalPrice = this.calculateTotal(cart);
    
    console.log('全选状态:', allSelected, '总价:', totalPrice);
    
    this.setData({
      cartList: cart,
      allSelected,
      totalPrice
    });
  },

  calculateTotal(cart: CartItem[]) {
    if (!cart || cart.length === 0) {
      return 0;
    }
    
    const total = cart
      .filter((item: CartItem) => item.selected)
      .reduce((sum: number, item: CartItem) => {
        const itemTotal = (item.price || 0) * (item.quantity || 0);
        console.log(`商品: ${item.productName}, 选中: ${item.selected}, 单价: ${item.price}, 数量: ${item.quantity}, 小计: ${itemTotal}`);
        return sum + itemTotal;
      }, 0);
    
    console.log('计算总价:', total);
    return total;
  },

  handleSelectItem(e: any) {
    const index = e.currentTarget.dataset.index;
    console.log('点击单选，索引:', index);
    
    const cart = this.data.cartList;
    cart[index].selected = !cart[index].selected;
    
    console.log('更新后的选中状态:', cart[index].selected);
    
    wx.setStorageSync('cart', cart);
    this.loadCart();
  },

  handleSelectAll() {
    console.log('点击全选，当前全选状态:', this.data.allSelected);
    
    const cart = this.data.cartList;
    const newSelected = !this.data.allSelected;
    
    console.log('新的全选状态:', newSelected);
    
    cart.forEach((item: CartItem) => {
      item.selected = newSelected;
    });
    
    wx.setStorageSync('cart', cart);
    this.loadCart();
  },

  handleQuantityChange(e: any) {
    const { index, type } = e.currentTarget.dataset;
    const cart = this.data.cartList;
    
    if (type === 'minus') {
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
      }
    } else {
      if (cart[index].quantity < cart[index].stock) {
        cart[index].quantity += 1;
      } else {
        wx.showToast({
          title: '库存不足',
          icon: 'none'
        });
        return;
      }
    }
    
    wx.setStorageSync('cart', cart);
    this.loadCart();
  },

  handleDelete(e: any) {
    const index = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '提示',
      content: '确定要删除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          const cart = this.data.cartList;
          cart.splice(index, 1);
          wx.setStorageSync('cart', cart);
          this.loadCart();
        }
      }
    });
  },

  handleCheckout() {
    const selectedItems = this.data.cartList.filter((item: CartItem) => item.selected);
    
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/order-confirm/order-confirm?items=${encodeURIComponent(JSON.stringify(selectedItems))}`
    });
  },

  goToIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});
