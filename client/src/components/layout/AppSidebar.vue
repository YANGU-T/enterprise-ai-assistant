<template>
  <aside class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="sidebar-menu">
      <div class="menu-group">
        <div class="menu-group-label" v-show="!appStore.sidebarCollapsed">核心模块</div>
        <button 
          v-for="item in filteredMenuItems" 
          :key="item.path"
          class="menu-item"
          :class="{ active: currentRoute === item.path }"
          @click="navigateTo(item.path)"
          :title="appStore.sidebarCollapsed ? item.label : ''"
        >
          <i :class="item.icon"></i>
          <span v-if="!appStore.sidebarCollapsed">{{ item.label }}</span>
          <span v-if="item.count && !appStore.sidebarCollapsed" class="count">{{ item.count }}</span>
        </button>
      </div>

      <div class="menu-group">
        <div 
          class="menu-group-label" 
          @click="toggleAssistants" 
          v-show="!appStore.sidebarCollapsed"
        >
          <span>AI 助手</span>
          <i :class="assistantExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        </div>
        <div class="menu-group-label no-hover" v-show="appStore.sidebarCollapsed">AI</div>
        <div v-show="assistantExpanded || appStore.sidebarCollapsed" class="submenu">
          <button 
            v-for="agent in assistants" 
            :key="agent.path"
            class="menu-item sub"
            :class="{ active: currentRoute === agent.path }"
            @click="navigateTo(agent.path)"
            :title="appStore.sidebarCollapsed ? agent.label : ''"
          >
            <div class="agent-dot" :style="{ background: agent.color }"></div>
            <span v-if="!appStore.sidebarCollapsed">{{ agent.label }}</span>
            <span v-if="agent.status && !appStore.sidebarCollapsed" class="agent-status" :class="agent.status">
              {{ agent.status === 'active' ? '运行中' : '已停用' }}
            </span>
          </button>
        </div>
      </div>
    </div>
    
    <div class="sidebar-footer">
      <div class="model-config" @click="showModelConfig" :title="appStore.sidebarCollapsed ? '模型配置' : ''">
        <i class="fas fa-sliders-h"></i>
        <span v-if="!appStore.sidebarCollapsed">模型配置</span>
      </div>
      <div class="sidebar-footer-actions">
        <button class="footer-btn notification-btn" @click="toggleNotifications" :title="appStore.sidebarCollapsed ? '消息提醒' : ''">
          <i class="fas fa-bell"></i>
          <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
        </button>
        <div class="sidebar-user" :title="appStore.sidebarCollapsed ? user.name : ''" @click.stop="toggleUserMenu">
          <div class="sidebar-user-avatar">{{ user.avatar }}</div>
          <div v-if="!appStore.sidebarCollapsed" class="sidebar-user-info">
            <div class="sidebar-user-name">{{ user.name }}</div>
            <div class="sidebar-user-role">{{ user.role }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户菜单弹窗遮罩 -->
    <div v-if="showUserMenu" class="user-menu-backdrop" @click="showUserMenu = false"></div>
    <!-- 用户菜单弹窗 -->
    <div v-if="showUserMenu" class="user-menu-popup" @click.stop>
      <div class="user-menu-header">
        <div class="user-menu-avatar">{{ user.avatar }}</div>
        <div>
          <div class="user-menu-name">{{ user.name }}</div>
          <div class="user-menu-role">{{ user.role }} · {{ user.department || '未设置部门' }}</div>
        </div>
      </div>
      <div class="user-menu-divider"></div>
      <button class="user-menu-item" @click="openProfile">
        <i class="fas fa-user"></i> 查看账号信息
      </button>
      <button class="user-menu-item" @click="openEditProfile">
        <i class="fas fa-user-edit"></i> 修改资料
      </button>
      <button class="user-menu-item" @click="openChangePassword">
        <i class="fas fa-key"></i> 修改密码
      </button>
      <div class="user-menu-divider"></div>
      <button class="user-menu-item danger" @click="handleLogout">
        <i class="fas fa-sign-out-alt"></i> 退出登录
      </button>
    </div>

    <!-- 查看/编辑账号信息弹窗 -->
    <div v-if="showProfileModal" class="profile-overlay" @click.self="showProfileModal = false">
      <div class="profile-dialog" @click.stop>
        <div class="profile-header">
          <h3><i class="fas fa-user-circle"></i> {{ isEditing ? '修改资料' : '账号信息' }}</h3>
          <button class="modal-close-btn" @click="showProfileModal = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="profile-body">
          <div class="profile-avatar-area">
            <div class="profile-avatar-lg">{{ user.avatar }}</div>
            <div class="profile-user-title">{{ user.name }}</div>
            <span class="profile-role-badge">{{ user.role }}</span>
          </div>
          <div class="profile-fields">
            <div class="profile-field">
              <label>用户名</label>
              <div v-if="!isEditing" class="field-value">{{ user.username || '未设置' }}</div>
              <input v-else v-model="profileForm.username" disabled class="field-input disabled" />
            </div>
            <div class="profile-field">
              <label>姓名</label>
              <div v-if="!isEditing" class="field-value">{{ user.name || '未设置' }}</div>
              <input v-else v-model="profileForm.name" class="field-input" placeholder="请输入姓名" />
            </div>
            <div class="profile-field">
              <label>部门</label>
              <div v-if="!isEditing" class="field-value">{{ user.department || '未设置' }}</div>
              <input v-else v-model="profileForm.department" class="field-input" placeholder="请输入部门" />
            </div>
            <div class="profile-field">
              <label>邮箱</label>
              <div v-if="!isEditing" class="field-value">{{ user.email || '未设置' }}</div>
              <input v-else v-model="profileForm.email" type="email" class="field-input" placeholder="请输入邮箱" />
            </div>
            <div class="profile-field">
              <label>手机号</label>
              <div v-if="!isEditing" class="field-value">{{ user.phone || '未设置' }}</div>
              <input v-else v-model="profileForm.phone" class="field-input" placeholder="请输入手机号" />
            </div>
          </div>
        </div>
        <div class="profile-footer">
          <button v-if="!isEditing" class="config-btn primary" @click="startEditProfile">修改资料</button>
          <template v-else>
            <button class="config-btn secondary" @click="isEditing = false">取消</button>
            <button class="config-btn primary" @click="saveProfile">保存</button>
          </template>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <div v-if="showPasswordModal" class="profile-overlay" @click.self="showPasswordModal = false">
      <div class="profile-dialog small" @click.stop>
        <div class="profile-header">
          <h3><i class="fas fa-key"></i> 修改密码</h3>
          <button class="modal-close-btn" @click="showPasswordModal = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="profile-body">
          <div class="password-fields">
            <div class="profile-field">
              <label>原密码</label>
              <div class="pwd-input-wrap">
                <input
                  v-model="pwdForm.oldPwd"
                  :type="showOldPwd ? 'text' : 'password'"
                  class="field-input"
                  placeholder="请输入原密码"
                />
                <button class="pwd-toggle" @click="showOldPwd = !showOldPwd">
                  <i :class="showOldPwd ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>
            <div class="profile-field">
              <label>新密码</label>
              <div class="pwd-input-wrap">
                <input
                  v-model="pwdForm.newPwd"
                  :type="showNewPwd ? 'text' : 'password'"
                  class="field-input"
                  placeholder="请输入新密码（至少6位）"
                />
                <button class="pwd-toggle" @click="showNewPwd = !showNewPwd">
                  <i :class="showNewPwd ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>
            <div class="profile-field">
              <label>确认新密码</label>
              <div class="pwd-input-wrap">
                <input
                  v-model="pwdForm.confirmPwd"
                  :type="showConfirmPwd ? 'text' : 'password'"
                  class="field-input"
                  placeholder="请再次输入新密码"
                />
                <button class="pwd-toggle" @click="showConfirmPwd = !showConfirmPwd">
                  <i :class="showConfirmPwd ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="profile-footer">
          <button class="config-btn secondary" @click="showPasswordModal = false">取消</button>
          <button class="config-btn primary" @click="submitChangePassword">确认修改</button>
        </div>
      </div>
    </div>
    <!-- 通知弹窗遮罩 -->
    <div v-if="showNotifications" class="notification-backdrop" @click="showNotifications = false"></div>
    <!-- 通知弹窗 -->
    <div v-if="showNotifications" class="notification-popup" @click.stop>
      <div class="notification-header">
        <span>消息提醒</span>
        <div class="notification-header-actions">
          <button v-if="unreadCount > 0" class="header-btn" @click="markAllRead" title="全部已读">
            <i class="fas fa-check-double"></i>
          </button>
          <button v-if="notifications.length > 0" class="header-btn" @click="clearAll" title="清空消息">
            <i class="fas fa-trash-alt"></i>
          </button>
          <button class="close-btn" @click="showNotifications = false"><i class="fas fa-times"></i></button>
        </div>
      </div>
      <div class="notification-list">
        <div v-if="notifications.length === 0" class="empty-msg">
          <i class="fas fa-bell-slash empty-icon"></i>
          <span>暂无新消息</span>
        </div>
        <div
          v-for="n in notifications"
          :key="n.id"
          class="notification-item"
          :class="{ unread: !n.read }"
          @click="readNotification(n)"
        >
          <div class="notification-icon" :class="n.type">
            <i :class="getNotificationIcon(n.type)"></i>
          </div>
          <div class="notification-content">
            <div class="notification-title">
              {{ n.title }}
              <span v-if="!n.read" class="unread-dot"></span>
            </div>
            <div class="notification-msg">{{ n.message }}</div>
            <div class="notification-time">{{ n.time }}</div>
          </div>
          <button v-if="!n.read" class="mark-read-btn" @click.stop="readSingle(n)" title="标为已读">
            <i class="fas fa-check"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 模型配置弹窗 -->
    <div v-if="showModelConfigDialog" class="model-config-overlay" @click.self="showModelConfigDialog = false">
      <div class="model-config-dialog" @click.stop>
        <div class="model-config-header">
          <div>
            <h3><i class="fas fa-brain"></i> 模型配置</h3>
            <p>管理AI模型接入与参数设置</p>
          </div>
          <button class="modal-close-btn" @click="showModelConfigDialog = false"><i class="fas fa-times"></i></button>
        </div>

        <div class="model-config-body">
          <!-- 当前选用模型 -->
          <div class="config-section">
            <h4><i class="fas fa-star"></i> 当前选用模型</h4>
            <div class="current-model-display">
              <div class="current-model-card">
                <span class="model-provider-badge">{{ getCurrentModelProvider() }}</span>
                <span class="current-model-name">{{ getCurrentModelName() }}</span>
              </div>
            </div>
          </div>

          <!-- 模型列表 -->
          <div class="config-section">
            <h4><i class="fas fa-list-ul"></i> 可用模型列表</h4>
            <div class="model-list">
              <div class="model-search">
                <i class="fas fa-search"></i>
                <input v-model="modelSearch" placeholder="搜索模型..." type="text">
                <button class="add-model-btn" @click="openAddModelForm" title="添加模型">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <div class="model-items">
                <div v-if="filteredModels.length === 0" class="empty-models">
                  <i class="fas fa-robot empty-icon"></i>
                  <span>暂无配置模型</span>
                  <button class="config-btn primary small" @click="openAddModelForm">添加模型</button>
                </div>
                <div
                  v-for="m in filteredModels"
                  :key="m.id"
                  class="model-card"
                  :class="{ active: appStore.modelConfig.currentModel === m.id, disabled: m.status !== 'active' }"
                  @click="selectModel(m)"
                >
                  <div class="model-card-left">
                    <div class="model-status-dot" :class="m.status"></div>
                    <div class="model-info">
                      <div class="model-name">{{ m.name }}</div>
                      <div class="model-desc">{{ m.description || m.endpoint }}</div>
                    </div>
                  </div>
                  <div class="model-card-right">
                    <span class="model-provider-tag">{{ m.provider }}</span>
                    <button class="model-edit-btn" @click.stop="openEditModelForm(m)" title="编辑">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="model-delete-btn" @click.stop="deleteModelById(m.id)" title="删除">
                      <i class="fas fa-trash"></i>
                    </button>
                    <button class="model-toggle-btn" @click.stop="toggleModel(m)" :title="m.status === 'active' ? '停用' : '启用'">
                      <i :class="m.status === 'active' ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 添加/编辑模型表单 -->
          <div v-if="showAddModelForm" class="config-section">
            <h4><i class="fas fa-plus-circle"></i> {{ editingModel ? '编辑模型' : '添加模型' }}</h4>
            <div class="model-form">
              <!-- 厂商快速选择 -->
              <div class="form-group">
                <label>选择厂商（快速填充）</label>
                <div class="provider-preset-grid">
                  <button
                    v-for="(_, key) in providerPresets"
                    :key="key"
                    class="provider-preset-btn"
                    :class="{ active: selectedProviderPreset === key }"
                    @click="onProviderPresetChange(key)"
                  >
                    {{ key }}
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label>模型名称 *</label>
                <div class="model-name-input-wrapper">
                  <input v-model="modelForm.name" type="text" placeholder="例如：gpt-4o、deepseek-v4-flash" class="form-input">
                  <!-- 模型建议列表 -->
                  <div v-if="availableModels.length > 0" class="model-suggestions">
                    <button
                      v-for="m in availableModels"
                      :key="m"
                      class="model-suggestion-item"
                      :class="{ active: modelForm.name === m }"
                      @click="selectModelName(m)"
                    >
                      {{ m }}
                    </button>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label>提供商</label>
                <input v-model="modelForm.provider" type="text" placeholder="例如：OpenAI、Anthropic、自定义" class="form-input">
              </div>
              <div class="form-group">
                <label>API接口地址 *</label>
                <input v-model="modelForm.endpoint" type="text" placeholder="如 https://api.deepseek.com" class="form-input" autocomplete="off">
                <p class="form-hint">填写 base URL 即可，系统会自动补全接口路径</p>
              </div>
              <div class="form-group">
                <label>API密钥</label>
                <div class="apikey-input-wrapper">
                  <input v-model="modelForm.apiKey" :type="showKeys['new'] ? 'text' : 'password'" placeholder="请输入API密钥" class="form-input" autocomplete="new-password">
                  <button class="toggle-key-btn" @click="showKeys['new'] = !showKeys['new']">
                    <i :class="showKeys['new'] ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label>描述</label>
                <input v-model="modelForm.description" type="text" placeholder="模型用途或特点描述" class="form-input">
              </div>
              <div class="form-actions">
                <button class="config-btn secondary" @click="closeAddModelForm">取消</button>
                <button class="config-btn primary" @click="saveModel">{{ editingModel ? '保存修改' : '添加模型' }}</button>
              </div>
            </div>
          </div>



          <!-- 联网搜索 -->
          <div class="config-section">
            <h4><i class="fas fa-globe"></i> 联网搜索</h4>
            <div class="web-search-toggle">
              <div class="toggle-info">
                <div class="toggle-label">启用联网搜索</div>
                <div class="toggle-desc">开启后AI可实时搜索互联网获取最新信息（仅部分模型支持）</div>
              </div>
              <button 
                class="toggle-switch"
                :class="{ active: appStore.modelConfig.enableWebSearch }"
                @click="toggleWebSearch"
              >
                <span class="toggle-knob"></span>
              </button>
            </div>
            <div class="search-supported-providers">
              <span class="provider-label">支持的模型：</span>
              <span class="provider-tag">DeepSeek</span>
              <span class="provider-tag">阿里云</span>
              <span class="provider-tag">智谱AI</span>
              <span class="provider-tag">百度</span>
              <span class="provider-tag">Moonshot</span>
            </div>
          </div>

          <!-- 模型参数 -->
          <div class="config-section">
            <h4><i class="fas fa-sliders-h"></i> 模型参数</h4>
            <div class="param-grid">
              <div class="param-item">
                <div class="param-label">
                  <span>Temperature</span>
                  <span class="param-value">{{ appStore.modelConfig.temperature.toFixed(1) }}</span>
                </div>
                <input type="range" min="0" max="2" step="0.1" :value="appStore.modelConfig.temperature" @input="updateTemp($event.target.value)">
                <div class="param-hints"><span>精确</span><span>创造</span></div>
              </div>
              <div class="param-item">
                <div class="param-label">
                  <span>Max Tokens</span>
                  <span class="param-value">{{ appStore.modelConfig.maxTokens }}</span>
                </div>
                <input type="range" min="512" max="32768" step="512" :value="appStore.modelConfig.maxTokens" @input="updateTokens($event.target.value)">
                <div class="param-hints"><span>512</span><span>32K</span></div>
              </div>
              <div class="param-item">
                <div class="param-label">
                  <span>Top P</span>
                  <span class="param-value">{{ appStore.modelConfig.topP.toFixed(2) }}</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" :value="appStore.modelConfig.topP" @input="updateTopP($event.target.value)">
                <div class="param-hints"><span>0</span><span>1</span></div>
              </div>
            </div>
          </div>

          <!-- System Prompt -->
          <div class="config-section">
            <h4><i class="fas fa-comment-dots"></i> 系统提示词</h4>
            <textarea
              class="system-prompt-input"
              :value="appStore.modelConfig.systemPrompt"
              @input="updateSystemPrompt($event.target.value)"
              rows="4"
              placeholder="设置系统级提示词..."
            ></textarea>
          </div>
        </div>

        <div class="model-config-footer">
          <button class="config-btn secondary" @click="resetModelConfig">恢复默认</button>
          <button class="config-btn primary" @click="saveAndClose">保存配置</button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const assistantExpanded = ref(true)
const showNotifications = ref(false)
const showModelConfigDialog = ref(false)
const modelSearch = ref('')
const showKeys = reactive({})
const showAddModelForm = ref(false)
const editingModel = ref(null)
const modelForm = reactive({
  name: '',
  provider: '',
  description: '',
  endpoint: '',
  apiKey: ''
})

// 主流模型厂商配置
const providerPresets = {
  'OpenAI': {
    endpoint: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1', 'o1-mini', 'o1-pro'],
    description: 'OpenAI GPT 系列模型'
  },
  'DeepSeek': {
    endpoint: 'https://api.deepseek.com',
    models: ['deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-chat', 'deepseek-reasoner'],
    description: 'DeepSeek 深度求索模型'
  },
  'Anthropic': {
    endpoint: 'https://api.anthropic.com',
    models: ['claude-4-opus', 'claude-4-sonnet', 'claude-3.5-sonnet', 'claude-3.5-haiku'],
    description: 'Anthropic Claude 系列模型'
  },
  '阿里云': {
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen-long', 'qwen-vl-max'],
    description: '阿里云通义千问系列模型'
  },
  '智谱AI': {
    endpoint: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4', 'glm-4-flash', 'glm-4v', 'glm-4-long', 'codegeex-4'],
    description: '智谱AI GLM 系列模型'
  },
  '百度': {
    endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop',
    models: ['ernie-4.0-turbo', 'ernie-4.0', 'ernie-3.5', 'ernie-speed'],
    description: '百度文心一言系列模型'
  },
  '小米MImo': {
    endpoint: 'https://token-plan-cn.xiaomimimo.com/v1',
    models: ['mimo-v2.5-pro', 'mimo-v2-pro', 'mimo-v2-omni'],
    description: '小米 MiMo 系列模型'
  },
  'Google': {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-2.0-pro', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    description: 'Google Gemini 系列模型'
  },
  'Moonshot': {
    endpoint: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-128k', 'moonshot-v1-32k', 'moonshot-v1-8k'],
    description: 'Moonshot Kimi 系列模型'
  },
  '零一万物': {
    endpoint: 'https://api.lingyiwanwu.com/v1',
    models: ['yi-large', 'yi-medium', 'yi-spark', 'yi-large-turbo'],
    description: '零一万物 Yi 系列模型'
  },
  '百川智能': {
    endpoint: 'https://api.baichuan-ai.com/v1',
    models: ['Baichuan4', 'Baichuan3-Turbo', 'Baichuan2-Turbo'],
    description: '百川智能 Baichuan 系列模型'
  },
  'MiniMax': {
    endpoint: 'https://api.minimax.chat/v1',
    models: ['abab6.5-chat', 'abab6.5s-chat', 'abab5.5-chat'],
    description: 'MiniMax 系列模型'
  },
  '自定义': {
    endpoint: '',
    models: [],
    description: '自定义 OpenAI 兼容接口'
  }
}

// 当前选择的厂商预设
const selectedProviderPreset = ref('')

// 可用的模型列表（根据厂商动态变化）
const availableModels = computed(() => {
  if (!selectedProviderPreset.value || selectedProviderPreset.value === '自定义') return []
  return providerPresets[selectedProviderPreset.value]?.models || []
})

// 用户菜单相关状态
const showUserMenu = ref(false)
const showProfileModal = ref(false)
const showPasswordModal = ref(false)
const isEditing = ref(false)
const profileForm = reactive({ username: '', name: '', department: '', email: '', phone: '' })
const pwdForm = reactive({ oldPwd: '', newPwd: '', confirmPwd: '' })
const showOldPwd = ref(false)
const showNewPwd = ref(false)
const showConfirmPwd = ref(false)

const user = computed(() => appStore.user)
const currentRoute = computed(() => route.path)
const unreadCount = computed(() => appStore.unreadNotifications)
const notifications = computed(() => appStore.notifications)
const filteredModels = computed(() => {
  const models = appStore.modelConfig.models || []
  if (!modelSearch.value) return models
  const q = modelSearch.value.toLowerCase()
  return models.filter(m =>
    m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)
  )
})
const uniqueProviders = computed(() => [...new Set((appStore.modelConfig.models || []).map(m => m.provider))])

