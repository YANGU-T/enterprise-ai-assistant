<template>
  <div class="ai-chat">
    <!-- 左侧对话历史 -->
    <div class="chat-sidebar">
      <div class="chat-sidebar-header">
        <button class="new-chat-btn" @click="startNewChat">
          <i class="fas fa-plus"></i>
          <span>新建对话</span>
        </button>
      </div>
      <div class="chat-history">
        <div 
          v-for="chat in chatHistory" 
          :key="chat.id"
          class="chat-history-item"
          :class="{ active: currentChatId === chat.id, 'agent-chat': chat.agent }"
          @click="switchChat(chat.id)"
        >
          <i :class="chat.agent ? 'fas fa-robot' : 'fas fa-comment-dots'"></i>
          <div class="chat-history-info">
            <div class="chat-history-title">
              <span v-if="chat.agent" class="agent-badge">{{ chat.agentName || 'Agent' }}</span>
              {{ chat.title }}
            </div>
            <div class="chat-history-time">{{ chat.time }}</div>
          </div>
          <button class="delete-chat-btn" @click.stop="deleteChat(chat.id)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 右侧对话区域 -->
    <div class="chat-main">
      <!-- 对话头部 -->
      <div class="chat-header">
        <div class="chat-header-info">
          <h2>{{ chatTitle }}</h2>
          <span class="chat-status">
            <span class="status-dot"></span>
            {{ currentAgent ? 'Agent运行中' : '在线' }}
          </span>
        </div>
        <div class="chat-header-actions">
          <button v-if="currentAgent" class="header-btn back-to-agent" @click="goBackToAgent" title="返回Agent页面">
            <i class="fas fa-arrow-left"></i>
            <span>返回{{ currentAgent.name }}</span>
          </button>
          <select v-model="selectedModel" class="model-select" :title="getModelDescription(selectedModel)">
            <option v-for="model in availableModels" :key="model.id" :value="model.id">
              {{ model.name }} ({{ model.provider }})
            </option>
          </select>
          <button class="header-btn" @click="clearChat" title="清空当前对话">
            <i class="fas fa-broom"></i>
          </button>
          <button class="header-btn" @click="clearAllChatHistory" title="清除所有对话缓存">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>

      <!-- 消息区域 -->
      <div class="chat-messages" ref="messagesContainer">
        <!-- 欢迎消息 -->
        <div v-if="messages.length === 0" class="welcome-section">
          <div class="welcome-icon" :style="currentAgent ? { background: `linear-gradient(135deg, ${currentAgent.color}, ${currentAgent.color}dd)` } : {}">
            <i :class="currentAgent ? currentAgent.icon : 'fas fa-robot'"></i>
          </div>
          <h1>{{ currentAgent ? currentAgent.name : '你好，我是你的AI工作助手' }}</h1>
          <p>{{ currentAgent ? currentAgent.welcome : '我可以帮你处理工作任务、分析数据、生成文档，以及协调各Agent完成复杂任务。请告诉我你的需求。' }}</p>
          
          <div class="quick-actions">
            <button 
              v-for="action in (currentAgent ? currentAgent.quickActions : quickActions)" 
              :key="action.id"
              class="quick-action-btn"
              @click="sendQuickAction(action)"
            >
              <i :class="action.icon"></i>
              <span>{{ action.label }}</span>
            </button>
          </div>
        </div>

        <!-- 消息列表 -->
        <div v-for="msg in messages" :key="msg.id" class="message" :class="msg.role">
          <div class="message-avatar" :style="msg.role === 'assistant' && currentAgent ? { background: `linear-gradient(135deg, ${currentAgent.color}, ${currentAgent.color}dd)` } : {}">
            <i :class="msg.role === 'user' ? 'fas fa-user' : (currentAgent ? currentAgent.icon : 'fas fa-robot')"></i>
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-sender">{{ msg.role === 'user' ? user.name : (currentAgent ? currentAgent.name : 'AI 助手') }}</span>
              <span class="message-time">{{ msg.time }}</span>
            </div>
            <div class="message-text" v-html="formatMessage(msg.content)"></div>
            
            <!-- 模拟响应提示 -->
            <div v-if="msg.simulated" class="simulated-badge">
              <i class="fas fa-info-circle"></i> 模拟响应 — 请在设置中配置 {{ msg.provider }} API Key 以获取真实响应
            </div>
            <div v-if="!msg.simulated && msg.provider && msg.role === 'assistant'" class="model-badge">
              <i class="fas fa-microchip"></i> {{ msg.model }} ({{ msg.provider }})
            </div>
            
            <!-- AI消息操作按钮 -->
            <div v-if="msg.role === 'assistant'" class="message-actions">
              <button class="action-btn" @click="copyMessage(msg.content)">
                <i class="fas fa-copy"></i> 复制
              </button>
              <button class="action-btn" @click="createTaskFromMessage(msg)">
                <i class="fas fa-tasks"></i> 创建任务
              </button>
              <button class="action-btn" @click="createScheduleFromMessage(msg)">
                <i class="fas fa-calendar-plus"></i> 创建日程
              </button>
              <button class="action-btn" @click="executeWithAgent(msg)">
                <i class="fas fa-robot"></i> Agent执行
              </button>
            </div>

            <!-- AI智能推荐面板 -->
            <div v-if="msg.role === 'assistant' && msg.recommendations && msg.recommendations.length" class="recommendation-panel">
              <div class="rec-header"><i class="fas fa-magic"></i> 智能推荐</div>
              <div class="rec-list">
                <div v-for="rec in msg.recommendations" :key="rec.id" class="rec-item" @click="handleRecommendation(rec)">
                  <div class="rec-icon" :style="{ background: rec.color }"><i :class="rec.icon"></i></div>
                  <div class="rec-body">
                    <div class="rec-title">{{ rec.title }}</div>
                    <div class="rec-desc">{{ rec.desc }}</div>
                  </div>
                  <i class="fas fa-chevron-right"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载中 -->
        <div v-if="isLoading" class="message assistant">
          <div class="message-avatar">
            <i class="fas fa-robot"></i>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input-area">
        <div class="input-wrapper">
          <textarea 
            v-model="inputMessage"
            placeholder="输入你的需求，例如：帮我生成本周的工作周报..."
            @keydown.enter.exact.prevent="sendMessage"
            @input="autoResize"
            ref="inputRef"
            rows="1"
          ></textarea>
          <div class="input-actions">
            <button class="input-btn" title="上传文件">
              <i class="fas fa-paperclip"></i>
            </button>
            <button class="input-btn" title="语音输入">
              <i class="fas fa-microphone"></i>
            </button>
            <button 
              class="send-btn" 
              :class="{ active: inputMessage.trim() }"
              @click="sendMessage"
              :disabled="!inputMessage.trim() || isLoading"
            >
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
        <div class="input-hint">
          按 Enter 发送，Shift + Enter 换行
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const user = computed(() => appStore.user)
const agentId = computed(() => route.params.agentId)

