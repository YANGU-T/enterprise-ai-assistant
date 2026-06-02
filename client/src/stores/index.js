import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ========== 角色与权限定义 ==========
const DEFAULT_ROLES = [
  { id: 'admin', name: '管理员', description: '拥有系统全部权限，可管理用户和配置' },
  { id: 'editor', name: '编辑', description: '可使用所有AI功能，无法管理用户' },
  { id: 'user', name: '用户', description: '基础使用权限，可使用AI对话和工作台' }
]

// 菜单权限映射：角色 -> 允许的路由路径
const DEFAULT_MENU_PERMISSIONS = {
  admin: [
    '/chat', '/workbench', '/agents',
    '/agent/bid-matching', '/agent/bid-workbench', '/agent/solution-gen', '/agent/resume-filter',
    '/agent/solution-editor', '/agent/bid-doc-editor', '/agent/contract-assistant',
    '/admin/users'
  ],
  editor: [
    '/chat', '/workbench', '/agents',
    '/agent/bid-matching', '/agent/bid-workbench', '/agent/solution-gen', '/agent/resume-filter',
    '/agent/solution-editor', '/agent/bid-doc-editor', '/agent/contract-assistant'
  ],
  user: [
    '/chat', '/workbench',
    '/agent/bid-matching', '/agent/bid-workbench', '/agent/solution-gen', '/agent/resume-filter',
    '/agent/solution-editor', '/agent/bid-doc-editor', '/agent/contract-assistant'
  ]
}

