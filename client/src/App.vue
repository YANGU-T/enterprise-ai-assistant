<template>
  <!-- 登录页面：不显示主布局 -->
  <div v-if="isLoginPage" class="app-login">
    <router-view />
  </div>
  <!-- 主应用布局 -->
  <div v-else class="app-container">
    <AppSidebar />
    <main class="main-content">
      <router-view />
    </main>
    <NotificationToast />
    <ModalOverlay />
  </div>
</template>

<script setup>
import { computed, onMounted, onErrorCaptured } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import NotificationToast from '@/components/common/NotificationToast.vue'
import ModalOverlay from '@/components/common/ModalOverlay.vue'

const route = useRoute()
const appStore = useAppStore()

// 判断是否为登录页（登录页不需要主布局）
const isLoginPage = computed(() => route.path === '/login')

// 捕获子组件错误
onErrorCaptured((err, instance, info) => {
  console.error('App捕获到子组件错误:', err)
  console.error('错误信息:', info)
  console.error('组件实例:', instance)
  return false // 阻止错误继续传播
})

onMounted(() => {
  try {
    // 初始化应用（仅在非登录页时）
    appStore.initializeApp()
  } catch (error) {
    console.error('App初始化错误:', error)
  }
})
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Plus Jakarta Sans', 'Noto Sans SC', -apple-system, sans-serif;
  color: #0f172a;
  background: #f1f5f9;
  line-height: 1.6;
  font-size: 14px;
  overflow: hidden;
  height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.app-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  transition: margin-left 0.3s ease;
}

/* 登录页容器：全屏展示，无滚动条 */
.app-login {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>