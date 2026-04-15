<template>
  <div class="qrcode-generator">
    <el-card class="header-card">
      <h2>批次溯源二维码生成</h2>
      <p class="subtitle">为批次生成溯源二维码，用户扫码即可查看产品溯源信息</p>
    </el-card>

    <el-card class="generator-card">
      <el-form :model="form" label-width="120px">
        <el-form-item label="批次号">
          <el-input 
            v-model="form.batchNumber" 
            placeholder="请输入批次号，如：BATCH-20240415-001"
            clearable
          >
            <template #append>
              <el-button @click="generateQRCode" type="primary" :loading="loading">
                生成二维码
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="二维码尺寸">
          <el-radio-group v-model="form.size">
            <el-radio :label="200">小 (200x200)</el-radio>
            <el-radio :label="300">中 (300x300)</el-radio>
            <el-radio :label="400">大 (400x400)</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <el-divider />

      <div v-if="qrCodeData" class="qrcode-result">
        <div class="qrcode-preview">
          <h3>二维码预览</h3>
          <div class="qrcode-image-container">
            <img :src="qrCodeData" alt="二维码" class="qrcode-image" />
          </div>
          <div class="qrcode-info">
            <p><strong>批次号：</strong>{{ form.batchNumber }}</p>
            <p><strong>扫码说明：</strong>使用微信扫一扫，即可查看产品溯源信息</p>
          </div>
        </div>

        <div class="qrcode-actions">
          <el-button type="primary" @click="downloadQRCode" icon="Download">
            下载二维码
          </el-button>
          <el-button @click="printQRCode" icon="Printer">
            打印二维码
          </el-button>
          <el-button @click="copyQRCode" icon="CopyDocument">
            复制图片
          </el-button>
        </div>
      </div>

      <el-empty v-else description="请输入批次号并生成二维码" />
    </el-card>

    <el-card class="batch-list-card">
      <h3>最近生成的二维码</h3>
      <el-table :data="recentQRCodes" style="width: 100%">
        <el-table-column prop="batchNumber" label="批次号" width="200" />
        <el-table-column prop="productName" label="产品名称" />
        <el-table-column prop="generateTime" label="生成时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              @click="regenerateQRCode(row.batchNumber)"
            >
              重新生成
            </el-button>
            <el-button 
              type="success" 
              size="small" 
              @click="viewTrace(row.batchNumber)"
            >
              查看溯源
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const loading = ref(false);
const qrCodeData = ref('');

const form = reactive({
  batchNumber: '',
  size: 300
});

const recentQRCodes = ref([
  {
    batchNumber: 'BATCH-20240415-001',
    productName: '有机苹果',
    generateTime: '2024-04-15 10:30:00'
  },
  {
    batchNumber: 'BATCH-20240415-002',
    productName: '绿色蔬菜',
    generateTime: '2024-04-15 11:20:00'
  }
]);

// 生成二维码
const generateQRCode = async () => {
  if (!form.batchNumber) {
    ElMessage.warning('请输入批次号');
    return;
  }

  loading.value = true;

  try {
    const response = await axios.get(
      `http://localhost:8080/api/trace/qrcode/${form.batchNumber}`
    );

    qrCodeData.value = response.data.qrCode;
    
    ElMessage.success('二维码生成成功');

    // 添加到最近生成列表
    recentQRCodes.value.unshift({
      batchNumber: form.batchNumber,
      productName: '产品名称', // 实际应该从接口获取
      generateTime: new Date().toLocaleString('zh-CN')
    });

  } catch (error: any) {
    console.error('生成二维码失败:', error);
    ElMessage.error(error.response?.data?.message || '生成二维码失败');
  } finally {
    loading.value = false;
  }
};

// 下载二维码
const downloadQRCode = () => {
  if (!qrCodeData.value) return;

  const link = document.createElement('a');
  link.href = qrCodeData.value;
  link.download = `qrcode-${form.batchNumber}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  ElMessage.success('二维码已下载');
};

// 打印二维码
const printQRCode = () => {
  if (!qrCodeData.value) return;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>打印二维码 - ${form.batchNumber}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            h2 {
              margin-bottom: 10px;
            }
            .info {
              margin-bottom: 20px;
              text-align: center;
            }
            img {
              max-width: 400px;
              border: 2px solid #333;
              padding: 10px;
            }
            .footer {
              margin-top: 20px;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h2>农产品溯源二维码</h2>
          <div class="info">
            <p><strong>批次号：</strong>${form.batchNumber}</p>
            <p>扫码查看产品溯源信息</p>
          </div>
          <img src="${qrCodeData.value}" alt="二维码" />
          <div class="footer">
            <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};

// 复制二维码
const copyQRCode = async () => {
  if (!qrCodeData.value) return;

  try {
    // 将Base64转换为Blob
    const base64Data = qrCodeData.value.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    // 复制到剪贴板
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);

    ElMessage.success('二维码已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
    ElMessage.error('复制失败，请手动下载');
  }
};

// 重新生成二维码
const regenerateQRCode = (batchNumber: string) => {
  form.batchNumber = batchNumber;
  generateQRCode();
};

// 查看溯源信息
const viewTrace = (batchNumber: string) => {
  // 在新窗口打开溯源页面
  const url = `http://localhost:8080/api/trace/batch/${batchNumber}`;
  window.open(url, '_blank');
};
</script>

<style scoped>
.qrcode-generator {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
}

.header-card h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.subtitle {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.generator-card {
  margin-bottom: 20px;
}

.qrcode-result {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-preview {
  text-align: center;
  margin-bottom: 30px;
}

.qrcode-preview h3 {
  margin-bottom: 20px;
  color: #333;
}

.qrcode-image-container {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.qrcode-image {
  max-width: 400px;
  border: 2px solid #ddd;
  border-radius: 4px;
  background: white;
  padding: 10px;
}

.qrcode-info {
  text-align: left;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.qrcode-info p {
  margin: 8px 0;
  color: #666;
}

.qrcode-actions {
  display: flex;
  gap: 10px;
}

.batch-list-card {
  margin-top: 20px;
}

.batch-list-card h3 {
  margin-bottom: 20px;
  color: #333;
}
</style>
