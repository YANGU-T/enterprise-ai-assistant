<template>
  <div class="workflow-page">
    <div class="page-header">
      <div class="page-title-area">
        <h2>工作流管理</h2>
        <p>管理企业工作流程，支持AI自动化执行</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline" @click="showWorkflowStats">
          <i class="fas fa-chart-bar"></i> 统计分析
        </button>
        <button class="btn btn-primary" @click="showNewWorkflowModal">
          <i class="fas fa-plus"></i> 新建工作流
        </button>
      </div>
    </div>
    
    <div class="scroll-area">
      <!-- 工作流统计 -->
      <div class="workflow-stats">
        <div class="workflow-stat-card">
          <div class="workflow-stat-value">23</div>
          <div class="workflow-stat-label">本月执行次数</div>
        </div>
        <div class="workflow-stat-card">
          <div class="workflow-stat-value">95%</div>
          <div class="workflow-stat-label">自动化成功率</div>
        </div>
        <div class="workflow-stat-card">
          <div class="workflow-stat-value">1.2s</div>
          <div class="workflow-stat-label">平均执行时间</div>
        </div>
        <div class="workflow-stat-card">
          <div class="workflow-stat-value">8</div>
          <div class="workflow-stat-label">活跃模板数</div>
        </div>
      </div>
      
      <!-- 工作流标签页 -->
      <div class="workflow-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="workflow-tab"
          :class="{ active: activeTab === tab.id }"
          @click="switchTab(tab.id)"
        >
          {{ tab.label }}
          <span v-if="tab.count" class="workflow-tab-badge">{{ tab.count }}</span>
        </button>
      </div>
      
      <!-- 工作流模板面板 -->
      <div v-if="activeTab === 'templates'" class="tab-panel">
        <div class="workflow-templates">
          <div 
            v-for="template in workflowTemplates" 
            :key="template.id"
            class="workflow-template-card"
            @click="useTemplate(template)"
          >
            <div class="template-header">
              <div class="template-icon" :style="{ background: template.iconBg, color: template.iconColor }">
                <i :class="template.icon"></i>
              </div>
              <div class="template-info">
                <h4>{{ template.name }}</h4>
                <p>{{ template.description }}</p>
              </div>
            </div>
            <div class="template-footer">
              <span class="template-usage">
                <i class="fas fa-users"></i> 本月 {{ template.usage }} 次使用
              </span>
              <span class="template-action">
                立即使用 <i class="fas fa-arrow-right"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 申请记录面板 -->
      <div v-if="activeTab === 'records'" class="tab-panel">
        <div class="record-filters">
          <button 
            v-for="filter in filters" 
            :key="filter.id"
            class="filter-chip"
            :class="{ active: activeFilter === filter.id }"
            @click="setFilter(filter.id)"
          >
            {{ filter.label }}
          </button>
        </div>
        
        <div class="application-list">
          <div 
            v-for="app in filteredApplications" 
            :key="app.id"
            class="application-item"
            @click="showApplicationDetail(app)"
          >
            <div class="application-icon" :style="{ background: app.iconBg, color: app.iconColor }">
              <i :class="app.icon"></i>
            </div>
            <div class="application-info">
              <div class="application-title">{{ app.title }}</div>
              <div class="application-meta">
                <span><i class="fas fa-user"></i> {{ app.submitter }}</span>
                <span><i class="fas fa-calendar"></i> {{ app.date }}</span>
                <span><i class="fas fa-tag"></i> {{ app.type }}</span>
              </div>
            </div>
            <div class="application-status">
              <span class="status-badge" :class="app.statusClass">{{ app.statusText }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 审批面板 -->
      <div v-if="activeTab === 'approval'" class="tab-panel">
        <div class="approval-inbox">
          <div 
            v-for="approval in pendingApprovals" 
            :key="approval.id"
            class="pa-card"
            :class="{ 'pa-urgent': approval.urgent }"
          >
            <div class="pa-card-head">
              <div class="pa-avatar" :style="{ background: approval.avatarBg }">
                {{ approval.avatar }}
              </div>
              <div class="pa-meta">
                <div class="pa-title">
                  {{ approval.title }}
                  <span v-if="approval.urgent" class="pa-urgent-tag">急</span>
                </div>
                <div class="pa-submitter">{{ approval.submitter }} · {{ approval.submitterRole }}</div>
              </div>
            </div>
            <div class="pa-desc">{{ approval.description }}</div>
            <div class="pa-actions">
              <button class="pa-btn-approve" @click="approveRequest(approval)">
                <i class="fas fa-check"></i> 批准
              </button>
              <button class="pa-btn-reject" @click="rejectRequest(approval)">
                <i class="fas fa-times"></i> 驳回
              </button>
              <button class="pa-btn-view" @click="viewApprovalDetail(approval)">
                <i class="fas fa-eye"></i> 详情
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- AI端到端执行 -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <i class="fas fa-magic" style="color: var(--accent)"></i>
            AI 端到端执行
            <span style="font-size: 11px; padding: 3px 10px; border-radius: 12px; background: var(--primary-50); color: var(--primary); font-weight: 600;">
              描述目标，AI 自动串联
            </span>
          </div>
          <button class="btn btn-ghost btn-sm" @click="viewExecutionHistory">
            <i class="fas fa-history"></i> 历史记录
          </button>
        </div>
        
        <div class="ai-endtoend-input">
          <input 
            v-model="aiInput" 
            type="text" 
            placeholder="或自由描述：例如「帮我安排下周三上海客户拜访，包括出差申请、差旅预支和会议预约」" 
          />
          <button class="btn btn-primary" @click="executeAITask">
            <i class="fas fa-magic"></i> AI 执行
          </button>
        </div>
        
        <!-- AI执行时间线 -->
        <div v-if="aiExecutionTimeline.length > 0" class="ai-endtoend-timeline">
          <div style="font-size: 14px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-robot" style="color: var(--primary)"></i>
            AI 自动执行中...
            <span style="font-size: 11px; padding: 2px 8px; border-radius: 10px; background: var(--primary-50); color: var(--primary); font-weight: 600;">
              预计总耗时 1.2秒
            </span>
          </div>
          
          <div 
            v-for="(step, index) in aiExecutionTimeline" 
            :key="index"
            class="ai-timeline-step"
          >
            <div 
              class="ai-timeline-dot" 
              :style="{ 
                background: step.completed ? 'var(--success-light)' : 'var(--primary-50)', 
                color: step.completed ? 'var(--success)' : 'var(--primary)' 
              }"
            >
              <i :class="step.completed ? 'fas fa-check' : 'fas fa-spinner fa-spin'"></i>
            </div>
            <div class="ai-timeline-content">
              <div class="ai-timeline-title">{{ step.title }}</div>
              <div class="ai-timeline-desc">{{ step.description }}</div>
              <div class="ai-timeline-time">
                {{ step.completed ? '✅ 已完成' : '⏳ 执行中' }} · {{ step.time }}
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

