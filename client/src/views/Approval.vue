<template>
  <div class="approval-page">
    <div class="page-header">
      <div class="page-title-area">
        <h2>审批中心</h2>
        <p>处理待审批事项，管理审批流程</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline" @click="showApprovalStats">
          <i class="fas fa-chart-bar"></i> 统计分析
        </button>
        <button class="btn btn-primary" @click="batchApprove">
          <i class="fas fa-check-double"></i> 批量审批
        </button>
      </div>
    </div>
    
    <div class="scroll-area">
      <!-- 审批统计 -->
      <div class="approval-stats">
        <div class="approval-stat-card">
          <div class="approval-stat-value">5</div>
          <div class="approval-stat-label">待审批</div>
        </div>
        <div class="approval-stat-card">
          <div class="approval-stat-value">23</div>
          <div class="approval-stat-label">本月已审批</div>
        </div>
        <div class="approval-stat-card">
          <div class="approval-stat-value">95%</div>
          <div class="approval-stat-label">通过率</div>
        </div>
        <div class="approval-stat-card">
          <div class="approval-stat-value">1.2天</div>
          <div class="approval-stat-label">平均处理时间</div>
        </div>
      </div>
      
      <!-- 筛选器 -->
      <div class="approval-filters">
        <button 
          v-for="filter in filters" 
          :key="filter.id"
          class="filter-chip"
          :class="{ active: activeFilter === filter.id }"
          @click="setFilter(filter.id)"
        >
          {{ filter.label }}
          <span v-if="filter.count" class="filter-count">{{ filter.count }}</span>
        </button>
      </div>
      
      <!-- 审批列表 -->
      <div class="approval-list">
        <div 
          v-for="approval in filteredApprovals" 
          :key="approval.id"
          class="approval-card"
          :class="{ urgent: approval.urgent }"
        >
          <div class="approval-card-header">
            <div class="approval-avatar" :style="{ background: approval.avatarBg }">
              {{ approval.avatar }}
            </div>
            <div class="approval-info">
              <div class="approval-title">
                {{ approval.title }}
                <span v-if="approval.urgent" class="urgent-tag">急</span>
              </div>
              <div class="approval-meta">
                <span>{{ approval.submitter }}</span>
                <span>{{ approval.submitterRole }}</span>
                <span>{{ approval.date }}</span>
              </div>
            </div>
            <div class="approval-status">
              <span class="status-badge" :class="approval.statusClass">
                {{ approval.statusText }}
              </span>
            </div>
          </div>
          
          <div class="approval-description">
            {{ approval.description }}
          </div>
          
          <div v-if="approval.amount" class="approval-amount">
            <span class="amount-label">申请金额</span>
            <span class="amount-value">¥{{ approval.amount.toLocaleString() }}</span>
          </div>
          
          <div class="approval-actions">
            <button 
              v-if="approval.status === 'pending'" 
              class="btn btn-success btn-sm" 
              @click="approveItem(approval)"
            >
              <i class="fas fa-check"></i> 批准
            </button>
            <button 
              v-if="approval.status === 'pending'" 
              class="btn btn-danger btn-sm" 
              @click="rejectItem(approval)"
            >
              <i class="fas fa-times"></i> 驳回
            </button>
            <button class="btn btn-outline btn-sm" @click="viewDetail(approval)">
              <i class="fas fa-eye"></i> 详情
            </button>
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

// 筛选器
const filters = ref([
  { id: 'all', label: '全部', count: 12 },
  { id: 'pending', label: '待审批', count: 5 },
  { id: 'approved', label: '已批准', count: 6 },
  { id: 'rejected', label: '已驳回', count: 1 }
])

const activeFilter = ref('all')

