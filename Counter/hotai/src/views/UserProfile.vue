<template>
  <div class="user-profile">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">个人中心</h1>
    </div>

    <el-card class="profile-card" shadow="hover">
      <!-- 用户基本信息 -->
      <div class="profile-header">
 
        <el-avatar :size="100" :src="currentUser.avatar || 'https://via.placeholder.com/100x100?text=User'">
          {{ currentUser.username ? currentUser.username.substring(0, 1) : 'U' }}
        </el-avatar>
        <div class="user-info">
          <h2>{{ currentUser.username }}</h2>
          <div class="info-row">
            <el-tag :type="getRoleTag(currentUser.role)">{{ currentUser.role }}</el-tag>
            <el-tag :type="currentUser.status === '启用' ? 'success' : 'danger'" style="margin-left: 10px;">
              {{ currentUser.status }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 用户详细信息 -->
      <el-descriptions :column="2" border style="margin-top: 30px;">
        <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ currentUser.realName || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentUser.email || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="所属组织">{{ currentUser.organization || '无' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentUser.registerTime || '未知' }}</el-descriptions-item>
        <el-descriptions-item label="最后登录时间">{{ currentUser.lastLoginTime || '从未登录' }}</el-descriptions-item>
        <el-descriptions-item label="最后登录IP">{{ currentUser.lastLoginIp || '未知' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 农户信息（仅当用户是农户时显示） -->
    <el-card v-if="isFarmer && currentUser.farmInfo" class="farm-info-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>农户信息</span>
        </div>
      </template>
      
      <el-descriptions :column="1" border>
 
        <el-descriptions-item label="农场名称">{{ currentUser.farmInfo.farmName || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="农场地点">{{ currentUser.farmInfo.location || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="农场规模">{{ currentUser.farmInfo.scale || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="主要作物">{{ currentUser.farmInfo.mainCrops || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ currentUser.farmInfo.contact || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="农场简介">{{ currentUser.farmInfo.description || '未设置' }}</el-descriptions-item>
      </el-descriptions>
      
      <div class="action-buttons" style="margin-top: 20px; text-align: right;">
        <el-button type="primary" @click="handleEditFarmInfo">编辑农场信息</el-button>
      </div>
    </el-card>

    <!-- 编辑农场信息对话框 -->
    <el-dialog
      v-model="farmInfoVisible"
      title="编辑农场信息"
      width="50%"
      :before-close="handleCloseFarmInfo"
    >
      <el-form
        ref="farmInfoFormRef"
        :model="farmInfoForm"
        :rules="farmInfoRules"
        class="farm-info-form"
      >
        <el-form-item prop="farmName" label="农场名称">
          <el-input v-model="farmInfoForm.farmName" placeholder="请输入农场名称" />
        </el-form-item>
        <el-form-item prop="location" label="农场地点">
          <el-input v-model="farmInfoForm.location" placeholder="请输入农场地点" />
        </el-form-item>
        <el-form-item prop="scale" label="农场规模">
          <el-input v-model="farmInfoForm.scale" placeholder="请输入农场规模（亩）" />
        </el-form-item>
        <el-form-item prop="mainCrops" label="主要作物">
          <el-input v-model="farmInfoForm.mainCrops" placeholder="请输入主要种植的作物" />
        </el-form-item>
        <el-form-item prop="contact" label="联系方式">
          <el-input v-model="farmInfoForm.contact" placeholder="请输入农场联系方式" />
        </el-form-item>
        <el-form-item prop="description" label="农场简介">
          <el-input
            v-model="farmInfoForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入农场简介"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseFarmInfo">取消</el-button>
        <el-button type="primary" @click="handleSaveFarmInfo">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import { mockUserData } from '../api/modules/user';

const store = useStore();
console.log('当前用户角色:', store);
const currentUser = computed(() => store.state.user.info);
 
const isFarmer = computed(() => store.getters.isFarmer);
const isRootAdmin = computed(() => store.getters.isRootAdmin);

const farmInfoVisible = ref(false);
const farmInfoFormRef = ref(null);

// 农场信息表单
const farmInfoForm = reactive({
  farmName: '',
  location: '',
  scale: '',
  mainCrops: '',
  contact: '',
  description: ''
});

// 农场信息验证规则
const farmInfoRules = {
  farmName: [
    { required: true, message: '请输入农场名称', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入农场地点', trigger: 'blur' }
  ]
};

// 根据角色获取标签类型
const getRoleTag = (role) => {
  const roleMap = {
    '超级管理员': 'danger',
    '管理员': 'primary',
    '农户': 'success',
    '操作员': 'info',
    '采购员': 'warning'
  };
  return roleMap[role] || 'default';
};

// 编辑农场信息
const handleEditFarmInfo = () => {
  // 填充表单数据
  if (currentUser.value.farmInfo) {
    Object.assign(farmInfoForm, currentUser.value.farmInfo);
  }
  farmInfoVisible.value = true;
};

// 关闭农场信息编辑对话框
const handleCloseFarmInfo = () => {
  farmInfoVisible.value = false;
  if (farmInfoFormRef.value) {
    farmInfoFormRef.value.resetFields();
  }
};

// 保存农场信息
const handleSaveFarmInfo = () => {
  farmInfoFormRef.value.validate((valid) => {
    if (valid) {
      // 更新用户信息中的农场信息
      const updatedUser = {
        ...currentUser.value,
        farmInfo: farmInfoForm
      };
      
      // 更新store中的用户信息
      store.commit('SET_USER', updatedUser);
      
      // 同时更新mockUserData中的数据
      const userIndex = mockUserData.list.findIndex(user => user.id === currentUser.value.id);
      if (userIndex > -1) {
        mockUserData.list[userIndex] = updatedUser;
      }
      
      ElMessage.success('农场信息更新成功');
      handleCloseFarmInfo();
    }
  });
};

// 组件挂载时初始化数据
onMounted(() => {
  // 如果当前用户没有农场信息但角色是农户，初始化空的农场信息对象
  if (isFarmer.value && !currentUser.value.farmInfo) {
    const updatedUser = {
      ...currentUser.value,
      farmInfo: {
        farmName: '',
        location: '',
        scale: '',
        mainCrops: '',
        contact: '',
        description: ''
      }
    };
    store.commit('SET_USER', updatedUser);
  }
});
</script>

<style scoped>
.user-profile {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.profile-card {
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 20px 0;
}

.user-info h2 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #303133;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.farm-info-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.farm-info-form {
  max-height: 60vh;
  overflow-y: auto;
}

.action-buttons {
  margin-top: 20px;
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-profile {
    padding: 10px;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .el-descriptions {
    font-size: 14px;
  }
  
  .el-descriptions-item__label {
    padding-right: 10px !important;
  }
}
</style>