const menuItems = computed(() => {
  const items = [
    { path: '/chat', icon: 'fas fa-comments', label: 'AI 对话' },
    { path: '/workbench', icon: 'fas fa-briefcase', label: '个人工作台', count: appStore.stats.activeTasks },
    { path: '/agents', icon: 'fas fa-robot', label: 'Agent 配置' },
    { path: '/admin/users', icon: 'fas fa-users-cog', label: '用户管理' }
  ]
  return items
})

// 根据权限过滤后的菜单
const filteredMenuItems = computed(() => {
  return menuItems.value.filter(item => appStore.hasRoutePermission(item.path))
})

// 从store动态获取AI助手列表，与Agent配置中心实时同步
const assistants = computed(() => {
  return appStore.dynamicAgents.map(agent => ({
    path: agent.path,
    label: agent.name,
    icon: agent.icon,
    color: agent.color,
    status: agent.status
  }))
})

function navigateTo(path) {
  router.push(path)
}

function toggleAssistants() {
  assistantExpanded.value = !assistantExpanded.value
}

function showModelConfig() {
  showModelConfigDialog.value = true
}

function getCurrentModelName() {
  const models = appStore.modelConfig.models || []
  const m = models.find(m => m.id === appStore.modelConfig.currentModel)
  return m ? m.name : appStore.modelConfig.currentModel || '未选择模型'
}

