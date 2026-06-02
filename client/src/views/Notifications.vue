<template>
  <div class="notifications-page">
    <div class="page-header">
      <div class="page-title-area">
        <h2>通知中心</h2>
        <p>查看系统通知、消息提醒和待办事项</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline">
          <i class="fas fa-check-double"></i> 全部已读
        </button>
        <button class="btn btn-outline">
          <i class="fas fa-cog"></i> 通知设置
        </button>
      </div>
    </div>
    
    <div class="scroll-area">
      <!-- 通知统计 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #fee2e2; color: #dc2626;">
            <i class="fas fa-bell"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">12</div>
            <div class="stat-label">未读通知</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #e0f2fe; color: #0284c7;">
            <i class="fas fa-envelope"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">5</div>
            <div class="stat-label">未读消息</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #fef3c7; color: #d97706;">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">8</div>
            <div class="stat-label">待办事项</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #dcfce7; color: #16a34a;">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">156</div>
            <div class="stat-label">已处理</div>
          </div>
        </div>
      </div>
      
      <!-- 通知筛选 -->
      <div class="card">
        <div class="card-header">
          <h3>通知列表</h3>
          <div class="card-actions">
            <div class="filter-tabs">
              <button class="filter-tab" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">全部</button>
              <button class="filter-tab" :class="{ active: activeFilter === 'unread' }" @click="activeFilter = 'unread'">未读</button>
              <button class="filter-tab" :class="{ active: activeFilter === 'important' }" @click="activeFilter = 'important'">重要</button>
              <button class="filter-tab" :class="{ active: activeFilter === 'system' }" @click="activeFilter = 'system'">系统</button>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="notification-list">
            <div class="notification-item" v-for="notification in filteredNotifications" :key="notification.id" :class="{ unread: !notification.read }">
              <div class="notification-icon" :style="{ background: notification.iconBg, color: notification.iconColor }">
                <i :class="notification.icon"></i>
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-time">{{ notification.time }}</div>
                </div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-meta">
                  <span class="notification-type" :class="notification.typeClass">{{ notification.type }}</span>
                  <span class="notification-sender" v-if="notification.sender">来自: {{ notification.sender }}</span>
                </div>
              </div>
              <div class="notification-actions">
                <button class="btn btn-sm btn-outline" v-if="!notification.read">
                  <i class="fas fa-check"></i> 标为已读
                </button>
                <button class="btn btn-sm btn-outline">
                  <i class="fas fa-trash"></i> 删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeFilter = ref('all')

const notifications = ref([
  { id: 1, title: '审批请求', message: '张三提交了差旅报销申请，金额￥3,500，请您审批。', time: '10分钟前', type: '审批', typeClass: 'type-approval', icon: 'fas fa-check-circle', iconBg: '#dcfce7', iconColor: '#16a34a', read: false, sender: '张三', important: true },
  { id: 2, title: '系统更新', message: '企业AI助手系统已更新至v2.1.0，新增智能审批功能。', time: '30分钟前', type: '系统', typeClass: 'type-system', icon: 'fas fa-cog', iconBg: '#e0f2fe', iconColor: '#0284c7', read: false, sender: null, important: false },
  { id: 3, title: '任务提醒', message: '您有一个任务"客户数据分析报告"即将到期，截止时间：今天18:00。', time: '1小时前', type: '任务', typeClass: 'type-task', icon: 'fas fa-tasks', iconBg: '#fef3c7', iconColor: '#d97706', read: false, sender: null, important: true },
  { id: 4, title: '新消息', message: '李四在项目讨论中@了您，请查看相关讨论。', time: '2小时前', type: '消息', typeClass: 'type-message', icon: 'fas fa-envelope', iconBg: '#f3e8ff', iconColor: '#9333ea', read: true, sender: '李四', important: false },
  { id: 5, title: '审批结果', message: '您提交的"采购申请"已通过审批，采购部门将跟进处理。', time: '3小时前', type: '审批', typeClass: 'type-approval', icon: 'fas fa-check-circle', iconBg: '#dcfce7', iconColor: '#16a34a', read: true, sender: '系统', important: false },
  { id: 6, title: '安全提醒', message: '检测到您的账号在异地登录，如非本人操作请及时修改密码。', time: '4小时前', type: '安全', typeClass: 'type-security', icon: 'fas fa-shield-alt', iconBg: '#fee2e2', iconColor: '#dc2626', read: false, sender: null, important: true },
  { id: 7, title: '会议提醒', message: '您有一个会议"项目进度评审"将于15:00开始，请提前准备。', time: '5小时前', type: '日程', typeClass: 'type-calendar', icon: 'fas fa-calendar', iconBg: '#e0f2fe', iconColor: '#0284c7', read: true, sender: null, important: false },
  { id: 8, title: '文档分享', message: '王五与您分享了文档"2026年Q2营销计划"，请查阅。', time: '6小时前', type: '文档', typeClass: 'type-document', icon: 'fas fa-file-alt', iconBg: '#dcfce7', iconColor: '#16a34a', read: true, sender: '王五', important: false }
])

const filteredNotifications = computed(() => {
  switch (activeFilter.value) {
    case 'unread':
      return notifications.value.filter(n => !n.read)
    case 'important':
      return notifications.value.filter(n => n.important)
    case 'system':
      return notifications.value.filter(n => n.type === '系统')
    default:
      return notifications.value
  }
})
</script>

<style scoped>
.notifications-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title-area h2 {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.page-title-area p {
  color: #64748b;
  font-size: 14px;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.card-body {
  padding: 20px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.filter-tab.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.notification-item:hover {
  background: #f1f5f9;
}

.notification-item.unread {
  background: #e0f2fe;
  border-color: #bae6fd;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notification-title {
  font-weight: 600;
  color: #0f172a;
}

.notification-time {
  font-size: 12px;
  color: #94a3b8;
}

.notification-message {
  font-size: 14px;
  color: #374151;
  margin-bottom: 8px;
  line-height: 1.5;
}

.notification-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
}

.notification-type {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.type-approval {
  background: #dcfce7;
  color: #16a34a;
}

.type-system {
  background: #e0f2fe;
  color: #0284c7;
}

.type-task {
  background: #fef3c7;
  color: #d97706;
}

.type-message {
  background: #f3e8ff;
  color: #9333ea;
}

.type-security {
  background: #fee2e2;
  color: #dc2626;
}

.type-calendar {
  background: #e0f2fe;
  color: #0284c7;
}

.type-document {
  background: #dcfce7;
  color: #16a34a;
}

.notification-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-outline {
  background: white;
  border: 1px solid #e2e8f0;
  color: #374151;
}

.btn-outline:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-primary {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}
</style>