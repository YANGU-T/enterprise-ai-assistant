<template>
  <div class="bid-workbench-page">
    <!-- 顶部标题栏 -->
    <div class="workbench-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i>
          <span>返回</span>
        </button>
        <div class="header-title">
          <i class="fas fa-th-list"></i>
          <span>业务概览</span>
        </div>
      </div>
      <button class="export-btn" @click="handleExport">
        <span>导出</span>
      </button>
    </div>

    <!-- 指标卡片 -->
    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-icon orange"><i class="fas fa-bullhorn"></i></div>
        <div class="metric-info">
          <div class="metric-label">商机总数</div>
          <div class="metric-value">{{ formatNumber(metrics.totalOpps) }} <span class="metric-unit">个</span></div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon blue"><i class="fas fa-link"></i></div>
        <div class="metric-info">
          <div class="metric-label">匹配总数</div>
          <div class="metric-value">{{ metrics.matchCount }} <span class="metric-unit">个</span></div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon purple"><i class="fas fa-chart-line"></i></div>
        <div class="metric-info">
          <div class="metric-label">ROI价值</div>
          <div class="metric-value">{{ metrics.roi }} <span class="metric-unit">人天</span></div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon red"><i class="fas fa-yen-sign"></i></div>
        <div class="metric-info">
          <div class="metric-label">项目金额</div>
          <div class="metric-value">{{ formatAmount(metrics.totalAmount) }} <span class="metric-unit">元</span></div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon green"><i class="fas fa-percentage"></i></div>
        <div class="metric-info">
          <div class="metric-label">匹配率</div>
          <div class="metric-value">{{ metrics.matchRate }} <span class="metric-unit">%</span></div>
        </div>
      </div>
    </div>

    <!-- 招标信息全流程跟踪 -->
    <div class="tracking-section">
      <div class="section-header">
        <i class="fas fa-tasks"></i>
        <span>招标信息全流程跟踪</span>
        <span class="tracking-count">共 {{ trackingList.length }} 条</span>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-tabs">
          <button 
            v-for="tab in statusTabs" 
            :key="tab.value" 
            :class="['tab-btn', { active: activeTab === tab.value }]"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
            <span class="tab-count">{{ getStatusCount(tab.value) }}</span>
          </button>
        </div>
      </div>

      <!-- 跟踪列表 -->
      <div class="tracking-list">
        <div v-for="item in filteredList" :key="item.id" class="tracking-item" @click="viewDetail(item)">
          <div class="tracking-status" :class="item.status">
            <i :class="getStatusIcon(item.status)"></i>
          </div>
          <div class="tracking-info">
            <div class="tracking-title">{{ item.title }}</div>
            <div class="tracking-meta">
              <span><i class="fas fa-building"></i> {{ item.company }}</span>
              <span><i class="fas fa-coins"></i> {{ item.budget }}</span>
              <span><i class="fas fa-map-marker-alt"></i> {{ item.region }}</span>
            </div>
            <div class="tracking-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: getProgressWidth(item.status) }"></div>
              </div>
              <span class="progress-text">{{ getStatusLabel(item.status) }}</span>
            </div>
          </div>
          <div class="tracking-time">
            <div class="time-label">截止日期</div>
            <div class="time-value">{{ item.deadline }}</div>
            <div class="time-remain" :class="{ urgent: isUrgent(item.deadline) }">
              {{ getRemainDays(item.deadline) }}
            </div>
          </div>
          <div class="tracking-actions">
            <button class="action-dot" @click.stop="toggleActions(item.id)">
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <div v-if="activeActions === item.id" class="action-menu" @click.stop>
              <button @click="updateStatus(item, 'contacted')"><i class="fas fa-phone"></i> 已联系</button>
              <button @click="updateStatus(item, 'bidding')"><i class="fas fa-file-alt"></i> 制作标书</button>
              <button @click="updateStatus(item, 'submitted')"><i class="fas fa-paper-plane"></i> 已投标</button>
              <button @click="updateStatus(item, 'won')"><i class="fas fa-trophy"></i> 已中标</button>
              <button class="danger" @click="updateStatus(item, 'lost')"><i class="fas fa-times"></i> 未中标</button>
            </div>
          </div>
        </div>

        <div v-if="filteredList.length === 0" class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>暂无{{ activeTab === 'all' ? '' : statusTabs.find(t => t.value === activeTab)?.label }}跟踪记录</p>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetail" class="detail-overlay" @click.self="showDetail = false">
      <div class="detail-modal">
        <div class="detail-header">
          <h3>商机详情</h3>
          <button @click="showDetail = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="detail-body" v-if="selectedItem">
          <div class="detail-title">
            <h2>{{ selectedItem.title }}</h2>
            <span class="match-score" :class="getScoreLevel(selectedItem.score)">{{ selectedItem.score }}%</span>
          </div>
          <div class="detail-grid">
            <div class="detail-cell"><label>招标单位</label><p>{{ selectedItem.company }}</p></div>
            <div class="detail-cell"><label>预算金额</label><p>{{ selectedItem.budget }}</p></div>
            <div class="detail-cell"><label>所在地区</label><p>{{ selectedItem.region }}</p></div>
            <div class="detail-cell"><label>截止日期</label><p>{{ selectedItem.deadline }}</p></div>
            <div class="detail-cell"><label>当前状态</label><p><span class="status-badge" :class="selectedItem.status">{{ getStatusLabel(selectedItem.status) }}</span></p></div>
            <div class="detail-cell"><label>匹配度</label><p>{{ selectedItem.score }}%</p></div>
          </div>
          <div class="detail-tags">
            <span v-for="tag in selectedItem.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
        <div class="detail-footer">
          <button class="action-btn" @click="showDetail = false">关闭</button>
          <button class="action-btn primary" @click="goToBidDoc"><i class="fas fa-file-alt"></i> 制作标书</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

