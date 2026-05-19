/**
 * 网络请求封装
 */

import { API_BASE_URL, REQUEST_TIMEOUT, TOKEN_KEY } from './config';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  params?: any;
  header?: any;
  showLoading?: boolean;
  loadingText?: string;
}

interface ResponseData<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 发起网络请求
 */
export function request<T = any>(options: RequestOptions): Promise<T> {
  const {
    url,
    method = 'GET',
    data,
    params,
    header = {},
    showLoading = false,
    loadingText = '加载中...'
  } = options;

  // 显示加载提示
  if (showLoading) {
    wx.showLoading({ title: loadingText, mask: true });
  }

  // 获取 token
  const token = wx.getStorageSync(TOKEN_KEY);

  // 构建完整 URL
  let fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  // 添加查询参数
  if (params) {
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...header
      },
      timeout: REQUEST_TIMEOUT,
      success: (res) => {
        if (showLoading) {
          wx.hideLoading();
        }

        console.log('请求响应:', res);

        // 请求成功
        if (res.statusCode === 200) {
          const responseData = res.data as any;
          
          // 处理不同的响应格式
          // 格式1: { code: 200, message: 'success', data: {...} }
          if (responseData.code !== undefined) {
            // 支持字符串和数字类型的 code
            const code = String(responseData.code);
            
            if (code === '200' || code === '0' || code === 200 || code === 0) {
              resolve(responseData.data || responseData);
            } else {
              // 业务错误
              const errorMsg = responseData.message || responseData.msg || '请求失败';
              wx.showToast({
                title: errorMsg,
                icon: 'none',
                duration: 2000
              });
              reject(new Error(errorMsg));
            }
          } 
          // 格式2: 直接返回数据对象（登录注册接口）
          else if (responseData.token || responseData.user) {
            resolve(responseData);
          }
          // 格式3: 直接返回数据
          else {
            resolve(responseData);
          }
        } else if (res.statusCode === 401) {
          // 未授权，跳转到登录页
          wx.showToast({
            title: '请先登录',
            icon: 'none',
            duration: 2000
          });
          setTimeout(() => {
            wx.redirectTo({ url: '/pages/login/login' });
          }, 2000);
          reject(new Error('未授权'));
        } else {
          // HTTP 错误
          const errorMsg = `请求失败(${res.statusCode})`;
          wx.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000
          });
          reject(new Error(errorMsg));
        }
      },
      fail: (err) => {
        if (showLoading) {
          wx.hideLoading();
        }

        console.error('请求失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
        reject(err);
      }
    });
  });
}

/**
 * GET 请求
 */
export function get<T = any>(url: string, params?: any, options?: Partial<RequestOptions>): Promise<T> {
  return request<T>({
    url,
    method: 'GET',
    params,
    ...options
  });
}

/**
 * POST 请求
 */
export function post<T = any>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<T> {
  return request<T>({
    url,
    method: 'POST',
    data,
    ...options
  });
}

/**
 * PUT 请求
 */
export function put<T = any>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<T> {
  return request<T>({
    url,
    method: 'PUT',
    data,
    ...options
  });
}

/**
 * DELETE 请求
 */
export function del<T = any>(url: string, params?: any, options?: Partial<RequestOptions>): Promise<T> {
  return request<T>({
    url,
    method: 'DELETE',
    params,
    ...options
  });
}

/**
 * 上传文件
 */
export function uploadFile(filePath: string, name: string = 'file'): Promise<string> {
  const token = wx.getStorageSync(TOKEN_KEY);

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${API_BASE_URL}/upload`,
      filePath,
      name,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            resolve(data.data);
          } else {
            wx.showToast({
              title: data.message || '上传失败',
              icon: 'none'
            });
            reject(data);
          }
        } else {
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          });
          reject(res);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}