const messagesContainer = ref(null)
const inputRef = ref(null)
const inputMessage = ref('')
const isLoading = ref(false)
const currentChatId = ref('chat-1')

// 从全局Store同步当前模型（动态选择第一个可用模型或空字符串）
const selectedModel = ref('')

// 同步 selectedModel 到 store
watch(() => appStore.modelConfig.currentModel, (val) => {
  if (val) selectedModel.value = val
}, { immediate: true })

// 监听 selectedModel 变化，同步到 store
watch(selectedModel, (val) => {
  if (val && val !== appStore.modelConfig.currentModel) {
    appStore.switchModel(val)
  }
})

// 确保 selectedModel 有值：优先使用 store 的 currentModel，否则选第一个可用模型
watch(() => appStore.modelConfig.models, (models) => {
  const list = (models || []).filter(m => m.status === 'active')
  if (list.length > 0 && !list.some(m => m.id === selectedModel.value)) {
    selectedModel.value = list[0].id
  }
}, { immediate: true })

// 从全局Store同步可用模型列表（仅激活的模型）
const availableModels = computed(() => {
  const models = appStore.modelConfig.models || []
  return models
    .filter(m => m.status === 'active')
    .map(m => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
      description: m.description,
      endpoint: m.endpoint,
      apiKey: m.apiKey
    }))
})

const agentConfigs = {
  'bid-matching': {
    name: '招投标匹配Agent',
    icon: 'fas fa-search-dollar',
    color: '#6366f1',
    welcome: '你好，我是招投标匹配Agent。我可以帮你分析招标文件，匹配企业资质，生成投标建议。请上传招标文件或描述你的需求。',
    quickActions: [
      { id: 'bid-1', icon: 'fas fa-file-upload', label: '上传招标文件', prompt: '请帮我分析这个招标文件，匹配我们公司的资质' },
      { id: 'bid-2', icon: 'fas fa-search', label: '搜索匹配项目', prompt: '帮我搜索最近的招投标项目，行业是IT信息化' },
      { id: 'bid-3', icon: 'fas fa-chart-pie', label: '生成投标建议', prompt: '根据我的公司情况，生成投标策略建议' }
    ]
  },
  'solution-gen': {
    name: '解决方案生成Agent',
    icon: 'fas fa-file-invoice',
    color: '#059669',
    welcome: '你好，我是解决方案生成Agent。我可以基于你的需求自动生成专业的解决方案文档。请描述你的项目需求。',
    quickActions: [
      { id: 'sol-1', icon: 'fas fa-edit', label: '描述项目需求', prompt: '我需要一个企业数字化转型的技术方案' },
      { id: 'sol-2', icon: 'fas fa-cog', label: '配置方案参数', prompt: '帮我生成详细的技术方案，包含架构设计和实施计划' },
      { id: 'sol-3', icon: 'fas fa-download', label: '导出方案文档', prompt: '将生成的解决方案导出为Word文档' }
    ]
  },
  'resume-filter': {
    name: '简历筛选Agent',
    icon: 'fas fa-user-check',
    color: '#d97706',
    welcome: '你好，我是简历筛选Agent。我可以智能分析简历，按岗位需求筛选匹配候选人。请上传简历或描述岗位要求。',
    quickActions: [
      { id: 'res-1', icon: 'fas fa-file-upload', label: '上传简历文件', prompt: '请帮我筛选这批简历，岗位是前端开发工程师' },
      { id: 'res-2', icon: 'fas fa-briefcase', label: '设置岗位要求', prompt: '我需要招聘一个5年经验的Java开发工程师' },
      { id: 'res-3', icon: 'fas fa-users', label: '查看候选人推荐', prompt: '推荐最匹配的候选人，并给出匹配度分析' }
    ]
  }
}

const currentAgent = computed(() => {
  if (agentId.value && agentConfigs[agentId.value]) {
    return agentConfigs[agentId.value]
  }
  return null
})

const chatTitle = computed(() => {
  return currentAgent.value ? currentAgent.value.name : 'AI 助手'
})

// 从 localStorage 加载聊天历史
function loadChatHistory() {
  try {
    const saved = localStorage.getItem('ai_chat_history')
    if (saved) return JSON.parse(saved)
  } catch (e) { /* ignore */ }
  return [
    { id: 'chat-1', title: '本周工作安排', time: '今天 09:30' },
    { id: 'chat-2', title: '项目进度分析', time: '昨天 14:20' },
    { id: 'chat-3', title: '周报生成', time: '05-26 16:45' }
  ]
}

// 保存聊天历史到 localStorage
function saveChatHistory() {
  try {
    localStorage.setItem('ai_chat_history', JSON.stringify(chatHistory.value))
  } catch (e) { /* ignore */ }
}

// 从 localStorage 加载指定对话的消息
function loadChatMessages(chatId) {
  try {
    const saved = localStorage.getItem(`ai_chat_messages_${chatId}`)
    if (saved) return JSON.parse(saved)
  } catch (e) { /* ignore */ }
  return []
}

// 保存指定对话的消息到 localStorage
function saveChatMessages(chatId, msgs) {
  try {
    localStorage.setItem(`ai_chat_messages_${chatId}`, JSON.stringify(msgs))
  } catch (e) { /* ignore */ }
}

const chatHistory = ref(loadChatHistory())

const messages = ref([])

const quickActions = ref([
  { id: 1, icon: 'fas fa-file-alt', label: '生成工作周报', prompt: '帮我生成本周的工作周报，需要包含工作内容、成果和下周计划' },
  { id: 2, icon: 'fas fa-tasks', label: '拆解任务需求', prompt: '我有一个新项目需求，请帮我拆解成具体的任务步骤' },
  { id: 3, icon: 'fas fa-chart-bar', label: '分析工作数据', prompt: '帮我分析最近的工作数据，找出效率提升点' },
  { id: 4, icon: 'fas fa-calendar', label: '安排今日日程', prompt: '帮我安排今天的工作日程，优先处理重要紧急的任务' }
])

function startNewChat() {
  // 保存当前对话的消息
  if (currentChatId.value && messages.value.length > 0) {
    saveChatMessages(currentChatId.value, messages.value)
  }
  
  const newId = `chat-${Date.now()}`
  chatHistory.value.unshift({
    id: newId,
    title: '新对话',
    time: '刚刚'
  })
  currentChatId.value = newId
  messages.value = []
  saveChatHistory()
}

function switchChat(chatId) {
  // 保存当前对话的消息
  if (currentChatId.value && messages.value.length > 0) {
    saveChatMessages(currentChatId.value, messages.value)
  }
  
  currentChatId.value = chatId
  // 从 localStorage 加载历史消息
  messages.value = loadChatMessages(chatId)
}

