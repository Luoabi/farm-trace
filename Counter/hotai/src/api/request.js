import axios from 'axios';
import store from '../store';
import router from '../router';
import { ElMessage } from 'element-plus';

// 创建axios实例
const service = axios.create({
  baseURL: '/api', // API基础URL - 使用相对路径，由Vite代理处理跨域
  timeout: 10000 // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从store获取token
    const token = store.state.token || localStorage.getItem('token');
    if (token) {
      // 设置请求头
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    
    // 如果返回的状态码不是200，则认为是错误
    if (res.code && res.code !== 200) {
      ElMessage.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    
    return res;
  },
  error => {
    console.error('响应错误:', error);
    
    // 处理响应错误
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转登录
          ElMessage.error('登录已过期，请重新登录');
          store.dispatch('user/logout');
          router.push({
            path: '/login',
            query: { redirect: router.currentRoute.value.fullPath }
          });
          break;
        case 403:
          ElMessage.error('没有权限访问');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error(data.message || '服务器内部错误');
          break;
        default:
          ElMessage.error(data.message || '请求失败');
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请稍后重试');
    } else if (error.message === 'Network Error') {
      ElMessage.error('网络连接失败，请检查网络');
    } else {
      ElMessage.error(error.message || '请求失败');
    }
    
    return Promise.reject(error);
  }
);

export default service;