function getCurrentModelProvider() {
  const models = appStore.modelConfig.models || []
  const m = models.find(m => m.id === appStore.modelConfig.currentModel)
  return m ? m.provider : '未知'
}

function selectModel(m) {
  if (m.status === 'active') {
    appStore.switchModel(m.id)
  }
}

function toggleModel(m) {
  appStore.toggleModelStatus(m.id)
}



function updateTemp(v) {
  appStore.updateModelConfig({ temperature: parseFloat(v) })
}

function updateTokens(v) {
  appStore.updateModelConfig({ maxTokens: parseInt(v) })
}

function updateTopP(v) {
  appStore.updateModelConfig({ topP: parseFloat(v) })
}

function updateSystemPrompt(v) {
  appStore.updateModelConfig({ systemPrompt: v })
}

function toggleWebSearch() {
  appStore.updateModelConfig({ enableWebSearch: !appStore.modelConfig.enableWebSearch })
}

function resetModelConfig() {
  if (confirm('确定要恢复默认配置吗？这将清除所有已配置的模型。')) {
    localStorage.removeItem('model_config')
    // 清空表单
    showAddModelForm.value = false
    editingModel.value = null
    modelForm.name = ''
    modelForm.provider = ''
    modelForm.description = ''
    modelForm.endpoint = ''
    modelForm.apiKey = ''
    location.reload()
  }
}

