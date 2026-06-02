<template>
  <header class="header">
    <div class="header-left">
      <button class="sidebar-toggle" @click="appStore.toggleSidebar()">
        <i :class="appStore.sidebarCollapsed ? 'fas fa-angle-right' : 'fas fa-angle-left'"></i>
      </button>
      <div class="logo" @click="router.push('/chat')">
        <div class="logo-icon"><i class="fas fa-robot"></i></div>
        <div class="logo-text">
          <h1>AI 中控平台</h1>
          <p>Enterprise AI Assistant</p>
        </div>
      </div>
    </div>
    
    <div class="header-center">
      <div class="header-stat-pill">
        <span class="dot green"></span>
        <span>系统运行正常</span>
      </div>
      <div class="header-stat-pill">
        <span class="dot blue"></span>
        <span>{{ activeTasks }} 进行中任务</span>
      </div>
      <div class="header-stat-pill">
        <span class="dot purple"></span>
        <span>{{ activeAgents }} 活跃Agent</span>
      </div>
    </div>
    
    <div class="header-right">
      <button class="header-btn model-btn" @click="showModelConfig">
        <i class="fas fa-sliders-h"></i>
        <span>模型设置</span>
      </button>
      <button class="header-btn" @click="router.push('/workbench')">
        <i class="fas fa-bell"></i>
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </button>
      <div class="user-avatar" @click="showUserMenu">{{ user.avatar }}</div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'

const router = useRouter()
const appStore = useAppStore()

const user = computed(() => appStore.user)
const unreadCount = computed(() => appStore.unreadNotifications)
const activeTasks = ref(8)
const activeAgents = ref(5)

function showModelConfig() {
  appStore.showModal('模型配置', '配置AI对话使用的模型能力', 'info')
}

function showUserMenu() {
  if (confirm('确定要退出登录吗？')) {
    appStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 100%);
  color: #fff;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  position: relative;
  z-index: 1000;
}

.header::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99,102,241,.4), transparent);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sidebar-toggle {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all .2s;
}

.sidebar-toggle:hover {
  background: rgba(255,255,255,.16);
}

.logo {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}

.logo-icon {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.logo-text h1 { font-size: 17px; font-weight: 800; letter-spacing: -.3px; }
.logo-text p { font-size: 11px; opacity: .6; font-weight: 500; letter-spacing: .8px; }

.header-center { flex: 1; display: flex; justify-content: center; gap: 12px; }

.header-stat-pill {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 12px; font-weight: 600;
}

.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot.green { background: #34d399; }
.dot.amber { background: #fbbf24; }
.dot.blue { background: #60a5fa; }
.dot.purple { background: #a78bfa; }

.header-right { display: flex; align-items: center; gap: 6px; }

.header-btn {
  background: rgba(255,255,255,.08);
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  transition: all .2s;
  position: relative;
  font-family: inherit;
}

.header-btn:hover { background: rgba(255,255,255,.16); }

.model-btn {
  background: rgba(99,102,241,.3);
  border: 1px solid rgba(99,102,241,.4);
}

.model-btn:hover {
  background: rgba(99,102,241,.5);
}

.badge {
  position: absolute; top: -5px; right: -5px;
  background: #ef4444; color: #fff;
  font-size: 10px; min-width: 18px; height: 18px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  border: 2px solid #1e1b4b;
}

.user-avatar {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px;
  margin-left: 8px;
  cursor: pointer;
}
</style>