function deleteChat(chatId) {
  chatHistory.value = chatHistory.value.filter(c => c.id !== chatId)
  // 删除该对话的消息
  try {
    localStorage.removeItem(`ai_chat_messages_${chatId}`)
  } catch (e) { /* ignore */ }
  
  if (currentChatId.value === chatId) {
    currentChatId.value = chatHistory.value[0]?.id || ''
    messages.value = currentChatId.value ? loadChatMessages(currentChatId.value) : []
  }
  saveChatHistory()
}

function clearChat() {
  messages.value = []
  // 清空时也保存（空数组）
  if (currentChatId.value) {
    saveChatMessages(currentChatId.value, [])
  }
}

function clearAllChatHistory() {
  if (!confirm('确定要清除所有对话历史缓存吗？此操作不可恢复。')) return
  
  // 删除所有对话消息缓存
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith('ai_chat_messages_')) {
      localStorage.removeItem(key)
    }
  })
  
  // 清除对话列表
  localStorage.removeItem('ai_chat_history')
  
  // 重置当前状态
  chatHistory.value = [
    { id: 'chat-1', title: '新对话', time: '刚刚' }
  ]
  currentChatId.value = 'chat-1'
  messages.value = []
  saveChatHistory()
  
  appStore.showModal('成功', '所有对话历史缓存已清除', 'success')
}

async function sendMessage() {
  if (!inputMessage.value.trim() || isLoading.value) return
  
  const userMsg = {
    id: Date.now(),
    role: 'user',
    content: inputMessage.value.trim(),
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  
  messages.value.push(userMsg)
  inputMessage.value = ''
  
  await nextTick()
  scrollToBottom()
  
  // 构建消息历史（发送给AI API）
  const apiMessages = [
    {
      role: 'system',
      content: appStore.modelConfig.systemPrompt || '你是一个专业的企业AI工作助手，帮助用户处理工作任务、分析数据、生成文档。'
    },
    // 包含最近20条对话作为上下文
    ...messages.value.slice(-20).map(m => ({
      role: m.role,
      content: m.content
    }))
  ]
  
  isLoading.value = true
  
  try {
    // 查找当前模型信息
    const models = appStore.modelConfig.models || []
    const currentModelInfo = models.find(m => m.id === selectedModel.value)
    const provider = currentModelInfo?.provider || ''
    const endpoint = currentModelInfo?.endpoint || ''
    const apiKey = currentModelInfo?.apiKey || ''
    // 使用模型名称作为 API 调用的 model 参数（用户配置的名称即为 API 模型标识）
    // 如果模型名称为空或与ID相同（自动生成的），则使用提供商默认模型名
    let modelName = currentModelInfo?.name || ''
    if (!modelName || modelName === selectedModel.value || modelName.startsWith('model-')) {
      // 根据提供商提供默认模型名
      const defaultModels = {
        'OpenAI': 'gpt-4o',
        'Anthropic': 'claude-3.5-sonnet',
        'DeepSeek': 'deepseek-v4-flash',
        '阿里云': 'qwen-max',
        '智谱AI': 'glm-4',
        'Google': 'gemini-2.0-pro',
        '小米MImo': 'mimo-v2.5-pro'
      }
      modelName = defaultModels[provider] || 'gpt-4o'
    }
    
    // 根据是否启用联网搜索选择端点
    const useWebSearch = appStore.modelConfig.enableWebSearch
    const apiEndpoint = useWebSearch ? '/api/ai/chat-with-search' : '/api/ai/chat'
    
    // 调用后端AI接口
    const response = await fetch(apiEndpoint, {
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
          maxTokens: appStore.modelConfig.maxTokens,
          topP: appStore.modelConfig.topP,
          enableWebSearch: useWebSearch
        }
      })
    })
    
    // 检查响应状态
    if (!response.ok) {
      let errorMsg = `请求失败 (${response.status})`
      try {
        const errorData = await response.json()
        errorMsg = errorData.message || errorData.hint || errorMsg
      } catch {
        errorMsg = `服务器返回错误 (${response.status})`
      }
      throw new Error(errorMsg)
    }
    
    // 安全解析JSON
    let result
    try {
      const text = await response.text()
      if (!text || text.trim() === '') {
        throw new Error('服务器返回空响应')
      }
      result = JSON.parse(text)
    } catch (parseError) {
      if (parseError.message.includes('服务器返回空响应')) throw parseError
      throw new Error('服务器响应格式错误，请检查AI服务配置')
    }
    
    if (result.success) {
      let aiContent = result.data.content
      const recommendations = analyzeAndRecommend(userMsg.content)
      
      // 如果有联网搜索结果，在回复末尾添加来源信息
      if (result.data.searchResults && result.data.searchResults.length > 0) {
        const sources = result.data.searchResults
          .map((r, i) => `[${i + 1}] ${r.title}`)
          .join('\n')
        aiContent += `\n\n---\n**联网搜索来源：**\n${sources}`
      }
      
      messages.value.push({
        id: Date.now(),
        role: 'assistant',
        content: aiContent,
        recommendations,
        model: result.data.model,
        provider: result.data.provider,
        simulated: result.data.simulated,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      })
      
      // 保存消息到 localStorage
      saveChatMessages(currentChatId.value, messages.value)
      
      // 更新对话标题（如果是第一条消息）
      if (messages.value.length === 2) {
        const chat = chatHistory.value.find(c => c.id === currentChatId.value)
        if (chat && chat.title === '新对话') {
          chat.title = userMsg.content.substring(0, 20) + (userMsg.content.length > 20 ? '...' : '')
          chat.time = '刚刚'
          saveChatHistory()
        }
      }
      
      // 更新全局推荐
      if (recommendations && recommendations.length) {
        appStore.setAiRecommendations(recommendations)
      }
    } else {
      // 请求失败，显示详细错误信息
      let errorMsg = result.message || 'AI服务暂时不可用'
      if (response.status === 404) {
        errorMsg = `模型接口返回 404，请检查：\n1. API接口地址是否正确\n2. 模型名称是否与服务商一致\n3. API密钥是否有效\n\n原始错误：${result.message || '接口不存在'}`
      } else if (response.status === 401 || response.status === 403) {
        errorMsg = `认证失败，请检查 API 密钥是否正确\n\n原始错误：${result.message}`
      } else if (response.status === 400) {
        errorMsg = `请求参数错误：${result.message}\n请检查模型配置中的参数是否正确`
      } else if (response.status === 502) {
        errorMsg = `AI服务返回异常响应：\n${result.message}\n${result.hint || ''}\n\n${result.error ? '服务端返回内容: ' + result.error : ''}`
      } else if (response.status === 500) {
        errorMsg = `服务器内部错误：${result.message}\n${result.error || ''}`
      } else if (response.status === 408) {
        errorMsg = `请求超时：${result.message}`
      }
      messages.value.push({
        id: Date.now(),
        role: 'assistant',
        content: `⚠️ 请求失败（${response.status}）：${errorMsg}`,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      })
      // 保存错误消息到 localStorage
      saveChatMessages(currentChatId.value, messages.value)
    }
  } catch (error) {
    console.error('AI请求错误:', error)
    // 显示错误信息，不再使用本地模拟
    let errorContent = `⚠️ 请求失败：${error.message || '网络错误'}`
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      errorContent = '⚠️ 网络连接失败，请检查：\n1. 网络是否正常\n2. 后端服务是否运行'
    }
    messages.value.push({
      id: Date.now(),
      role: 'assistant',
      content: errorContent,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    })
    // 保存错误消息到 localStorage
    saveChatMessages(currentChatId.value, messages.value)
  } finally {
    isLoading.value = false
    nextTick(() => scrollToBottom())
  }
}