// 标签页
const tabs = ref([
  { id: 'templates', label: '工作流模板', count: null },
  { id: 'records', label: '申请记录', count: 12 },
  { id: 'approval', label: '待审批', count: 5 }
])

const activeTab = ref('templates')

// 筛选器
const filters = ref([
  { id: 'all', label: '全部' },
  { id: 'pending', label: '待审批' },
  { id: 'approved', label: '已批准' },
  { id: 'rejected', label: '已驳回' },
  { id: 'processing', label: '处理中' }
])

const activeFilter = ref('all')

// 工作流模板
const workflowTemplates = ref([
  {
    id: 'travel',
    name: '出差审批流',
    description: '申请→审批→差旅预支→报销→归档，AI 自动填充历史数据',
    icon: 'fas fa-plane',
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    usage: 23
  },
  {
    id: 'onboarding',
    name: '新员工入职',
    description: 'Offer→合同→设备→IT权限→培训→导师，全流程自动协调',
    icon: 'fas fa-user-plus',
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
    usage: 8
  },
  {
    id: 'reimbursement',
    name: '费用报销',
    description: '提交→审批→财务处理→到账，AI 自动校验发票与标准',
    icon: 'fas fa-receipt',
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    usage: 45
  },
  {
    id: 'report',
    name: '周报/月报',
    description: '数据采集→汇总→AI 生成→审批→发布，一键生成多部门报告',
    icon: 'fas fa-file-alt',
    iconBg: '#d1fae5',
    iconColor: '#059669',
    usage: 12
  }
])

// 申请记录
const applications = ref([
  {
    id: 1,
    title: '上海出差申请',
    type: '出差申请',
    submitter: '张明辉',
    date: '2026-05-27',
    status: 'pending',
    statusText: '待审批',
    statusClass: 'status-pending',
    icon: 'fas fa-plane',
    iconBg: '#dbeafe',
    iconColor: '#2563eb'
  },
  {
    id: 2,
    title: 'Q2季度费用报销',
    type: '费用报销',
    submitter: '李文静',
    date: '2026-05-26',
    status: 'approved',
    statusText: '已批准',
    statusClass: 'status-approved',
    icon: 'fas fa-receipt',
    iconBg: '#fef3c7',
    iconColor: '#d97706'
  },
  {
    id: 3,
    title: '新员工入职流程',
    type: '入职流程',
    submitter: '周建国',
    date: '2026-05-25',
    status: 'processing',
    statusText: '处理中',
    statusClass: 'status-processing',
    icon: 'fas fa-user-plus',
    iconBg: '#d1fae5',
    iconColor: '#059669'
  },
  {
    id: 4,
    title: '客户演示PPT制作',
    type: '任务申请',
    submitter: '赵海涛',
    date: '2026-05-24',
    status: 'rejected',
    statusText: '已驳回',
    statusClass: 'status-rejected',
    icon: 'fas fa-file-powerpoint',
    iconBg: '#fee2e2',
    iconColor: '#dc2626'
  }
])