function saveAndClose() {
  appStore.saveModelConfig()
  appStore.addNotification({
    title: '模型配置已更新',
    message: `当前选用模型：${getCurrentModelName()}`,
    type: 'system'
  })
  showModelConfigDialog.value = false
  // 清空表单
  showAddModelForm.value = false
  editingModel.value = null
  modelForm.name = ''
  modelForm.provider = ''
  modelForm.description = ''
  modelForm.endpoint = ''
  modelForm.apiKey = ''
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
}

function openAddModelForm() {
  showAddModelForm.value = true
  editingModel.value = null
  modelForm.name = ''
  modelForm.provider = ''
  modelForm.description = ''
  modelForm.endpoint = ''
  modelForm.apiKey = ''
  selectedProviderPreset.value = ''
}

// 厂商选择变化时自动填充配置
function onProviderPresetChange(preset) {
  selectedProviderPreset.value = preset
  if (preset && preset !== '自定义') {
    const config = providerPresets[preset]
    modelForm.provider = preset
    modelForm.endpoint = config.endpoint
    modelForm.description = config.description
    // 如果只有一个模型，自动选择
    if (config.models.length === 1) {
      modelForm.name = config.models[0]
    } else {
      modelForm.name = ''
    }
  } else if (preset === '自定义') {
    modelForm.provider = '自定义'
    modelForm.endpoint = ''
    modelForm.description = ''
    modelForm.name = ''
  }
}

