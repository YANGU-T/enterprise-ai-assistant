<template>
  <div class="dashboard-page">
    <div class="page-header">
      <div class="page-title-area">
        <h2>仪表盘</h2>
        <p>欢迎回来，{{ user.name }}！这是您的工作概览。</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline" @click="refreshData">
          <i class="fas fa-sync-alt"></i> 刷新数据
        </button>
        <button class="btn btn-primary" @click="showQuickActions">
          <i class="fas fa-plus"></i> 快速操作
        </button>
      </div>
    </div>
    
    <div class="scroll-area">
      <!-- 概览横幅 -->
      <div class="overview-banner">
        <div class="overview-text">
          <h3>今日工作概览</h3>
          <p>您有 {{ stats.pendingApprovals }} 个待审批，{{ stats.activeTasks }} 个进行中任务，{{ stats.ongoingProjects }} 个项目进行中。</p>
        </div>
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div 
          v-for="stat in statCards" 
          :key="stat.id"
          class="stat-card"
          @click="navigateToStat(stat)"
        >
          <div class="stat-icon" :style="{ background: stat.iconBg, color: stat.iconColor }">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
          <div class="stat-trend" :class="stat.trendClass">
            <i :class="stat.trendIcon"></i>
            {{ stat.trend }}
          </div>
        </div>
      </div>
      
      <!-- 快捷操作 -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <i class="fas fa-bolt" style="color: var(--warning)"></i>
            快捷操作
          </div>
        </div>
        <div class="quick-actions-grid">
          <button 
            v-for="action in quickActions" 
            :key="action.id"
            class="quick-action-btn"
            @click="executeQuickAction(action)"
          >
            <div class="quick-action-icon" :style="{ background: action.iconBg, color: action.iconColor }">
              <i :class="action.icon"></i>
            </div>
            <div class="quick-action-info">
              <div class="quick-action-name">{{ action.name }}</div>
              <div class="quick-action-desc">{{ action.description }}</div>
            </div>
          </button>
        </div>
      </div>
      
      <!-- 待办事项 -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <i class="fas fa-list-check" style="color: var(--primary)"></i>
            待办事项
          </div>
          <button class="btn btn-ghost btn-sm" @click="viewAllTasks">
            查看全部 <i class="fas fa-arrow-right"></i>
          </button>
        </div>
        <div class="todo-list">
          <div 
            v-for="todo in todos" 
            :key="todo.id"
            class="todo-item"
            :class="{ urgent: todo.urgent }"
          >
            <div class="todo-checkbox" @click="toggleTodo(todo)">
              <i v-if="todo.completed" class="fas fa-check-circle"></i>
              <i v-else class="far fa-circle"></i>
            </div>
            <div class="todo-content">
              <div class="todo-title">{{ todo.title }}</div>
              <div class="todo-meta">
                <span class="todo-type">{{ todo.type }}</span>
                <span class="todo-due">{{ todo.due }}</span>
              </div>
            </div>
            <div class="todo-priority" :class="todo.priority">
              {{ todo.priorityText }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 最近活动 -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <i class="fas fa-clock-rotate-left" style="color: var(--accent)"></i>
            最近活动
          </div>
        </div>
        <div class="activity-list">
          <div 
            v-for="activity in recentActivities" 
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-icon" :style="{ background: activity.iconBg, color: activity.iconColor }">
              <i :class="activity.icon"></i>
            </div>
            <div class="activity-content">
              <div class="activity-text">{{ activity.text }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'

const router = useRouter()
const appStore = useAppStore()

const user = computed(() => appStore.user)
const stats = computed(() => appStore.stats)

// 统计卡片数据
const statCards = ref([
  {
    id: 'approvals',
    label: '待审批',
    value: 5,
    icon: 'fas fa-check-double',
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    trend: '+2 今日',
    trendClass: 'trend-up',
    trendIcon: 'fas fa-arrow-up'
  },
  {
    id: 'tasks',
    label: '进行中任务',
    value: 12,
    icon: 'fas fa-tasks',
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
    trend: '+3 今日',
    trendClass: 'trend-up',
    trendIcon: 'fas fa-arrow-up'
  },
  {
    id: 'projects',
    label: '进行中项目',
    value: 3,
    icon: 'fas fa-folder-open',
    iconBg: '#d1fae5',
    iconColor: '#059669',
    trend: '稳定',
    trendClass: 'trend-stable',
    trendIcon: 'fas fa-minus'
  },
  {
    id: 'ai',
    label: 'AI 执行次数',
    value: 28,
    icon: 'fas fa-robot',
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    trend: '+12 本周',
    trendClass: 'trend-up',
    trendIcon: 'fas fa-arrow-up'
  }
])

// 快捷操作
const quickActions = ref([
  {
    id: 'travel',
    name: '出差申请',
    description: '快速提交出差审批',
    icon: 'fas fa-plane',
    iconBg: '#dbeafe',
    iconColor: '#2563eb'
  },
  {
    id: 'report',
    name: '生成周报',
    description: 'AI自动生成工作周报',
    icon: 'fas fa-file-alt',
    iconBg: '#ede9fe',
    iconColor: '#7c3aed'
  },
  {
    id: 'reimburse',
    name: '费用报销',
    description: '提交费用报销申请',
    icon: 'fas fa-receipt',
    iconBg: '#fef3c7',
    iconColor: '#d97706'
  },
  {
    id: 'meeting',
    name: '会议安排',
    description: '创建会议邀请',
    icon: 'fas fa-calendar-check',
    iconBg: '#d1fae5',
    iconColor: '#059669'
  }
])

// 待办事项
const todos = ref([
  {
    id: 1,
    title: '审批张明辉的出差申请',
    type: '审批',
    due: '今天 17:00',
    priority: 'high',
    priorityText: '紧急',
    urgent: true,
    completed: false
  },
  {
    id: 2,
    title: '完成客户演示PPT定稿',
    type: '任务',
    due: '明天 12:00',
    priority: 'high',
    priorityText: '紧急',
    urgent: true,
    completed: false
  },
  {
    id: 3,
    title: '审核新员工入职流程',
    type: '审批',
    due: '今天 18:00',
    priority: 'medium',
    priorityText: '重要',
    urgent: false,
    completed: false
  },
  {
    id: 4,
    title: '提交Q2季度报告',
    type: '任务',
    due: '本周五',
    priority: 'medium',
    priorityText: '重要',
    urgent: false,
    completed: false
  },
  {
    id: 5,
    title: '更新产品知识库',
    type: '任务',
    due: '下周一',
    priority: 'low',
    priorityText: '普通',
    urgent: false,
    completed: true
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    text: 'AI自动生成了本周工作周报',
    time: '10分钟前',
    icon: 'fas fa-magic',
    iconBg: '#ede9fe',
    iconColor: '#7c3aed'
  },
  {
    id: 2,
    text: '批准了李文静的请假申请',
    time: '30分钟前',
    icon: 'fas fa-check',
    iconBg: '#d1fae5',
    iconColor: '#059669'
  },
  {
    id: 3,
    text: '创建了新项目「上海客户拜访」',
    time: '1小时前',
    icon: 'fas fa-folder-plus',
    iconBg: '#dbeafe',
    iconColor: '#2563eb'
  },
  {
    id: 4,
    text: '完成了前端架构评审任务',
    time: '2小时前',
    icon: 'fas fa-check-circle',
    iconBg: '#d1fae5',
    iconColor: '#059669'
  },
  {
    id: 5,
    text: 'AI检测到资源冲突并提供了解决方案',
    time: '3小时前',
    icon: 'fas fa-exclamation-triangle',
    iconBg: '#fef3c7',
    iconColor: '#d97706'
  }
])

function refreshData() {
  appStore.showModal('刷新数据', '正在刷新仪表盘数据...', 'info')
}

function showQuickActions() {
  appStore.showModal('快速操作', '快速操作菜单', 'info')
}

function navigateToStat(stat) {
  const routes = {
    approvals: '/approval',
    tasks: '/tasks',
    projects: '/projects',
    ai: '/ai-workbench'
  }
  router.push(routes[stat.id] || '/dashboard')
}

function executeQuickAction(action) {
  appStore.showModal('执行操作', `正在执行：${action.name}`, 'info')
}

function viewAllTasks() {
  router.push('/tasks')
}

function toggleTodo(todo) {
  todo.completed = !todo.completed
  if (todo.completed) {
    appStore.addNotification({
      title: '任务完成',
      message: `已完成：${todo.title}`,
      type: 'success'
    })
  }
}

onMounted(() => {
  // 初始化仪表盘数据
})
</script>

<style scoped>
.dashboard-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 18px 28px;
  background: var(--bg-white);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.page-title-area h2 {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -.3px;
}

.page-title-area p {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 3px;
}

.page-actions {
  display: flex;
  gap: 10px;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
}

.scroll-area::-webkit-scrollbar {
  width: 5px;
}

.scroll-area::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.overview-banner {
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 100%);
  border-radius: var(--radius-lg);
  padding: 28px 32px;
  color: #fff;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.overview-banner::before {
  content: '';
  position: absolute;
  top: -60%;
  right: -5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(99,102,241,.15) 0%, transparent 70%);
  border-radius: 50%;
}

