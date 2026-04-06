import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import store from './store'
import './assets/styles/global.css'
// 测试api接口
// 导入权限指令
import permissionDirective from './directives/permission'

// 创建Vue应用实例
const app = createApp(App)

// 全局注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册权限指令
app.directive('permission', permissionDirective)

// 配置Element Plus全局选项
app.use(ElementPlus, {
  size: 'default',
  zIndex: 3000,
})

// 使用路由和状态管理
app.use(router)
app.use(store)

// 页面刷新时从localStorage恢复用户信息
const token = localStorage.getItem('token');
const userInfoStr = localStorage.getItem('userInfo');
if (token && userInfoStr) {
  try {
    const userInfo = JSON.parse(userInfoStr);
    store.commit('SET_TOKEN', token);
    store.commit('user/SET_USER', userInfo);
  } catch (error) {
    console.error('恢复用户信息失败:', error);
    // 如果解析失败，清除可能损坏的数据
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
  }
}

// 挂载应用
app.mount('#app')
