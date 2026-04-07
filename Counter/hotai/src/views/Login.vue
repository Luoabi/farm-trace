<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <!-- 登录表单 -->
      <div v-if="activeForm === 'login'" class="form-container">
        <div class="form-header">
          <img src="/logo.png" class="logo" alt="logo" />
          <h1 class="title">西昌农产品溯源系统</h1>
          <p class="subtitle">登录后台管理系统</p>
        </div>
        
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
              clearable
              autocomplete="on"
              class="form-input"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              show-password
              autocomplete="on"
              class="form-input"
            />
          </el-form-item>
          
          <el-form-item>
            <div class="form-options">
              <el-checkbox v-model="loginForm.remember" class="remember-checkbox">
                记住我
              </el-checkbox>
            </div>
            <el-button
              type="primary"
              class="form-button"
              :loading="loading"
              @click="handleLogin"
              round
            >
              登录
            </el-button>
          </el-form-item>
          
          <div class="form-footer">
            <a href="#" class="forgot-password">忘记密码?</a>
            <span class="separator">|</span>
            <a href="#" class="switch-form" @click.prevent="switchToRegister">注册账号</a>
          </div>
        </el-form>
      </div>

      <!-- 注册表单 -->
      <div v-else class="form-container">
        <div class="form-header">
          <img src="/vite.svg" class="logo" alt="logo" />
          <h1 class="title">西昌农产品溯源系统</h1>
          <p class="subtitle">创建新账号</p>
        </div>
        
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请设置用户名"
              prefix-icon="el-icon-user"
              clearable
              autocomplete="on"
              class="form-input"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请设置密码"
              prefix-icon="el-icon-lock"
              show-password
              autocomplete="on"
              class="form-input"
            />
          </el-form-item>
          
          <el-form-item prop="phone">
            <el-input
              v-model="registerForm.phone"
              placeholder="请输入手机号码"
              prefix-icon="el-icon-mobile"
              clearable
              autocomplete="on"
              class="form-input"
            />
          </el-form-item>
          
          <!-- 农场信息 -->
          <el-form-item prop="farmName">
            <el-input
              v-model="registerForm.farmName"
              placeholder="请输入农场名称"
              prefix-icon="el-icon-office-building"
              clearable
              autocomplete="on"
              class="form-input"
            />
          </el-form-item>
          
          <el-form-item prop="farmLocation">
            <el-input
              v-model="registerForm.farmLocation"
              placeholder="请输入农场地点"
              prefix-icon="el-icon-location"
              clearable
              autocomplete="on"
              class="form-input"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              class="form-button"
              :loading="loading"
              @click="handleRegister"
              round
            >
              注册
            </el-button>
          </el-form-item>
          
          <div class="form-footer">
            <a href="#" class="switch-form" @click.prevent="switchToLogin">已有账号? 立即登录</a>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

// 初始化状态
const store = useStore();
const router = useRouter();
const loginFormRef = ref(null);
const registerFormRef = ref(null);
const loading = ref(false);
const activeForm = ref('login'); // 'login' 或 'register'

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
});

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  phone: '',
  farmName: '',
  farmLocation: ''
});

// 登录表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
};

// 注册表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请设置用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请设置密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  farmName: [
    { required: true, message: '请输入农场名称', trigger: 'blur' }
  ],
  farmLocation: [
    { required: true, message: '请输入农场地点', trigger: 'blur' }
  ]
};

// 切换到登录表单
const switchToLogin = () => {
  activeForm.value = 'login';
  // 重置注册表单
  if (registerFormRef.value) {
    registerFormRef.value.resetFields();
  }
};

// 切换到注册表单
const switchToRegister = () => {
  activeForm.value = 'register';
  // 重置登录表单
  if (loginFormRef.value) {
    loginFormRef.value.resetFields();
  }
};

// 角色处理逻辑已移除，所有用户默认注册为农户角色

