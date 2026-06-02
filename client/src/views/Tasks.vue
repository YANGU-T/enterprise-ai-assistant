<template>
  <div class="tasks-page">
    <div class="page-header">
      <div class="page-title-area">
        <h2>任务管理</h2>
        <p>管理个人和团队任务，跟踪任务进度</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline" @click="toggleView">
          <i :class="viewMode === 'list' ? 'fas fa-th' : 'fas fa-list'"></i>
          {{ viewMode === 'list' ? '看板视图' : '列表视图' }}
        </button>
        <button class="btn btn-primary" @click="showNewTaskModal">
          <i class="fas fa-plus"></i> 新建任务
        </button>
      </div>
    </div>
    
    <div class="scroll-area">
      <!-- 任务统计 -->
      <div class="task-stats">
        <div 
          v-for="stat in taskStats" 
          :key="stat.id"
          class="task-stat-card"
          :class="{ active: activeStat === stat.id }"
          @click="filterByStat(stat.id)"
        >
          <div class="task-stat-value">{{ stat.value }}</div>
          <div class="task-stat-label">{{ stat.label }}</div>
        </div>
      </div>
      
      <!-- 列表视图 -->
      <div v-if="viewMode === 'list'" class="task-list">
        <div 
          v-for="task in filteredTasks" 
          :key="task.id"
          class="task-item"
          :class="{ completed: task.status === 'done' }"
        >
          <div class="task-checkbox" @click="toggleTaskStatus(task)">
            <i v-if="task.status === 'done'" class="fas fa-check-circle"></i>
            <i v-else class="far fa-circle"></i>
          </div>
          <div class="task-content">
            <div class="task-title">{{ task.title }}</div>
            <div class="task-meta">
              <span class="task-assignee">
                <i class="fas fa-user"></i> {{ task.assignee }}
              </span>
              <span class="task-due" :class="{ overdue: isOverdue(task.due) }">
                <i class="fas fa-calendar"></i> {{ task.due }}
              </span>
              <span class="task-priority" :class="task.priority">
                {{ task.priorityText }}
              </span>
            </div>
          </div>
          <div class="task-actions">
            <button class="btn btn-ghost btn-sm" @click="editTask(task)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-ghost btn-sm" @click="deleteTask(task)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 看板视图 -->
      <div v-else class="kanban-view">
        <div 
          v-for="column in kanbanColumns" 
          :key="column.id"
          class="kanban-column"
        >
          <div class="kanban-header">
            <div class="kanban-title">
              <span class="kanban-dot" :style="{ background: column.color }"></span>
              {{ column.title }}
              <span class="kanban-count">{{ column.tasks.length }}</span>
            </div>
          </div>
          <div class="kanban-tasks">
            <div 
              v-for="task in column.tasks" 
              :key="task.id"
              class="kanban-task"
              @click="viewTaskDetail(task)"
            >
              <div class="kanban-task-title">{{ task.title }}</div>
              <div class="kanban-task-meta">
                <span class="kanban-task-assignee">{{ task.assignee }}</span>
                <span class="kanban-task-due">{{ task.due }}</span>
              </div>
              <div class="kanban-task-priority" :class="task.priority">
                {{ task.priorityText }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores'

const appStore = useAppStore()

// 视图模式
const viewMode = ref('list')

// 活跃统计筛选
const activeStat = ref('all')

// 任务统计
const taskStats = ref([
  { id: 'all', label: '全部任务', value: 12 },
  { id: 'todo', label: '待处理', value: 4 },
  { id: 'in_progress', label: '进行中', value: 5 },
  { id: 'done', label: '已完成', value: 3 }
])

// 任务数据
const tasks = ref([
  {
    id: 1,
    title: '完成客户演示PPT定稿',
    assignee: '赵海涛',
    due: '2026-05-28',
    priority: 'high',
    priorityText: '紧急',
    status: 'in_progress'
  },
  {
    id: 2,
    title: '前端架构评审',
    assignee: '赵海涛',
    due: '2026-05-29',
    priority: 'medium',
    priorityText: '重要',
    status: 'todo'
  },
  {
    id: 3,
    title: '新员工入职培训',
    assignee: '王丽华',
    due: '2026-05-30',
    priority: 'medium',
    priorityText: '重要',
    status: 'in_progress'
  },
  {
    id: 4,
    title: 'Q2季度报告',
    assignee: 'MI',
    due: '2026-05-31',
    priority: 'high',
    priorityText: '紧急',
    status: 'todo'
  },
  {
    id: 5,
    title: '更新产品知识库',
    assignee: '李文静',
    due: '2026-06-01',
    priority: 'low',
    priorityText: '普通',
    status: 'done'
  }
])

// 看板列
const kanbanColumns = ref([
  {
    id: 'todo',
    title: '待处理',
    color: '#94a3b8',
    tasks: []
  },
  {
    id: 'in_progress',
    title: '进行中',
    color: '#2563eb',
    tasks: []
  },
  {
    id: 'done',
    title: '已完成',
    color: '#059669',
    tasks: []
  }
])

// 计算属性
const filteredTasks = computed(() => {
  if (activeStat.value === 'all') {
    return tasks.value
  }
  return tasks.value.filter(t => t.status === activeStat.value)
})

// 方法
function toggleView() {
  viewMode.value = viewMode.value === 'list' ? 'kanban' : 'list'
  if (viewMode.value === 'kanban') {
    updateKanbanColumns()
  }
}

function updateKanbanColumns() {
  kanbanColumns.value.forEach(column => {
    column.tasks = tasks.value.filter(t => t.status === column.id)
  })
}

function filterByStat(statId) {
  activeStat.value = statId
}

function showNewTaskModal() {
  appStore.showModal('新建任务', '新建任务功能开发中...', 'info')
}

function toggleTaskStatus(task) {
  if (task.status === 'done') {
    task.status = 'todo'
  } else {
    task.status = 'done'
    appStore.addNotification({
      title: '任务完成',
      message: `已完成任务：${task.title}`,
      type: 'success'
    })
  }
  
  if (viewMode.value === 'kanban') {
    updateKanbanColumns()
  }
}

function editTask(task) {
  appStore.showModal('编辑任务', `编辑任务：${task.title}`, 'info')
}

function deleteTask(task) {
  const index = tasks.value.findIndex(t => t.id === task.id)
  if (index > -1) {
    tasks.value.splice(index, 1)
    if (viewMode.value === 'kanban') {
      updateKanbanColumns()
    }
  }
}

function viewTaskDetail(task) {
  appStore.showModal('任务详情', `任务详情：${task.title}`, 'info')
}

function isOverdue(dueDate) {
  return new Date(dueDate) < new Date()
}

onMounted(() => {
  // 初始化任务数据
})
</script>

<style scoped>
.tasks-page {
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

.task-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.task-stat-card {
  background: #fff;
  border-radius: var(--radius);
  padding: 20px;
  border: 1.5px solid var(--border);
  box-shadow: var(--shadow-xs);
  cursor: pointer;
  transition: all var(--tr);
}

.task-stat-card:hover {
  border-color: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.task-stat-card.active {
  border-color: var(--primary);
  background: var(--primary-50);
}

.task-stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 4px;
  letter-spacing: -1px;
}

.task-stat-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--bg-white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: all var(--tr);
}

.task-item:hover {
  border-color: var(--primary-light);
  background: var(--primary-50);
}

.task-item.completed {
  opacity: 0.6;
}

.task-checkbox {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 18px;
}

.task-checkbox:hover {
  color: var(--primary);
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
}

.task-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.task-assignee,
.task-due {
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-due.overdue {
  color: var(--danger);
}

.task-priority {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.task-priority.high {
  background: var(--danger-light);
  color: var(--danger);
}

.task-priority.medium {
  background: var(--warning-light);
  color: var(--warning);
}

.task-priority.low {
  background: var(--bg-surface);
  color: var(--text-muted);
}

.task-actions {
  display: flex;
  gap: 4px;
}

.kanban-view {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  min-height: 500px;
}

.kanban-column {
  background: var(--bg-surface);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 16px;
}

.kanban-header {
  margin-bottom: 16px;
}

.kanban-title {
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.kanban-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.kanban-count {
  background: var(--border);
  color: var(--text-muted);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
}

.kanban-tasks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.kanban-task {
  background: #fff;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 14px;
  cursor: pointer;
  transition: all var(--tr);
}

.kanban-task:hover {
  border-color: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.kanban-task-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.kanban-task-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.kanban-task-priority {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  display: inline-block;
}

.kanban-task-priority.high {
  background: var(--danger-light);
  color: var(--danger);
}

.kanban-task-priority.medium {
  background: var(--warning-light);
  color: var(--warning);
}

.kanban-task-priority.low {
  background: var(--bg-surface);
  color: var(--text-muted);
}

@media (max-width: 1200px) {
  .task-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .kanban-view {
    grid-template-columns: 1fr;
  }
}
</style>