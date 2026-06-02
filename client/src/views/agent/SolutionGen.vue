<template>
  <div class="agent-page">
    <div class="agent-header">
      <div class="agent-title">
        <div class="agent-icon solution"><i class="fas fa-file-invoice"></i></div>
        <div>
          <h2>解决方案生成Agent</h2>
          <p>选择行业模板，通过对话式交互收集需求，自动生成专业解决方案文档</p>
        </div>
      </div>
      <div class="agent-actions">
        <button class="action-btn" @click="openIndustryConfig"><i class="fas fa-cog"></i> 行业模板配置</button>
      </div>
    </div>

    <div class="agent-content">
      <!-- 左侧：需求收集助手（主区域） -->
      <div class="input-section">
        <div class="section-card chat-card">
          <div class="chat-header">
            <div class="chat-title">
              <h3><i class="fas fa-robot"></i> 需求收集助手</h3>
              <span class="industry-badge" v-if="projectInfo.industry" :style="{ '--ind-color': getIndustryColor(projectInfo.industry) }">
                <i :class="getIndustryIcon(projectInfo.industry)"></i> {{ projectInfo.industry }}
              </span>
            </div>
            <p class="chat-desc">通过对话方式收集项目信息，AI将自动识别需求并生成定制化方案</p>
          </div>
          <div class="ask-chat">
            <div class="ask-messages" ref="askMessagesRef">
              <div v-for="msg in askMessages" :key="msg.id" class="ask-message" :class="msg.role">
                <div class="ask-avatar">
                  <i :class="msg.role === 'user' ? 'fas fa-user' : 'fas fa-robot'"></i>
                </div>
                <div class="ask-content">
                  <div v-if="msg.type === 'text'" v-html="formatMessage(msg.content)"></div>
                  <div v-else-if="msg.type === 'options'" class="ask-options">
                    <p>{{ msg.question }}</p>
                    <div class="option-btns">
                      <button v-for="opt in msg.options" :key="opt.value" @click="selectOption(msg, opt)">
                        <span class="opt-icon" v-if="opt.icon"><i :class="opt.icon"></i></span>
                        {{ opt.label }}
                      </button>
                    </div>
                  </div>
                  <div v-else-if="msg.type === 'input'" class="ask-input-group">
                    <p>{{ msg.question }}</p>
                    <div class="ask-input-wrapper">
                      <input v-model="askInputValue" :placeholder="msg.placeholder" @keydown.enter="submitAskInput(msg)">
                      <button @click="submitAskInput(msg)"><i class="fas fa-paper-plane"></i></button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- AI加载中 -->
              <div v-if="isLoadingAI" class="ask-message assistant">
                <div class="ask-avatar">
                  <i class="fas fa-robot"></i>
                </div>
                <div class="ask-content">
                  <div class="typing-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </div>
            <div class="ask-input-fixed">
              <!-- 行业模板快捷按钮 -->
              <div class="industry-quick-btns">
                <button v-for="ind in industries" :key="ind.name"
                        class="industry-quick-btn"
                        :class="{ active: projectInfo.industry === ind.name }"
                        :style="{ '--ind-color': ind.color }"
                        @click="selectIndustry(ind)">
                  <i :class="ind.icon"></i>
                  <span>{{ ind.name }}</span>
                </button>
              </div>
              <div class="ask-input-area">
                <input v-model="freeInputValue" placeholder="输入任何问题或需求..." @keydown.enter="sendFreeMessage" :disabled="isLoadingAI">
                <button @click="sendFreeMessage" :disabled="isLoadingAI"><i :class="isLoadingAI ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：方案工作台 + 行业模板 + 资料上传 -->
      <div class="result-section">
        <!-- 方案工作台 -->
        <div class="section-card workbench-card">
          <h3><i class="fas fa-clipboard-check"></i> 方案工作台</h3>
          <div class="workbench-progress">
            <div class="progress-bar"><div class="progress-fill" :style="{ width: completionRate + '%' }"></div></div>
            <span class="progress-text">{{ completionRate }}%</span>
          </div>
          <div class="workbench-info">
            <div v-for="(value, key) in projectInfo" :key="key" class="wb-item" :class="{ filled: value }">
              <span class="wb-label"><i :class="fieldIcons[key]"></i> {{ infoLabels[key] || key }}</span>
              <span class="wb-value">{{ value || '待填写' }}</span>
            </div>
          </div>
          <div class="workbench-actions" v-if="isStepCompleted">
            <button class="action-btn-sm primary" @click="generate"><i class="fas fa-magic"></i> 生成方案</button>
            <button class="action-btn-sm" @click="resetAsk"><i class="fas fa-redo"></i> 重新收集</button>
          </div>
        </div>

        <!-- 资料上传 -->
        <div class="section-card upload-card">
          <h3><i class="fas fa-cloud-upload-alt"></i> 资料上传</h3>
          <p class="upload-desc">上传项目相关文档，AI将自动提取关键信息辅助方案生成</p>
          <div class="upload-area" @click="triggerUpload" @drop.prevent="handleDrop" @dragover.prevent>
            <i class="fas fa-cloud-upload-alt"></i>
            <p>拖拽或点击上传文档</p>
            <span>支持 .docx, .pdf, .pptx, .xlsx 格式</span>
          </div>
          <div v-if="uploadedFiles.length" class="file-list">
            <div v-for="(f, i) in uploadedFiles" :key="i" class="file-item">
              <i class="fas fa-file-alt"></i><span>{{ f.name }}</span>
              <button @click="uploadedFiles.splice(i, 1)"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <input type="file" ref="fileInput" @change="handleFile" hidden accept=".docx,.pdf,.pptx,.xlsx" multiple>
        </div>

        <!-- 历史生成方案 -->
        <div class="section-card history-card">
          <h3><i class="fas fa-history"></i> 历史生成方案</h3>
          <div v-if="historySolutions.length === 0" class="empty-history">
            <i class="fas fa-file-alt"></i>
            <p>暂无历史方案</p>
            <span>生成的方案将在这里显示</span>
          </div>
          <div v-else class="history-list">
            <div v-for="(sol, i) in historySolutions" :key="i" class="history-item" @click="viewHistorySolution(sol)">
              <div class="history-icon" :style="{ background: getIndustryColor(sol.industry) }">
                <i :class="getIndustryIcon(sol.industry)"></i>
              </div>
              <div class="history-info">
                <div class="history-title">{{ sol.name || '未命名方案' }}</div>
                <div class="history-meta">
                  <span class="history-industry">{{ sol.industry }}</span>
                  <span class="history-time">{{ sol.time }}</span>
                </div>
              </div>
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 行业模板配置弹窗 -->
    <div class="config-modal-overlay" v-if="showIndustryConfig" @click.self="closeIndustryConfig">
      <div class="config-modal">
        <div class="config-modal-header">
          <h3><i class="fas fa-cog"></i> 行业模板配置</h3>
          <button class="modal-close" @click="closeIndustryConfig"><i class="fas fa-times"></i></button>
        </div>
        <div class="config-modal-body">
          <div class="config-sidebar">
            <div class="config-tabs">
              <div class="config-tab active"><i class="fas fa-comment-dots"></i> 提示词设置</div>
            </div>
            <div class="config-ind-list">
              <div v-for="ind in industries" :key="ind.name"
                   class="config-ind-item"
                   :class="{ active: editingIndustry === ind.name }"
                   :style="{ '--ind-color': ind.color }"
                   @click="editingIndustry = ind.name">
                <i :class="ind.icon"></i>
                <span>{{ ind.name }}</span>
                <button v-if="ind.custom" class="config-ind-delete" @click.stop="deleteIndustry(ind.name)" title="删除模板">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <button class="add-industry-btn" @click="addNewIndustry">
              <i class="fas fa-plus"></i> 新增模板
            </button>
          </div>
          <div class="config-main" v-if="industryConfigs[editingIndustry]">
            <div class="config-field">
              <label>名称</label>
              <div class="config-name-row">
                <div class="config-icon" :style="{ background: industryConfigs[editingIndustry].color }">
                  <i :class="industryConfigs[editingIndustry].icon"></i>
                </div>
                <input v-model="industryConfigs[editingIndustry].name" type="text">
              </div>
            </div>
            <div class="config-field">
              <label>提示词 <i class="fas fa-question-circle" title="配置AI对话角色的提示词，影响AI的回答风格和内容"></i></label>
              <textarea v-model="industryConfigs[editingIndustry].prompt" rows="12" placeholder="输入该行业模板的AI提示词..."></textarea>
              <div class="config-tokens">Tokens: {{ configPromptTokens() }}</div>
            </div>
          </div>
        </div>
        <div class="config-modal-footer">
          <button class="action-btn" @click="closeIndustryConfig">取消</button>
          <button class="action-btn primary" @click="saveIndustryConfig"><i class="fas fa-save"></i> 保存配置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'

