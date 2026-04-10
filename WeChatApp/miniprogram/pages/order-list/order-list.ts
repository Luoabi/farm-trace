import { getOrderList } from '../../api/order';
import { Order } from '../../types/order';
import { getUserInfo } from '../../utils/auth';

Page({
  data: {
    currentTab: 'ALL',
    orderList: [] as Order[],
    page: 1,
    pageSize: 10,
    loading: false,
    noMore: false
  },

  onLoad() {
    this.loadOrders();
  },

  async loadOrders(refresh = false) {
    if (this.data.loading || this.data.noMore) return;

    if (refresh) {
      this.setData({
        page: 1,
        orderList: [],
        noMore: false
      });
    }

    this.setData({ loading: true });

    try {
      const userInfo = getUserInfo();
      const res = await getOrderList({
        page: this.data.page,
        pageSize: this.data.pageSize
      }, userInfo.id);

      let list = res.list;
      
      // 根据当前标签筛选
      if (this.data.currentTab !== 'ALL') {
        list = list.filter((order: Order) => order.status === this.data.currentTab);
      }

      const newList = refresh ? list : [...this.data.orderList, ...list];
      
      this.setData({
        orderList: newList,
        loading: false,
        noMore: list.length < this.data.pageSize,
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

  handleTabChange(e: any) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.loadOrders(true);
  },

  goToDetail(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${id}`
    });
  },

  onPullDownRefresh() {
    this.loadOrders(true);
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    this.loadOrders();
  }
});