// 审批数据
const approvals = ref([
  {
    id: 1,
    title: '上海出差申请',
    submitter: '张明辉',
    submitterRole: '销售经理',
    description: '申请6月15日至6月25日前往上海拜访客户A公司，预计费用12000元。',
    amount: 12000,
    status: 'pending',
    statusText: '待审批',
    statusClass: 'status-pending',
    urgent: true,
    date: '2026-05-27',
    avatar: '张',
    avatarBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
  },
  {
    id: 2,
    title: '设备采购申请',
    submitter: '陈思雨',
    submitterRole: '前端开发',
    description: '申请采购MacBook Pro M3 Max一台，用于前端开发工作。',
    amount: 25000,
    status: 'pending',
    statusText: '待审批',
    statusClass: 'status-pending',
    urgent: false,
    date: '2026-05-26',
    avatar: '陈',
    avatarBg: 'linear-gradient(135deg, #059669, #10b981)'
  },
  {
    id: 3,
    title: '请假申请',
    submitter: '王丽华',
    submitterRole: '产品经理',
    description: '申请6月20日至6月22日年假，共3天。',
    amount: null,
    status: 'pending',
    statusText: '待审批',
    statusClass: 'status-pending',
    urgent: false,
    date: '2026-05-25',
    avatar: '王',
    avatarBg: 'linear-gradient(135deg, #d97706, #f59e0b)'
  },
  {
    id: 4,
    title: 'Q2季度费用报销',
    submitter: '李文静',
    submitterRole: '销售代表',
    description: '报销Q2季度差旅费用，包含交通、住宿和餐饮。',
    amount: 8500,
    status: 'approved',
    statusText: '已批准',
    statusClass: 'status-approved',
    urgent: false,
    date: '2026-05-24',
    avatar: '李',
    avatarBg: 'linear-gradient(135deg, #2563eb, #3b82f6)'
  },
  {
    id: 5,
    title: '加班申请',
    submitter: '赵海涛',
    submitterRole: '前端开发',
    description: '申请5月28日晚加班，完成客户演示PPT。',
    amount: null,
    status: 'rejected',
    statusText: '已驳回',
    statusClass: 'status-rejected',
    urgent: false,
    date: '2026-05-23',
    avatar: '赵',
    avatarBg: 'linear-gradient(135deg, #dc2626, #ef4444)'
  }
])

// 计算属性
const filteredApprovals = computed(() => {
  if (activeFilter.value === 'all') {
    return approvals.value
  }
  return approvals.value.filter(a => a.status === activeFilter.value)
})

// 方法
function setFilter(filterId) {
  activeFilter.value = filterId
}

function showApprovalStats() {
  appStore.showModal('统计分析', '审批统计分析功能开发中...', 'info')
}

function batchApprove() {
  appStore.showModal('批量审批', '批量审批功能开发中...', 'info')
}

function approveItem(approval) {
  approval.status = 'approved'
  approval.statusText = '已批准'
  approval.statusClass = 'status-approved'
  
  appStore.addNotification({
    title: '审批通过',
    message: `已批准 ${approval.submitter} 的 ${approval.title}`,
    type: 'success'
  })
}

function rejectItem(approval) {
  approval.status = 'rejected'
  approval.statusText = '已驳回'
  approval.statusClass = 'status-rejected'
  
  appStore.addNotification({
    title: '审批驳回',
    message: `已驳回 ${approval.submitter} 的 ${approval.title}`,
    type: 'error'
  })
}

function viewDetail(approval) {
  appStore.showModal('审批详情', `审批详情：${approval.title}`, 'info')
}

onMounted(() => {
  // 初始化审批数据
})
</script>

<style scoped>
.approval-page {
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

.approval-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.approval-stat-card {
  background: #fff;
  border-radius: var(--radius);
  padding: 20px;
  border: 1.5px solid var(--border);
  box-shadow: var(--shadow-xs);
  transition: all var(--tr);
}

.approval-stat-card:hover {
  border-color: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.approval-stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 4px;
  letter-spacing: -1px;
}

.approval-stat-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.approval-filters {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
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
  display: flex;
  align-items: center;
  gap: 6px;
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

.filter-count {
  background: var(--danger);
  color: #fff;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.approval-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.approval-card {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--border);
  padding: 20px;
  transition: all var(--tr);
  position: relative;
  overflow: hidden;
}

.approval-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--warning);
  border-radius: 4px 0 0 4px;
}

.approval-card:hover {
  border-color: var(--warning);
  box-shadow: var(--shadow);
}

.approval-card.urgent::before {
  background: var(--danger);
}

.approval-card.urgent {
  border-color: #fecaca;
}

.approval-card-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}

.approval-avatar {
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

.approval-info {
  flex: 1;
  min-width: 0;
}

.approval-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.urgent-tag {
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.approval-meta {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.approval-status {
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

.approval-description {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  padding: 10px 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
  border-left: 3px solid var(--primary-light);
}

.approval-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--primary-50), #e0e7ff);
  border: 1.5px solid var(--primary-light);
  border-radius: var(--radius);
  margin-bottom: 16px;
}

.amount-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.amount-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--primary);
}

.approval-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

@media (max-width: 1200px) {
  .approval-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>