// 待审批列表
const pendingApprovals = ref([
  {
    id: 1,
    title: '上海出差申请',
    submitter: '张明辉',
    submitterRole: '销售经理',
    description: '申请6月15日至6月25日前往上海拜访客户A公司，预计费用12000元。',
    avatar: '张',
    avatarBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    urgent: true
  },
  {
    id: 2,
    title: '设备采购申请',
    submitter: '陈思雨',
    submitterRole: '前端开发',
    description: '申请采购MacBook Pro M3 Max一台，用于前端开发工作。',
    avatar: '陈',
    avatarBg: 'linear-gradient(135deg, #059669, #10b981)',
    urgent: false
  },
  {
    id: 3,
    title: '请假申请',
    submitter: '王丽华',
    submitterRole: '产品经理',
    description: '申请6月20日至6月22日年假，共3天。',
    avatar: '王',
    avatarBg: 'linear-gradient(135deg, #d97706, #f59e0b)',
    urgent: false
  }
])

// AI执行相关
const aiInput = ref('')
const aiExecutionTimeline = ref([])

// 计算属性
const filteredApplications = computed(() => {
  if (activeFilter.value === 'all') {
    return applications.value
  }
  return applications.value.filter(app => app.status === activeFilter.value)
})

// 方法
function switchTab(tabId) {
  activeTab.value = tabId
}

function setFilter(filterId) {
  activeFilter.value = filterId
}

function showWorkflowStats() {
  appStore.showModal('统计分析', '工作流统计分析功能开发中...', 'info')
}

function showNewWorkflowModal() {
  appStore.showModal('新建工作流', '新建工作流功能开发中...', 'info')
}

function useTemplate(template) {
  appStore.showModal('使用模板', `正在使用模板：${template.name}`, 'info')
}

function showApplicationDetail(app) {
  appStore.showModal('申请详情', `申请详情：${app.title}`, 'info')
}

function approveRequest(approval) {
  appStore.addNotification({
    title: '审批通过',
    message: `已批准 ${approval.submitter} 的 ${approval.title}`,
    type: 'success'
  })
}

function rejectRequest(approval) {
  appStore.addNotification({
    title: '审批驳回',
    message: `已驳回 ${approval.submitter} 的 ${approval.title}`,
    type: 'error'
  })
}

function viewApprovalDetail(approval) {
  appStore.showModal('审批详情', `审批详情：${approval.title}`, 'info')
}

function viewExecutionHistory() {
  appStore.showModal('执行历史', 'AI执行历史记录', 'info')
}

function executeAITask() {
  if (!aiInput.value.trim()) {
    appStore.showModal('提示', '请输入AI执行任务描述', 'warning')
    return
  }
  
  // 模拟AI执行
  aiExecutionTimeline.value = [
    {
      title: '自动填写出差申请表',
      description: '已根据历史出差记录自动填充：目的地-上海，日期-下周三至周五，拜访客户-A公司',
      completed: true,
      time: '0.3秒'
    },
    {
      title: '提交审批流程',
      description: '已自动提交至直属领导审批，预计审批时间：2小时内',
      completed: true,
      time: '0.2秒'
    },
    {
      title: '创建差旅预支申请',
      description: '已根据公司标准自动生成差旅预支申请，金额：8000元',
      completed: true,
      time: '0.4秒'
    },
    {
      title: '预约会议室',
      description: '已预约A公司会议室，时间：下周三 14:00-17:00',
      completed: false,
      time: '0.3秒'
    }
  ]
  
  appStore.addNotification({
    title: 'AI执行完成',
    message: `已完成任务：${aiInput.value}`,
    type: 'success'
  })
  
  aiInput.value = ''
}

onMounted(() => {
  // 初始化工作流数据
})
</script>

<style scoped>
.workflow-page {
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

.workflow-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.workflow-stat-card {
  background: #fff;
  border-radius: var(--radius);
  padding: 20px;
  border: 1.5px solid var(--border);
  box-shadow: var(--shadow-xs);
  transition: all var(--tr);
}

.workflow-stat-card:hover {
  border-color: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.workflow-stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 4px;
  letter-spacing: -1px;
}

.workflow-stat-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.workflow-tabs {
  display: flex;
  gap: 4px;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  padding: 4px;
  margin-bottom: 20px;
  border: 1px solid var(--border);
  width: fit-content;
}

.workflow-tab {
  padding: 8px 20px;
  border-radius: var(--radius-xs);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--tr);
  border: none;
  background: transparent;
  font-family: inherit;
}