// 从建议列表选择模型名称
function selectModelName(modelName) {
  modelForm.name = modelName
}

function openEditModelForm(model) {
  showAddModelForm.value = true
  editingModel.value = model.id
  modelForm.name = model.name
  modelForm.provider = model.provider
  modelForm.description = model.description || ''
  modelForm.endpoint = model.endpoint || ''
  modelForm.apiKey = model.apiKey || ''
  // 尝试匹配厂商预设
  selectedProviderPreset.value = model.provider || ''
}

function closeAddModelForm() {
  showAddModelForm.value = false
  editingModel.value = null
  // 清空表单
  modelForm.name = ''
  modelForm.provider = ''
  modelForm.description = ''
  modelForm.endpoint = ''
  modelForm.apiKey = ''
}

function saveModel() {
  if (!modelForm.name.trim()) {
    appStore.showModal('提示', '模型名称不能为空', 'warning')
    return
  }
  
  if (!modelForm.endpoint.trim()) {
    appStore.showModal('提示', 'API接口地址不能为空', 'warning')
    return
  }
  
  if (editingModel.value) {
    // 编辑现有模型
    appStore.updateModel(editingModel.value, {
      name: modelForm.name,
      provider: modelForm.provider || '自定义',
      description: modelForm.description,
      endpoint: modelForm.endpoint,
      apiKey: modelForm.apiKey
    })
    appStore.addNotification({
      title: '模型已更新',
      message: `模型"${modelForm.name}"配置已更新`,
      type: 'system'
    })
  } else {
    // 添加新模型
    appStore.addModel({
      name: modelForm.name,
      provider: modelForm.provider || '自定义',
      description: modelForm.description,
      endpoint: modelForm.endpoint,
      apiKey: modelForm.apiKey
    })
    appStore.addNotification({
      title: '模型已添加',
      message: `新模型"${modelForm.name}"已添加到配置`,
      type: 'system'
    })
  }
  
  closeAddModelForm()
}

function deleteModelById(modelId) {
  if (confirm('确定要删除这个模型吗？')) {
    const models = appStore.modelConfig.models || []
    const model = models.find(m => m.id === modelId)
    appStore.deleteModel(modelId)
    appStore.addNotification({
      title: '模型已删除',
      message: `模型"${model?.name}"已从配置中删除`,
      type: 'system'
    })
  }
}

function readNotification(n) {
  if (!n.read) appStore.markNotificationAsRead(n.id)
}

function readSingle(n) {
  appStore.markNotificationAsRead(n.id)
}

function markAllRead() {
  appStore.markAllNotificationsRead()
}

function clearAll() {
  if (confirm('确定要清空所有消息吗？')) {
    appStore.clearAllNotifications()
  }
}

function getNotificationIcon(type) {
  const icons = {
    ai: 'fas fa-robot',
    task: 'fas fa-tasks',
    agent: 'fas fa-cog',
    system: 'fas fa-server',
    warning: 'fas fa-exclamation-triangle',
    update: 'fas fa-sync-alt'
  }
  return icons[type] || 'fas fa-bell'
}

