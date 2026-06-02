<template>
  <div class="toast-container">
    <div 
      v-for="toast in toasts" 
      :key="toast.id"
      class="toast"
      :class="toast.type"
      @click="removeToast(toast.id)"
    >
      <div class="toast-icon">
        <i :class="getToastIcon(toast.type)"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">{{ toast.title }}</div>
        <div v-if="toast.message" class="toast-message">{{ toast.message }}</div>
      </div>
      <button class="toast-close" @click.stop="removeToast(toast.id)">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

function addToast(toast) {
  const id = ++toastId
  toasts.value.push({
    id,
    type: 'info',
    duration: 3000,
    ...toast
  })
  
  // 自动移除
  setTimeout(() => {
    removeToast(id)
  }, toast.duration || 3000)
}

function removeToast(id) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

function getToastIcon(type) {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }
  return icons[type] || icons.info
}

// 暴露方法给父组件
defineExpose({
  addToast
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,.1);
  min-width: 300px;
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast:hover {
  transform: translateX(-4px);
}

.toast.success {
  border-left: 4px solid #059669;
}

.toast.error {
  border-left: 4px solid #dc2626;
}

.toast.warning {
  border-left: 4px solid #d97706;
}

.toast.info {
  border-left: 4px solid #2563eb;
}

.toast-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
}

.toast.success .toast-icon {
  background: #d1fae5;
  color: #059669;
}

.toast.error .toast-icon {
  background: #fee2e2;
  color: #dc2626;
}

.toast.warning .toast-icon {
  background: #fef3c7;
  color: #d97706;
}

.toast.info .toast-icon {
  background: #dbeafe;
  color: #2563eb;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.toast-message {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}

.toast-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  font-size: 12px;
  transition: color 0.2s ease;
}

.toast-close:hover {
  color: #0f172a;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>