// 应用全局状态
export const useAppStore = defineStore('app', () => {
  // 用户信息
  const user = ref({
    id: 1,
    name: 'MI',
    role: '管理员',
    avatar: 'MI',
    department: '技术部',
    email: '',
    phone: '',
    username: 'admin'
  })

  // 登录状态
  const isLoggedIn = ref(false)

  // 角色列表
  const roles = ref(loadRoles())

  // 菜单权限映射
  const menuPermissions = ref(loadMenuPermissions())

  // 用户列表
  const userList = ref(loadUserList())

  // 初始化登录状态（从localStorage恢复）
  function initAuth() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
        isLoggedIn.value = true
      } catch (e) {
        isLoggedIn.value = false
      }
    }
  }

  // 登录
  function login(userData) {
    user.value = { ...user.value, ...userData }
    isLoggedIn.value = true
    localStorage.setItem('user', JSON.stringify(user.value))
    return true
  }

  // 退出登录
  function logout() {
    user.value = { id: null, name: '', role: '', avatar: '', department: '', email: '', phone: '', username: '' }
    isLoggedIn.value = false
    localStorage.removeItem('user')
  }

  // ========== 用户管理 ==========

  // 从localStorage加载角色列表
  function loadRoles() {
    try {
      const saved = localStorage.getItem('app_roles')
      if (saved) return JSON.parse(saved)
    } catch (e) { /* ignore */ }
    return [...DEFAULT_ROLES]
  }

  // 从localStorage加载菜单权限
  function loadMenuPermissions() {
    try {
      const saved = localStorage.getItem('app_menu_permissions')
      if (saved) return JSON.parse(saved)
    } catch (e) { /* ignore */ }
    return JSON.parse(JSON.stringify(DEFAULT_MENU_PERMISSIONS))
  }

  // 从localStorage加载用户列表
  function loadUserList() {
    try {
      const saved = localStorage.getItem('app_user_list')
      if (saved) return JSON.parse(saved)
    } catch (e) { /* ignore */ }
    // 默认管理员账号
    return [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        name: 'MI',
        role: 'admin',
        roleName: '管理员',
        department: '技术部',
        email: 'admin@company.com',
        phone: '13800138000',
        status: 'active',
        createdAt: '2026-01-01'
      }
    ]
  }

  function saveRoles() {
    localStorage.setItem('app_roles', JSON.stringify(roles.value))
  }

  function saveMenuPermissions() {
    localStorage.setItem('app_menu_permissions', JSON.stringify(menuPermissions.value))
  }

  function saveUserList() {
    localStorage.setItem('app_user_list', JSON.stringify(userList.value))
  }

  // 获取当前用户的角色ID
  function getCurrentRoleId() {
    const u = userList.value.find(u => u.username === user.value.username)
    return u ? u.role : 'user'
  }

  // 检查当前用户是否有指定路由的访问权限
  function hasRoutePermission(routePath) {
    const roleId = getCurrentRoleId()
    const perms = menuPermissions.value[roleId]
    if (!perms) return false
    // 精确匹配或前缀匹配（允许子路由）
    return perms.some(p => routePath === p || routePath.startsWith(p + '/'))
  }

  // 获取当前用户可访问的侧边栏菜单
  function getAccessibleMenuItems() {
    const roleId = getCurrentRoleId()
    return menuPermissions.value[roleId] || []
  }

  // 添加用户
  function addUser(userData) {
    const newUser = {
      id: Date.now(),
      username: userData.username,
      password: userData.password || '123456',
      name: userData.name,
      role: userData.role || 'user',
      roleName: roles.value.find(r => r.id === (userData.role || 'user'))?.name || '用户',
      department: userData.department || '',
      email: userData.email || '',
      phone: userData.phone || '',
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10)
    }
    userList.value.push(newUser)
    saveUserList()
    // 同步到app_users
    syncLegacyUsers()
    return newUser
  }

  // 更新用户
  function updateUser(userId, updates) {
    const idx = userList.value.findIndex(u => u.id === userId)
    if (idx === -1) return false
    if (updates.role) {
      updates.roleName = roles.value.find(r => r.id === updates.role)?.name || updates.role
    }
    Object.assign(userList.value[idx], updates)
    saveUserList()
    syncLegacyUsers()
    // 如果更新的是当前用户，同步到user状态
    if (userList.value[idx].username === user.value.username) {
      const u = userList.value[idx]
      user.value.name = u.name
      user.value.role = u.roleName
      user.value.department = u.department
      user.value.email = u.email
      user.value.phone = u.phone
      user.value.avatar = u.name.slice(0, 2)
      localStorage.setItem('user', JSON.stringify(user.value))
    }
    return true
  }

  // 删除用户
  function deleteUser(userId) {
    const idx = userList.value.findIndex(u => u.id === userId)
    if (idx === -1) return false
    // 不允许删除当前登录用户
    if (userList.value[idx].username === user.value.username) return false
    userList.value.splice(idx, 1)
    saveUserList()
    syncLegacyUsers()
    return true
  }

  // 切换用户状态
  function toggleUserStatus(userId) {
    const u = userList.value.find(u => u.id === userId)
    if (!u) return
    u.status = u.status === 'active' ? 'disabled' : 'active'
    saveUserList()
  }

  // 更新菜单权限
  function updateMenuPermissions(roleId, paths) {
    menuPermissions.value[roleId] = [...paths]
    saveMenuPermissions()
  }

  // 更新当前用户资料
  function updateProfile(data) {
    Object.assign(user.value, data)
    localStorage.setItem('user', JSON.stringify(user.value))
    // 同步到userList
    const idx = userList.value.findIndex(u => u.username === user.value.username)
    if (idx !== -1) {
      if (data.name) userList.value[idx].name = data.name
      if (data.email) userList.value[idx].email = data.email
      if (data.phone) userList.value[idx].phone = data.phone
      if (data.department) userList.value[idx].department = data.department
      saveUserList()
    }
  }

  // 修改密码
  function changePassword(oldPwd, newPwd) {
    const idx = userList.value.findIndex(u => u.username === user.value.username)
    if (idx === -1) return { success: false, message: '用户不存在' }
    if (userList.value[idx].password !== oldPwd) {
      return { success: false, message: '原密码错误' }
    }
    userList.value[idx].password = newPwd
    saveUserList()
    syncLegacyUsers()
    return { success: true, message: '密码修改成功' }
  }

  // 同步用户到旧的app_users格式（兼容登录页）
  function syncLegacyUsers() {
    const legacy = {}
    userList.value.forEach(u => {
      legacy[u.username] = u.password
    })
    localStorage.setItem('app_users', JSON.stringify(legacy))
  }

  // 通知列表
  const notifications = ref([])
  
  // 模态框状态
  const modal = ref({
    show: false,
    title: '',
    content: '',
    type: 'info'
  })

  // 侧边栏状态
  const sidebarCollapsed = ref(false)

  // 全局加载状态
  const loading = ref(false)

  // 统计数据
  const stats = ref({
    activeTasks: 8,
    activeAgents: 5,
    aiExecutions: 28
  })

  // 跨模块共享的任务列表
  const sharedTasks = ref([])

  // 跨模块共享的日程列表
  const sharedSchedules = ref([])

  // AI推荐的助手功能
  const aiRecommendations = ref([])

  // Agent状态同步（配置中心 <-> 侧边栏）
  const agentStatuses = ref({
    '/agent/bid-matching': 'active',
    '/agent/bid-workbench': 'active',
    '/agent/solution-gen': 'active',
    '/agent/resume-filter': 'active',
    '/agent/contract-assistant': 'active'
  })

  // 动态Agent列表（Agent配置中心 <-> 侧边栏AI助手）
  const DEFAULT_DYNAMIC_AGENTS = [
    { id: 'bid-matching', name: '招投标匹配', path: '/agent/bid-matching', icon: 'fas fa-search-dollar', color: '#6366f1', status: 'active', description: '智能匹配招投标项目', tags: ['招投标','匹配'] },
    { id: 'solution-gen', name: '解决方案生成', path: '/agent/solution-gen', icon: 'fas fa-file-invoice', color: '#059669', status: 'active', description: '基于需求自动生成专业的解决方案文档', tags: ['方案','生成'] },
    { id: 'contract-assistant', name: 'AI合同助手', path: '/agent/contract-assistant', icon: 'fas fa-file-contract', color: '#ec4899', status: 'active', description: '智能生成合同文档，支持在线编辑与合规审查', tags: ['合同','生成'] },
    { id: 'resume-filter', name: '简历筛选', path: '/agent/resume-filter', icon: 'fas fa-user-check', color: '#d97706', status: 'active', description: '智能分析简历，按岗位需求筛选匹配候选人', tags: ['简历','筛选'] }
  ]

  function loadDynamicAgents() {
    try {
      const saved = localStorage.getItem('dynamic_agents')
      if (saved) return JSON.parse(saved)
    } catch (e) { /* ignore */ }
    return [...DEFAULT_DYNAMIC_AGENTS]
  }

  function saveDynamicAgents() {
    localStorage.setItem('dynamic_agents', JSON.stringify(dynamicAgents.value))
  }

  const dynamicAgents = ref(loadDynamicAgents())

  function addDynamicAgent(agentData) {
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: agentData.name,
      path: agentData.path || `/agent/${Date.now()}`,
      icon: agentData.icon || 'fas fa-robot',
      color: agentData.color || '#6366f1',
      status: 'active',
      description: agentData.description || '',
      tags: agentData.tags || []
    }
    dynamicAgents.value.push(newAgent)
    // 同步到agentStatuses
    agentStatuses.value[newAgent.path] = 'active'
    saveDynamicAgents()
    return newAgent
  }

  function updateDynamicAgent(agentId, updates) {
    const idx = dynamicAgents.value.findIndex(a => a.id === agentId)
    if (idx === -1) return false
    const oldPath = dynamicAgents.value[idx].path
    Object.assign(dynamicAgents.value[idx], updates)
    // 如果path变了，同步更新agentStatuses
    if (updates.path && updates.path !== oldPath) {
      agentStatuses.value[updates.path] = dynamicAgents.value[idx].status
      delete agentStatuses.value[oldPath]
    }
    saveDynamicAgents()
    return true
  }

  function deleteDynamicAgent(agentId) {
    const idx = dynamicAgents.value.findIndex(a => a.id === agentId)
    if (idx === -1) return false
    const path = dynamicAgents.value[idx].path
    dynamicAgents.value.splice(idx, 1)
    // 清理agentStatuses
    delete agentStatuses.value[path]
    saveDynamicAgents()
    return true
  }

  function toggleDynamicAgentStatus(agentId) {
    const agent = dynamicAgents.value.find(a => a.id === agentId)
    if (!agent) return
    agent.status = agent.status === 'active' ? 'inactive' : 'active'
    agentStatuses.value[agent.path] = agent.status
    saveDynamicAgents()
  }

  // AI模型配置
  const modelConfig = ref(loadModelConfig())

  function loadModelConfig() {
    const defaults = {
      currentModel: '',
      models: [],
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1.0,
      enableWebSearch: false,
      systemPrompt: '你是一个专业的企业AI工作助手，帮助用户处理工作任务、分析数据、生成文档。'
    }
    try {
      const saved = localStorage.getItem('model_config')
      if (saved) {
        const parsed = JSON.parse(saved)
        // 兼容旧格式：如果存在 availableModels 但没有 models，迁移数据
        if (Array.isArray(parsed.availableModels) && !Array.isArray(parsed.models)) {
          parsed.models = parsed.availableModels.map(m => ({
            id: m.id,
            name: m.name,
            provider: m.provider || '未知',
            description: m.description || '',
            endpoint: '',
            apiKey: parsed.apiKeys?.[m.provider] || '',
            status: m.status || 'active',
            createdAt: new Date().toISOString().slice(0, 10)
          }))
          delete parsed.availableModels
          delete parsed.apiKeys
        }
        // 确保 models 数组存在
        if (!Array.isArray(parsed.models)) parsed.models = []
        return { ...defaults, ...parsed }
      }
    } catch (e) { /* ignore */ }
    return defaults
  }

  function saveModelConfig() {
    localStorage.setItem('model_config', JSON.stringify(modelConfig.value))
  }

  // 计算属性
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read).length
  )

  // 方法
  function initializeApp() {
    initAuth()
    loadNotifications()
  }

  function loadNotifications() {
    notifications.value = [
      { id: 1, title: 'AI任务完成', message: '周报生成流程已完成', time: '5分钟前', read: false, type: 'ai' },
      { id: 2, title: '任务即将到期', message: '客户演示PPT定稿将于明天到期', time: '10分钟前', read: false, type: 'task' },
      { id: 3, title: 'Agent执行完成', message: '数据分析Agent已完成数据处理', time: '1小时前', read: true, type: 'agent' }
    ]
  }

  function addNotification(notification) {
    notifications.value.unshift({
      id: Date.now(),
      time: '刚刚',
      read: false,
      ...notification
    })
  }

  function markNotificationAsRead(id) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) notification.read = true
  }

  function showModal(title, content, type = 'info') {
    modal.value = { show: true, title, content, type }
  }

  function hideModal() {
    modal.value.show = false
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setLoading(status) {
    loading.value = status
  }

  function updateModelConfig(config) {
    Object.assign(modelConfig.value, config)
    saveModelConfig()
  }

  function switchModel(modelId) {
    modelConfig.value.currentModel = modelId
    saveModelConfig()
  }

  function toggleModelStatus(modelId) {
    const model = modelConfig.value.models.find(m => m.id === modelId)
    if (model) {
      model.status = model.status === 'active' ? 'inactive' : 'active'
      saveModelConfig()
    }
  }

  function addModel(modelData) {
    const newModel = {
      id: `model-${Date.now()}`,
      name: modelData.name,
      provider: modelData.provider || '自定义',
      description: modelData.description || '',
      endpoint: modelData.endpoint || '',
      apiKey: modelData.apiKey || '',
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10)
    }
    modelConfig.value.models.push(newModel)
    saveModelConfig()
    return newModel
  }

  function updateModel(modelId, updates) {
    const idx = modelConfig.value.models.findIndex(m => m.id === modelId)
    if (idx === -1) return false
    Object.assign(modelConfig.value.models[idx], updates)
    saveModelConfig()
    return true
  }

  function deleteModel(modelId) {
    const idx = modelConfig.value.models.findIndex(m => m.id === modelId)
    if (idx === -1) return false
    modelConfig.value.models.splice(idx, 1)
    // 如果删除的是当前模型，清空当前模型
    if (modelConfig.value.currentModel === modelId) {
      modelConfig.value.currentModel = ''
    }
    saveModelConfig()
    return true
  }

  function getApiKey(modelId) {
    const model = modelConfig.value.models.find(m => m.id === modelId)
    return model ? model.apiKey : ''
  }

  function clearAllNotifications() {
    notifications.value = []
  }

  function markAllNotificationsRead() {
    notifications.value.forEach(n => n.read = true)
  }

  // 跨模块联动：添加任务到工作台
  function addSharedTask(task) {
    sharedTasks.value.unshift({
      id: Date.now(),
      title: task.title,
      priority: task.priority || 'medium',
      status: 'pending',
      done: false,
      deadline: task.deadline || '待定',
      agent: task.agent || 'AI对话',
      source: 'ai-chat',
      createdAt: new Date().toLocaleString('zh-CN')
    })
    stats.value.activeTasks++
    addNotification({
      title: '新任务创建',
      message: `从AI对话创建了任务：${task.title}`,
      type: 'task'
    })
  }

  // 跨模块联动：添加日程到工作台
  function addSharedSchedule(schedule) {
    sharedSchedules.value.unshift({
      id: Date.now(),
      time: schedule.time || '待定',
      title: schedule.title,
      type: schedule.type || '任务',
      status: 'pending',
      aiHint: true,
      source: 'ai-chat',
      createdAt: new Date().toLocaleString('zh-CN')
    })
    addNotification({
      title: '新日程创建',
      message: `从AI对话创建了日程：${schedule.title}`,
      type: 'task'
    })
  }

  // 跨模块联动：设置AI推荐
  function setAiRecommendations(recommendations) {
    aiRecommendations.value = recommendations
  }

  // 更新Agent状态
  function updateAgentStatus(path, status) {
    agentStatuses.value[path] = status
  }

  return {
    user,
    isLoggedIn,
    notifications,
    modal,
    sidebarCollapsed,
    loading,
    stats,
    modelConfig,
    sharedTasks,
    sharedSchedules,
    aiRecommendations,
    agentStatuses,
    unreadNotifications,
    roles,
    menuPermissions,
    userList,
    initializeApp,
    login,
    logout,
    loadNotifications,
    addNotification,
    markNotificationAsRead,
    clearAllNotifications,
    markAllNotificationsRead,
    showModal,
    hideModal,
    toggleSidebar,
    setLoading,
    updateModelConfig,
    switchModel,
    toggleModelStatus,
    addModel,
    updateModel,
    deleteModel,
    getApiKey,
    saveModelConfig,
    addSharedTask,
    addSharedSchedule,
    setAiRecommendations,
    updateAgentStatus,
    dynamicAgents,
    addDynamicAgent,
    updateDynamicAgent,
    deleteDynamicAgent,
    toggleDynamicAgentStatus,
    // 用户管理
    hasRoutePermission,
    getAccessibleMenuItems,
    getCurrentRoleId,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    updateMenuPermissions,
    updateProfile,
    changePassword,
    syncLegacyUsers
  }
})