const router = useRouter()
const appStore = useAppStore()
const askMessagesRef = ref(null)
const fileInput = ref(null)
const askInputValue = ref('')
const freeInputValue = ref('')
const generated = ref('')
const currentAskStep = ref(0)
const isStepCompleted = ref(false)
const uploadedFiles = ref([])
const isLoadingAI = ref(false)
const linkedChatId = ref(null) // 关联的 AI 对话 ID

// 历史生成方案
const historySolutions = ref(loadHistorySolutions())

function loadHistorySolutions() {
  try {
    const saved = localStorage.getItem('solution_gen_history')
    if (saved) return JSON.parse(saved)
  } catch (e) { /* ignore */ }
  return []
}

function saveHistorySolution(solution) {
  historySolutions.value.unshift(solution)
  // 最多保留 20 条历史
  if (historySolutions.value.length > 20) {
    historySolutions.value = historySolutions.value.slice(0, 20)
  }
  localStorage.setItem('solution_gen_history', JSON.stringify(historySolutions.value))
  // 同步到服务器缓存
  syncToServer('solution_gen_history', historySolutions.value)
}

// 同步数据到服务器
async function syncToServer(key, data) {
  try {
    await fetch(`/api/cache/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  } catch (e) { /* 静默失败 */ }
}

function viewHistorySolution(sol) {
  // 跳转到方案编辑页面查看历史方案
  router.push({
    path: '/agent/solution-editor',
    query: { data: encodeURIComponent(JSON.stringify(sol)) }
  })
}

const projectInfo = ref({
  industry: '',
  name: '',
  budget: '',
  timeline: '',
  requirements: '',
  techStack: ''
})

const infoLabels = {
  industry: '行业领域',
  name: '项目名称',
  budget: '预算范围',
  timeline: '项目周期',
  requirements: '核心需求',
  techStack: '技术要求'
}

const fieldIcons = {
  industry: 'fas fa-th-large',
  name: 'fas fa-file-signature',
  budget: 'fas fa-coins',
  timeline: 'fas fa-clock',
  requirements: 'fas fa-tasks',
  techStack: 'fas fa-code'
}

const industries = [
  { name: '信息技术', color: '#6366f1', icon: 'fas fa-laptop-code', desc: '软件开发、系统集成' },
  { name: '建筑工程', color: '#059669', icon: 'fas fa-building', desc: '工程施工、建筑设计' },
  { name: '医疗卫生', color: '#dc2626', icon: 'fas fa-heartbeat', desc: '医疗信息化、健康管理' },
  { name: '教育培训', color: '#d97706', icon: 'fas fa-graduation-cap', desc: '在线教育、培训系统' },
  { name: '金融服务', color: '#3b82f6', icon: 'fas fa-chart-line', desc: '金融科技、风控系统' },
  { name: '智能制造', color: '#8b5cf6', icon: 'fas fa-industry', desc: '工业4.0、物联网' }
]

const askMessages = ref([
  {
    id: 1,
    role: 'assistant',
    type: 'text',
    content: '你好！我是解决方案生成助手。请先选择上方的行业模板，我将根据行业特点为你定制对话流程，生成专业的解决方案文档。'
  }
])

function getAskSteps(industry) {
  const baseSteps = [
    { type: 'input', question: '请告诉我项目的名称是什么？', placeholder: '例如：企业数字化转型项目', field: 'name' },
    { type: 'options', question: '项目的预算范围是多少？', options: [
      { label: '50万以下', value: '50万以下' },
      { label: '50-100万', value: '50-100万' },
      { label: '100-300万', value: '100-300万' },
      { label: '300-500万', value: '300-500万' },
      { label: '500万以上', value: '500万以上' }
    ], field: 'budget' },
    { type: 'options', question: '预计项目周期是多长？', options: [
      { label: '1-3个月', value: '1-3个月' },
      { label: '3-6个月', value: '3-6个月' },
      { label: '6-12个月', value: '6-12个月' },
      { label: '12个月以上', value: '12个月以上' }
    ], field: 'timeline' }
  ]

  const specific = {
    '信息技术': [
      { type: 'input', question: '请描述项目的核心功能需求和技术目标：', placeholder: '例如：构建统一的数据管理平台，实现业务流程自动化...', field: 'requirements' },
      { type: 'input', question: '对技术栈有什么偏好或要求？（可选）', placeholder: '例如：Vue.js + Node.js + PostgreSQL，或输入"不限"', field: 'techStack' }
    ],
    '建筑工程': [
      { type: 'input', question: '请描述项目的建设规模和主要工程内容：', placeholder: '例如：总建筑面积5万平方米，包含办公楼、停车场及配套设施', field: 'requirements' },
      { type: 'input', question: '对施工单位资质等级有什么要求？（可选）', placeholder: '例如：一级建造师资质、甲级设计资质', field: 'techStack' }
    ],
    '医疗卫生': [
      { type: 'input', question: '请描述项目的医疗信息化需求：', placeholder: '例如：建设智慧医院管理平台，集成HIS、PACS、LIS等系统', field: 'requirements' },
      { type: 'input', question: '是否需要符合特定医疗行业规范？（可选）', placeholder: '例如：等保三级、互联互通四级甲等', field: 'techStack' }
    ],
    '教育培训': [
      { type: 'input', question: '请描述项目的教育平台建设需求：', placeholder: '例如：搭建在线学习平台，支持直播、录播、互动答题', field: 'requirements' },
      { type: 'input', question: '目标用户规模和并发要求？（可选）', placeholder: '例如：10万注册用户，5000并发', field: 'techStack' }
    ],
    '金融服务': [
      { type: 'input', question: '请描述项目的金融科技需求：', placeholder: '例如：建设智能风控系统，实现实时反欺诈检测', field: 'requirements' },
      { type: 'input', question: '对安全合规有什么要求？（可选）', placeholder: '例如：等保四级、PCI-DSS认证', field: 'techStack' }
    ],
    '智能制造': [
      { type: 'input', question: '请描述项目的智能制造升级需求：', placeholder: '例如：建设MES系统，实现生产数据实时采集与分析', field: 'requirements' },
      { type: 'input', question: '现有设备和系统对接需求？（可选）', placeholder: '例如：对接西门子PLC、SAP ERP系统', field: 'techStack' }
    ]
  }

  return [...baseSteps, ...(specific[industry] || specific['信息技术'])]
}

let currentAskSteps = []

const completionRate = computed(() => {
  const fields = Object.keys(projectInfo.value)
  const filled = fields.filter(k => projectInfo.value[k]).length
  return Math.round((filled / fields.length) * 100)
})

function formatMessage(content) {
  return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
}

function scrollToBottom() {
  if (askMessagesRef.value) {
    askMessagesRef.value.scrollTop = askMessagesRef.value.scrollHeight
  }
}

function selectIndustry(ind) {
  projectInfo.value = { industry: ind.name, name: '', budget: '', timeline: '', requirements: '', techStack: '' }
  currentAskStep.value = 0
  isStepCompleted.value = false
  generated.value = ''
  linkedChatId.value = null // 重置关联对话
  currentAskSteps = getAskSteps(ind.name)
  
  const welcomeMsg = `已选择**${ind.name}**行业模板（${ind.desc}）。我将根据该行业特点为你定制对话流程，请回答以下问题。`
  askMessages.value = [{
    id: Date.now(),
    role: 'assistant',
    type: 'text',
    content: welcomeMsg
  }]
  
  // 同步欢迎消息到 AI 对话模块
  syncMessageToAIChat('assistant', welcomeMsg)
  
  nextTick(() => {
    scrollToBottom()
    setTimeout(() => nextAsk(), 500)
  })
}

function selectOption(msg, opt) {
  if (msg.answered) return
  msg.answered = true

  askMessages.value.push({
    id: Date.now(),
    role: 'user',
    type: 'text',
    content: opt.label
  })
  
  // 同步用户选择到 AI 对话模块
  syncMessageToAIChat('user', opt.label)

  projectInfo.value[msg.field] = opt.value

  nextTick(() => {
    scrollToBottom()
    setTimeout(() => nextAsk(), 600)
  })
}

function submitAskInput(msg) {
  if (!askInputValue.value.trim()) return

  const value = askInputValue.value.trim()
  askMessages.value.push({
    id: Date.now(),
    role: 'user',
    type: 'text',
    content: value
  })
  
  // 同步用户输入到 AI 对话模块
  syncMessageToAIChat('user', value)

  projectInfo.value[msg.field] = value
  askInputValue.value = ''

  nextTick(() => {
    scrollToBottom()
    setTimeout(() => nextAsk(), 600)
  })
}

function startAsk() {
  currentAskStep.value = 0
  nextTick(() => nextAsk())
}

function resetAsk() {
  const currentIndustry = projectInfo.value.industry
  currentAskStep.value = 0
  isStepCompleted.value = false
  askMessages.value = [askMessages.value[0]]
  projectInfo.value = { industry: currentIndustry, name: '', budget: '', timeline: '', requirements: '', techStack: '' }
  generated.value = ''
  if (currentIndustry) {
    currentAskSteps = getAskSteps(currentIndustry)
    nextTick(() => nextAsk())
  }
}

function nextAsk() {
  if (currentAskStep.value >= currentAskSteps.length) {
    const completeMsg = `太好了！我已经收集到足够的项目信息。已自动匹配**${projectInfo.value.industry}**行业模板。请点击上方的**"生成方案"**按钮，我将为你生成专业的解决方案文档。你也可以在下方输入框中继续提问或补充需求。`
    askMessages.value.push({
      id: Date.now(),
      role: 'assistant',
      type: 'text',
      content: completeMsg
    })
    // 同步完成消息到 AI 对话模块
    syncMessageToAIChat('assistant', completeMsg)
    isStepCompleted.value = true
    nextTick(() => scrollToBottom())
    return
  }

  const step = currentAskSteps[currentAskStep.value]
  askMessages.value.push({
    id: Date.now(),
    role: 'assistant',
    type: step.type,
    question: step.question,
    options: step.options,
    placeholder: step.placeholder,
    field: step.field,
    answered: false
  })
  
  // 同步问题到 AI 对话模块（仅同步文本问题）
  syncMessageToAIChat('assistant', step.question)

  currentAskStep.value++
  nextTick(() => scrollToBottom())
}

function editProjectInfo() {
  appStore.showModal('编辑项目信息', '请在上方对话框中重新收集对应信息', 'info')
}

function goToChat() {
  router.push({ path: '/chat/solution-gen', query: { from: 'agent', type: 'solution-gen' } })
}

function copyContent() {
  navigator.clipboard.writeText(generated.value.replace(/<[^>]*>/g, ''))
  appStore.showModal('复制成功', '方案内容已复制到剪贴板', 'success')
}

function download() {
  appStore.showModal('下载方案', '文档下载功能开发中，即将支持 PDF / Word 格式导出', 'info')
}

function sendToChat() {
  router.push({ path: '/chat/solution-gen', query: { from: 'agent', type: 'solution-gen', content: generated.value } })
}

async function sendFreeMessage() {
  if (!freeInputValue.value.trim() || isLoadingAI.value) return

  const userMessage = freeInputValue.value.trim()
  askMessages.value.push({
    id: Date.now(),
    role: 'user',
    type: 'text',
    content: userMessage
  })
  
  // 同步用户消息到 AI 对话模块
  syncMessageToAIChat('user', userMessage)

  freeInputValue.value = ''
  isLoadingAI.value = true

  nextTick(() => scrollToBottom())

  // 本地分析提取项目信息
  const extracted = analyzeUserMessage(userMessage)
  if (Object.keys(extracted).length > 0) {
    Object.assign(projectInfo.value, extracted)
  }

  try {
    // 构建系统提示词：行业提示词 + 项目上下文
    const ind = projectInfo.value.industry || '通用'
    const config = industryConfigs.value[ind] || industryConfigs.value['信息技术']
    const systemPrompt = config.prompt
      + '\n\n当前已收集的项目信息：'
      + JSON.stringify(projectInfo.value, null, 2)
      + '\n\n你的任务：作为需求收集助手，通过对话帮助用户完善项目信息。'
      + '如果用户提供了新信息，简要确认并追问缺失的信息字段。'
      + '如果信息已完整，提示用户可以点击"生成方案"。'
      + '请用简洁友好的语气，避免过长回复。'

    // 构建消息历史（最近20条）
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...askMessages.value.slice(-20).filter(m => m.type === 'text').map(m => ({
        role: m.role,
        content: m.content
      }))
    ]

    // 查找当前模型配置
    const models = appStore.modelConfig.models || []
    const currentModelId = appStore.modelConfig.currentModel
    const currentModelInfo = models.find(m => m.id === currentModelId) || models.find(m => m.status === 'active')
    const provider = currentModelInfo?.provider || ''
    const endpoint = currentModelInfo?.endpoint || ''
    const apiKey = currentModelInfo?.apiKey || ''

    // 智能判断模型名称
    let modelName = currentModelInfo?.name || ''
    if (!modelName || modelName === currentModelInfo?.id || modelName.startsWith('model-')) {
      const defaultModels = {
        'OpenAI': 'gpt-4o', 'Anthropic': 'claude-3.5-sonnet', 'DeepSeek': 'deepseek-v4-flash',
        '阿里云': 'qwen-max', '智谱AI': 'glm-4', 'Google': 'gemini-2.0-pro', '小米MImo': 'mimo-v2.5-pro'
      }
      modelName = defaultModels[provider] || 'gpt-4o'
    }

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: apiMessages,
        model: modelName,
        config: {
          provider,
          endpoint,
          apiKey,
          temperature: appStore.modelConfig.temperature,
          maxTokens: appStore.modelConfig.maxTokens || 2048,
          topP: appStore.modelConfig.topP,
          enableWebSearch: appStore.modelConfig.enableWebSearch
        }
      })
    })

    const result = await response.json()

    if (result.success) {
      const aiContent = result.data.content
      askMessages.value.push({
        id: Date.now(),
        role: 'assistant',
        type: 'text',
        content: aiContent
      })
      // 同步 AI 响应到对话模块
      syncMessageToAIChat('assistant', aiContent)
    } else {
      let errorMsg = result.message || 'AI服务暂时不可用'
      if (response.status === 401 || response.status === 403) {
        errorMsg = '认证失败，请在左下角模型配置中检查 API 密钥是否正确'
      } else if (response.status === 400) {
        errorMsg = `请求参数错误：${result.message}`
      }
      const errorText = `⚠️ AI请求失败（${response.status}）：${errorMsg}`
      askMessages.value.push({
        id: Date.now(),
        role: 'assistant',
        type: 'text',
        content: errorText
      })
      // 同步错误消息到对话模块
      syncMessageToAIChat('assistant', errorText)
    }
  } catch (error) {
    let errorContent = `⚠️ 请求失败：${error.message || '网络错误'}`
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      errorContent = '⚠️ 网络连接失败，请检查后端服务是否运行'
    }
    askMessages.value.push({
      id: Date.now(),
      role: 'assistant',
      type: 'text',
      content: errorContent
    })
    // 同步错误消息到对话模块
    syncMessageToAIChat('assistant', errorContent)
  } finally {
    isLoadingAI.value = false

    // 检查信息完整度，自动标记完成
    const fields = Object.keys(projectInfo.value)
    const filled = fields.filter(k => projectInfo.value[k]).length
    if (filled >= 4) {
      isStepCompleted.value = true
    }

    nextTick(() => scrollToBottom())
  }
}

// 资料上传
function triggerUpload() { fileInput.value?.click() }
function handleFile(e) { uploadedFiles.value.push(...Array.from(e.target.files)) }
function handleDrop(e) { uploadedFiles.value.push(...Array.from(e.dataTransfer.files)) }

// ========== AI 对话模块同步功能 ==========
// 创建或获取关联的 AI 对话
function getOrCreateLinkedChat() {
  if (linkedChatId.value) return linkedChatId.value
  
  const chatId = `chat-solution-${Date.now()}`
  linkedChatId.value = chatId
  
  // 读取现有对话列表
  let chatHistory = []
  try {
    const saved = localStorage.getItem('ai_chat_history')
    if (saved) chatHistory = JSON.parse(saved)
  } catch (e) { /* ignore */ }
  
  // 添加新对话（带 Agent 标识）
  const ind = projectInfo.value.industry || '需求收集'
  chatHistory.unshift({
    id: chatId,
    title: `[方案生成] ${ind}行业需求收集`,
    time: '刚刚',
    agent: 'solution-gen', // Agent 标识
    agentName: '解决方案生成Agent'
  })
  
  // 保存对话列表
  localStorage.setItem('ai_chat_history', JSON.stringify(chatHistory))
  
  return chatId
}

// 同步消息到 AI 对话模块
function syncMessageToAIChat(role, content) {
  const chatId = getOrCreateLinkedChat()
  
  // 读取现有消息
  let messages = []
  try {
    const saved = localStorage.getItem(`ai_chat_messages_${chatId}`)
    if (saved) messages = JSON.parse(saved)
  } catch (e) { /* ignore */ }
  
  // 添加新消息
  messages.push({
    id: Date.now(),
    role: role,
    content: content,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    fromAgent: 'solution-gen' // 标记来源
  })
  
  // 保存消息
  localStorage.setItem(`ai_chat_messages_${chatId}`, JSON.stringify(messages))
  
  // 更新对话标题（第一条用户消息后）
  if (role === 'user' && messages.filter(m => m.role === 'user').length === 1) {
    let chatHistory = []
    try {
      const saved = localStorage.getItem('ai_chat_history')
      if (saved) chatHistory = JSON.parse(saved)
    } catch (e) { /* ignore */ }
    
    const chat = chatHistory.find(c => c.id === chatId)
    if (chat) {
      const titleText = content.length > 15 ? content.substring(0, 15) + '...' : content
      chat.title = `[方案生成] ${titleText}`
      chat.time = '刚刚'
      localStorage.setItem('ai_chat_history', JSON.stringify(chatHistory))
    }
  }
}

// AI从对话内容主动分析提取项目信息
function analyzeUserMessage(msg) {
  const lower = msg.toLowerCase()
  let extracted = {}

  // 提取项目名称
  const namePatterns = [
    /项目(?:名称|叫|是|为)[：:\s]*([^，。；\n]+)/,
    /(?:叫做|名为|叫)["']?([^"'，。；\n]{3,30})["']?/,
    /(?:我们要做|正在做|准备做)["']?([^"'，。；\n]{3,30})["']?/
  ]
  for (const p of namePatterns) {
    const m = msg.match(p)
    if (m && m[1] && m[1].length > 2 && !projectInfo.value.name) {
      extracted.name = m[1].trim()
      break
    }
  }

  // 提取预算
  const budgetPatterns = [
    /预算[：:\s]*(\d+(?:\.\d+)?)\s*(万|万?元|W)/i,
    /(?:大概|大约|约)?[\s]*(\d+(?:\.\d+)?)\s*(万|万?元|W)/i,
    /(?:投入|花费|成本)[：:\s]*(\d+(?:\.\d+)?)\s*(万|万?元|W)/i
  ]
  for (const p of budgetPatterns) {
    const m = msg.match(p)
    if (m && m[1]) {
      const unit = m[2] && m[2].includes('万') ? '万' : ''
      extracted.budget = m[1] + unit + '元'
      break
    }
  }

  // 提取周期
  const timelinePatterns = [
    /周期[：:\s]*(\d+)\s*(个月|月|周|天|年)/,
    /(?:工期|时间|多久|多长时间)[：:\s]*(\d+)\s*(个月|月|周|天|年)/,
    /(?:预计|计划|打算)[\s]*([\d一二三四五六七八九十]+)\s*(个月|月|周|天|年)/
  ]
  for (const p of timelinePatterns) {
    const m = msg.match(p)
    if (m && m[1]) {
      extracted.timeline = m[1] + m[2]
      break
    }
  }

  // 提取需求描述（简单提取较长句子）
  if (msg.length > 20 && !projectInfo.value.requirements) {
    const reqPatterns = [
      /(?:需求|需要|要求|想做|希望)[：:\s]*(.{10,200})/,
      /(?:我们要|我们想|我们打算|目标是|目的是)(.{10,200})/
    ]
    for (const p of reqPatterns) {
      const m = msg.match(p)
      if (m && m[1]) {
        const cleaned = m[1].replace(/[，。；]$/, '').trim()
        if (cleaned.length > 5) {
          extracted.requirements = cleaned
          break
        }
      }
    }
  }

  // 提取技术栈
  const techPatterns = [
    /(?:技术栈|技术|架构)[：:\s]*(.{3,100})/,
    /(?:用|使用|采用)["']?(vue|react|angular|spring|java|python|node|go|docker|k8s|kubernete)["']?/i
  ]
  for (const p of techPatterns) {
    const m = msg.match(p)
    if (m && m[1]) {
      extracted.techStack = m[1].replace(/[，。；]$/, '').trim()
      break
    }
  }

  return extracted
}

// 生成AI回复（结合行业提示词）
function generateAIResponse(userMessage) {
  const lower = userMessage.toLowerCase()
  const ind = projectInfo.value.industry || '通用'
  const config = industryConfigs.value[ind] || industryConfigs.value['信息技术']

  // 先分析提取信息
  const extracted = analyzeUserMessage(userMessage)

  // 如果提取到信息，更新projectInfo
  if (Object.keys(extracted).length > 0) {
    Object.assign(projectInfo.value, extracted)
  }

  // 根据配置提示词和行业特点生成回复
  let responses = []

  // 检查还有哪些信息缺失
  const missing = []
  if (!projectInfo.value.name) missing.push('项目名称')
  if (!projectInfo.value.budget) missing.push('预算范围')
  if (!projectInfo.value.timeline) missing.push('项目周期')
  if (!projectInfo.value.requirements) missing.push('核心需求')
  if (!projectInfo.value.techStack) missing.push('技术要求')

  if (Object.keys(extracted).length > 0) {
    const extractedKeys = Object.keys(extracted).map(k => infoLabels[k]).filter(Boolean)
    responses.push(`已记录信息：${extractedKeys.join('、')}。`)
  }

  // 根据行业提示词生成引导
  if (config.prompt) {
    if (missing.length > 0) {
      const nextItem = missing[0]
      const followUps = {
        '项目名称': '能告诉我这个项目的具体名称吗？',
        '预算范围': '项目的预算大概是多少？',
        '项目周期': '预计项目周期是多长时间？',
        '核心需求': '项目的核心需求或目标是什么？',
        '技术要求': '对技术方面有什么要求或偏好吗？'
      }
      responses.push(followUps[nextItem] || `还需要了解${nextItem}。`)
    } else {
      responses.push('项目信息已收集完整！您可以继续补充细节，或点击"生成方案"按钮开始生成解决方案。')
    }
  }

  // 针对特定关键词的智能回复
  if (lower.includes('价格') || lower.includes('费用') || lower.includes('成本')) {
    responses.push('费用方面会根据具体需求和技术复杂度而定。如果您能提供预算范围，我可以为您制定更精准的成本方案。')
  } else if (lower.includes('时间') || lower.includes('周期') || lower.includes('工期')) {
    responses.push('项目周期取决于需求复杂度。您预计的时间安排是怎样的？')
  } else if (lower.includes('技术') || lower.includes('架构')) {
    responses.push('技术架构方面，我会根据行业特点推荐合适的方案。您对技术栈有什么偏好吗？')
  }

  if (responses.length === 0) {
    responses.push(`好的，我已了解。${missing.length > 0 ? '还需要您补充：' + missing.slice(0, 2).join('、') + '。' : '您可以继续补充需求，或点击"生成方案"。'}`)
  }

  return responses.join('\n\n')
}

// 行业模板配置
const showIndustryConfig = ref(false)
const configTab = ref('prompt')
const editingIndustry = ref('信息技术')

const industryConfigs = ref({
  '信息技术': {
    name: '信息技术',
    icon: 'fas fa-laptop-code',
    color: '#6366f1',
    desc: '软件开发、系统集成',
    prompt: '你是一位资深的IT解决方案顾问，专注于信息技术领域的项目咨询与方案设计。你擅长分析客户的业务需求，将其转化为技术方案。请用专业但易懂的语言与客户沟通。注意：1. 深入理解客户的业务场景；2. 推荐成熟可靠的技术方案；3. 考虑系统的可扩展性和安全性。'
  },
  '建筑工程': {
    name: '建筑工程',
    icon: 'fas fa-building',
    color: '#059669',
    desc: '工程施工、建筑设计',
    prompt: '你是一位资深的建筑工程顾问，专注于工程项目的方案设计与实施规划。你擅长分析工程项目需求，提供专业的施工组织设计和项目管理建议。请用规范的行业术语与客户沟通。注意：1. 严格遵守工程建设规范；2. 注重施工安全与质量控制；3. 合理规划工期与资源配置。'
  },
  '医疗卫生': {
    name: '医疗卫生',
    icon: 'fas fa-heartbeat',
    color: '#dc2626',
    desc: '医疗信息化、健康管理',
    prompt: '你是一位资深的医疗信息化顾问，专注于医疗卫生领域的数字化转型方案设计。你熟悉医疗行业规范和数据安全要求。注意：1. 严格遵守医疗行业法规；2. 重视患者数据隐私保护；3. 确保系统的高可用性和稳定性；4. 符合互联互通和等保要求。'
  },
  '教育培训': {
    name: '教育培训',
    icon: 'fas fa-graduation-cap',
    color: '#d97706',
    desc: '在线教育、培训系统',
    prompt: '你是一位资深的教育科技顾问，专注于教育培训领域的平台建设与课程设计。你擅长将教育理念与技术手段相结合。注意：1. 以学习者为中心的设计理念；2. 注重用户体验和互动性；3. 支持多种教学模式；4. 保障平台稳定性和并发性能。'
  },
  '金融服务': {
    name: '金融服务',
    icon: 'fas fa-chart-line',
    color: '#3b82f6',
    desc: '金融科技、风控系统',
    prompt: '你是一位资深的金融科技顾问，专注于金融服务领域的系统建设和风控方案设计。你熟悉金融监管要求和安全标准。注意：1. 严格遵守金融监管法规；2. 高度重视系统安全与数据保护；3. 确保交易的实时性和准确性；4. 符合等保和PCI-DSS等标准。'
  },
  '智能制造': {
    name: '智能制造',
    icon: 'fas fa-industry',
    color: '#8b5cf6',
    desc: '工业4.0、物联网',
    prompt: '你是一位资深的智能制造顾问，专注于工业互联网和智能制造转型方案。你熟悉MES、IoT、大数据分析等技术在制造业的应用。注意：1. 注重与现有设备和系统的兼容性；2. 保障工业数据的安全与实时性；3. 支持柔性生产和快速响应；4. 考虑投资回报和实施可行性。'
  }
})

// 记录打开配置时的原始行业名称列表，用于取消时回退新增
let originalIndustryNames = []

function openIndustryConfig() {
  // 记录打开时的行业名称快照，用于取消时回退
  originalIndustryNames = industries.map(i => i.name)
  editingIndustry.value = projectInfo.value.industry || '信息技术'
  configTab.value = 'prompt'
  showIndustryConfig.value = true
}

function closeIndustryConfig() {
  // 回退本次新增的自定义模板（未保存的）
  const namesToRemove = industries.filter(i => !originalIndustryNames.includes(i.name)).map(i => i.name)
  for (const name of namesToRemove) {
    const idx = industries.findIndex(i => i.name === name)
    if (idx !== -1) industries.splice(idx, 1)
    delete industryConfigs.value[name]
  }
  // 如果当前编辑的行业已被回退，切回默认
  if (namesToRemove.includes(editingIndustry.value)) {
    editingIndustry.value = originalIndustryNames[0] || '信息技术'
  }
  showIndustryConfig.value = false
}

function deleteIndustry(name) {
  // 不能删除内置的6个行业
  const builtIn = ['信息技术', '建筑工程', '医疗卫生', '教育培训', '金融服务', '智能制造']
  if (builtIn.includes(name)) {
    appStore.showModal('提示', '内置行业模板不可删除', 'warning')
    return
  }
  const idx = industries.findIndex(i => i.name === name)
  if (idx !== -1) industries.splice(idx, 1)
  delete industryConfigs.value[name]
  // 如果删除的是当前编辑的行业，切换到第一个
  if (editingIndustry.value === name) {
    editingIndustry.value = industries[0]?.name || '信息技术'
  }
}

function saveIndustryConfig() {
  appStore.showModal('保存成功', `已保存"${editingIndustry.value}"行业模板的提示词配置`, 'success')
  showIndustryConfig.value = false
}

function configPromptTokens() {
  const prompt = industryConfigs.value[editingIndustry.value]?.prompt || ''
  return Math.ceil(prompt.length / 2)
}

function addNewIndustry() {
  const newId = Date.now()
  // 用序号避免重名
  const existingCustom = industries.filter(i => i.custom).length
  const newName = `自定义模板${existingCustom + 1}`
  const newColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
  
  // 添加到 industries 列表
  industries.push({
    name: newName,
    color: newColor,
    icon: 'fas fa-puzzle-piece',
    desc: '自定义行业模板',
    custom: true
  })
  
  // 添加默认配置
  industryConfigs.value[newName] = {
    name: newName,
    icon: 'fas fa-puzzle-piece',
    color: newColor,
    desc: '自定义行业模板',
    prompt: '你是一位专业的行业顾问，擅长为客户提供定制化的解决方案。请根据用户的需求，提供专业、详细的建议和方案。'
  }
  
  // 自动选中新模板
  editingIndustry.value = newName
}

function getIndustryColor(industryName) {
  const ind = industries.find(i => i.name === industryName)
  return ind ? ind.color : '#6366f1'
}

function getIndustryIcon(industryName) {
  const ind = industries.find(i => i.name === industryName)
  return ind ? ind.icon : 'fas fa-laptop-code'
}

// 生成方案后跳转新页面
function generate() {
  if (!projectInfo.value.name) {
    appStore.showModal('提示', '请先通过对话收集项目需求信息', 'warning')
    return
  }

  // 构建完整的方案数据
  const solutionData = {
    projectInfo: { ...projectInfo.value },
    generatedAt: new Date().toISOString()
  }

  // 保存到历史记录
  const historyRecord = {
    ...projectInfo.value,
    time: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    generatedAt: solutionData.generatedAt
  }
  saveHistorySolution(historyRecord)

  // 跳转至方案编辑页面
  router.push({
    path: '/agent/solution-editor',
    query: { data: encodeURIComponent(JSON.stringify(solutionData)) }
  })
}

// 覆盖原来的generate
</script>

<style scoped>
.agent-page { padding: 24px; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
.agent-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0; }
.agent-title { display: flex; align-items: center; gap: 16px; }
.agent-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; }
.agent-icon.solution { background: linear-gradient(135deg, #059669, #10b981); }
.agent-title h2 { font-size: 20px; font-weight: 800; color: var(--text-primary); }
.agent-title p { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
.agent-actions { display: flex; gap: 10px; }
.action-btn { padding: 8px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; font-family: inherit; background: var(--bg-white); color: var(--text-secondary); transition: all var(--tr); }
.action-btn:hover { border-color: var(--primary); color: var(--primary); }
.action-btn.primary { background: var(--primary); color: #fff; border-color: var(--primary); }
.action-btn.primary:hover { background: var(--primary-dark); }
.action-btn:disabled { opacity: .5; cursor: not-allowed; }

/* 主内容区：左侧对话区 + 右侧面板 */
.agent-content { flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
.input-section { min-height: 0; display: flex; flex-direction: column; }
.result-section { overflow-y: auto; min-height: 0; padding-right: 4px; }
.result-section::-webkit-scrollbar { width: 4px; }
.result-section::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
.section-card { background: var(--bg-white); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 16px; transition: all var(--tr); }
.section-card:last-child { margin-bottom: 0; }
.section-card h3 { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.section-card h3 i { color: var(--primary); width: 18px; }

/* ========== 左侧：需求收集助手 ========== */
.chat-card { background: linear-gradient(180deg, #fafbff, #fff); border-color: #e0e7ff; flex: 1; display: flex; flex-direction: column; min-height: 0; }
.chat-header { flex-shrink: 0; }
.chat-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.chat-title h3 { margin-bottom: 0 !important; }
.industry-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; font-size: 11px; font-weight: 600; background: linear-gradient(135deg, rgba(99,102,241,.08), rgba(139,92,246,.08)); color: var(--ind-color, var(--primary)); border: 1px solid rgba(99,102,241,.2); border-radius: 20px; }
.industry-badge i { font-size: 10px; }
.chat-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 0; }

.ask-chat { flex: 1; min-height: 0; display: flex; flex-direction: column; margin-top: 14px; background: #f9fafb; border-radius: var(--radius-sm); overflow: hidden; }
.ask-messages { display: flex; flex-direction: column; gap: 12px; flex: 1; overflow-y: auto; padding: 16px; }
.ask-messages::-webkit-scrollbar { width: 4px; }
.ask-messages::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
.ask-message { display: flex; gap: 10px; animation: msgIn .3s ease; }
.ask-message.user { flex-direction: row-reverse; }
.ask-avatar { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ask-message.assistant .ask-avatar { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; }
.ask-message.user .ask-avatar { background: #e5e7eb; color: #374151; }
.ask-content { max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.6; }
.ask-message.assistant .ask-content { background: #fff; border: 1px solid #e5e7eb; }
.ask-message.user .ask-content { background: var(--primary); color: #fff; }
.ask-options p { margin-bottom: 10px; font-weight: 500; }
.option-btns { display: flex; flex-wrap: wrap; gap: 8px; }
.option-btns button { padding: 6px 14px; font-size: 12px; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; cursor: pointer; color: var(--primary); transition: all var(--tr); font-family: inherit; display: flex; align-items: center; gap: 5px; }
.option-btns button:hover { background: var(--primary); color: #fff; transform: translateY(-1px); }
.opt-icon { font-size: 13px; }
.ask-input-group p { margin-bottom: 10px; font-weight: 500; }
.ask-input-wrapper { display: flex; gap: 8px; }
.ask-input-wrapper input { flex: 1; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: inherit; background: #fff; transition: all var(--tr); }
.ask-input-wrapper input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.ask-input-wrapper button { width: 36px; height: 36px; background: var(--primary); color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: all var(--tr); }
.ask-input-wrapper button:hover { background: var(--primary-dark); }

/* 固定输入区域 */
.ask-input-fixed { flex-shrink: 0; padding: 12px 16px; background: #fff; border-top: 1px solid #e5e7eb; }

/* 行业模板快捷按钮 */
.industry-quick-btns { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
.industry-quick-btn { padding: 6px 12px; font-size: 12px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; gap: 5px; font-family: inherit; transition: all var(--tr); }
.industry-quick-btn:hover { background: #eef2ff; border-color: var(--ind-color, var(--primary)); color: var(--ind-color, var(--primary)); }
.industry-quick-btn.active { background: linear-gradient(135deg, rgba(99,102,241,.1), rgba(139,92,246,.1)); border-color: var(--ind-color, var(--primary)); color: var(--ind-color, var(--primary)); font-weight: 600; }
.industry-quick-btn i { font-size: 12px; }

.ask-input-area { display: flex; gap: 8px; }
.ask-input-area input { flex: 1; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: inherit; background: #f9fafb; transition: all var(--tr); }
.ask-input-area input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,.1); background: #fff; }
.ask-input-area button { width: 40px; height: 40px; background: var(--primary); color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: all var(--tr); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ask-input-area button:hover { background: var(--primary-dark); transform: scale(1.05); }

@keyframes msgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* AI加载动画 */
.typing-dots { display: flex; gap: 4px; padding: 4px 0; }
.typing-dots span { width: 6px; height: 6px; background: var(--text-muted); border-radius: 50%; animation: typingBounce 1.4s infinite; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingBounce { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }

/* ========== 右侧面板 ========== */
/* 方案工作台 */
.workbench-card { background: linear-gradient(180deg, #fafbff, #fff); border-color: #e0e7ff; }
.workbench-progress { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.progress-bar { flex: 1; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 3px; transition: width .4s ease; }
.progress-text { font-size: 12px; font-weight: 700; color: var(--primary); min-width: 36px; text-align: right; }
.workbench-info { display: flex; flex-direction: column; gap: 8px; }
.wb-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: #f9fafb; border-radius: var(--radius-sm); font-size: 12px; }
.wb-item.filled { background: #eef2ff; }
.wb-label { display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-weight: 500; }
.wb-label i { font-size: 11px; color: var(--primary); width: 14px; }
.wb-value { color: var(--text-primary); font-weight: 600; max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; }
.wb-item.filled .wb-value { color: var(--primary); }
.workbench-actions { display: flex; gap: 8px; margin-top: 14px; }
.action-btn-sm { padding: 6px 14px; font-size: 12px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; gap: 5px; font-family: inherit; transition: all var(--tr); }
.action-btn-sm:hover { background: #eef2ff; border-color: var(--primary); color: var(--primary); }
.action-btn-sm.primary { background: var(--primary); color: #fff; border-color: var(--primary); }
.action-btn-sm.primary:hover { background: var(--primary-dark); }

/* 行业模板选择 */
.industry-card { background: linear-gradient(180deg, #fafbff, #fff); border-color: #e0e7ff; }
.industry-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.industry-header h3 { margin-bottom: 0 !important; }
.config-btn { padding: 4px 10px; font-size: 11px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; font-family: inherit; transition: all var(--tr); }
.config-btn:hover { background: #eef2ff; border-color: var(--primary); color: var(--primary); }
.industry-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.industry-item { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 6px; border: 1px solid #e5e7eb; border-radius: var(--radius-sm); cursor: pointer; transition: all var(--tr); background: #fff; text-align: center; }
.industry-item:hover { border-color: var(--ind-color, var(--primary)); box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.industry-item.active { border-color: var(--ind-color, var(--primary)); background: linear-gradient(135deg, rgba(99,102,241,.08), rgba(139,92,246,.08)); }
.industry-item i { font-size: 16px; color: var(--ind-color, var(--primary)); }
.industry-item span { font-size: 11px; font-weight: 600; color: var(--text-primary); }
.industry-item small { font-size: 10px; color: var(--text-muted); line-height: 1.2; }

/* 资料上传 */
.upload-card { background: linear-gradient(180deg, #fafbff, #fff); border-color: #e0e7ff; }
.upload-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; margin-top: -8px; }
.upload-area { border: 2px dashed var(--border); border-radius: var(--radius); padding: 16px; text-align: center; cursor: pointer; transition: all var(--tr); }
.upload-area:hover { border-color: var(--primary); background: var(--primary-50); }
.upload-area i { font-size: 22px; color: var(--primary); margin-bottom: 6px; }
.upload-area p { font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
.upload-area span { font-size: 11px; color: var(--text-muted); }
.file-list { margin-top: 10px; }
.file-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; background: var(--primary-50); border-radius: var(--radius-sm); margin-bottom: 4px; font-size: 11px; }
.file-item i { color: var(--primary); }
.file-item span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-item button { background: none; border: none; color: var(--text-muted); cursor: pointer; }

/* 历史生成方案 */
.history-card { background: linear-gradient(180deg, #fafbff, #fff); border-color: #e0e7ff; }
.empty-history { text-align: center; padding: 20px 10px; color: var(--text-muted); }
.empty-history i { font-size: 28px; margin-bottom: 8px; opacity: 0.5; }
.empty-history p { font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--text-secondary); }
.empty-history span { font-size: 11px; }
.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: var(--radius-sm); cursor: pointer; transition: all var(--tr); }
.history-item:hover { border-color: var(--primary); background: #eef2ff; transform: translateX(2px); }
.history-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; flex-shrink: 0; }
.history-info { flex: 1; min-width: 0; }
.history-title { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.history-meta { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
.history-industry { font-size: 11px; padding: 1px 6px; background: #e0e7ff; color: var(--primary); border-radius: 4px; }
.history-time { font-size: 11px; color: var(--text-muted); }
.history-item > i:last-child { color: var(--text-muted); font-size: 11px; transition: all var(--tr); }
.history-item:hover > i:last-child { color: var(--primary); transform: translateX(2px); }

/* 行业模板配置弹窗 */
.config-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn .2s ease; }
.config-modal { background: #fff; border-radius: var(--radius-lg); width: 720px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: var(--shadow-lg); animation: slideUp .25s ease; }
.config-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.config-modal-header h3 { font-size: 16px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 10px; }
.config-modal-header h3 i { color: var(--primary); }
.modal-close { background: none; border: none; font-size: 16px; color: var(--text-muted); cursor: pointer; padding: 4px; }
.modal-close:hover { color: var(--text-primary); }
.config-modal-body { display: flex; flex: 1; min-height: 0; overflow: hidden; }
.config-sidebar { width: 200px; border-right: 1px solid var(--border); padding: 16px; background: #fafafa; overflow-y: auto; flex-shrink: 0; }
.config-tabs { margin-bottom: 16px; }
.config-tab { padding: 8px 12px; font-size: 12px; font-weight: 600; color: var(--text-secondary); border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all var(--tr); }
.config-tab.active { background: #eef2ff; color: var(--primary); }
.config-tab i { font-size: 13px; width: 16px; }
.config-ind-list { display: flex; flex-direction: column; gap: 4px; }
.config-ind-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: all var(--tr); font-size: 12px; color: var(--text-secondary); }
.config-ind-item:hover { background: #f3f4f6; }
.config-ind-item.active { background: linear-gradient(135deg, rgba(99,102,241,.1), rgba(139,92,246,.1)); color: var(--primary); font-weight: 600; }
.config-ind-item i { font-size: 13px; width: 16px; color: var(--ind-color, var(--primary)); }
.config-ind-item .config-ind-delete { margin-left: auto; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px 4px; font-size: 10px; border-radius: 4px; opacity: 0; transition: all .2s; }
.config-ind-item:hover .config-ind-delete { opacity: 1; }
.config-ind-item .config-ind-delete:hover { color: #dc2626; background: #fee2e2; }
.config-main { flex: 1; padding: 24px; overflow-y: auto; }
.config-field { margin-bottom: 20px; }
.config-field label { display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
.config-field label i { color: var(--text-muted); font-size: 12px; cursor: help; }
.config-name-row { display: flex; align-items: center; gap: 10px; }
.config-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; flex-shrink: 0; }
.config-name-row input { flex: 1; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: inherit; transition: all var(--tr); }
.config-name-row input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.config-field textarea { width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; line-height: 1.7; font-family: inherit; resize: vertical; transition: all var(--tr); }
.config-field textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.config-tokens { text-align: right; font-size: 11px; color: var(--text-muted); margin-top: 6px; }
.config-modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border); flex-shrink: 0; }

/* 新增模板按钮 */
.add-industry-btn { width: 100%; margin-top: 12px; padding: 8px 12px; border: 1px dashed var(--border); border-radius: 8px; background: #f8fafc; cursor: pointer; font-size: 12px; font-weight: 600; color: var(--primary); display: flex; align-items: center; justify-content: center; gap: 6px; font-family: inherit; transition: all var(--tr); }
.add-industry-btn:hover { background: #eef2ff; border-color: var(--primary); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
</style>