function handleLogout() {
  showUserMenu.value = false
  if (confirm('确定要退出登录吗？')) {
    appStore.logout()
    router.push('/login')
  }
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

function openProfile() {
  showUserMenu.value = false
  isEditing.value = false
  showProfileModal.value = true
}

function openEditProfile() {
  showUserMenu.value = false
  isEditing.value = true
  profileForm.username = user.value.username || ''
  profileForm.name = user.value.name || ''
  profileForm.department = user.value.department || ''
  profileForm.email = user.value.email || ''
  profileForm.phone = user.value.phone || ''
  showProfileModal.value = true
}

function startEditProfile() {
  isEditing.value = true
  profileForm.username = user.value.username || ''
  profileForm.name = user.value.name || ''
  profileForm.department = user.value.department || ''
  profileForm.email = user.value.email || ''
  profileForm.phone = user.value.phone || ''
}

function saveProfile() {
  if (!profileForm.name.trim()) {
    appStore.showModal('提示', '姓名不能为空', 'warning')
    return
  }
  appStore.updateProfile({
    name: profileForm.name,
    department: profileForm.department,
    email: profileForm.email,
    phone: profileForm.phone,
    avatar: profileForm.name.slice(0, 2)
  })
  appStore.addNotification({ title: '资料已更新', message: '账号资料修改成功', type: 'system' })
  isEditing.value = false
}

function openChangePassword() {
  showUserMenu.value = false
  pwdForm.oldPwd = ''
  pwdForm.newPwd = ''
  pwdForm.confirmPwd = ''
  showOldPwd.value = false
  showNewPwd.value = false
  showConfirmPwd.value = false
  showPasswordModal.value = true
}

function submitChangePassword() {
  if (!pwdForm.oldPwd || !pwdForm.newPwd || !pwdForm.confirmPwd) {
    appStore.showModal('提示', '请填写完整密码信息', 'warning')
    return
  }
  if (pwdForm.newPwd.length < 6) {
    appStore.showModal('提示', '新密码至少需要6位', 'warning')
    return
  }
  if (pwdForm.newPwd !== pwdForm.confirmPwd) {
    appStore.showModal('提示', '两次输入的新密码不一致', 'warning')
    return
  }
  const result = appStore.changePassword(pwdForm.oldPwd, pwdForm.newPwd)
  if (result.success) {
    appStore.addNotification({ title: '密码已修改', message: '密码修改成功，请妥善保管', type: 'system' })
    showPasswordModal.value = false
  } else {
    appStore.showModal('提示', result.message, 'warning')
  }
}
</script>

<style scoped>
.sidebar {
  width: 252px;
  background: var(--bg-white);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar.collapsed .menu-item {
  justify-content: center;
  padding: 12px 8px;
}

.sidebar.collapsed .menu-item i {
  margin: 0;
  font-size: 17px;
}

.sidebar.collapsed .menu-item::after {
  display: none;
}

.sidebar.collapsed .sidebar-footer {
  padding: 12px 8px;
}

.sidebar.collapsed .sidebar-footer-actions {
  flex-direction: column;
  gap: 8px;
}

.sidebar.collapsed .footer-btn {
  width: 44px;
  height: 36px;
}

.sidebar.collapsed .sidebar-footer-actions .sidebar-user {
  justify-content: center;
  padding: 10px;
}

.sidebar.collapsed .model-config {
  justify-content: center;
  padding: 10px;
}

.sidebar.collapsed .model-config i {
  margin: 0;
  font-size: 16px;
}

.sidebar.collapsed .sidebar-user {
  justify-content: center;
  padding: 10px;
}

.sidebar-menu {
  flex: 1;
  padding: 16px 10px;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu::-webkit-scrollbar {
  width: 0;
}

.sidebar-menu:hover::-webkit-scrollbar {
  width: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.menu-group {
  margin-bottom: 6px;
}

.menu-group-label {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 8px 12px 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}

.menu-group-label:hover {
  color: var(--text-secondary);
}

.menu-group-label.no-hover {
  cursor: default;
  text-align: center;
  justify-content: center;
  padding: 4px 0 8px;
  font-size: 11px;
}

.menu-group-label i {
  font-size: 10px;
  transition: transform 0.2s;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.18s ease;
  color: var(--text-secondary);
  font-size: 13.5px;
  font-weight: 500;
  margin-bottom: 1px;
  position: relative;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-family: inherit;
  white-space: nowrap;
  overflow: hidden;
}

.menu-item:hover {
  background: var(--primary-50);
  color: var(--primary);
}

.menu-item.active {
  background: var(--primary-100);
  color: var(--primary);
  font-weight: 600;
}

.menu-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  border-radius: 0 3px 3px 0;
  background: var(--primary);
}

.menu-item i {
  width: 20px;
  text-align: center;
  font-size: 15px;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.menu-item:hover i {
  transform: scale(1.1);
}

.menu-item .count {
  margin-left: auto;
  font-size: 10px;
  font-weight: 600;
  background: var(--danger);
  color: #fff;
  padding: 1px 7px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

/* Submenu */
.submenu {
  padding-left: 4px;
}

.menu-item.sub {
  padding: 8px 12px;
  font-size: 13px;
  gap: 10px;
}

.agent-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.menu-item.sub:hover .agent-dot {
  transform: scale(1.3);
}

.agent-status {
  margin-left: auto;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 8px;
}

.agent-status.active {
  background: #d1fae5;
  color: #059669;
}

.agent-status.inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.agent-status.idle {
  background: #f3f4f6;
  color: #6b7280;
}

/* Collapsed: dot-only indicators */
.sidebar.collapsed .menu-item.sub {
  justify-content: center;
  padding: 10px 8px;
}

.sidebar.collapsed .agent-dot {
  width: 10px;
  height: 10px;
}

.sidebar.collapsed .submenu {
  padding-left: 0;
}

.sidebar-footer {
  padding: 14px 12px;
  border-top: 1px solid var(--border);
}

.sidebar-footer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.footer-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all .2s;
  position: relative;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.footer-btn:hover {
  background: var(--primary-50);
  border-color: var(--primary);
  color: var(--primary);
}

.footer-btn i {
  font-size: 15px;
}

.footer-btn .badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: #fff;
  font-size: 9px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border: 2px solid var(--bg-white);
}

.sidebar-footer-actions .sidebar-user {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.sidebar-footer-actions .sidebar-user:hover {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border-color: #fecaca;
}

/* 通知弹窗遮罩 */
.notification-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1999;
}

/* 通知弹窗 */
.notification-popup {
  position: fixed;
  bottom: 80px;
  left: 12px;
  width: 240px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0,0,0,.12);
  border: 1px solid var(--border);
  z-index: 2000;
  max-height: 320px;
  display: flex;
  flex-direction: column;
  animation: slideUp .2s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.notification-header .close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all .2s;
}

.notification-header .close-btn:hover {
  background: #f1f5f9;
  color: var(--text-primary);
}

.notification-list {
  overflow-y: auto;
  padding: 8px;
}

.notification-list::-webkit-scrollbar {
  width: 4px;
}

.notification-list::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.notification-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  transition: background .2s;
  cursor: pointer;
}

.notification-item:hover {
  background: #f8fafc;
}

.notification-item.unread {
  background: #eff6ff;
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 13px;
}

.notification-icon.ai {
  background: #dbeafe;
  color: #2563eb;
}

.notification-icon.task {
  background: #fef3c7;
  color: #d97706;
}

.notification-icon.agent {
  background: #d1fae5;
  color: #059669;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.notification-msg {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-time {
  font-size: 10px;
  color: var(--text-muted);
}

.empty-msg {
  text-align: center;
  padding: 24px;
  font-size: 12px;
  color: var(--text-muted);
}

.model-config {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  background: var(--bg-surface);
  border: 1px dashed var(--border);
}

.model-config:hover {
  background: var(--primary-50);
  color: var(--primary);
  border-color: var(--primary);
}

.model-config i {
  font-size: 14px;
  flex-shrink: 0;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #fafbff, #eef2ff);
  border-radius: var(--radius);
  cursor: default;
}

.sidebar-user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.sidebar-user-info {
  flex: 1;
  min-width: 0;
}

.sidebar-user-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user-role {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

/* 通知增强样式 */
.notification-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #f1f5f9;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 11px;
  transition: all .2s;
}

.header-btn:hover {
  background: #e2e8f0;
  color: var(--text-primary);
}

.empty-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
  opacity: .25;
  color: var(--text-muted);
}

.unread-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  margin-left: 6px;
  vertical-align: middle;
}

