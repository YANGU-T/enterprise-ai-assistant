<template>
  <div 
    v-if="appStore.modal.show" 
    class="modal-overlay"
    @click.self="appStore.hideModal()"
  >
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">
          <i v-if="modalIcon" :class="modalIcon" :style="{ color: modalIconColor }"></i>
          {{ appStore.modal.title }}
        </h3>
        <button class="modal-close" @click="appStore.hideModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div v-if="appStore.modal.type === 'confirm'" class="confirm-content">
          <div class="confirm-icon">
            <i class="fas fa-question-circle"></i>
          </div>
          <p>{{ appStore.modal.content }}</p>
        </div>
        <div v-else>
          <div v-html="appStore.modal.content"></div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          v-if="appStore.modal.type === 'confirm'" 
          class="btn btn-outline" 
          @click="appStore.hideModal()"
        >
          取消
        </button>
        <button 
          class="btn btn-primary" 
          @click="handleConfirm"
        >
          {{ appStore.modal.type === 'confirm' ? '确认' : '关闭' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores'

const appStore = useAppStore()

const modalIcon = computed(() => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle',
    confirm: 'fas fa-question-circle'
  }
  return icons[appStore.modal.type] || icons.info
})

const modalIconColor = computed(() => {
  const colors = {
    success: '#059669',
    error: '#dc2626',
    warning: '#d97706',
    info: '#2563eb',
    confirm: '#4f46e5'
  }
  return colors[appStore.modal.type] || colors.info
})

function handleConfirm() {
  if (appStore.modal.type === 'confirm') {
    // 执行确认回调
    if (appStore.modal.onConfirm) {
      appStore.modal.onConfirm()
    }
  }
  appStore.hideModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease-out;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,.2);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: scaleIn 0.2s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
}

.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.confirm-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #4f46e5;
}

.confirm-content p {
  font-size: 16px;
  color: #0f172a;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}
</style>