<template>
  <div class="workbench">
    <!-- 主内容 -->
    <main class="wb-main wb-main--full">
      <!-- 统计概览 -->
      <div class="overview-row">
        <div class="panel">
          <div class="panel-hd">
            <h4>任务总量</h4>
            <span>已处理 {{ totalTasksCount }} 项</span>
          </div>
          <div class="panel-bd metrics">
            <div class="m-item">
              <div class="m-icon pending"><i class="fas fa-clock"></i></div>
              <div class="m-val">{{ pendingCount }}</div>
              <div class="m-label">待处理</div>
            </div>
            <div class="m-item">
              <div class="m-icon progress"><i class="fas fa-spinner"></i></div>
              <div class="m-val">{{ progressCount }}</div>
              <div class="m-label">进行中</div>
            </div>
            <div class="m-item">
              <div class="m-icon completed"><i class="fas fa-check-circle"></i></div>
              <div class="m-val">{{ completedCount }}</div>
              <div class="m-label">已完成</div>
            </div>
          </div>
        </div>
        <div class="panel today">
          <div class="panel-hd">
            <h4>今日概览</h4>
            <span>{{ todayDate }}</span>
          </div>
          <div class="panel-bd metrics">
            <div class="m-item">
              <div class="m-icon ai"><i class="fas fa-calendar-day"></i></div>
              <div class="m-val">{{ todayScheduleCount }}</div>
              <div class="m-label">今日日程</div>
            </div>
            <div class="m-item">
              <div class="m-icon progress"><i class="fas fa-tasks"></i></div>
              <div class="m-val">{{ todayTaskCount }}</div>
              <div class="m-label">今日任务</div>
            </div>
            <div class="m-item">
              <div class="m-icon ai"><i class="fas fa-robot"></i></div>
              <div class="m-val">{{ aiAssistedCount }}</div>
              <div class="m-label">AI辅助</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容区 -->
      <div class="content-row">
        <div class="content-left">
          <!-- 任务 -->
          <div class="dcard">
            <div class="dcard-hd">
              <h4><i class="fas fa-tasks"></i> 我的任务</h4>
              <div class="filters-mini">
                <button v-for="f in filters" :key="f.value" :class="{ active: filter === f.value }" @click="filter = f.value">{{ f.label }}</button>
              </div>
            </div>
            <div class="dcard-bd">
              <div v-for="task in filteredTasks" :key="task.id" class="list-item task">
                <input type="checkbox" :checked="task.done" @change="toggleTaskDone(task)">
                <div class="li-body" @click="jumpToTask(task)">
                  <div class="li-title" :class="{ done: task.done }">{{ task.title }}</div>
                  <div class="li-meta">
                    <span class="priority" :class="task.priority">{{ priorityText(task.priority) }}</span>
                    <span class="deadline"><i class="fas fa-clock"></i> {{ task.deadline }}</span>
                    <span v-if="task.agent" class="agent-tag"><i class="fas fa-robot"></i> {{ task.agent }}</span>
                  </div>
                </div>
                <button class="li-del" @click="deleteTask(task.id)"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>

          <!-- AI建议 -->
          <div class="dcard ai">
            <div class="dcard-hd">
              <h4><i class="fas fa-lightbulb"></i> AI 建议</h4>
              <span class="live">实时</span>
            </div>
            <div class="dcard-bd">
              <div v-if="suggestions.length === 0" class="empty"><i class="fas fa-robot"></i><p>暂无AI建议</p><span>添加任务和日程后，AI将自动生成关联建议</span></div>
              <div v-for="s in suggestions" :key="s.id" class="sug-item">
                <div class="sug-icon"><i :class="s.icon"></i></div>
                <div class="sug-body" @click="jumpToSuggestion(s)">
                  <div class="sug-title">{{ s.title }}</div>
                  <div class="sug-desc">{{ s.desc }}</div>
                  <div class="sug-actions"><button @click.stop="acceptSuggestion(s)">采纳</button><button class="secondary" @click.stop="ignoreSuggestion(s)">忽略</button></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="content-right">
          <!-- 日历 + 日程 -->
          <div class="dcard cal">
            <div class="dcard-hd">
              <h4><i class="fas fa-calendar-alt"></i> {{ currentMonthLabel }}</h4>
              <div class="cal-hd-right">
                <button class="btn-mini" @click="openScheduleModal"><i class="fas fa-plus"></i> 添加日程</button>
                <div class="cal-nav">
                  <button @click="changeMonth(-1)"><i class="fas fa-chevron-left"></i></button>
                  <button @click="changeMonth(1)"><i class="fas fa-chevron-right"></i></button>
                </div>
              </div>
            </div>
            <div class="cal-grid">
              <div class="cal-wd"><span v-for="d in weekDays" :key="d">{{ d }}</span></div>
              <div class="cal-days">
                <span v-for="d in calendarDays" :key="d.key"
                  :class="{ other: d.other, today: d.today, event: d.hasEvent, active: d.selected }"
                  >{{ d.day }}</span>
              </div>
            </div>
            <div class="cal-schedule-section">
              <div class="cal-schedule-hd">
                <span>{{ selectedDateLabel }} 日程</span>
                <strong>{{ selectedDateSchedules.length }} 项</strong>
              </div>
              <div class="cal-schedule-list">
                <div v-if="selectedDateSchedules.length === 0" class="empty small"><i class="fas fa-calendar"></i><p>该日暂无日程</p></div>
                <div v-for="s in selectedDateSchedules" :key="s.id" class="schedule-row" @click="viewSchedule(s)">
                  <span class="sch-time">{{ s.time }}</span>
                  <div class="sch-body">
                    <div class="sch-title">{{ s.title }}</div>
                    <div class="sch-meta"><span class="tag">{{ s.type }}</span><span v-if="s.aiHint" class="ai-tag"><i class="fas fa-robot"></i> AI建议</span></div>
                  </div>
                  <span class="pill" :class="s.status">{{ statusText(s.status) }}</span>
                  <button class="li-del" @click.stop="deleteSchedule(s.id)"><i class="fas fa-trash"></i></button>
                </div>
              </div>
            </div>
          </div>

          <!-- 工作流 -->
          <div class="dcard">
            <div class="dcard-hd">
              <h4><i class="fas fa-project-diagram"></i> AI助手工作流</h4>
              <span class="badge pink">闭环</span>
            </div>
            <div class="dcard-bd compact">
              <div class="wf-step" @click="router.push('/agent/bid-matching')">
                <div class="wf-num">1</div>
                <div class="wf-icon" style="background:#f59e0b"><i class="fas fa-search-dollar"></i></div>
                <div class="wf-txt"><div class="wf-title">招投标匹配</div><div class="wf-desc">智能匹配招标项目</div></div>
                <i class="fas fa-chevron-right"></i>
              </div>
              <div class="wf-conn"><i class="fas fa-arrow-down"></i></div>
              <div class="wf-step" @click="router.push('/agent/solution-gen')">
                <div class="wf-num">2</div>
                <div class="wf-icon" style="background:#059669"><i class="fas fa-file-invoice"></i></div>
                <div class="wf-txt"><div class="wf-title">解决方案生成</div><div class="wf-desc">生成投标方案文档</div></div>
                <i class="fas fa-chevron-right"></i>
              </div>
              <div class="wf-conn"><i class="fas fa-arrow-down"></i></div>
              <div class="wf-step" @click="router.push('/agent/contract-assistant')">
                <div class="wf-num">3</div>
                <div class="wf-icon" style="background:#ec4899"><i class="fas fa-file-contract"></i></div>
                <div class="wf-txt"><div class="wf-title">AI合同助手</div><div class="wf-desc">生成与审查合同</div></div>
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>
          </div>

          <!-- 制品 -->
          <div class="dcard art">
            <div class="dcard-hd">
              <h4><i class="fas fa-box-open"></i> 我的制品</h4>
              <span class="badge blue" v-if="artifacts.length">{{ artifacts.length }}</span>
            </div>
            <div class="dcard-bd">
              <div v-if="artifacts.length === 0" class="empty small"><i class="fas fa-folder-open"></i><p>暂无生成制品</p></div>
              <div v-else class="mini-list">
                <div v-for="item in artifacts" :key="item.id" class="mini-item" @click="openArtifact(item)">
                  <div class="mini-icon" :class="item.type"><i :class="item.type === 'solution' ? 'fas fa-file-invoice' : item.type === 'contract' ? 'fas fa-file-contract' : 'fas fa-file-alt'"></i></div>
                  <div class="mini-info"><div class="mini-name">{{ item.name }}</div><div class="mini-meta"><span :class="item.type">{{ item.typeName }}</span><span>{{ item.time }}</span></div></div>
                  <i class="fas fa-chevron-right"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- 推荐 -->
          <div class="dcard">
            <div class="dcard-hd">
              <h4><i class="fas fa-robot"></i> 推荐工具</h4>
              <button class="view-all" @click="router.push('/agents')">查看全部</button>
            </div>
            <div class="dcard-bd compact">
              <div v-for="a in agents" :key="a.id" class="mini-item" @click="useAgent(a)">
                <div class="mini-icon" :style="{ background: a.color }"><i :class="a.icon"></i></div>
                <div class="mini-info"><div class="mini-name">{{ a.name }}</div><div class="mini-desc">{{ a.desc }}</div></div>
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 日程添加弹窗 -->
    <div class="schedule-modal-overlay" v-if="showAddModal" @click.self="showAddModal = false">
      <div class="schedule-modal">
        <div class="schedule-modal-header">
          <h3><i class="fas fa-calendar-plus"></i> 添加日程</h3>
          <button class="modal-close-btn" @click="showAddModal = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="schedule-modal-body">
          <div class="form-group">
            <label>日程标题</label>
            <input v-model="newSchedule.title" type="text" placeholder="输入日程标题">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>日期</label>
              <input v-model="newSchedule.date" type="date">
            </div>
            <div class="form-group">
              <label>时间</label>
              <input v-model="newSchedule.time" type="time">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>类型</label>
              <select v-model="newSchedule.type">
                <option value="会议">会议</option>
                <option value="任务">任务</option>
                <option value="沟通">沟通</option>
                <option value="文档">文档</option>
                <option value="AI创建">AI创建</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>备注（选填）</label>
            <textarea v-model="newSchedule.note" placeholder="输入备注信息..." rows="3"></textarea>
          </div>
          <div class="ai-link-section">
            <div class="ai-link-header">
              <i class="fas fa-robot"></i>
              <span>AI对话创建</span>
            </div>
            <p class="ai-link-desc">通过AI对话自动分析并创建日程</p>
            <button class="ai-link-btn" @click="goToAIChatForSchedule">
              <i class="fas fa-comments"></i> 前往AI对话创建日程
            </button>
          </div>
        </div>
        <div class="schedule-modal-footer">
          <button class="cancel-btn" @click="showAddModal = false">取消</button>
          <button class="save-btn" @click="addSchedule"><i class="fas fa-plus"></i> 添加日程</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'