function sendQuickAction(action) {
  inputMessage.value = action.prompt
  sendMessage()
}

// 获取模型描述
function getModelDescription(modelId) {
  const models = appStore.modelConfig.models || []
  const model = models.find(m => m.id === modelId)
  return model ? `${model.name} — ${model.description || model.endpoint}` : modelId
}

function generateAIResponse(userInput) {
  // 如果有Agent上下文，返回Agent特定的响应
  if (currentAgent.value) {
    const response = generateAgentResponse(userInput, agentId.value)
    return { response, recommendations: analyzeAndRecommend(userInput) }
  }
  
  // 通用AI响应逻辑
  const responses = {
    '周报': `好的，我来帮你生成本周工作周报。

**本周工作内容：**
1. 完成了企业AI助手项目的核心功能开发
2. 与团队成员进行了3次技术评审会议
3. 优化了系统性能，响应时间提升20%

**主要成果：**
- AI对话模块完成度达到80%
- 个人工作台功能已基本实现
- Agent配置模块进入测试阶段

**下周工作计划：**
1. 继续完善AI对话功能
2. 开始集成外部Agent工具
3. 准备项目中期汇报材料

已自动为你创建任务和日程，请查看工作台。`,
    
    '任务': `我来帮你拆解这个需求。根据你的描述，我建议将任务分为以下几个阶段：

**阶段一：需求分析（1-2天）**
- 收集和整理业务需求
- 确定技术方案和架构设计
- 输出需求文档

**阶段二：开发实现（3-5天）**
- 搭建基础框架
- 实现核心功能模块
- 编写单元测试

**阶段三：测试优化（1-2天）**
- 功能测试和Bug修复
- 性能优化
- 用户体验改进

**阶段四：部署上线（1天）**
- 部署到测试环境
- 最终验收
- 正式上线

已将各阶段任务自动同步到工作台，你可以点击操作按钮创建日程。`,
    
    '日程': `好的，我来帮你安排日程。

**今日日程建议：**

**上午 (9:00-12:00)**
- 09:00 回复重要邮件和消息
- 10:00 处理核心工作任务
- 11:30 整理上午工作进展

**下午 (14:00-18:00)**
- 14:00 团队沟通和协作
- 15:30 处理待审批事项
- 17:00 总结今日工作，规划明日任务

已将日程同步到个人工作台，你可以点击"创建日程"按钮添加到日历。`,
    
    '招标': `我来帮你处理招投标相关工作。

**当前招标匹配情况：**
- 已匹配到 5 条招标信息
- 其中 2 条匹配度超过 90%
- 建议优先关注北京地区的项目

**推荐操作：**
1. 查看招投标匹配Agent获取详细匹配结果
2. 使用AI标书制作工具生成投标文件
3. 分析企业资质与项目要求的匹配度

需要我跳转到招投标匹配Agent吗？`,
    
    '简历': `我来帮你处理简历筛选工作。

**人才库匹配结果：**
- 已筛选出 5 位候选人
- 其中 3 位为A级推荐
- 匹配维度：技能、经验、学历

**推荐操作：**
1. 查看简历筛选Agent获取详细候选人信息
2. 使用AI分析候选人匹配度
3. 安排面试流程

需要我跳转到简历筛选Agent吗？`,
    
    '方案': `我来帮你生成解决方案。

**方案类型推荐：**
1. **技术方案** - 包含架构设计、技术选型、实施计划
2. **商业方案** - 包含市场分析、商业模式、财务预测
3. **项目方案** - 包含需求分析、项目计划、风险评估

需要我跳转到解决方案生成Agent吗？`,
    
    'default': `我理解你的需求。作为你的AI工作助手，我可以：

1. **分析任务** - 将复杂需求拆解为可执行的步骤
2. **协调资源** - 推荐合适的Agent工具来协助完成
3. **跟踪进度** - 将任务同步到你的工作台进行管理
4. **安排日程** - 根据任务自动创建日程安排
5. **智能推荐** - 根据你的需求推荐合适的AI助手功能

你想让我从哪个方面开始帮助你？`
  }
  
  let response = responses['default']
  for (const [key, value] of Object.entries(responses)) {
    if (userInput.includes(key)) { response = value; break }
  }
  
  // 智能分析用户需求并生成推荐
  const recommendations = analyzeAndRecommend(userInput)
  
  return { response, recommendations }
}

// 智能分析用户需求并生成推荐
function analyzeAndRecommend(userInput) {
  const recommendations = []
  const input = userInput.toLowerCase()
  
  // 招投标相关需求
  if (input.includes('招标') || input.includes('投标') || input.includes('标书') || input.includes('采购')) {
    recommendations.push({
      id: 'rec-bid',
      type: 'agent',
      icon: 'fas fa-search-dollar',
      color: '#6366f1',
      title: '招投标匹配Agent',
      desc: '智能匹配招标项目，分析企业资质',
      path: '/agent/bid-workbench'
    })
  }
  
  // 简历/招聘相关需求
  if (input.includes('简历') || input.includes('招聘') || input.includes('人才') || input.includes('面试') || input.includes('候选人')) {
    recommendations.push({
      id: 'rec-resume',
      type: 'agent',
      icon: 'fas fa-user-check',
      color: '#d97706',
      title: '简历筛选Agent',
      desc: '智能筛选简历，匹配优质候选人',
      path: '/agent/resume-filter'
    })
  }
  
  // 方案/文档相关需求
  if (input.includes('方案') || input.includes('文档') || input.includes('报告') || input.includes('PPT')) {
    recommendations.push({
      id: 'rec-solution',
      type: 'agent',
      icon: 'fas fa-file-invoice',
      color: '#059669',
      title: '解决方案生成Agent',
      desc: '自动生成专业解决方案文档',
      path: '/agent/solution-gen'
    })
  }
  
  // 任务管理需求
  if (input.includes('任务') || input.includes('工作') || input.includes('计划') || input.includes('进度')) {
    recommendations.push({
      id: 'rec-task',
      type: 'task',
      icon: 'fas fa-tasks',
      color: '#2563eb',
      title: '创建工作任务',
      desc: '将当前对话内容创建为工作任务',
      prompt: userInput,
      userInput: userInput // 保存用户输入内容
    })
  }
  
  // 日程安排需求
  if (input.includes('日程') || input.includes('安排') || input.includes('会议') || input.includes('提醒') || input.includes('时间')) {
    recommendations.push({
      id: 'rec-schedule',
      type: 'schedule',
      icon: 'fas fa-calendar-plus',
      color: '#7c3aed',
      title: '创建日程提醒',
      desc: '将当前对话内容创建为日程',
      prompt: userInput,
      userInput: userInput // 保存用户输入内容
    })
  }
  
  // 周报/总结相关
  if (input.includes('周报') || input.includes('总结') || input.includes('汇报')) {
    recommendations.push({
      id: 'rec-weekly',
      type: 'function',
      icon: 'fas fa-file-alt',
      color: '#059669',
      title: '生成工作周报',
      desc: '基于本周工作数据自动生成周报',
      prompt: '帮我生成本周的工作周报'
    })
  }
  
  // 默认推荐：工作台
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-workbench',
      type: 'agent',
      icon: 'fas fa-th-large',
      color: '#2563eb',
      title: '查看工作台',
      desc: '查看任务、日程和AI建议',
      path: '/workbench'
    })
  }
  
  return recommendations
}

