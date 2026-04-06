<template>
  <el-container class="app-container">
    <!-- 左侧菜单栏 -->
    <el-aside :width="sidebarCollapse ? '64px' : '240px'" class="sidebar">
      <div class="sidebar-header">
        <img v-if="!sidebarCollapse" src="/vite.svg" class="logo" alt="logo" />
        <span v-if="!sidebarCollapse" class="logo-text">西昌农产品溯源系统</span>
      </div>
      <el-menu :collapse="sidebarCollapse" :default-active="activeMenu" class="el-menu-vertical"
        background-color="#001529" text-color="#fff" active-text-color="#409EFF" router @select="handleMenuSelect">
        <!-- 驾驶舱 - 所有登录用户可见 -->
        <el-menu-item index="/">
          <el-icon>
            <DataLine />
          </el-icon>
          <span v-if="!sidebarCollapse">驾驶舱</span>
        </el-menu-item>

        <!-- 业务功能 - 农户和操作员可见 -->
        <template v-if="user.role === '农户' || user.role === '操作员'">
          <el-menu-item index="/products">
            <el-icon>
              <Goods />
            </el-icon>
            <span v-if="!sidebarCollapse">商品管理</span>
          </el-menu-item>
          <el-menu-item index="/batches">
            <el-icon>
              <Box />
            </el-icon>
            <span v-if="!sidebarCollapse">产品批次管理</span>
          </el-menu-item>

          <el-menu-item index="/growth-records">
            <el-icon>
              <Guide />
            </el-icon>
            <span v-if="!sidebarCollapse">生长记录管理</span>
          </el-menu-item>

          <el-menu-item index="/orders">
            <el-icon>
              <Document />
            </el-icon>
            <span v-if="!sidebarCollapse">订单管理</span>
          </el-menu-item>
        </template>

        <!-- 用户管理 - 只有超级管理员或农场管理员可见 -->
        <el-menu-item v-if="user.role === '超级管理员' || (user.role === '农户' && user.parentId === 'user000')"
          index="/users">
          <el-icon>
            <Edit />
          </el-icon>
          <span v-if="!sidebarCollapse">用户管理</span>
        </el-menu-item>

        <!-- 系统管理 - 只有超级管理员可见 -->
        <el-menu-item v-if="user.role === '超级管理员'" index="/system">
          <el-icon>
            <Setting />
          </el-icon>
          <span v-if="!sidebarCollapse">系统管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-button link @click="toggleSidebar" class="sidebar-toggle-btn" size="large">
            <el-icon>
              <Fold v-if="!sidebarCollapse" />
              <Unfold v-else />
            </el-icon>
          </el-button>
        </div>

        <!-- 标签页导航 -->
        <div class="tabs-container">
          <el-tabs v-model="activeTab" type="card" class="tabs" @tab-click="handleTabClick"
            @tab-remove="handleTabRemove">
            <el-tab-pane v-for="tab in tabsList" :key="tab.path" :name="tab.path" :label="tab.title"
              :closable="tab.path !== '/'">
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 顶部右侧工具栏 -->
        <div class="header-right">
          <el-dropdown>
            <el-button link class="header-btn">
              <el-icon>
                <Bell />
              </el-icon>
              <el-badge :value="5" class="notification-badge" />
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>通知消息</el-dropdown-item>
                <el-dropdown-item>新订单提醒</el-dropdown-item>
                <el-dropdown-item>系统更新提醒</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-dropdown>
            <div class="user-info">
              <el-avatar :size="32">
                {{ user.username ? user.username.substring(0, 1) : 'U' }}
              </el-avatar>
              <span v-if="user.realName || user.username">{{ user.realName || user.username }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleProfile">个人中心</el-dropdown-item>
                <el-dropdown-item @click="handleSettings">系统设置</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 页面内容区域 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" v-if="Component" :key="route.path" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, watch, ref, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
// 使用Vuex store、路由和响应式数据
const store = useStore();
const router = useRouter();
const route = useRoute();
// 使用路径作为标签页标识，避免name缺失或重复的问题
const activeTab = ref('/');
const cachedViews = ref(['/']);

// 计算属性
const sidebarCollapse = computed(() => store.getters.isSidebarCollapse);
const activeMenu = computed(() => store.getters.getActiveMenu);
const tabsList = computed(() => store.getters.getTabsList);
const user = computed(() => store.getters.getUser);

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    // console.log('路由变化:', newPath);
    // console.log('当前标签页列表:', tabsList.value);

    if (newPath !== '/login') {
      // 确保title有值，避免依赖route.name
      const routeTitle = route.meta.title || (route.name || '未知页面');
      const routeInfo = {
        path: newPath,
        name: route.name || newPath,
        title: routeTitle
      };
      // 添加新标签
      store.dispatch('addTab', routeInfo);
      store.commit('SET_ACTIVE_MENU', newPath);
      // 同步activeTab
      activeTab.value = newPath;
    }
  },
  { immediate: true }
);

