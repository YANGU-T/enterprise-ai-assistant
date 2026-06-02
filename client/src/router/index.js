import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/chat'
  },
  {
    path: '/chat',
    name: 'AIChat',
    component: () => import('@/views/AIChat.vue'),
    meta: { title: 'AI 对话', requiresAuth: true }
  },
  {
    path: '/chat/:agentId',
    name: 'AIChatAgent',
    component: () => import('@/views/AIChat.vue'),
    meta: { title: 'AI 对话', requiresAuth: true }
  },
  {
    path: '/workbench',
    name: 'Workbench',
    component: () => import('@/views/Workbench.vue'),
    meta: { title: '个人工作台', requiresAuth: true }
  },
  {
    path: '/agents',
    name: 'Agents',
    component: () => import('@/views/AgentConfig.vue'),
    meta: { title: 'Agent 配置', requiresAuth: true }
  },
  {
    path: '/agent/bid-matching',
    name: 'BidMatching',
    component: () => import('@/views/agent/BidMatching.vue'),
    meta: { title: '招投标匹配', requiresAuth: true }
  },
  {
    path: '/agent/bid-workbench',
    name: 'BidWorkbench',
    component: () => import('@/views/agent/BidWorkbench.vue'),
    meta: { title: '招投标工作台', requiresAuth: true }
  },
  {
    path: '/agent/solution-gen',
    name: 'SolutionGen',
    component: () => import('@/views/agent/SolutionGen.vue'),
    meta: { title: '解决方案生成', requiresAuth: true }
  },
  {
    path: '/agent/resume-filter',
    name: 'ResumeFilter',
    component: () => import('@/views/agent/ResumeFilter.vue'),
    meta: { title: '简历筛选', requiresAuth: true }
  },
  {
    path: '/agent/solution-editor',
    name: 'SolutionEditor',
    component: () => import('@/views/agent/SolutionEditor.vue'),
    meta: { title: '方案编辑', requiresAuth: true }
  },
  {
    path: '/agent/bid-doc-editor',
    name: 'BidDocEditor',
    component: () => import('@/views/agent/BidDocEditor.vue'),
    meta: { title: '标书编辑', requiresAuth: true }
  },
  {
    path: '/agent/contract-assistant',
    name: 'ContractAssistant',
    component: () => import('@/views/agent/ContractAssistant.vue'),
    meta: { title: 'AI合同助手', requiresAuth: true }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: () => import('@/views/admin/UserManagement.vue'),
    meta: { title: '用户管理', requiresAuth: true, requireRole: 'admin' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '企业AI助手'} - 中控平台`
  
  // 检查是否需要认证
  if (to.meta.requiresAuth !== false && !localStorage.getItem('user')) {
    if (to.path !== '/login') {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  // 已登录用户访问登录页时，重定向到首页
  if (to.path === '/login' && localStorage.getItem('user')) {
    next('/chat')
    return
  }

  // 权限检查：检查用户是否有该路由的菜单权限
  if (to.meta.requiresAuth !== false) {
    try {
      const savedUser = JSON.parse(localStorage.getItem('user'))
      const savedUserList = JSON.parse(localStorage.getItem('app_user_list') || '[]')
      const savedPerms = JSON.parse(localStorage.getItem('app_menu_permissions') || '{}')
      
      if (savedUser && savedUserList.length > 0 && Object.keys(savedPerms).length > 0) {
        const currentUserData = savedUserList.find(u => u.username === savedUser.username)
        const roleId = currentUserData ? currentUserData.role : 'user'
        const allowedPaths = savedPerms[roleId] || []
        
        // 精确匹配或前缀匹配
        const hasAccess = allowedPaths.some(p => to.path === p || to.path.startsWith(p + '/'))
        if (!hasAccess) {
          next('/chat')
          return
        }
      }
    } catch (e) {
      // 解析失败，放行
    }
  }
  
  next()
})

export default router