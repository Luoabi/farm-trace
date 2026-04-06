// 产品模块
import { productAPI, mockProductData } from '../../api/modules/product';
import { USE_MOCK } from '../index';

const state = {
  // 产品列表
  list: [],
  // 产品详情
  detail: {},
  // 总数
  total: 0,
  // 加载状态
  loading: false
};

const getters = {
  // 获取产品列表
  productList: state => state.list,
  // 获取产品详情
  productDetail: state => state.detail,
  // 获取产品总数
  productTotal: state => state.total,
  // 获取加载状态
  isProductLoading: state => state.loading
};

const mutations = {
  // 设置产品列表
  SET_PRODUCT_LIST(state, { list, total }) {
    state.list = list;
    state.total = total;
  },
  // 设置产品详情
  SET_PRODUCT_DETAIL(state, productDetail) {
    state.detail = productDetail;
  },
  // 添加产品
  ADD_PRODUCT(state, newProduct) {
    state.list.push(newProduct);
    state.total += 1;
  },
  // 更新产品
  UPDATE_PRODUCT(state, updatedProduct) {
    const index = state.list.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      state.list[index] = updatedProduct;
    }
    if (state.detail.id === updatedProduct.id) {
      state.detail = updatedProduct;
    }
  },
  // 删除产品
  DELETE_PRODUCT(state, productId) {
    state.list = state.list.filter(p => p.id !== productId);
    state.total -= 1;
    if (state.detail.id === productId) {
      state.detail = {};
    }
  },
  // 设置加载状态
  SET_PRODUCT_LOADING(state, loading) {
    state.loading = loading;
  }
};

const actions = {
  // 获取产品列表
  async getProductList({ commit }, params) {
    try {
      commit('SET_PRODUCT_LOADING', true);
      
      let productList = [];
      let total = 0;
      
      if (USE_MOCK) {
        // 使用模拟数据
        productList = mockProductData.list;
        total = productList.length;
      } else {
        // 使用真实API
        const response = await productAPI.getProductList(params);
        productList = response.data.list;
        total = response.data.total;
      }
      
      commit('SET_PRODUCT_LIST', { list: productList, total });
      return { success: true, data: productList, total };
    } catch (error) {
      throw new Error(error.message || '获取产品列表失败');
    } finally {
      commit('SET_PRODUCT_LOADING', false);
    }
  },
  
  // 获取产品详情
  async getProductDetail({ commit }, id) {
    try {
      commit('SET_PRODUCT_LOADING', true);
      
      let productDetail = {};
      
      if (USE_MOCK) {
        // 使用模拟数据
        productDetail = mockProductData.detail;
      } else {
        // 使用真实API
        const response = await productAPI.getProductDetail(id);
        productDetail = response.data;
      }
      
      commit('SET_PRODUCT_DETAIL', productDetail);
      return { success: true, data: productDetail };
    } catch (error) {
      throw new Error(error.message || '获取产品详情失败');
    } finally {
      commit('SET_PRODUCT_LOADING', false);
    }
  },
  
  // 创建产品
  async createProduct({ commit }, productData) {
    try {
      commit('SET_PRODUCT_LOADING', true);
      
      let newProduct = {};
      
      if (USE_MOCK) {
        // 使用模拟数据
        newProduct = {
          ...productData,
          id: 'product' + Date.now(),
          createTime: new Date().toLocaleString('zh-CN')
        };
        
        mockProductData.list.push(newProduct);
      } else {
        // 使用真实API
        const response = await productAPI.createProduct(productData);
        newProduct = response.data;
      }
      
      commit('ADD_PRODUCT', newProduct);
      return { success: true, data: newProduct };
    } catch (error) {
      throw new Error(error.message || '创建产品失败');
    } finally {
      commit('SET_PRODUCT_LOADING', false);
    }
  },
  
  // 更新产品
  async updateProduct({ commit }, { id, data }) {
    try {
      commit('SET_PRODUCT_LOADING', true);
      
      let updatedProduct = {};
      
      if (USE_MOCK) {
        // 使用模拟数据
        const index = mockProductData.list.findIndex(p => p.id === id);
        if (index !== -1) {
          updatedProduct = { ...mockProductData.list[index], ...data };
          mockProductData.list[index] = updatedProduct;
        }
      } else {
        // 使用真实API
        const response = await productAPI.updateProduct(id, data);
        updatedProduct = response.data;
      }
      
      commit('UPDATE_PRODUCT', updatedProduct);
      return { success: true, data: updatedProduct };
    } catch (error) {
      throw new Error(error.message || '更新产品失败');
    } finally {
      commit('SET_PRODUCT_LOADING', false);
    }
  },
  
  // 删除产品
  async deleteProduct({ commit }, id) {
    try {
      commit('SET_PRODUCT_LOADING', true);
      
      if (USE_MOCK) {
        // 使用模拟数据
        mockProductData.list = mockProductData.list.filter(p => p.id !== id);
      } else {
        // 使用真实API
        await productAPI.deleteProduct(id);
      }
      
      commit('DELETE_PRODUCT', id);
      return { success: true };
    } catch (error) {
      throw new Error(error.message || '删除产品失败');
    } finally {
      commit('SET_PRODUCT_LOADING', false);
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