.workflow-tab.active {
  background: var(--primary);
  color: #fff;
  box-shadow: var(--shadow-sm);
}

.workflow-tab:not(.active):hover {
  color: var(--primary);
  background: var(--primary-50);
}

.workflow-tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  padding: 0 4px;
  margin-left: 5px;
  vertical-align: middle;
}

.tab-panel {
  margin-bottom: 24px;
}

.workflow-templates {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.workflow-template-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 22px;
  border: 1.5px solid var(--border);
  cursor: pointer;
  transition: all var(--tr);
  position: relative;
}

.workflow-template-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.template-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.template-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 21px;
}

.template-info h4 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
}

.template-info p {
  font-size: 12px;
  color: var(--text-muted);
}

.template-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed var(--border);
}

.template-usage {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.template-action {
  font-size: 12.5px;
  color: var(--primary);
  font-weight: 600;
}

.record-filters {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid var(--border);
  background: #fff;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--tr);
  font-family: inherit;
}

.filter-chip:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.filter-chip.active {
  border-color: var(--primary);
  background: var(--primary-50);
  color: var(--primary);
}

.application-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.application-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  background: var(--bg-white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  margin-bottom: 10px;
  cursor: pointer;
  transition: all var(--tr);
}

.application-item:hover {
  border-color: var(--primary-light);
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}

.application-icon {
  width: 46px;
  height: 46px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.application-info {
  flex: 1;
  min-width: 0;
}

.application-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}

.application-meta {
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  gap: 16px;
  font-weight: 500;
  flex-wrap: wrap;
}

.application-meta i {
  margin-right: 4px;
}

.application-status {
  flex-shrink: 0;
}

.status-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-pending {
  background: var(--warning-light);
  color: var(--warning);
}

.status-approved {
  background: var(--success-light);
  color: var(--success);
}

.status-rejected {
  background: var(--danger-light);
  color: var(--danger);
}

.status-processing {
  background: var(--info-light);
  color: var(--info);
}

.status-completed {
  background: var(--success-light);
  color: var(--success);
}

.status-draft {
  background: #f1f5f9;
  color: var(--text-muted);
}

.approval-inbox {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pa-card {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--border);
  padding: 20px;
  transition: all var(--tr);
  position: relative;
  overflow: hidden;
}

.pa-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--warning);
  border-radius: 4px 0 0 4px;
}

.pa-card:hover {
  border-color: var(--warning);
  box-shadow: var(--shadow);
}

.pa-card.pa-urgent::before {
  background: var(--danger);
}

.pa-card.pa-urgent {
  border-color: #fecaca;
}

.pa-card-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}

.pa-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.pa-meta {
  flex: 1;
  min-width: 0;
}

.pa-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pa-urgent-tag {
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.pa-submitter {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.pa-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  padding: 10px 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
  border-left: 3px solid var(--primary-light);
}

.pa-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pa-btn-approve {
  padding: 9px 22px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: var(--success);
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all var(--tr);
  font-family: inherit;
}

.pa-btn-approve:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5,150,105,.3);
}

.pa-btn-reject {
  padding: 9px 22px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  border: 1.5px solid var(--border);
  cursor: pointer;
  background: #fff;
  color: var(--danger);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all var(--tr);
  font-family: inherit;
}

.pa-btn-reject:hover {
  border-color: var(--danger);
  background: var(--danger-light);
  transform: translateY(-1px);
}

.pa-btn-view {
  padding: 9px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  border: 1.5px solid var(--border);
  cursor: pointer;
  background: #fff;
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all var(--tr);
  font-family: inherit;
  margin-left: auto;
}

.pa-btn-view:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-50);
}

.ai-endtoend-input {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.ai-endtoend-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  font-size: 14px;
  font-family: inherit;
  transition: all var(--tr);
}

.ai-endtoend-input input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79,70,229,.12);
}

.ai-endtoend-timeline {
  margin-top: 16px;
  padding: 20px;
  background: var(--bg-surface);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.ai-timeline-step {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);
}

.ai-timeline-step:last-child {
  border-bottom: none;
}

.ai-timeline-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.ai-timeline-content {
  flex: 1;
}

.ai-timeline-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.ai-timeline-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 6px;
}

.ai-timeline-time {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

@media (max-width: 1200px) {
  .workflow-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .workflow-templates {
    grid-template-columns: 1fr;
  }
}
</style>