// 方法 
function toggleSidebar() {
  // console.log('切换侧边栏');
  store.dispatch('toggleSidebar');
};

const handleMenuSelect = (index) => {
  // console.log('=== 菜单选择 ===');
  // console.log('选择的路径:', index);
  // console.log('当前路径:', route.path);

  // 如果点击的是当前路由，不做任何操作
  if (index === route.path) {
    // console.log('点击的是当前路由，不跳转');
    return;
  }

  // 确保路由跳转的同时会触发标签页更新
  router.push(index).catch(err => {
    // console.error('路由跳转失败:', err);
  });
};

// 点击标签页切换路由 - 使用path作为唯一标识
const handleTabClick = (tab) => {
  // console.log('点击标签页:', tab);
  // 从 Element Plus 标签实例中获取实际绑定的 paneName (即路径)
  const tabPath = tab.paneName;
  // 使用path查找对应的路由信息，确保准确匹配
  const targetTab = tabsList.value.find(t => t.path === tabPath);
  if (targetTab) {
    // 确保activeTab与点击的标签同步
    activeTab.value = tabPath;
    // 使用路由的完整路径进行跳转
    router.push(targetTab.path);
  }
};

// 标签页切换前的处理 - 使用path作为唯一标识
const beforeTabLeave = (activePath, oldActivePath) => {
  // 确保路由和标签页保持同步
  activeTab.value = activePath;

  // 查找对应的路由信息 - 使用path作为查找条件
  const targetTab = tabsList.value.find(t => t.path === activePath);
  if (targetTab && targetTab.path) {
    // 确保路由与当前标签页同步
    if (route.path !== targetTab.path) {
      router.push(targetTab.path);
    }
  }
};

// 清空缓存视图 - 使用path作为标识
const clearCache = () => {
  cachedViews.value = ['/'];
  // 不再使用routerViewKey，依赖route.path自动刷新
  ElMessage.success('已清空缓存');
};

// 处理页面刷新 - 使用路由重新加载
const handlePageRefresh = () => {
  // 记录当前路径
  const currentPath = route.path;
  // 跳转到一个临时路径
  router.replace('/refresh').then(() => {
    // 再跳转回当前路径，实现组件重新渲染
    router.replace(currentPath);
  });
  ElMessage.success('页面已刷新');
};

// 删除标签页 - 使用path作为唯一标识
const handleTabRemove = (targetPath) => {
  // console.log('删除标签页:', targetPath);
  // 确保不删除首页标签
  if (targetPath === '/') return;

  // 执行删除操作 - 使用path作为标识
  store.dispatch('removeTab', targetPath);

  // 从缓存中移除 - 使用path作为标识
  const index = cachedViews.value.indexOf(targetPath);
  if (index > -1) {
    cachedViews.value.splice(index, 1);
  }

  // 如果删除的是当前活动标签，需要切换到其他标签
  if (targetPath === activeTab.value) {
    // 等待store更新后获取新的tabsList
    nextTick(() => {
      const currentTabs = tabsList.value;

      // 如果还有标签页，切换到最后一个
      if (currentTabs.length > 0) {
        const lastTab = currentTabs[currentTabs.length - 1];
        router.push(lastTab.path);
      } else {
        // 如果没有标签页了，跳转到首页
        router.push('/');
      }
    });
  }
};

const handleProfile = () => {
  router.push('/profile');
};

const handleSettings = () => {
  ElMessage.info('系统设置功能开发中');
};

const handleLogout = () => {
  // console.log('=== 开始退出登录 ===');

  // 使用 ElMessageBox 确认
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '退出确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // console.log('用户确认退出');

    // 调用 logout action
    store.dispatch('user/logout');

    console.log('清理完成，跳转到登录页');

    // 跳转到登录页
    router.push('/login');

    // 显示提示
    ElMessage.success('已退出登录');
  }).catch(() => {
    // console.log('用户取消退出');
    ElMessage.info('已取消退出');
  });
};
</script>

<style scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  background-color: #001529;
  transition: width 0.3s ease;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border-bottom: 1px solid #1f2937;
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.el-menu-vertical {
  height: calc(100% - 60px);
  border-right: none;
}

/* 顶部导航栏样式 */
.header {
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.sidebar-toggle-btn {
  color: #606266;
}

/* 标签页样式 */
.tabs-container {
  flex: 1;
  overflow: hidden;
}

.tabs {
  width: 100%;
  height: 50px;
}

.el-tabs__header {
  margin: 0;
  height: 50px;
  line-height: 50px;
}

.el-tabs__nav {
  padding: 0 10px;
}

/* 顶部右侧工具栏样式 */
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-btn {
  color: #606266;
}

.notification-badge {
  top: -5px;
  right: -5px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* 主内容区域样式 */
.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>