// 指标数据
const metrics = ref({
  totalOpps: 0,
  matchCount: 0,
  roi: 0,
  totalAmount: 0,
  matchRate: 0
})

// 跟踪列表
const trackingList = ref([])

// 状态筛选
const activeTab = ref('all')
const statusTabs = [
  { value: 'all', label: '全部' },
  { value: 'new', label: '新发现' },
  { value: 'contacted', label: '已联系' },
  { value: 'bidding', label: '制作中' },
  { value: 'submitted', label: '已投标' },
  { value: 'won', label: '已中标' },
  { value: 'lost', label: '未中标' }
]

// 操作菜单
const activeActions = ref(null)

// 详情弹窗
const showDetail = ref(false)
const selectedItem = ref(null)

// 人工每日筛选条数（ROI计算基数）
const MANUAL_DAILY_COUNT = 20

onMounted(() => {
  // 从路由参数获取数据
  const queryData = route.query.data
  if (queryData) {
    try {
      const data = JSON.parse(decodeURIComponent(queryData))
      initFromData(data)
    } catch (e) {
      console.error('解析数据失败:', e)
      useDefaultData()
    }
  } else {
    useDefaultData()
  }
})

function initFromData(data) {
  const results = data.results || []
  const totalOpps = data.totalOpps || 746
  
  // 计算匹配总数
  const matchCount = results.length || 17
  
  // 计算项目金额（解析预算字符串）
  let totalAmount = 0
  results.forEach(r => {
    const budgetStr = r.budget || ''
    const match = budgetStr.match(/(\d+)-(\d+)/)
    if (match) {
      totalAmount += (parseInt(match[1]) + parseInt(match[2])) / 2 * 10000
    }
  })
  if (totalAmount === 0) totalAmount = 3961320
  
  // ROI = 匹配商机条数 ÷ 人工每日筛选条数
  const roi = (matchCount / MANUAL_DAILY_COUNT).toFixed(1)
  
  // 匹配率
  const matchRate = ((matchCount / totalOpps) * 100).toFixed(2)
  
  metrics.value = {
    totalOpps,
    matchCount,
    roi: parseFloat(roi),
    totalAmount,
    matchRate: parseFloat(matchRate)
  }
  
  // 构建跟踪列表
  trackingList.value = results.map((r, index) => ({
    id: r.id || index + 1,
    title: r.title,
    company: r.company,
    budget: r.budget,
    region: r.region,
    score: r.score,
    level: r.level,
    tags: r.tags || [],
    deadline: r.deadline,
    status: 'new'
  }))
}