import { cache, CACHE_KEYS, restoreAllFromServer } from '@/utils/cache'

const router = useRouter()
const appStore = useAppStore()
const filter = ref('all')
const showAddModal = ref(false)

// 日历相关
const calDate = ref(new Date())
const selectedDate = ref(new Date())
const weekDays = ['日','一','二','三','四','五','六']

const currentMonthLabel = computed(() => `${calDate.value.getFullYear()}年${calDate.value.getMonth() + 1}月`)
const todayDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})
const totalTasksCount = computed(() => tasks.value.length)
const todayScheduleCount = computed(() => schedules.value.filter(s => isSameDay(s.date, new Date())).length)
const todayTaskCount = computed(() => tasks.value.filter(t => t.status !== 'done').length)
const monthEventCount = computed(() => schedules.value.filter(s => {
  const d = parseDate(s.date)
  return d && d.getFullYear() === calDate.value.getFullYear() && d.getMonth() === calDate.value.getMonth()
}).length)

const selectedDateLabel = computed(() => {
  const d = selectedDate.value
  const today = new Date()
  if (isSameDay(d, today)) return '今日'
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

const selectedDateSchedules = computed(() => {
  return schedules.value.filter(s => isSameDay(s.date, selectedDate.value))
})

function parseDate(dateStr) {
  if (!dateStr) return null
  const parts = dateStr.split('-')
  if (parts.length === 3) return new Date(+parts[0], +parts[1] - 1, +parts[2])
  return null
}

function isSameDay(dateStr, date) {
  if (!dateStr) return false
  const d = parseDate(dateStr)
  if (!d) return false
  return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate()
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function changeMonth(delta) {
  const d = new Date(calDate.value)
  d.setMonth(d.getMonth() + delta)
  calDate.value = d
}

function selectDate(dayInfo) {
  if (dayInfo.other) return
  const year = calDate.value.getFullYear()
  const month = calDate.value.getMonth()
  selectedDate.value = new Date(year, month, dayInfo.day)
}

const calendarDays = computed(() => {
  const year = calDate.value.getFullYear()
  const month = calDate.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDays = new Date(year, month, 0).getDate()
  const today = new Date()
  const sel = selectedDate.value
  const result = []
  for (let i = firstDay - 1; i >= 0; i--) {
    result.push({ key: `p${i}`, day: prevDays - i, other: true, today: false, hasEvent: false, selected: false })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = year === today.getFullYear() && month === today.getMonth() && i === today.getDate()
    const isSelected = year === sel.getFullYear() && month === sel.getMonth() && i === sel.getDate()
    const dateStr = formatDate(new Date(year, month, i))
    const hasEvent = schedules.value.some(s => isSameDay(s.date, new Date(year, month, i)))
    result.push({ key: `c${i}`, day: i, other: false, today: isToday, hasEvent, selected: isSelected })
  }
  const remain = 42 - result.length
  for (let i = 1; i <= remain; i++) {
    result.push({ key: `n${i}`, day: i, other: true, today: false, hasEvent: false, selected: false })
  }
  return result
})
const newSchedule = ref({
  title: '',
  time: '',
  date: formatDate(new Date()),
  type: '任务',
  note: ''
})

const filters = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: 'pending' },
  { label: '进行中', value: 'progress' },
  { label: '已完成', value: 'done' }
]

const defaultSchedules = [
  { id: 1, time: '09:00', date: formatDate(new Date()), title: '项目进度评审会议', type: '会议', status: 'done', aiHint: true },
  { id: 2, time: '10:30', date: formatDate(new Date()), title: '完成AI对话模块开发', type: '任务', status: 'progress', aiHint: false },
  { id: 3, time: '14:00', date: formatDate(new Date()), title: '与新锋沟通功能清单', type: '沟通', status: 'pending', aiHint: true },
  { id: 4, time: '16:00', date: formatDate(new Date()), title: '代码审查', type: '任务', status: 'pending', aiHint: false },
  { id: 5, time: '17:30', date: formatDate(new Date()), title: '整理本周工作周报', type: '文档', status: 'pending', aiHint: true }
]

const defaultTasks = [
  { id: 1, title: '完成企业AI助手前端重构', priority: 'high', status: 'progress', done: false, deadline: '今天 18:00', agent: '代码助手' },
  { id: 2, title: '输出基础设施健康度评估PPT', priority: 'high', status: 'progress', done: false, deadline: '明天 12:00', agent: '文档生成' },
  { id: 3, title: '整理招投标AI助理功能清单', priority: 'medium', status: 'pending', done: false, deadline: '本周五', agent: null },
  { id: 4, title: '准备项目中期汇报材料', priority: 'medium', status: 'progress', done: false, deadline: '下周一', agent: '数据分析' },
  { id: 5, title: '修复登录页面样式问题', priority: 'low', status: 'done', done: true, deadline: '已完成', agent: null }
]

const schedules = ref(loadSchedules())

const tasks = ref(loadTasks())

// 生成制品展示
const artifacts = ref(loadArtifacts())

function loadArtifacts() {
  const items = []

  // 加载解决方案历史
  try {
    const saved = localStorage.getItem('solution_gen_history')
    if (saved) {
      const solutions = JSON.parse(saved)
      for (const sol of solutions) {
        items.push({
          id: `sol-${sol.generatedAt || sol.time}`,
          type: 'solution',
          typeName: '解决方案',
          name: sol.name || '未命名方案',
          industry: sol.industry,
          time: sol.time,
          data: sol
        })
      }
    }
  } catch (e) { /* ignore */ }

  // 加载标书历史
  try {
    const saved = localStorage.getItem('bid_doc_history')
    if (saved) {
      const bids = JSON.parse(saved)
      for (const bid of bids) {
        items.push({
          id: `bid-${bid.id}`,
          type: 'bid',
          typeName: '标书文档',
          name: bid.name || '未命名标书',
          bidType: bid.bidTypeName,
          time: bid.time,
          data: bid
        })
      }
    }
  } catch (e) { /* ignore */ }

  // 加载合同历史
  try {
    const saved = localStorage.getItem('contract_history')
    if (saved) {
      const contracts = JSON.parse(saved)
      for (const c of contracts) {
        items.push({
          id: `contract-${c.id}`,
          type: 'contract',
          typeName: '合同文档',
          name: c.title || '未命名合同',
          time: c.time,
          data: c
        })
      }
    }
  } catch (e) { /* ignore */ }

  // 按时间排序（最新的在前），最多展示20条
  return items.slice(0, 20)
}

function openArtifact(item) {
  if (item.type === 'solution') {
    router.push({
      path: '/agent/solution-editor',
      query: { data: encodeURIComponent(JSON.stringify(item.data)) }
    })
  } else if (item.type === 'bid') {
    router.push({
      path: '/agent/bid-doc-editor',
      query: { data: encodeURIComponent(JSON.stringify({ bidInfo: item.data, sections: item.data.sections })) }
    })
  } else if (item.type === 'contract') {
    router.push({
      path: '/agent/contract-assistant',
      query: { from: 'workbench', data: encodeURIComponent(JSON.stringify(item.data)) }
    })
  }
}

// 日程与任务持久化
function loadSchedules() {
  let result
  try {
    const saved = localStorage.getItem('workbench_schedules')
    if (saved) result = JSON.parse(saved)
  } catch (e) { /* ignore */ }
  // 首次加载解析AI对话生成日程
  if (!result) {
    const parsed = parseChatForSchedules()
    result = parsed.length ? parsed : defaultSchedules
  }
  // 兼容旧数据：为没有date字段的日程补上今天日期
  const todayStr = formatDate(new Date())
  for (const s of result) {
    if (!s.date) s.date = todayStr
  }
  return result
}

function loadTasks() {
  try {
    const saved = localStorage.getItem('workbench_tasks')
    if (saved) return JSON.parse(saved)
  } catch (e) { /* ignore */ }
  // 首次加载解析AI对话生成任务
  const parsed = parseChatForTasks()
  return parsed.length ? parsed : defaultTasks
}

function saveSchedules() {
  try { localStorage.setItem('workbench_schedules', JSON.stringify(schedules.value)) } catch (e) { /* ignore */ }
}

function saveTasks() {
  try { localStorage.setItem('workbench_tasks', JSON.stringify(tasks.value)) } catch (e) { /* ignore */ }
}

// 从AI对话解析任务与日程
function parseChatForTasks() {
  const tasks = []
  try {
    const history = localStorage.getItem('ai_chat_history')
    if (!history) return tasks
    const chats = JSON.parse(history)
    for (const chat of chats) {
      try {
        const msgs = localStorage.getItem(`ai_chat_messages_${chat.id}`)
        if (!msgs) continue
        const messages = JSON.parse(msgs)
        for (const msg of messages) {
          if (msg.role === 'assistant' || msg.role === 'user') {
            const content = msg.content || ''
            // 匹配任务关键词
            const taskPatterns = [
              /(?:需要|建议|应该|准备|计划|安排)[^\n]*(?:完成|开发|修复|撰写|输出|整理|提交|评审|部署|测试|发布|优化|重构|设计|对接)[^\n]*/g,
              /TODO[:：]\s*[^\n]+/g,
              /待办[:：]\s*[^\n]+/g
            ]
            for (const pattern of taskPatterns) {
              const matches = content.match(pattern)
              if (matches) {
                for (const m of matches) {
                  const title = m.replace(/^(?:需要|建议|应该|准备|计划|安排|TODO[:：]|待办[:：])\s*/, '').substring(0, 30)
                  if (title.length >= 4 && !tasks.some(t => t.title === title)) {
                    tasks.push({
                      id: Date.now() + tasks.length,
                      title,
                      priority: 'medium',
                      status: 'pending',
                      done: false,
                      deadline: '待定',
                      agent: chat.agentName || 'AI对话',
                      source: 'ai-chat',
                      sourceChatId: chat.id
                    })
                  }
                }
              }
            }
          }
        }
      } catch (e) { /* ignore */ }
    }
  } catch (e) { /* ignore */ }
  return tasks.slice(0, 8)
}

function parseChatForSchedules() {
  const schedules = []
  try {
    const history = localStorage.getItem('ai_chat_history')
    if (!history) return schedules
    const chats = JSON.parse(history)
    for (const chat of chats) {
      try {
        const msgs = localStorage.getItem(`ai_chat_messages_${chat.id}`)
        if (!msgs) continue
        const messages = JSON.parse(msgs)
        for (const msg of messages) {
          if (msg.role === 'assistant' || msg.role === 'user') {
            const content = msg.content || ''
            // 匹配日程时间模式
            const timePatterns = [
              /(\d{1,2}[:：]\d{2})\s*[-\s]+\s*([^\n]+)/g,
              /(上午|中午|下午|晚上|明天|今天|周[一二三四五六日])\s*\d{1,2}[:：]\d{2}?\s*[^\n]*/g,
              /(\d{1,2})月(\d{1,2})日\s*[^\n]+/g
            ]
            for (const pattern of timePatterns) {
              const matches = content.match(pattern)
              if (matches) {
                for (const m of matches) {
                  const title = m.substring(0, 25)
                  if (title.length >= 4 && !schedules.some(s => s.title === title)) {
                    schedules.push({
                      id: Date.now() + schedules.length,
                      time: extractTime(m),
                      date: formatDate(new Date()),
                      title: title,
                      type: 'AI创建',
                      status: 'pending',
                      aiHint: true,
                      source: 'ai-chat'
                    })
                  }
                }
              }
            }
          }
        }
      } catch (e) { /* ignore */ }
    }
  } catch (e) { /* ignore */ }
  return schedules.slice(0, 5)
}

function extractTime(text) {
  const match = text.match(/(\d{1,2})[:：](\d{2})/)
  if (match) return `${match[1].padStart(2, '0')}:${match[2]}`
  if (text.includes('上午')) return '09:00'
  if (text.includes('中午')) return '12:00'
  if (text.includes('下午')) return '14:00'
  if (text.includes('晚上')) return '19:00'
  return '待定'
}

// AI智能建议：关联日程与任务（根据选中日期动态生成）
const ignoredSuggestions = ref(new Set())
const suggestions = computed(() => generateAISuggestions(selectedDate.value).filter(s => !ignoredSuggestions.value.has(s.id)))

function generateAISuggestions(targetDate) {
  const result = []
  const today = new Date()
  const now = today.getHours()
  const isToday = isSameDay(formatDate(targetDate), today)

  // 1. 根据未完成任务推荐日程安排
  const activeTasks = tasks.value.filter(t => t.status !== 'done' && t.status !== 'pending')
  const pendingTasks = tasks.value.filter(t => t.status === 'pending')
  const allOpenTasks = tasks.value.filter(t => t.status !== 'done')

  if (isToday && activeTasks.length > 0) {
    const highPrio = activeTasks.filter(t => t.priority === 'high')
    if (highPrio.length > 0) {
      result.push({
        id: Date.now() + 1,
        icon: 'fas fa-exclamation-triangle',
        title: '高优任务提醒',
        desc: `你有 ${highPrio.length} 个高优先级任务正在处理中：${highPrio.map(t => t.title).join('、')}。建议今日优先完成。`
      })
    }
  }

  if (isToday && pendingTasks.length > 0) {
    result.push({
      id: Date.now() + 2,
      icon: 'fas fa-calendar-plus',
      title: '待办任务安排',
      desc: `有 ${pendingTasks.length} 个待处理任务，建议安排上午${now < 11 ? '剩余' : ''}时间启动：${pendingTasks.slice(0, 2).map(t => t.title).join('、')}`
    })
  }

  // 2. 根据选中日期日程推荐关联任务
  const dateSchedules = schedules.value.filter(s => isSameDay(s.date, targetDate) && (s.status === 'pending' || s.status === 'progress'))
  if (dateSchedules.length > 0 && activeTasks.length > 0) {
    const nextSchedule = dateSchedules[0]
    result.push({
      id: Date.now() + 3,
      icon: 'fas fa-link',
      title: '日程任务联动',
      desc: `"${nextSchedule.title}" 涉及 ${nextSchedule.type}，建议提前准备相关材料，关联任务：${activeTasks[0]?.title || '待定'}`
    })
  }

  // 3. 招投标任务专项建议
  const bidTasks = allOpenTasks.filter(t => t.title.includes('【招投标】') || t.agent === '招投标匹配')
  if (bidTasks.length > 0) {
    const urgentBidTasks = bidTasks.filter(t => t.priority === 'high')
    if (urgentBidTasks.length > 0) {
      result.push({
        id: Date.now() + 6,
        icon: 'fas fa-search-dollar',
        title: '投标任务提醒',
        desc: `你有 ${urgentBidTasks.length} 个高匹配度投标任务：${urgentBidTasks.slice(0, 2).map(t => t.title.replace('【招投标】', '')).join('、')}。建议使用AI标书工具准备投标材料。`,
        action: '/agent/bid-workbench'
      })
    } else {
      result.push({
        id: Date.now() + 6,
        icon: 'fas fa-search-dollar',
        title: '投标任务跟踪',
        desc: `当前有 ${bidTasks.length} 个投标相关任务待处理，建议定期检查招标进度并准备标书。`,
        action: '/agent/bid-workbench'
      })
    }
  }

  // 4. 检查是否有投标截止日程
  const bidSchedules = schedules.value.filter(s => s.title.includes('投标截止') && s.status !== 'done')
  if (bidSchedules.length > 0) {
    const nextDeadline = bidSchedules[0]
    result.push({
      id: Date.now() + 7,
      icon: 'fas fa-clock',
      title: '投标截止提醒',
      desc: `"${nextDeadline.title}" 即将到期，建议提前完成标书制作和审核。`,
      action: '/agent/bid-workbench'
    })
  }

  // 5. 合同相关建议
  const contractTasks = allOpenTasks.filter(t => t.title.includes('合同') || t.title.includes('协议') || t.agent === '合同助手')
  if (contractTasks.length > 0) {
    result.push({
      id: Date.now() + 8,
      icon: 'fas fa-file-contract',
      title: '合同处理提醒',
      desc: `你有 ${contractTasks.length} 个合同相关任务待处理：${contractTasks.slice(0, 2).map(t => t.title).join('、')}。建议使用AI合同助手生成或审查。`,
      action: '/agent/contract-assistant'
    })
  }

  // 6. 工作流闭环建议：有中标项目但未生成合同
  const bidDoneTasks = tasks.value.filter(t => t.status === 'done' && (t.title.includes('投标') || t.title.includes('招标')))
  const hasContract = contractTasks.length > 0 || artifacts.value.some(a => a.type === 'contract')
  if (bidDoneTasks.length > 0 && !hasContract) {
    result.push({
      id: Date.now() + 9,
      icon: 'fas fa-link',
      title: '工作流闭环提醒',
      desc: `你已完成 ${bidDoneTasks.length} 个招投标项目，建议使用AI合同助手生成正式合同。`,
      action: '/agent/contract-assistant'
    })
  }

  // 7. 工作日周报建议（仅周五显示）
  const dayOfWeek = targetDate.getDay()
  if (isToday && dayOfWeek === 5) {
    result.push({
      id: Date.now() + 4,
      icon: 'fas fa-file-alt',
      title: '生成周报',
      desc: '今天是周五，建议整理本周完成的任务和生成的方案文档，生成工作周报。'
    })
  }

  // 8. 无日程时给出建议
  if (isToday && dateSchedules.length === 0 && now < 10) {
    result.push({
      id: Date.now() + 5,
      icon: 'fas fa-calendar-check',
      title: '规划今日日程',
      desc: '今日暂无日程安排，建议根据待办任务规划今日工作节奏，优先处理高优任务。'
    })
  }

  return result.slice(0, 5)
}

// 推荐工具 Agent - 根据任务动态调整
const agents = computed(() => {
  const allAgents = [
    { id: 1, name: '招投标工作台', desc: '招投标数据看板与智能匹配', icon: 'fas fa-briefcase', color: '#f59e0b', path: '/agent/bid-workbench', keywords: ['招投标', '投标', '招标'] },
    { id: 2, name: '解决方案生成', desc: '基于需求自动生成专业的解决方案文档', icon: 'fas fa-file-invoice', color: '#059669', path: '/agent/solution-gen', keywords: ['方案', '解决方案', '文档'] },
    { id: 3, name: 'AI合同助手', desc: '智能合同生成、多类型模板与AI审查', icon: 'fas fa-file-contract', color: '#ec4899', path: '/agent/contract-assistant', keywords: ['合同', '协议', '审查'] },
    { id: 4, name: '简历筛选', desc: '智能分析简历，按岗位需求筛选匹配候选人', icon: 'fas fa-user-check', color: '#d97706', path: '/agent/resume-filter', keywords: ['简历', '招聘', '候选人'] }
  ]
  
  // 根据当前任务内容推荐相关工具
  const taskTitles = tasks.value.filter(t => t.status !== 'done').map(t => t.title).join(' ')
  const scheduleTitles = schedules.value.filter(s => s.status !== 'done').map(s => s.title).join(' ')
  const allText = taskTitles + ' ' + scheduleTitles
  
  // 计算每个Agent的相关性得分
  const scoredAgents = allAgents.map(agent => {
    let score = 0
    for (const keyword of agent.keywords) {
      if (allText.includes(keyword)) {
        score += 10
      }
    }
    // 如果有招投标相关任务，招投标匹配工具得分最高
    if (agent.path === '/agent/bid-workbench' && (allText.includes('【招投标】') || allText.includes('投标截止'))) {
      score += 20
    }
    return { ...agent, score }
  })
  
  // 按得分排序，得分相同时保持原顺序
  return scoredAgents.sort((a, b) => b.score - a.score)
})

// 实时统计计算属性
const pendingCount = computed(() => tasks.value.filter(t => t.status === 'pending').length)
const progressCount = computed(() => tasks.value.filter(t => t.status === 'progress').length)
const completedCount = computed(() => tasks.value.filter(t => t.status === 'done').length)
const aiAssistedCount = computed(() => tasks.value.filter(t => t.agent).length)

const filteredTasks = computed(() => {
  if (filter.value === 'all') return tasks.value
  if (filter.value === 'done') return tasks.value.filter(t => t.done)
  if (filter.value === 'progress') return tasks.value.filter(t => t.status === 'progress')
  if (filter.value === 'pending') return tasks.value.filter(t => t.status === 'pending')
  return tasks.value
})

function statusText(s) {
  return { pending: '待开始', progress: '进行中', done: '已完成' }[s] || s
}

function priorityText(p) {
  return { high: '高优', medium: '中等', low: '低优' }[p] || p
}

function deleteTask(id) {
  tasks.value = tasks.value.filter(t => t.id !== id)
  saveTasks()
}

function deleteSchedule(id) {
  schedules.value = schedules.value.filter(s => s.id !== id)
  saveSchedules()
  // suggestions 是 computed，会自动更新
}

function viewSchedule(schedule) {
  const statusMap = {
    'pending': '待处理',
    'progress': '进行中',
    'done': '已完成'
  }
  const content = `
    <div style="text-align: left; line-height: 1.8;">
      <p><strong>时间：</strong>${schedule.time}</p>
      <p><strong>类型：</strong>${schedule.type}</p>
      <p><strong>状态：</strong>${statusMap[schedule.status] || schedule.status}</p>
      ${schedule.aiHint ? '<p><strong>来源：</strong><span style="color: #ec4899;">AI 建议</span></p>' : ''}
      <p><strong>日期：</strong>${schedule.date || '未指定'}</p>
    </div>
  `
  appStore.showModal(schedule.title, content, 'info')
}

function toggleTaskDone(task) {
  task.done = !task.done
  task.status = task.done ? 'done' : 'pending'
  saveTasks()
  // 同步全局统计
  syncStatsToStore()
  // suggestions 是 computed，会自动更新
}

function acceptSuggestion(s) {
  tasks.value.push({ id: Date.now(), title: s.title, priority: 'medium', status: 'pending', done: false, deadline: '今天', agent: 'AI建议', source: 'ai-suggestion' })
  // suggestions 是 computed，会自动更新
  saveTasks()
  syncStatsToStore()
  appStore.showModal('已采纳', `任务"${s.title}"已添加到工作台`, 'success')
}

function ignoreSuggestion(s) {
  ignoredSuggestions.value.add(s.id)
}

// 同步统计到全局Store
function syncStatsToStore() {
  appStore.stats.activeTasks = pendingCount.value + progressCount.value
  appStore.stats.activeAgents = tasks.value.filter(t => t.agent).length
}

function useAgent(a) {
  if (a.path) {
    router.push(a.path)
  } else {
    router.push('/chat')
  }
}

function jumpToSuggestion(s) {
  // 如果建议有指定的action路径，直接跳转
  if (s.action) {
    router.push(s.action)
    return
  }
  
  // 根据建议类型跳转到不同页面
  if (s.title.includes('周报')) {
    // 跳转到文档生成页面，假设路径为/agent/solution-gen
    router.push({ path: '/agent/solution-gen', query: { from: 'workbench', type: 'weekly-report' } })
  } else if (s.title.includes('代码')) {
    // 跳转到AI对话页面，询问代码优化
    router.push({ path: '/chat', query: { from: 'workbench', type: 'code-optimization', suggestion: s.title } })
  } else if (s.title.includes('投标') || s.title.includes('招投标')) {
    // 跳转到招投标工作台
    router.push('/agent/bid-workbench')
  } else if (s.title.includes('日程')) {
    // 跳转到日程页面，假设路径为/workbench（当前页面）
    appStore.showModal('日程详情', s.desc, 'info')
  } else {
    // 默认跳转到AI对话
    router.push({ path: '/chat', query: { from: 'workbench', suggestion: s.title } })
  }
}

function jumpToTask(task) {
  // 如果是招投标相关任务，跳转到招投标匹配页面
  if (task.title.includes('【招投标】') || task.agent === '招投标匹配') {
    router.push('/agent/bid-workbench')
    return
  }
  
  // 如果任务关联到Agent或需要AI处理，跳转到对应页面并自动填充需求
  if (task.agent || task.source === 'ai-chat') {
    // 根据agent名称查找对应的路径，默认都走AI对话并自动填充发送
    const agentMap = {
      '代码助手': '/chat',
      '文档生成': '/chat',
      '数据分析': '/chat',
      'AI对话': '/chat',
      '解决方案生成': '/agent/solution-gen',
      '简历筛选': '/agent/resume-filter',
      '合同助手': '/agent/contract-assistant',
      'AI合同助手': '/agent/contract-assistant'
    }
    const targetPath = agentMap[task.agent] || '/chat'
    // 将任务标题作为需求填充到对话框并发送
    router.push({ path: targetPath, query: { from: 'workbench', taskTitle: task.title, autoSend: 'true' } })
  } else {
    // 没有关联Agent的任务，也跳转到AI对话让AI给出解决方案
    router.push({ path: '/chat', query: { from: 'workbench', taskTitle: task.title, autoSend: 'true' } })
  }
}

// 同步AI对话创建的任务和日程到工作台
function syncFromStore() {
  // 同步任务
  if (appStore.sharedTasks.length) {
    const newTasks = appStore.sharedTasks.filter(st => !tasks.value.some(t => t.id === st.id))
    tasks.value.unshift(...newTasks)
  }
  // 同步日程
  if (appStore.sharedSchedules.length) {
    const newSchedules = appStore.sharedSchedules.filter(ss => !schedules.value.some(s => s.id === ss.id))
    for (const ns of newSchedules) {
      if (!ns.date) ns.date = formatDate(new Date())
    }
    schedules.value.unshift(...newSchedules)
  }
}

// 监听store变化
watch(() => appStore.sharedTasks.length, () => syncFromStore())
watch(() => appStore.sharedSchedules.length, () => syncFromStore())

// 监听统计变化自动同步到Store
watch([pendingCount, progressCount, completedCount, aiAssistedCount], () => syncStatsToStore())

// 页面加载时同步，并刷新AI建议
onMounted(async () => {
  // 先从服务器恢复数据到localStorage
  await restoreAllFromServer()
  // 重新加载制品列表
  artifacts.value = loadArtifacts()
  syncFromStore()
  syncStatsToStore()
  // suggestions 是 computed，会自动更新
})

// 监听日程/任务变化自动保存
watch(schedules, () => saveSchedules(), { deep: true })
watch(tasks, () => { saveTasks(); syncStatsToStore() }, { deep: true })

// 打开日程弹窗
function openScheduleModal() {
  newSchedule.value = { title: '', time: '', date: formatDate(selectedDate.value), type: '任务', note: '' }
  showAddModal.value = true
}

// 添加日程
function addSchedule() {
  if (!newSchedule.value.title.trim()) {
    appStore.showModal('提示', '请输入日程标题', 'warning')
    return
  }
  const schedule = {
    id: Date.now(),
    time: newSchedule.value.time || '待定',
    date: newSchedule.value.date || formatDate(new Date()),
    title: newSchedule.value.title,
    type: newSchedule.value.type,
    status: 'pending',
    aiHint: false
  }
  schedules.value.unshift(schedule)
  showAddModal.value = false
  saveSchedules()
  // suggestions 是 computed，会自动更新
  appStore.showModal('添加成功', `日程"${schedule.title}"已添加`, 'success')
}

// 跳转到AI对话创建日程
function goToAIChatForSchedule() {
  showAddModal.value = false
  router.push({ path: '/chat', query: { from: 'workbench', type: 'schedule', hint: '帮我安排日程' } })
}
</script>

<style scoped>
.workbench { display: flex; height: 100vh; overflow: hidden; background: #f0f4f8; }

/* 主内容 */
.wb-main { flex: 1; display: flex; flex-direction: column; padding: 16px; overflow: hidden; }
.wb-main--full { padding: 16px 24px; }
.overview-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; flex-shrink: 0; }
.panel { background: #fff; border-radius: 20px; padding: 20px 24px; box-shadow: 0 2px 16px rgba(0,0,0,0.04); }
.panel-hd { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.panel-hd h4 { font-size: 15px; font-weight: 700; color: var(--text-primary); }
.panel-hd span { font-size: 12px; color: var(--text-muted); margin-left: auto; }
.metrics { display: flex; gap: 24px; }
.m-item { display: flex; align-items: center; gap: 10px; }
.m-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.m-icon.pending { background: #fef3c7; color: #d97706; }
.m-icon.progress { background: #dbeafe; color: #2563eb; }
.m-icon.completed { background: #d1fae5; color: #059669; }
.m-icon.ai { background: #ede9fe; color: #7c3aed; }
.m-val { font-size: 22px; font-weight: 800; color: var(--text-primary); }
.m-label { font-size: 12px; color: var(--text-muted); }

/* 内容区 */
.content-row { display: grid; grid-template-columns: 1fr 340px; gap: 16px; flex: 1; overflow: hidden; min-height: 0; }
.content-left, .content-right { display: flex; flex-direction: column; gap: 16px; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
.content-left::-webkit-scrollbar, .content-right::-webkit-scrollbar { display: none; }

/* 卡片 */
.dcard { background: #fff; border-radius: 20px; padding: 20px; box-shadow: 0 2px 16px rgba(0,0,0,0.04); }
.dcard-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.dcard-hd h4 { font-size: 14px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
.dcard-hd h4 i { color: var(--primary); }
.btn-mini { padding: 5px 10px; background: var(--primary); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px; font-family: inherit; }
.filters-mini { display: flex; gap: 4px; }
.filters-mini button { padding: 3px 10px; background: none; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 11px; color: var(--text-muted); font-family: inherit; }
.filters-mini button.active { background: var(--primary); color: #fff; border-color: var(--primary); }

/* 列表项 */
.list-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.list-item:last-child { border-bottom: none; }
.li-time { font-size: 12px; font-weight: 700; color: var(--primary); min-width: 44px; }
.li-body { flex: 1; }
.li-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.li-title.done { text-decoration: line-through; color: var(--text-muted); }
.li-meta { display: flex; gap: 8px; margin-top: 3px; flex-wrap: wrap; }
.tag { font-size: 10px; color: var(--text-muted); background: #f8fafc; padding: 1px 8px; border-radius: 4px; }
.ai-tag { font-size: 10px; color: var(--primary); display: flex; align-items: center; gap: 3px; }
.pill { font-size: 10px; font-weight: 600; padding: 3px 10px; border-radius: 10px; }
.pill.pending { background: #fef3c7; color: #d97706; }
.pill.progress { background: #dbeafe; color: #2563eb; }
.pill.done { background: #d1fae5; color: #059669; }
.priority { font-size: 10px; font-weight: 600; padding: 1px 8px; border-radius: 4px; }
.priority.high { background: #fee2e2; color: #dc2626; }
.priority.medium { background: #fef3c7; color: #d97706; }
.priority.low { background: #f3f4f6; color: #6b7280; }
.deadline { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 3px; }
.agent-tag { font-size: 11px; color: var(--primary); display: flex; align-items: center; gap: 3px; }
.li-del { background: none; border: none; color: #cbd5e1; cursor: pointer; padding: 4px; font-size: 12px; }
.li-del:hover { color: #dc2626; }

/* 空状态 */
.empty { text-align: center; padding: 30px 10px; color: var(--text-muted); }
.empty i { font-size: 28px; margin-bottom: 8px; opacity: .4; }
.empty p { font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--text-secondary); }
.empty span { font-size: 11px; }

/* AI建议 */
.dcard.ai { background: linear-gradient(135deg, #faf5ff, #ede9fe); }
.live { font-size: 10px; font-weight: 700; background: var(--primary); color: #fff; padding: 2px 8px; border-radius: 10px; }
.sug-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(139,92,246,.12); }
.sug-item:last-child { border-bottom: none; }
.sug-icon { width: 32px; height: 32px; background: var(--primary-100); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--primary); flex-shrink: 0; font-size: 13px; }
.sug-body { flex: 1; cursor: pointer; }
.sug-title { font-size: 13px; font-weight: 700; color: var(--text-primary); }
.sug-desc { font-size: 11px; color: var(--text-muted); margin: 3px 0 8px; line-height: 1.4; }
.sug-actions { display: flex; gap: 6px; }
.sug-actions button { padding: 3px 10px; font-size: 11px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; font-family: inherit; }
.sug-actions button:not(.secondary) { background: var(--primary); color: #fff; }
.sug-actions button.secondary { background: none; border: 1px solid var(--border); color: var(--text-muted); }

/* 日历 */
.cal-grid { margin-bottom: 0; }
.cal-wd { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; margin-bottom: 6px; }
.cal-wd span { font-size: 11px; color: var(--text-muted); font-weight: 600; }
.cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-days span { text-align: center; padding: 6px 0; font-size: 12px; border-radius: 8px; color: var(--text-primary); cursor: pointer; transition: all .15s; }
.cal-days span:hover:not(.other) { background: #eef2ff; }
.cal-days span.other { color: #cbd5e1; cursor: default; }
.cal-days span.today { background: var(--primary); color: #fff; font-weight: 700; }
.cal-days span.today:hover { background: var(--primary); }
.cal-days span.active { box-shadow: inset 0 0 0 2px var(--primary); font-weight: 700; }
.cal-days span.today.active { box-shadow: inset 0 0 0 2px #fff; }
.cal-days span.event { position: relative; }
.cal-days span.event::after { content: ''; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: var(--primary); }
.cal-days span.today.event::after { background: #fff; }
.cal-hd-right { display: flex; align-items: center; gap: 8px; }
.cal-nav { display: flex; gap: 4px; }
.cal-nav button { width: 24px; height: 24px; border: none; background: #f1f5f9; border-radius: 6px; cursor: pointer; color: var(--text-muted); font-size: 10px; }

/* 日历日程区 */
.cal-schedule-section { margin-top: 14px; padding-top: 12px; border-top: 1px solid #f1f5f9; }
.cal-schedule-hd { display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-bottom: 10px; }
.cal-schedule-hd span { color: var(--text-muted); }
.cal-schedule-hd strong { color: var(--text-primary); font-weight: 700; }
.cal-schedule-list { max-height: 200px; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
.cal-schedule-list::-webkit-scrollbar { display: none; }
.schedule-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
.schedule-row:last-child { border-bottom: none; }
.sch-time { font-size: 11px; font-weight: 700; color: var(--primary); min-width: 40px; }
.sch-body { flex: 1; min-width: 0; }
.sch-title { font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sch-meta { display: flex; gap: 6px; margin-top: 2px; }
.empty.small { padding: 16px 10px; }
.empty.small i { font-size: 20px; }

/* 工作流 */
.badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
.badge.pink { background: #ec4899; color: #fff; }
.badge.blue { background: var(--primary); color: #fff; }
.wf-step { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 12px; cursor: pointer; transition: all .2s; }
.wf-step:hover { background: rgba(236,72,153,.05); }
.wf-num { width: 18px; height: 18px; border-radius: 50%; background: #ec4899; color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.wf-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; flex-shrink: 0; }
.wf-txt { flex: 1; }
.wf-title { font-size: 12px; font-weight: 700; color: var(--text-primary); }
.wf-desc { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.wf-conn { text-align: center; color: #ec4899; font-size: 11px; padding: 2px 0; opacity: .5; }

/* 制品/推荐 */
.mini-list { display: flex; flex-direction: column; gap: 6px; }
.mini-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 10px; cursor: pointer; transition: all .2s; }
.mini-item:hover { border-color: var(--primary); background: #eef2ff; }
.mini-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; flex-shrink: 0; }
.mini-icon.solution { background: linear-gradient(135deg, #059669, #10b981); }
.mini-icon.bid { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
.mini-icon.contract { background: linear-gradient(135deg, #ec4899, #f472b6); }
.mini-info { flex: 1; min-width: 0; }
.mini-name { font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mini-meta { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
.mini-meta span { font-size: 10px; }
.mini-meta span.solution { color: #059669; background: #d1fae5; padding: 1px 6px; border-radius: 4px; font-weight: 600; }
.mini-meta span.bid { color: #6366f1; background: #e0e7ff; padding: 1px 6px; border-radius: 4px; font-weight: 600; }
.mini-meta span.contract { color: #ec4899; background: #fce7f3; padding: 1px 6px; border-radius: 4px; font-weight: 600; }
.mini-desc { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.view-all { font-size: 11px; color: var(--primary); background: none; border: none; cursor: pointer; font-weight: 600; font-family: inherit; }
.mini-item > i:last-child { color: #cbd5e1; font-size: 10px; }
.mini-item:hover > i:last-child { color: var(--primary); }

/* 弹窗 */
.schedule-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn .2s ease; }
.schedule-modal { background: #fff; border-radius: 20px; width: 480px; max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,.12); animation: slideUp .25s ease; }
.schedule-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.schedule-modal-header h3 { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
.schedule-modal-header h3 i { color: var(--primary); }
.modal-close-btn { width: 32px; height: 32px; border: none; background: #f3f4f6; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 14px; transition: all var(--tr); }
.modal-close-btn:hover { background: #fee2e2; color: #dc2626; }
.schedule-modal-body { padding: 20px 24px; }
.schedule-modal-body .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.schedule-modal-body .form-group { margin-bottom: 16px; }
.schedule-modal-body .form-group label { display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
.schedule-modal-body .form-group input, .schedule-modal-body .form-group select, .schedule-modal-body .form-group textarea { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: inherit; background: #f9fafb; transition: all var(--tr); }
.schedule-modal-body .form-group input:focus, .schedule-modal-body .form-group select:focus, .schedule-modal-body .form-group textarea:focus { outline: none; border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.schedule-modal-body .form-group textarea { resize: vertical; min-height: 60px; }
.ai-link-section { background: linear-gradient(135deg, #faf5ff, #ede9fe); border: 1px solid #ddd6fe; border-radius: var(--radius); padding: 16px; margin-top: 12px; }
.ai-link-header { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: var(--primary); margin-bottom: 6px; }
.ai-link-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
.ai-link-btn { width: 100%; padding: 10px 16px; background: linear-gradient(135deg, var(--primary), #8b5cf6); color: #fff; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit; transition: all var(--tr); }
.ai-link-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,.3); }
.schedule-modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border); }
.cancel-btn { padding: 8px 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-secondary); font-family: inherit; }
.save-btn { padding: 8px 20px; background: var(--primary); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-weight: 600; color: #fff; font-family: inherit; display: flex; align-items: center; gap: 6px; }
.save-btn:hover { background: var(--primary-dark); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
</style>