function generateAgentResponse(userInput, agentType) {
  const agentResponses = {
    'bid-matching': {
      '招标': `好的，我来帮你分析这个招标文件。

**招标文件分析结果：**
1. **项目名称**：XX市智慧政务平台建设项目
2. **招标单位**：XX市政务服务管理局
3. **预算金额**：500万元
4. **投标截止时间**：2026年6月15日

**资质要求匹配度：**
- ✅ ISO9001质量管理体系认证
- ✅ CMMI3级认证
- ✅ 软件企业认证
- ⚠️ 需要补充：电子与智能化工程专业承包二级资质

**建议：**
1. 建议尽快准备投标文件
2. 需要补充相关资质证明
3. 可以联系合作伙伴进行联合投标

需要我帮你生成投标策略建议吗？`,
      
      '匹配': `根据你的企业资质，我为你找到了以下匹配的招投标项目：

**高匹配度项目（90%以上）：**
1. **XX市智慧政务平台** - 匹配度95%
   - 预算：500万 | 地域：北京
   - 状态：招标中

2. **企业数字化转型咨询** - 匹配度88%
   - 预算：200万 | 地域：上海
   - 状态：即将开始

**中等匹配度项目（70-90%）：**
3. **医疗信息化系统升级** - 匹配度75%
   - 预算：350万 | 地域：广州

**建议优先投标顺序：**
1. 优先考虑XX市智慧政务平台项目
2. 准备企业数字化转型咨询项目投标材料

需要我帮你查看具体项目详情吗？`,
      
      '资质': `根据你的企业资质信息，我为你整理了以下分析：

**现有资质清单：**
- ✅ ISO9001质量管理体系认证
- ✅ CMMI3级认证
- ✅ 软件企业认证
- ✅ 高新技术企业认证

**资质优势：**
1. **技术资质齐全**：满足大部分IT项目投标要求
2. **质量管理认证**：提升投标竞争力
3. **行业认可度高**：增加中标概率

**建议补充资质：**
1. **信息安全等级保护**：适用于政务、金融项目
2. **系统集成资质**：适用于大型集成项目
3. **行业专项资质**：如医疗、教育等行业认证

需要我帮你制定资质提升计划吗？`,
      
      '策略': `我来为你制定投标策略建议：

**投标策略分析：**
1. **项目选择策略**
   - 优先选择匹配度90%以上的项目
   - 关注预算在300-800万的中型项目
   - 选择地域优势明显的项目

2. **报价策略**
   - 采用成本加成定价法
   - 预留10-15%的利润空间
   - 考虑竞争对手报价水平

3. **技术方案策略**
   - 突出企业核心竞争优势
   - 提供差异化解决方案
   - 强调成功案例和客户评价

4. **风险控制策略**
   - 评估项目实施风险
   - 制定应急预案
   - 购买相关保险

需要我帮你生成具体的投标方案模板吗？`,
      
      'default': `我是招投标匹配Agent，可以帮你：

1. **分析招标文件** - 上传招标文件，我帮你分析关键要求
2. **匹配企业资质** - 根据你的企业资质匹配合适的项目
3. **生成投标建议** - 提供投标策略和风险分析
4. **资质分析** - 分析企业资质优势和提升建议
5. **投标策略** - 制定报价、技术、风险控制策略

请上传招标文件或告诉我你的具体需求。`
    },
    
    'solution-gen': {
      '方案': `好的，我来帮你生成解决方案文档。

**解决方案概览：**
1. **项目背景**：基于企业数字化转型需求
2. **技术架构**：微服务 + 容器化部署
3. **实施周期**：预计12周

**核心模块：**
- 用户管理模块
- 数据分析模块
- 业务流程自动化模块
- 移动端适配模块

**技术选型：**
- 前端：Vue.js 3 + TypeScript
- 后端：Node.js + Express
- 数据库：PostgreSQL + Redis
- 部署：Docker + Kubernetes

需要我详细展开某个模块的实施方案吗？`,
      
      '技术': `基于你的技术需求，我建议采用以下技术方案：

**技术架构设计：**
1. **前端层**：Vue.js 3 + Vite + Pinia
2. **网关层**：Nginx + API Gateway
3. **服务层**：Node.js微服务集群
4. **数据层**：PostgreSQL + Redis + MongoDB
5. **基础设施**：Docker + Kubernetes

**关键技术点：**
- 前后端分离架构
- RESTful API设计
- JWT身份认证
- 数据缓存策略
- 日志监控体系

**性能优化建议：**
1. 前端代码分割和懒加载
2. 数据库查询优化和索引设计
3. Redis缓存热点数据
4. CDN加速静态资源

需要我生成详细的技术架构图吗？`,
      
      '实施': `我来为你制定详细的项目实施计划：

**项目实施阶段：**

**阶段一：需求分析与规划（2周）**
- 业务需求调研和分析
- 技术方案设计和评审
- 项目计划制定和资源分配
- 风险评估和应对策略

**阶段二：系统设计与开发（6周）**
- 系统架构设计和数据库设计
- 核心功能模块开发
- 接口开发和联调
- 单元测试和集成测试

**阶段三：测试与优化（2周）**
- 系统测试和性能测试
- 安全测试和漏洞修复
- 用户体验优化
- 文档编写和培训

**阶段四：部署与上线（2周）**
- 生产环境部署
- 数据迁移和验证
- 用户培训和上线支持
- 项目验收和总结

**关键里程碑：**
- 需求评审完成：第2周末
- 系统设计完成：第4周末
- 开发完成：第8周末
- 测试完成：第10周末
- 正式上线：第12周末

需要我生成详细的甘特图或资源分配表吗？`,
      
      '风险': `我来为你进行项目风险评估和应对策略分析：

**风险识别与评估：**

**高风险（需重点关注）：**
1. **技术风险**
   - 风险：新技术栈学习曲线陡峭
   - 影响：可能导致开发进度延迟
   - 应对：提前进行技术预研和培训

2. **需求变更风险**
   - 风险：客户需求频繁变更
   - 影响：增加开发成本和周期
   - 应对：建立需求变更管理流程

**中风险（需监控）：**
3. **人员风险**
   - 风险：核心人员离职或请假
   - 影响：项目进度受影响
   - 应对：建立知识共享和备份机制

4. **第三方依赖风险**
   - 风险：第三方服务不稳定
   - 影响：系统功能受影响
   - 应对：制定备选方案和降级策略

**低风险（常规管理）：**
5. **进度风险**
   - 风险：任务估算不准确
   - 影响：项目延期
   - 应对：定期进度评审和调整

**风险监控机制：**
- 每周风险评审会议
- 风险状态看板更新
- 风险升级处理流程

需要我帮你制定详细的风险应对计划吗？`,
      
      'default': `我是解决方案生成Agent，可以帮你：

1. **生成技术方案** - 基于需求自动生成技术架构
2. **制定实施计划** - 包含时间线、里程碑、资源分配
3. **风险评估** - 识别项目风险并提供应对策略
4. **成本估算** - 项目成本预算和资源投入分析
5. **方案优化** - 对现有方案进行优化和改进建议

请描述你的项目需求，我来为你生成专业的解决方案。`
    },
    
    'resume-filter': {
      '简历': `好的，我来帮你筛选这批简历。

**筛选结果统计：**
- 总共收到：25份简历
- A级推荐：5人（匹配度90%以上）
- B级候选人：8人（匹配度70-89%）
- C级待定：12人（匹配度70%以下）

**A级推荐候选人：**
1. **张三** - 5年经验 | 硕士 | 清华大学
   - 匹配度：95%
   - 技能：Vue.js, React, TypeScript, Node.js
   
2. **李四** - 4年经验 | 本科 | 北京大学
   - 匹配度：88%
   - 技能：Vue.js, TypeScript, Webpack

**筛选标准：**
- 技能匹配度：40%
- 工作经验：30%
- 学历背景：20%
- 项目经历：10%

需要我安排面试或查看详细简历吗？`,
      
      '岗位': `根据你设置的岗位要求，我建议：

**岗位需求分析：**
- 岗位：前端开发工程师
- 经验要求：3-5年
- 学历要求：本科及以上
- 必备技能：Vue.js, React, TypeScript

**市场人才供给分析：**
1. **供给充足**：Vue.js, JavaScript开发者
2. **供给紧张**：TypeScript, React高级开发者
3. **稀缺人才**：全栈工程师（前端+Node.js）

**招聘建议：**
1. 薪资范围：25-40K/月
2. 招聘周期：预计4-6周
3. 渠道推荐：拉勾、Boss直聘、猎聘

**面试评估重点：**
1. 技术深度：框架原理、性能优化
2. 项目经验：复杂业务场景处理
3. 学习能力：新技术掌握速度

需要我帮你生成面试题库吗？`,
      
      '面试': `我来帮你准备面试评估方案：

**面试流程设计：**

**第一轮：技术面试（60分钟）**
1. **基础知识（15分钟）**
   - HTML/CSS/JavaScript基础
   - 浏览器渲染原理
   - 网络协议和性能优化

2. **框架能力（20分钟）**
   - Vue.js/React核心概念
   - 状态管理方案
   - 组件化设计思想

3. **项目经验（15分钟）**
   - 项目架构设计
   - 技术难点攻克
   - 性能优化实践

4. **编码能力（10分钟）**
   - 算法题或业务场景题
   - 代码规范和风格

**第二轮：综合面试（45分钟）**
1. **项目深挖（20分钟）**
   - 项目背景和职责
   - 技术决策和思考
   - 成果和收获

2. **团队协作（15分钟）**
   - 沟通协作能力
   - 问题解决方式
   - 学习成长意愿

3. **职业规划（10分钟）**
   - 技术发展方向
   - 职业目标规划
   - 对公司的期望

**评估维度：**
- 技术能力：40%
- 项目经验：30%
- 综合素质：30%

需要我生成具体的面试题目和评分标准吗？`,
      
      '薪资': `我来为你提供薪资评估和谈判建议：

**市场薪资调研：**

**前端开发工程师薪资范围（一线城市）：**
- **初级（1-3年）**：15-25K/月
- **中级（3-5年）**：25-40K/月
- **高级（5年以上）**：40-60K/月
- **专家/架构师**：60-100K/月

**影响薪资的因素：**
1. **技术能力**：框架深度、性能优化、架构设计
2. **项目经验**：复杂业务场景、大型项目经验
3. **学历背景**：985/211、硕士博士
4. **行业经验**：金融、电商、政务等高薪行业
5. **公司规模**：大厂、独角兽、中小企业

**薪资谈判策略：**
1. **了解市场行情**：调研同岗位薪资水平
2. **突出个人价值**：强调技术能力和项目成果
3. **合理期望范围**：基于市场行情设定合理范围
4. **关注整体薪酬**：基本工资+奖金+股票+福利
5. **谈判时机**：拿到offer后再谈薪资

**薪资结构建议：**
- 基本工资：70-80%
- 绩效奖金：10-20%
- 股票期权：5-10%
- 其他福利：补充医疗、年假、培训等

需要我帮你制定具体的薪资谈判方案吗？`,
      
      'default': `我是简历筛选Agent，可以帮你：

1. **批量筛选简历** - 上传简历文件，智能分析匹配度
2. **设置筛选标准** - 根据岗位需求定制筛选规则
3. **生成候选人报告** - 提供详细的候选人分析
4. **面试准备** - 设计面试流程和评估标准
5. **薪资评估** - 提供市场薪资调研和谈判建议

请上传简历或告诉我岗位要求，我来帮你筛选最合适的人才。`
    }
  }
  
  const agentTypeResponses = agentResponses[agentType]
  if (!agentTypeResponses) return '我是AI助手，可以帮你处理各种工作任务。'
  
  for (const [key, value] of Object.entries(agentTypeResponses)) {
    if (userInput.includes(key)) return value
  }
  return agentTypeResponses['default']
}