.mark-read-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 10px;
  flex-shrink: 0;
  opacity: 0;
  transition: all .2s;
}

.notification-item:hover .mark-read-btn {
  opacity: 1;
}

.mark-read-btn:hover {
  background: #eef2ff;
  border-color: var(--primary);
  color: var(--primary);
}

.notification-icon.system {
  background: #e0e7ff;
  color: #4f46e5;
}

.notification-icon.warning {
  background: #fef2f2;
  color: #dc2626;
}

.notification-icon.update {
  background: #f0fdf4;
  color: #16a34a;
}

/* 模型配置弹窗 */
.model-config-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,.45);
  backdrop-filter: blur(4px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn .2s ease;
}

.model-config-dialog {
  background: #fff;
  border-radius: 20px;
  width: 680px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(0,0,0,.15);
  animation: slideUp .25s ease;
}

.model-config-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 28px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.model-config-header h3 {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.model-config-header h3 i {
  color: #6366f1;
}

.model-config-header p {
  font-size: 13px;
  color: var(--text-muted);
}

.modal-close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f1f5f9;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 14px;
  transition: all .2s;
}

.modal-close-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.model-config-body {
  padding: 20px 28px;
  overflow-y: auto;
  flex: 1;
}

.model-config-body::-webkit-scrollbar {
  width: 4px;
}

.model-config-body::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 2px;
}

.config-section {
  margin-bottom: 24px;
}

.config-section h4 {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.config-section h4 i {
  color: #6366f1;
  width: 16px;
}

.current-model-display {
  padding: 14px 16px;
  background: linear-gradient(135deg, #eef2ff, #f5f3ff);
  border-radius: 12px;
  border: 1px solid #ddd6fe;
}

.current-model-card {
  display: flex;
  align-items: center;
  gap: 10px;
}

.model-provider-badge {
  font-size: 11px;
  padding: 3px 10px;
  background: #6366f1;
  color: #fff;
  border-radius: 6px;
  font-weight: 600;
}

.current-model-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.model-list {
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.model-search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  background: #f8fafc;
}

.model-search i {
  color: var(--text-muted);
  font-size: 13px;
}

.model-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  font-family: inherit;
  color: var(--text-primary);
}

.model-search input::placeholder {
  color: #94a3b8;
}

.model-items {
  max-height: 280px;
  overflow-y: auto;
}

.model-items::-webkit-scrollbar {
  width: 4px;
}

.model-items::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.model-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #f8fafc;
  transition: all .2s;
  cursor: pointer;
}

.model-card:last-child {
  border-bottom: none;
}

.model-card:hover {
  background: #f8fafc;
}

.model-card.active {
  background: #eef2ff;
  border-color: #ddd6fe;
}

.model-card.disabled {
  opacity: .5;
  cursor: not-allowed;
}

.model-card-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.model-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.model-status-dot.active {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16,185,129,.15);
}

.model-status-dot.inactive {
  background: #94a3b8;
}

.model-info {
  min-width: 0;
}

.model-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.model-desc {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-card-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.model-provider-tag {
  font-size: 10px;
  padding: 2px 8px;
  background: #f1f5f9;
  border-radius: 4px;
  color: var(--text-muted);
  font-weight: 500;
}

.model-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 2px;
  transition: all .2s;
}

.model-toggle-btn .fa-toggle-on {
  color: #10b981;
}

.model-toggle-btn .fa-toggle-off {
  color: #94a3b8;
}

.model-toggle-btn:hover .fa-toggle-off {
  color: #6366f1;
}

/* API Key 配置 */
.apikey-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.apikey-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.apikey-row label {
  width: 80px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-align: right;
  flex-shrink: 0;
}

.apikey-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.apikey-input-wrapper input {
  width: 100%;
  padding: 8px 36px 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: #f8fafc;
  transition: all .2s;
  color: var(--text-primary);
}