function useDefaultData() {
  // 默认示例数据
  metrics.value = {
    totalOpps: 746,
    matchCount: 17,
    roi: 0.8,
    totalAmount: 3961320,
    matchRate: 2.28
  }
  
  trackingList.value = [
    { id: 1, title: 'XX市智慧政务平台（三期）建设项目', company: 'XX市政务服务管理局', budget: '500-600万', region: '北京', score: 95, level: 'high', tags: ['IT信息化', '政府项目', '智慧城市'], deadline: '2025-07-15', status: 'new' },
    { id: 2, title: '企业数字化转型咨询与实施项目', company: '某大型国有企业集团', budget: '200-300万', region: '上海', score: 88, level: 'high', tags: ['数字化转型', '咨询服务'], deadline: '2025-06-30', status: 'contacted' },
    { id: 3, title: '区域医疗信息化系统升级改造', company: '某省级三甲医院', budget: '350-400万', region: '广州', score: 75, level: 'medium', tags: ['医疗信息化', '系统集成'], deadline: '2025-08-01', status: 'bidding' },
    { id: 4, title: '教育培训云平台开发项目', company: '某教育科技集团', budget: '150-200万', region: '深圳', score: 62, level: 'medium', tags: ['教育平台', '云服务'], deadline: '2025-07-20', status: 'submitted' },
    { id: 5, title: '大数据分析平台搭建项目', company: '某省级大数据局', budget: '800-1000万', region: '杭州', score: 56, level: 'low', tags: ['大数据', '数据分析'], deadline: '2025-08-15', status: 'new' }
  ]
}

// 筛选后的列表
const filteredList = computed(() => {
  if (activeTab.value === 'all') return trackingList.value
  return trackingList.value.filter(item => item.status === activeTab.value)
})

// 获取各状态数量
function getStatusCount(status) {
  if (status === 'all') return trackingList.value.length
  return trackingList.value.filter(item => item.status === status).length
}

// 状态标签
function getStatusLabel(status) {
  const labels = {
    new: '新发现',
    contacted: '已联系',
    bidding: '制作中',
    submitted: '已投标',
    won: '已中标',
    lost: '未中标'
  }
  return labels[status] || status
}

// 状态图标
function getStatusIcon(status) {
  const icons = {
    new: 'fas fa-sparkles',
    contacted: 'fas fa-phone',
    bidding: 'fas fa-file-alt',
    submitted: 'fas fa-paper-plane',
    won: 'fas fa-trophy',
    lost: 'fas fa-times-circle'
  }
  return icons[status] || 'fas fa-circle'
}

// 进度条宽度
function getProgressWidth(status) {
  const widths = {
    new: '20%',
    contacted: '40%',
    bidding: '60%',
    submitted: '80%',
    won: '100%',
    lost: '100%'
  }
  return widths[status] || '0%'
}

// 格式化数字
function formatNumber(num) {
  return num.toLocaleString()
}

// 格式化金额
function formatAmount(amount) {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 获取分数等级
function getScoreLevel(score) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

// 计算剩余天数
function getRemainDays(deadline) {
  const now = new Date()
  const end = new Date(deadline)
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  if (diff < 0) return '已过期'
  if (diff === 0) return '今天截止'
  return `剩余 ${diff} 天`
}

// 是否紧急（7天内）
function isUrgent(deadline) {
  const now = new Date()
  const end = new Date(deadline)
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  return diff <= 7 && diff >= 0
}

// 切换操作菜单
function toggleActions(id) {
  activeActions.value = activeActions.value === id ? null : id
}

// 更新状态
function updateStatus(item, status) {
  item.status = status
  activeActions.value = null
  appStore.showModal('状态更新', `"${item.title}" 状态已更新为 ${getStatusLabel(status)}`, 'success')
}

// 查看详情
function viewDetail(item) {
  selectedItem.value = item
  showDetail.value = true
}

// 跳转制作标书
function goToBidDoc() {
  if (!selectedItem.value) return
  const bidData = {
    bidInfo: {
      projectName: selectedItem.value.title,
      bidType: 'tech',
      bidTypeName: '技术标书',
      company: selectedItem.value.company,
      createTime: new Date().toLocaleString(),
      extra: ''
    }
  }
  router.push({
    path: '/agent/bid-doc-editor',
    query: { data: encodeURIComponent(JSON.stringify(bidData)) }
  })
}

// 返回上一级
function goBack() {
  router.push('/agent/bid-matching')
}

// 导出
function handleExport() {
  appStore.showModal('导出', '招标跟踪数据导出功能开发中...', 'info')
}

// 关闭操作菜单
document.addEventListener('click', () => {
  activeActions.value = null
})
</script>

<style scoped>
.bid-workbench-page {
  padding: 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 顶部标题栏 */
.workbench-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.header-title i {
  color: #6b7280;
  font-size: 16px;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: #1f2937;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.export-btn:hover {
  background: #374151;
}

/* 指标卡片 */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 12px;
  padding: 20px 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid #f3f4f6;
}

.metric-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
  flex-shrink: 0;
}

