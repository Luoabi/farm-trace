import { updateOrderStatus } from './order';

/**
 * 支付相关API（简化版 - 纯前端模拟）
 */

/**
 * 统一支付方法（纯前端模拟，真实体验）
 */
export async function pay(orderId: string): Promise<boolean> {
  try {
    console.log('开始支付流程:', orderId);
    
    // 显示支付确认对话框
    const confirmed = await showPaymentConfirm();
    if (!confirmed) {
      throw new Error('用户取消支付');
    }
    
    // 显示密码输入动画
    await showPasswordInputAnimation();
    
    // 显示支付处理动画
    await showPaymentProcessAnimation();
    
    // 调用后端更新订单状态
    await updateOrderStatus(orderId, '1');
    
    // 显示支付成功动画
    await showSuccessAnimation();
    
    return true;
    
  } catch (error: any) {
    console.error('支付失败:', error);
    throw error;
  }
}

/**
 * 显示支付确认对话框
 */
function showPaymentConfirm(): Promise<boolean> {
  return new Promise((resolve) => {
    wx.showModal({
      title: '确认支付',
      content: '请确认是否完成支付？\n\n（这是模拟支付环境）',
      confirmText: '确认支付',
      confirmColor: '#07c160',
      cancelText: '取消',
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      }
    });
  });
}

/**
 * 显示密码输入动画
 */
function showPasswordInputAnimation(): Promise<void> {
  return new Promise((resolve) => {
    wx.showLoading({
      title: '请输入支付密码',
      mask: true
    });
    
    // 模拟密码输入过程
    let dots = 0;
    const maxDots = 6;
    
    const timer = setInterval(() => {
      dots++;
      const passwordDots = '●'.repeat(dots) + '○'.repeat(maxDots - dots);
      wx.showLoading({
        title: `支付密码\n${passwordDots}`,
        mask: true
      });
      
      if (dots >= maxDots) {
        clearInterval(timer);
        wx.hideLoading();
        
        // 短暂延迟，模拟密码验证
        setTimeout(() => {
          resolve();
        }, 300);
      }
    }, 200);
  });
}

/**
 * 显示支付处理动画
 */
function showPaymentProcessAnimation(): Promise<void> {
  return new Promise((resolve) => {
    const steps = [
      { text: '正在连接支付系统...', duration: 600 },
      { text: '正在验证支付密码...', duration: 500 },
      { text: '正在验证订单信息...', duration: 500 },
      { text: '正在处理支付请求...', duration: 700 },
      { text: '正在确认交易...', duration: 600 },
      { text: '支付处理中...', duration: 400 }
    ];
    
    let currentStep = 0;
    
    function showNextStep() {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        wx.showLoading({
          title: step.text,
          mask: true
        });
        
        setTimeout(() => {
          currentStep++;
          showNextStep();
        }, step.duration);
      } else {
        wx.hideLoading();
        resolve();
      }
    }
    
    showNextStep();
  });
}

/**
 * 显示支付成功动画
 */
function showSuccessAnimation(): Promise<void> {
  return new Promise((resolve) => {
    // 显示成功提示
    wx.showToast({
      title: '支付成功',
      icon: 'success',
      duration: 2000,
      mask: true
    });
    
    // 震动反馈
    wx.vibrateShort({
      type: 'medium'
    });
    
    // 等待提示显示完成
    setTimeout(() => {
      resolve();
    }, 2000);
  });
}