// 处理登录
const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      
      console.log('=== 开始登录 ===');
      console.log('用户名:', loginForm.username);
      
      // 保存记住用户名的状态
      if (loginForm.remember) {
        localStorage.setItem('rememberUsername', 'true');
      } else {
        localStorage.removeItem('rememberUsername');
      }
      
      try {
        console.log('调用登录 action...');
        await store.dispatch('user/login', {
          username: loginForm.username,
          password: loginForm.password,
          remember: loginForm.remember
        });
        
        console.log('登录 action 完成');
        console.log('Store 中的 token:', store.state.token);
        console.log('Store 中的用户信息:', store.state.user.info);
        console.log('localStorage 中的 token:', localStorage.getItem('token'));
        console.log('localStorage 中的 userInfo:', localStorage.getItem('userInfo'));
        
        ElMessage.success('登录成功');
        
        console.log('准备跳转到首页...');
        await router.push('/');
        console.log('路由跳转完成');
      } catch (error) {
        console.error('登录失败:', error);
        ElMessage.error(error.message || '登录失败');
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.warning('请填写正确的登录信息');
    }
  });
};

// 处理注册
const handleRegister = () => {
  registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      
      // 准备注册数据 - 默认角色为农户
      const registerData = {
        ...registerForm,
        role: 'FARMER', // 默认设置为农户角色
        farmInfo: {
          name: registerForm.farmName,
          location: registerForm.farmLocation
        }
      };
      
      try {
        await store.dispatch('user/register', registerData);
        ElMessage.success('注册成功，请登录');
        switchToLogin();
      } catch (error) {
        ElMessage.error(error.message || '注册失败');
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.warning('请填写正确的注册信息');
    }
  });
};

// 从localStorage恢复记住的用户名
onMounted(() => {
  const savedUsername = localStorage.getItem('rememberedUsername');
  if (savedUsername) {
    loginForm.username = savedUsername;
    loginForm.remember = true;
  }
});
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-attachment: fixed;
  animation: gradientBackground 15s ease infinite;
  background-size: 400% 400%;
}

@keyframes gradientBackground {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.login-form-wrapper {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  padding: 0;
  width: 100%;
  max-width: 480px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-form-wrapper:hover {
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.form-container {
  padding: 40px;
}

.form-header {
  text-align: center;
  margin-bottom: 35px;
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: white;
  padding: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.logo:hover {
  transform: rotate(5deg) scale(1.05);
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #1a1a1a;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
  font-weight: 500;
}

.form {
  margin-bottom: 20px;
}

.form-input,
.form-select {
  transition: all 0.3s ease;
}

.form-input:focus-within,
.form-select:focus-within {
  transform: translateY(-2px);
}

.form-options {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
}

.remember-checkbox {
  font-size: 14px;
  color: #666;
}

.form-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
}

.form-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
}

.form-footer {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-top: 25px;
}

.form-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.form-footer a:hover {
  color: #5a67d8;
  text-decoration: underline;
}

.switch-form {
  position: relative;
  padding: 0 5px;
}

.switch-form::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 5px;
  width: calc(100% - 10px);
  height: 2px;
  background-color: #667eea;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.switch-form:hover::after {
  transform: scaleX(1);
}

.separator {
  margin: 0 15px;
  color: #999;
}

/* 输入框样式优化 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

:deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

:deep(.el-input__prefix-icon) {
  color: #667eea;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

:deep(.el-select__wrapper:focus-within) {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-form-wrapper {
    margin: 0 15px;
  }
  
  .form-container {
    padding: 30px 25px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .logo {
    width: 64px;
    height: 64px;
  }
}

@media (max-width: 480px) {
  .form-container {
    padding: 25px 20px;
  }
  
  .title {
    font-size: 22px;
  }
  
  .form-button {
    padding: 10px 0;
    font-size: 15px;
  }
}

/* 动画效果 */
.form-container {
  animation: formTransition 0.5s ease-out;
}

@keyframes formTransition {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>