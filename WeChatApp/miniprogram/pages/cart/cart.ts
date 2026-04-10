import { CartItem } from '../../types/common';

Page({
  data: {
    cartList: [] as CartItem[],
    totalPrice: 0,
    allSelected: false
  },

  onShow() {
    this.loadCart();
  },

  loadCart() {
    const cart = wx.getStorageSync('cart') || [];
    const allSelected = cart.length > 0 && cart.every((item: CartItem) => item.selected);
    const totalPrice = this.calculateTotal(cart);
    
    this.setData({
      cartList: cart,
      allSelected,
      totalPrice
    });
  },

  calculateTotal(cart: CartItem[]) {
    return cart
      .filter((item: CartItem) => item.selected)
      .reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
  },

  handleSelectItem(e: any) {
    const index = e.currentTarget.dataset.index;
    const cart = this.data.cartList;
    cart[index].selected = !cart[index].selected;
    
    wx.setStorageSync('cart', cart);
    this.loadCart();
  },

  handleSelectAll() {
    const cart = this.data.cartList;
    const newSelected = !this.data.allSelected;
    
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