.metric-icon.orange { background: linear-gradient(135deg, #f97316, #fb923c); }
.metric-icon.blue { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
.metric-icon.purple { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }
.metric-icon.red { background: linear-gradient(135deg, #ef4444, #f87171); }
.metric-icon.green { background: linear-gradient(135deg, #10b981, #34d399); }

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.metric-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.metric-unit {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 400;
  margin-left: 2px;
}

/* 全流程跟踪 */
.tracking-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid #f3f4f6;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.section-header i {
  color: #6b7280;
  font-size: 14px;
}

.tracking-count {
  margin-left: auto;
  font-size: 13px;
  color: #9ca3af;
  font-weight: 400;
}

/* 筛选栏 */
.filter-bar {
  margin-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 12px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #f3f4f6;
  color: #4b5563;
}

.tab-btn.active {
  background: #1f2937;
  border-color: #1f2937;
  color: #fff;
}

.tab-count {
  font-size: 11px;
  background: rgba(0,0,0,0.1);
  padding: 1px 6px;
  border-radius: 10px;
}

.tab-btn.active .tab-count {
  background: rgba(255,255,255,0.2);
}

/* 跟踪列表 */
.tracking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tracking-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 10px;
  border: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s;
}

.tracking-item:hover {
  background: #fff;
  border-color: #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.tracking-status {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #fff;
  flex-shrink: 0;
}

.tracking-status.new { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
.tracking-status.contacted { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.tracking-status.bidding { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }
.tracking-status.submitted { background: linear-gradient(135deg, #10b981, #34d399); }
.tracking-status.won { background: linear-gradient(135deg, #22c55e, #4ade80); }
.tracking-status.lost { background: linear-gradient(135deg, #9ca3af, #bdc3c7); }

.tracking-info {
  flex: 1;
  min-width: 0;
}

.tracking-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tracking-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 10px;
}

.tracking-meta i {
  margin-right: 4px;
}

.tracking-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 2px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.tracking-time {
  text-align: right;
  min-width: 100px;
}

.time-label {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.time-value {
  font-size: 13px;
  color: #4b5563;
  font-weight: 500;
}

.time-remain {
  font-size: 12px;
  color: #10b981;
  margin-top: 4px;
}

.time-remain.urgent {
  color: #ef4444;
  font-weight: 600;
}

.tracking-actions {
  position: relative;
}

.action-dot {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-dot:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.action-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 10;
  min-width: 140px;
  padding: 4px;
}

.action-menu button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.action-menu button:hover {
  background: #f3f4f6;
}

.action-menu button.danger {
  color: #ef4444;
}

.action-menu button.danger:hover {
  background: #fef2f2;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.empty-state p {
  font-size: 14px;
}

/* 详情弹窗 */
.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.detail-modal {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.detail-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.detail-header button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-body {
  padding: 24px;
}

.detail-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.detail-title h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  margin-right: 16px;
}

.match-score {
  font-size: 24px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
  flex-shrink: 0;
}

.match-score.high { background: #dcfce7; color: #16a34a; }
.match-score.medium { background: #fef3c7; color: #d97706; }
.match-score.low { background: #fee2e2; color: #dc2626; }

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.detail-cell label {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.detail-cell p {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.status-badge.new { background: #dbeafe; color: #2563eb; }
.status-badge.contacted { background: #fef3c7; color: #d97706; }
.status-badge.bidding { background: #ede9fe; color: #7c3aed; }
.status-badge.submitted { background: #d1fae5; color: #059669; }
.status-badge.won { background: #dcfce7; color: #16a34a; }
.status-badge.lost { background: #f3f4f6; color: #6b7280; }

.detail-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 12px;
  color: #4b5563;
}

.detail-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.action-btn.primary {
  background: #1f2937;
  border-color: #1f2937;
  color: #fff;
}

.action-btn.primary:hover {
  background: #374151;
}

/* 响应式 */
@media (max-width: 1200px) {
  .metrics-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .tracking-meta {
    flex-wrap: wrap;
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .bid-workbench-page {
    padding: 16px;
  }
  .metrics-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .tracking-item {
    flex-wrap: wrap;
  }
  .tracking-time {
    min-width: auto;
    text-align: left;
  }
  .detail-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