.apikey-input-wrapper input:focus {
  outline: none;
  border-color: #6366f1;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}

.apikey-input-wrapper input::placeholder {
  color: #94a3b8;
  font-size: 11px;
}

.toggle-key-btn {
  position: absolute;
  right: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 12px;
  transition: all .2s;
}

.toggle-key-btn:hover {
  background: #f1f5f9;
  color: var(--text-primary);
}

/* 参数配置 */
.param-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.param-item {
  background: #f8fafc;
  padding: 14px 16px;
  border-radius: 10px;
}

.param-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.param-value {
  font-size: 12px;
  padding: 2px 10px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-weight: 700;
  color: #6366f1;
}

input[type="range"] {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #6366f1;
  box-shadow: 0 2px 6px rgba(0,0,0,.1);
  cursor: pointer;
  transition: all .2s;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  border-color: #4f46e5;
}

.param-hints {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}

/* 联网搜索开关 */
.web-search-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 10px;
  margin-bottom: 10px;
}

.toggle-info {
  flex: 1;
  min-width: 0;
}

.toggle-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.toggle-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
}

.toggle-switch {
  width: 48px;
  height: 26px;
  border-radius: 13px;
  border: none;
  background: #cbd5e1;
  cursor: pointer;
  position: relative;
  transition: all 0.25s ease;
  flex-shrink: 0;
  margin-left: 16px;
}

.toggle-switch.active {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,.15);
  transition: transform 0.25s ease;
}

.toggle-switch.active .toggle-knob {
  transform: translateX(22px);
}

.search-supported-providers {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px dashed #e2e8f0;
}

.provider-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.provider-tag {
  font-size: 10px;
  padding: 2px 8px;
  background: #eef2ff;
  color: #6366f1;
  border-radius: 4px;
  font-weight: 500;
}

.system-prompt-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 13px;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  min-height: 80px;
  background: #f8fafc;
  transition: all .2s;
  color: var(--text-primary);
}

.system-prompt-input:focus {
  outline: none;
  border-color: #6366f1;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}

.model-config-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 28px;
  border-top: 1px solid #f1f5f9;
}

.config-btn {
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all .2s;
}

.config-btn.secondary {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: var(--text-secondary);
}

.config-btn.secondary:hover {
  background: #e2e8f0;
  color: var(--text-primary);
}

.config-btn.primary {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border: none;
  color: #fff;
  box-shadow: 0 4px 12px rgba(99,102,241,.3);
}

.config-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99,102,241,.4);
}

.config-btn.small {
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 8px;
}

.config-btn.small:hover {
  transform: none;
}

/* 添加模型按钮 */
.add-model-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  font-size: 12px;
  transition: all .2s;
  flex-shrink: 0;
}

.add-model-btn:hover {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}

/* 模型卡片操作按钮 */
.model-edit-btn,
.model-delete-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 11px;
  transition: all .2s;
  color: var(--text-muted);
}

.model-edit-btn:hover {
  background: #dbeafe;
  color: #2563eb;
}

.model-delete-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* 空模型状态 */
.empty-models {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--text-muted);
  font-size: 13px;
  gap: 8px;
}

/* 模型表单 */
.model-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: #f8fafc;
  transition: all .2s;
  color: var(--text-primary);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  background: #fff;
}

.form-hint {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
  opacity: 0.8;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}

.form-input::placeholder {
  color: #94a3b8;
  font-size: 12px;
}

/* 厂商快速选择按钮网格 */
.provider-preset-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.provider-preset-btn {
  padding: 5px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  color: #475569;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.provider-preset-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
  background: #eef2ff;
}

.provider-preset-btn.active {
  border-color: #6366f1;
  background: #6366f1;
  color: #fff;
}

/* 模型名称输入框和建议列表 */
.model-name-input-wrapper {
  position: relative;
}

.model-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.model-suggestion-item {
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: #fff;
  color: #475569;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}

.model-suggestion-item:hover {
  border-color: #6366f1;
  color: #6366f1;
}

.model-suggestion-item.active {
  border-color: #6366f1;
  background: #eef2ff;
  color: #6366f1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

/* 用户菜单弹窗 */
.user-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1998;
}

.user-menu-popup {
  position: fixed;
  bottom: 80px;
  left: 12px;
  width: 220px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0,0,0,.14);
  border: 1px solid #e2e8f0;
  z-index: 2000;
  overflow: hidden;
  animation: slideUp .2s ease;
}

.user-menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #fafbff, #eef2ff);
}

.user-menu-avatar {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  flex-shrink: 0;
}

.user-menu-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.user-menu-role {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.user-menu-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  color: #374151;
  transition: all .15s;
}

.user-menu-item:hover {
  background: #f8fafc;
}

.user-menu-item i {
  width: 18px;
  font-size: 13px;
  color: #6366f1;
}

.user-menu-item.danger {
  color: #dc2626;
}

.user-menu-item.danger i {
  color: #dc2626;
}

.user-menu-item.danger:hover {
  background: #fef2f2;
}

/* 账号信息弹窗 */
.profile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,.45);
  backdrop-filter: blur(4px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn .2s ease;
}

.profile-dialog {
  background: #fff;
  border-radius: 20px;
  width: 480px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(0,0,0,.15);
  animation: slideUp .25s ease;
}

.profile-dialog.small {
  width: 400px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.profile-header h3 {
  font-size: 17px;
  font-weight: 800;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-header h3 i {
  color: #6366f1;
}

.profile-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

.profile-avatar-area {
  text-align: center;
  padding: 20px 0 24px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 20px;
}

.profile-avatar-lg {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 800;
  font-size: 24px;
  margin: 0 auto 12px;
}

.profile-user-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
}

.profile-role-badge {
  padding: 3px 14px;
  background: #eef2ff;
  color: #6366f1;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.profile-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile-field label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.field-value {
  font-size: 14px;
  color: #1e293b;
  padding: 8px 0;
}

.field-input {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: all .2s;
  background: #f8fafc;
  color: #1e293b;
}

.field-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
  background: #fff;
}

.field-input.disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.password-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pwd-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.pwd-input-wrap .field-input {
  flex: 1;
  padding-right: 40px;
}

.pwd-toggle {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 6px;
  border-radius: 6px;
  font-size: 13px;
  transition: all .2s;
}

.pwd-toggle:hover {
  background: #f1f5f9;
  color: #475569;
}

.profile-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
}
</style>