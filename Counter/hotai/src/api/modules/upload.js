import request from '../request';

/**
 * 文件上传 API
 */
export const uploadAPI = {
  /**
   * 上传单个图片
   * @param {File} file - 图片文件
   * @returns {Promise}
   */
  uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return request({
      url: '/upload/image',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * 批量上传图片
   * @param {File[]} files - 图片文件数组
   * @returns {Promise}
   */
  uploadImages(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return request({
      url: '/upload/images',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * 删除文件
   * @param {string} url - 文件URL
   * @returns {Promise}
   */
  deleteFile(url) {
    return request({
      url: '/upload/file',
      method: 'DELETE',
      params: { url }
    });
  }
};