.overview-banner::after {
  content: '';
  position: absolute;
  bottom: -40%;
  left: 20%;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(124,58,237,.1) 0%, transparent 70%);
  border-radius: 50%;
}

.overview-text h3 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 6px;
  position: relative;
}

.overview-text p {
  font-size: 13px;
  opacity: .7;
  position: relative;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-white);
  border-radius: var(--radius);
  padding: 22px;
  border: 1.5px solid var(--border);
  box-shadow: var(--shadow-xs);
  cursor: pointer;
  transition: all var(--tr);
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  border-color: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 16px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 4px;
  letter-spacing: -1px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-trend.trend-up {
  color: var(--success);
}

.stat-trend.trend-down {
  color: var(--danger);
}

.stat-trend.trend-stable {
  color: var(--text-muted);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--bg-white);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--tr);
  text-align: left;
}

.quick-action-btn:hover {
  border-color: var(--primary-light);
  background: var(--primary-50);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.quick-action-icon {
  width: 46px;
  height: 46px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.quick-action-name {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}

.quick-action-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--bg-white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: all var(--tr);
}

.todo-item:hover {
  border-color: var(--primary-light);
  background: var(--primary-50);
}

.todo-item.urgent {
  border-left: 4px solid var(--danger);
}

.todo-checkbox {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 18px;
}

.todo-checkbox:hover {
  color: var(--primary);
}

.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.todo-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.todo-priority {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
}

.todo-priority.high {
  background: var(--danger-light);
  color: var(--danger);
}

.todo-priority.medium {
  background: var(--warning-light);
  color: var(--warning);
}

.todo-priority.low {
  background: var(--bg-surface);
  color: var(--text-muted);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.activity-text {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: var(--text-muted);
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>