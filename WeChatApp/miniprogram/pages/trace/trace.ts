import { getTraceInfo, TraceInfo } from '../../api/trace';

Page({
  data: {
    batchNumber: '',
    traceInfo: null as TraceInfo | null,
    loading: false,
    showResult: false,
    activeTab: 'batch' as 'batch' | 'growth' | 'blockchain',
    // 加载状态
    verifying: false,
    verifyStep: 0,
    verifySteps: [
      { text: '正在查询批次信息...', icon: '📦' },
      { text: '正在获取生长记录...', icon: '🌱' },
      { text: '正在验证区块链数据...', icon: '🔗' },
      { text: '正在对比数据完整性...', icon: '🔍' },
      { text: '验证完成！', icon: '✅' }
    ]
  },

  onLoad(options: any) {
    // 如果从扫码进入，直接查询
    if (options.batchNumber) {
      this.setData({ batchNumber: options.batchNumber });
      this.queryTrace();
    }
  },

  // 扫码查询
  scanCode() {
    wx.scanCode({
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        console.log('扫码结果:', res);
        
        // 解析扫码结果
        let batchNumber = '';
        
        // 如果是完整URL，提取批次号
        if (res.result.includes('batchNumber=')) {
          const match = res.result.match(/batchNumber=([^&]+)/);
          if (match) {
            batchNumber = match[1];
          }
        } else {
          // 直接是批次号
          batchNumber = res.result;
        }
        
        if (batchNumber) {
          this.setData({ batchNumber });
          this.queryTrace();
        } else {
          wx.showToast({
            title: '无效的二维码',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('扫码失败:', err);
        if (err.errMsg !== 'scanCode:fail cancel') {
          wx.showToast({
            title: '扫码失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 手动输入批次号
  onBatchNumberInput(e: any) {
    this.setData({
      batchNumber: e.detail.value
    });
  },

  // 查询溯源信息
  async queryTrace() {
    const { batchNumber } = this.data;
    
    if (!batchNumber || !batchNumber.trim()) {
      wx.showToast({
        title: '请输入批次号',
        icon: 'none'
      });
      return;
    }

    // 开始验证流程
    this.setData({ 
      loading: true,
      verifying: true,
      verifyStep: 0
    });

    try {
      // 模拟验证步骤动画
      await this.simulateVerificationSteps();
      
      // 实际查询数据
      const traceInfo = await getTraceInfo(batchNumber.trim());
      
      console.log('溯源信息:', traceInfo);
      
      // 显示最后一步
      this.setData({ verifyStep: 4 });
      
      // 等待一下再显示结果
      await this.sleep(800);
      
      this.setData({
        traceInfo,
        showResult: true,
        loading: false,
        verifying: false,
        activeTab: 'batch'
      });
    } catch (error: any) {
      console.error('查询失败:', error);
      
      this.setData({ 
        loading: false,
        verifying: false
      });
      
      wx.showModal({
        title: '查询失败',
        content: error.message || '未找到该批次的溯源信息',
        showCancel: false
      });
    }
  },

  // 模拟验证步骤
  async simulateVerificationSteps() {
    // 步骤1: 查询批次信息
    this.setData({ verifyStep: 0 });
    await this.sleep(600);
    
    // 步骤2: 获取生长记录
    this.setData({ verifyStep: 1 });
    await this.sleep(600);
    
    // 步骤3: 验证区块链数据
    this.setData({ verifyStep: 2 });
    await this.sleep(800);
    
    // 步骤4: 对比数据完整性
    this.setData({ verifyStep: 3 });
    await this.sleep(700);
  },

  // 延迟函数
  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // 切换标签页
  switchTab(e: any) {
    const { tab } = e.currentTarget.dataset;
    this.setData({ activeTab: tab });
  },

  // 重新查询
  resetQuery() {
    this.setData({
      batchNumber: '',
      traceInfo: null,
      showResult: false,
      activeTab: 'batch'
    });
  },

  // 查看图片
  previewImage(e: any) {
    const { url } = e.currentTarget.dataset;
    
    if (!url) return;
    
    const urls = url.split(',').filter((u: string) => u.trim());
    
    wx.previewImage({
      urls: urls,
      current: urls[0]
    });
  },

  // 复制交易哈希
  copyTxHash(e: any) {
    const { hash } = e.currentTarget.dataset;
    
    wx.setClipboardData({
      data: hash,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        });
      }
    });
  }
});
