<template>
  <div class="image-upload">
    <el-upload
      v-model:file-list="fileList"
      :action="uploadUrl"
      :headers="uploadHeaders"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
      :limit="limit"
      :on-exceed="handleExceed"
      list-type="picture-card"
      :disabled="disabled"
    >
      <el-icon><Plus /></el-icon>
      <template #tip>
        <div class="el-upload__tip">
          {{ tip || `支持 jpg/png/gif 格式，单个文件不超过 ${maxSize}MB，最多上传 ${limit} 张` }}
        </div>
      </template>
    </el-upload>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="60%">
      <img :src="previewUrl" style="width: 100%;" alt="预览图片" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const props = defineProps({
  // v-model 绑定的图片URL数组
  modelValue: {
    type: Array,
    default: () => []
  },
  // 最大上传数量
  limit: {
    type: Number,
    default: 5
  },
  // 单个文件最大大小（MB）
  maxSize: {
    type: Number,
    default: 5
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 提示文本
  tip: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// 上传地址
const uploadUrl = ref(import.meta.env.VITE_API_BASE_URL + '/file/upload');

// 上传请求头
const uploadHeaders = ref({
  // 如果需要token，可以在这里添加
  // 'Authorization': 'Bearer ' + localStorage.getItem('token')
});

// 文件列表
const fileList = ref([]);

// 预览相关
const previewVisible = ref(false);
const previewUrl = ref('');

// 监听 modelValue 变化，初始化文件列表
watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.length > 0) {
    fileList.value = newVal.map((url, index) => ({
      name: `image-${index}`,
      url: url,
      uid: Date.now() + index
    }));
  } else {
    fileList.value = [];
  }
}, { immediate: true });

// 上传前验证
const beforeUpload = (file) => {
  // 验证文件类型
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }

  // 验证文件大小
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize;
  if (!isLtMaxSize) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB！`);
    return false;
  }

  return true;
};

// 上传成功
const handleSuccess = (response, file, fileList) => {
  if (response.code === 200) {
    ElMessage.success('上传成功');
    
    // 更新文件列表中的URL
    const index = fileList.findIndex(item => item.uid === file.uid);
    if (index !== -1) {
      fileList[index].url = response.data.url;
    }
    
    // 提取所有图片URL
    const urls = fileList.map(item => item.url).filter(url => url);
    emit('update:modelValue', urls);
    emit('change', urls);
  } else {
    ElMessage.error(response.message || '上传失败');
  }
};

// 上传失败
const handleError = (error) => {
  console.error('上传失败:', error);
  ElMessage.error('上传失败，请重试');
};

// 预览图片
const handlePreview = (file) => {
  previewUrl.value = file.url;
  previewVisible.value = true;
};

// 删除图片
const handleRemove = (file, fileList) => {
  const urls = fileList.map(item => item.url).filter(url => url);
  emit('update:modelValue', urls);
  emit('change', urls);
};

// 超出限制
const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${props.limit} 张图片`);
};
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.el-upload__tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}
</style>
