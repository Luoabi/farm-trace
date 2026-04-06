<template>
  <div class="app-container">
    <!-- 路由视图 -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
// 使用setup语法糖简化组件定义
</script>

<style>
/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 全局应用容器 */
.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* 修复Element Plus表格在移动端的显示问题 */
.el-table {
  width: 100%;
}

/* 确保对话框内容不会溢出 */
.el-dialog__body {
  max-height: 60vh;
  overflow-y: auto;
}
</style>