function formatMessage(content) {
  // 简单的Markdown格式化
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function copyMessage(content) {
  navigator.clipboard.writeText(content)
  appStore.showModal('成功', '消息已复制到剪贴板', 'success')
}

function createTaskFromMessage(msg) {
  // 从消息中提取任务信息
  const taskTitle = extractTaskFromContent(msg.content)
  appStore.addSharedTask({
    title: taskTitle,
    priority: 'medium',
    deadline: '本周内'
  })
  appStore.showModal('创建任务', `任务"${taskTitle}"已创建并同步到个人工作台`, 'success')
}

function createScheduleFromMessage(msg) {
  // 从消息中提取日程信息
  const scheduleTitle = extractScheduleFromContent(msg.content)
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes() + 30).padStart(2, '0')
  appStore.addSharedSchedule({
    time: `${hours}:${minutes}`,
    title: scheduleTitle,
    type: 'AI创建'
  })
  appStore.showModal('创建日程', `日程"${scheduleTitle}"已创建并同步到个人工作台`, 'success')
}

function extractTaskFromContent(content) {
  // 从用户输入或AI回复中提取任务标题
  // 尝试匹配常见的任务创建模式
  const taskPatterns = [
    /(?:创建|新建|添加|建立|设置)(?:一个)?(?:任务|工作|计划)[：:]\s*(.+)/i,
    /(?:任务|工作|计划)[：:]\s*(.+)/i,
    /(?:帮我|请|麻烦)(?:创建|新建|添加|建立|设置)(?:一个)?(?:任务|工作|计划)[：:]?\s*(.+)/i,
    /(.+?)(?:任务|工作|计划)/i
  ]
  
  for (const pattern of taskPatterns) {
    const match = content.match(pattern)
    if (match && match[1] && match[1].trim().length > 2) {
      return match[1].trim().substring(0, 50)
    }
  }
  
  // 如果没有匹配到模式，尝试提取有意义的句子
  const lines = content.split(/[。！!？?\n]/).filter(l => l.trim().length > 4)
  if (lines.length > 0) {
    const firstLine = lines[0].replace(/[*#>\-\s]/g, ' ').trim()
    if (firstLine.length > 4 && firstLine.length < 50) {
      return firstLine
    }
  }
  
  // 截取前30个字符作为任务标题
  const plain = content.replace(/[*#>\-\n]/g, ' ').replace(/\s+/g, ' ').trim()
  return plain.substring(0, 30) + (plain.length > 30 ? '...' : '')
}

function extractScheduleFromContent(content) {
  // 从用户输入或AI回复中提取日程标题
  // 尝试匹配常见的日程创建模式
  const schedulePatterns = [
    /(?:创建|新建|添加|设置|安排)(?:一个)?(?:日程|提醒|会议|约会)[：:]\s*(.+)/i,
    /(?:日程|提醒|会议|约会)[：:]\s*(.+)/i,
    /(?:帮我|请|麻烦)(?:创建|新建|添加|设置|安排)(?:一个)?(?:日程|提醒|会议|约会)[：:]?\s*(.+)/i,
    /(.+?)(?:日程|提醒|会议|约会)/i
  ]
  
  for (const pattern of schedulePatterns) {
    const match = content.match(pattern)
    if (match && match[1] && match[1].trim().length > 2) {
      return match[1].trim().substring(0, 50)
    }
  }
  
  // 如果没有匹配到模式，尝试提取有意义的句子
  const lines = content.split(/[。！!？?\n]/).filter(l => l.trim().length > 4)
  if (lines.length > 0) {
    const firstLine = lines[0].replace(/[*#>\-\s]/g, ' ').trim()
    if (firstLine.length > 4 && firstLine.length < 50) {
      return '跟进：' + firstLine
    }
  }
  
  // 截取前30个字符作为日程标题
  const plain = content.replace(/[*#>\-\n]/g, ' ').replace(/\s+/g, ' ').trim()
  return '跟进：' + plain.substring(0, 25) + (plain.length > 25 ? '...' : '')
}

function executeWithAgent(msg) {
  appStore.showModal('Agent执行', '已将任务分配给Agent处理', 'info')
}

function handleRecommendation(rec) {
  if (rec.type === 'agent') {
    router.push(rec.path)
  } else if (rec.type === 'task') {
    // 使用用户输入的内容来提取任务标题
    const content = rec.userInput || rec.title
    createTaskFromMessage({ content: content })
  } else if (rec.type === 'schedule') {
    // 使用用户输入的内容来提取日程标题
    const content = rec.userInput || rec.title
    createScheduleFromMessage({ content: content })
  } else if (rec.type === 'function') {
    inputMessage.value = rec.prompt
    sendMessage()
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function autoResize(e) {
  const textarea = e.target
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
}

function goBackToAgent() {
  if (agentId.value) {
    router.push(`/agent/${agentId.value}`)
  }
}

onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
  
  // 恢复当前对话的消息
  if (currentChatId.value) {
    messages.value = loadChatMessages(currentChatId.value)
  }
  
  // 处理从Agent页面跳转过来的上下文
  handleAgentContext()
})

// 处理从工作台跳转过来的任务上下文（自动填充并发送）
watch(() => route.query, (newQuery) => {
  if (newQuery.from === 'workbench' && newQuery.taskTitle) {
    handleWorkbenchTaskContext()
  } else if (newQuery.from === 'agent') {
    handleAgentContext()
  }
}, { deep: true })

function handleAgentContext() {
  const query = route.query
  if (query.from !== 'agent') return
  
  let contextMessage = ''
  let chatTitle = '新对话'
  
  if (query.type === 'bid-matching' && query.result) {
    try {
      const result = JSON.parse(query.result)
      contextMessage = `我从招投标匹配Agent发送了一个匹配结果：\n\n**${result.title}**\n- 匹配度：${result.score}%\n- 预算：${result.budget}\n- 地域：${result.region}\n- 公司：${result.company}\n\n请帮我分析这个项目的投标可行性。`
      chatTitle = `招投标分析 - ${result.title || '匹配结果'}`
    } catch (e) {
      contextMessage = '我从招投标匹配Agent发送了一个匹配结果，请帮我分析。'
      chatTitle = '招投标分析'
    }
  } else if (query.type === 'solution-gen' && query.content) {
    contextMessage = `我从解决方案生成Agent发送了一个方案文档，请帮我审核和优化：\n\n${query.content.substring(0, 200)}...`
    chatTitle = '方案审核优化'
  } else if (query.type === 'solution-gen') {
    contextMessage = '我刚从解决方案生成Agent跳转过来，请帮我继续完善方案。'
    chatTitle = '方案讨论'
  } else if (query.type === 'resume-filter' && query.candidate) {
    try {
      const candidate = JSON.parse(query.candidate)
      contextMessage = `我从简历筛选Agent发送了一位候选人：\n\n**${candidate.name}**\n- 经验：${candidate.experience}年\n- 学历：${candidate.education} | ${candidate.school}\n- 匹配度：${candidate.score}%\n- 技能：${candidate.skills.join(', ')}\n\n请帮我评估这位候选人。`
      chatTitle = `候选人评估 - ${candidate.name}`
    } catch (e) {
      contextMessage = '我从简历筛选Agent发送了一位候选人，请帮我评估。'
      chatTitle = '候选人评估'
    }
  } else if (query.from === 'agent') {
    contextMessage = `我刚从${currentAgent.value?.name || 'Agent'}页面跳转过来，请继续帮我处理相关任务。`
    chatTitle = `${currentAgent.value?.name || 'Agent'} 任务`
  }
  
  if (contextMessage) {
    // 清除查询参数，避免重复处理
    router.replace({ query: {} })
    
    // 自动创建新对话
    startNewChat()
    // 更新对话标题
    const currentChat = chatHistory.value.find(c => c.id === currentChatId.value)
    if (currentChat) {
      currentChat.title = chatTitle
      saveChatHistory()
    }
    
    // 延迟发送消息，确保页面加载完成
    setTimeout(() => {
      inputMessage.value = contextMessage
      sendMessage()
    }, 500)
  }
}

// 处理从工作台跳转过来的任务上下文（自动填充并发送）
function handleWorkbenchTaskContext() {
  const query = route.query
  if (!query.taskTitle) return
  
  // 构建智能需求消息：将任务标题转化为AI可理解的需求描述
  const taskTitle = decodeURIComponent(query.taskTitle)
  const autoSendMsg = query.autoSend === 'true'
  
  const contextMessage = `我有以下工作任务需要你帮助处理，请给出具体的解决方案和执行步骤：

**任务名称：** ${taskTitle}

请分析这个任务的需求，给出：
1. 任务拆解和执行步骤
2. 所需资源和时间估算
3. 可能遇到的风险和建议
4. 如果有对应的AI助手工具可以协助，请推荐使用`

  // 清除查询参数
  router.replace({ query: {} })
  
  if (autoSendMsg) {
    // 自动填充并发送
    setTimeout(() => {
      inputMessage.value = contextMessage
      sendMessage()
    }, 500)
  } else {
    // 仅填充到输入框
    inputMessage.value = contextMessage
  }
}
</script>

<style scoped>
.ai-chat {
  display: flex;
  height: 100vh;
  background: var(--bg-surface);
}

/* 左侧对话历史 */
.chat-sidebar {
  width: 280px;
  background: var(--bg-white);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.chat-sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.new-chat-btn {
  width: 100%;
  padding: 10px 16px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  transition: all var(--tr);
}

.new-chat-btn:hover {
  background: var(--primary-dark);
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.chat-history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--tr);
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.chat-history-item:hover {
  background: var(--primary-50);
}

.chat-history-item.agent-chat {
  background: linear-gradient(135deg, rgba(99,102,241,.05), rgba(139,92,246,.05));
  border-left: 3px solid var(--primary);
}

.chat-history-item.agent-chat:hover {
  background: linear-gradient(135deg, rgba(99,102,241,.1), rgba(139,92,246,.1));
}

.agent-badge {
  display: inline-block;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 600;
  background: var(--primary);
  color: #fff;
  border-radius: 4px;
  margin-right: 4px;
  vertical-align: middle;
}

.chat-history-item.active {
  background: var(--primary-100);
  color: var(--primary);
}

.chat-history-item i:first-child {
  font-size: 14px;
  opacity: 0.7;
}

.chat-history-info {
  flex: 1;
  min-width: 0;
}

.chat-history-title {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-history-time {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.delete-chat-btn {
  opacity: 0;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  font-size: 12px;
  transition: all var(--tr);
}

.chat-history-item:hover .delete-chat-btn {
  opacity: 1;
}

.delete-chat-btn:hover {
  color: var(--danger);
}

/* 右侧对话区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 16px 24px;
  background: var(--bg-white);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header-info h2 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--success);
  margin-top: 2px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--success);
  border-radius: 50%;
}

.chat-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-select {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg-white);
  cursor: pointer;
  font-family: inherit;
}

.header-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  font-size: 14px;
  transition: all var(--tr);
}

.header-btn:hover {
  color: var(--primary);
}

.header-btn.back-to-agent {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-white);
}

.header-btn.back-to-agent:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-50);
}

.header-btn.back-to-agent i {
  font-size: 12px;
}

/* 消息区域 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.welcome-section {
  text-align: center;
  padding: 60px 20px;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #fff;
}

.welcome-section h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.welcome-section p {
  font-size: 15px;
  color: var(--text-muted);
  max-width: 500px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-width: 500px;
  margin: 0 auto;
}

.quick-action-btn {
  padding: 16px;
  background: var(--bg-white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all var(--tr);
  font-family: inherit;
}

.quick-action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-50);
}

.quick-action-btn i {
  font-size: 18px;
  color: var(--primary);
}

/* 消息样式 */
.message {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  color: #fff;
}

.message.assistant .message-avatar {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: #fff;
}

.message-content {
  max-width: 70%;
}

.message.user .message-content {
  text-align: right;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.message.user .message-header {
  justify-content: flex-end;
}

.message-sender {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.message-time {
  font-size: 11px;
  color: var(--text-muted);
}

.message-text {
  padding: 12px 16px;
  border-radius: var(--radius);
  font-size: 14px;
  line-height: 1.6;
}

.message.user .message-text {
  background: var(--primary);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-text {
  background: var(--bg-white);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.action-btn {
  padding: 4px 10px;
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all var(--tr);
  font-family: inherit;
}

.action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

/* 加载动画 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: var(--bg-white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  border-bottom-left-radius: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--text-muted);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* 输入区域 */
.chat-input-area {
  padding: 16px 24px 24px;
  background: var(--bg-white);
  border-top: 1px solid var(--border);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 8px 12px;
  transition: all var(--tr);
}

.input-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-100);
}

.input-wrapper textarea {
  flex: 1;
  border: none;
  background: none;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  font-family: inherit;
  max-height: 200px;
}

.input-wrapper textarea::placeholder {
  color: var(--text-muted);
}

.input-wrapper textarea:focus {
  outline: none;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.input-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  font-size: 16px;
  transition: all var(--tr);
}

.input-btn:hover {
  color: var(--primary);
}

.send-btn {
  background: var(--text-muted);
  color: #fff;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all var(--tr);
}

.send-btn.active {
  background: var(--primary);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-hint {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
}

/* AI智能推荐面板 */
.recommendation-panel {
  margin-top: 12px;
  background: linear-gradient(135deg, #faf5ff, #ede9fe);
  border: 1px solid #ddd6fe;
  border-radius: var(--radius);
  padding: 14px;
  animation: slideUp .3s ease;
}

.rec-header {
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.rec-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rec-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #e9e5f5;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--tr);
}

.rec-item:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(99,102,241,.12);
  transform: translateX(4px);
}

.rec-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  flex-shrink: 0;
}

.rec-body {
  flex: 1;
  min-width: 0;
}

.rec-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.rec-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.rec-item > i:last-child {
  color: var(--text-muted);
  font-size: 11px;
  transition: all var(--tr);
}

.rec-item:hover > i:last-child {
  color: var(--primary);
  transform: translateX(3px);
}

/* 需求分析指示器 */
.needs-analysis {
  margin-top: 10px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: var(--radius-sm);
  font-size: 11px;
  color: #0369a1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.needs-analysis i {
  color: #0284c7;
}

/* 模拟/模型标识 */
.simulated-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  padding: 4px 10px;
  font-size: 11px;
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 6px;
}

.simulated-badge i {
  font-size: 10px;
}

.model-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  padding: 4px 10px;
  font-size: 11px;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
}

.model-badge i {
  font-size: 10px;
  color: #059669;
}
</style>