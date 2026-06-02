<template>
  <div class="login-page">
    <!-- 居中卡片容器 -->
    <div class="login-container">
      <!-- 左侧品牌区域 -->
      <div class="login-brand">
        <div class="brand-logo">
          <div class="logo-wrapper">
            <img src="@/assets/logo.png" alt="安小美 Logo" class="logo-img" />
          </div>
        </div>

        <h1 class="brand-title">企业AI中台</h1>
        <p class="brand-desc">专为现代团队和企业打造的AI生产力与管理平台，助力团队效率提升</p>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon"><i class="fas fa-bolt"></i></div>
            <div class="feature-text">
              <span class="feature-name">高效智能</span>
              <span class="feature-desc">AI驱动的智能助手</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon"><i class="fas fa-shield-halved"></i></div>
            <div class="feature-text">
              <span class="feature-name">安全可靠</span>
              <span class="feature-desc">企业级安全保障</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon"><i class="fas fa-cubes"></i></div>
            <div class="feature-text">
              <span class="feature-name">模型统一管理</span>
              <span class="feature-desc">集中接入和管理各类云端大模型</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-form-area">
        <!-- 登录表单 -->
        <div v-if="currentView === 'login'" class="form-panel">
          <h2 class="form-title">欢迎使用</h2>
          <p class="form-subtitle">请登录您的账号</p>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label>用户名</label>
              <div class="input-wrapper">
                <i class="fas fa-user input-icon"></i>
                <input v-model="loginForm.username" type="text" placeholder="请输入用户名" autocomplete="username">
              </div>
            </div>

            <div class="form-group">
              <label>密码</label>
              <div class="input-wrapper">
                <i class="fas fa-lock input-icon"></i>
                <input v-model="loginForm.password" :type="showPwd ? 'text' : 'password'" placeholder="请输入密码" autocomplete="current-password">
                <i class="fas fa-eye input-icon right" :class="{ off: !showPwd }" @click="showPwd = !showPwd"></i>
              </div>
            </div>

            <button type="submit" class="login-btn" :class="{ loading: isLogging }" :disabled="isLogging">
              <span v-if="!isLogging">登录</span>
              <span v-else class="btn-loading"><i class="fas fa-spinner fa-spin"></i> 登录中...</span>
            </button>

            <div class="form-links">
              <a href="#" class="link" @click.prevent="switchView('forgot')">忘记密码</a>
              <a href="#" class="link primary" @click.prevent="switchView('register')">注册账号</a>
            </div>

            <p class="agreement-text">登录即表示您已阅读并同意<a href="#" @click.prevent>《隐私协议》</a></p>
          </form>
        </div>

        <!-- 忘记密码 -->
        <div v-if="currentView === 'forgot'" class="form-panel">
          <h2 class="form-title">找回密码</h2>
          <p class="form-subtitle">{{ forgotStep === 1 ? '请输入用户名以验证身份' : '请设置新密码' }}</p>

          <form @submit.prevent="handleForgotStep1" v-if="forgotStep === 1" class="login-form">
            <div class="form-group">
              <label>用户名</label>
              <div class="input-wrapper">
                <i class="fas fa-user input-icon"></i>
                <input v-model="forgotForm.username" type="text" placeholder="请输入用户名">
              </div>
            </div>
            <p v-if="forgotError" class="error-msg">{{ forgotError }}</p>
            <button type="submit" class="login-btn" :class="{ loading: forgotLoading }" :disabled="forgotLoading">
              <span v-if="!forgotLoading">下一步</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> 验证中...</span>
            </button>
            <a href="#" class="back-link" @click.prevent="switchView('login')"><i class="fas fa-arrow-left"></i> 返回登录</a>
          </form>

          <form @submit.prevent="handleForgotStep2" v-if="forgotStep === 2" class="login-form">
            <div class="form-group">
              <label>新密码</label>
              <div class="input-wrapper">
                <i class="fas fa-lock input-icon"></i>
                <input v-model="forgotForm.newPassword" :type="showForgotPwd ? 'text' : 'password'" placeholder="请输入新密码（至少6位）">
                <i class="fas fa-eye input-icon right" :class="{ off: !showForgotPwd }" @click="showForgotPwd = !showForgotPwd"></i>
              </div>
            </div>
            <div class="form-group">
              <label>确认新密码</label>
              <div class="input-wrapper">
                <i class="fas fa-check input-icon"></i>
                <input v-model="forgotForm.confirmPassword" :type="showForgotPwd ? 'text' : 'password'" placeholder="请再次输入新密码">
              </div>
            </div>
            <p v-if="forgotError" class="error-msg">{{ forgotError }}</p>
            <p v-if="forgotSuccess" class="success-msg">{{ forgotSuccess }}</p>
            <button type="submit" class="login-btn" :class="{ loading: forgotLoading }" :disabled="forgotLoading">
              <span v-if="!forgotLoading">重置密码</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> 重置中...</span>
            </button>
            <a href="#" class="back-link" @click.prevent="switchView('login')"><i class="fas fa-arrow-left"></i> 返回登录</a>
          </form>
        </div>

        <!-- 注册账号 -->
        <div v-if="currentView === 'register'" class="form-panel">
          <h2 class="form-title">注册账号</h2>
          <p class="form-subtitle">创建您的企业AI中台账号</p>

          <form @submit.prevent="handleRegister" class="login-form">
            <div class="form-group">
              <label>用户名</label>
              <div class="input-wrapper">
                <i class="fas fa-user input-icon"></i>
                <input v-model="registerForm.username" type="text" placeholder="请输入用户名（至少3位）" autocomplete="off">
              </div>
            </div>
            <div class="form-group">
              <label>密码</label>
              <div class="input-wrapper">
                <i class="fas fa-lock input-icon"></i>
                <input v-model="registerForm.password" :type="showRegPwd ? 'text' : 'password'" placeholder="请输入密码（至少6位）">
                <i class="fas fa-eye input-icon right" :class="{ off: !showRegPwd }" @click="showRegPwd = !showRegPwd"></i>
              </div>
            </div>
            <div class="form-group">
              <label>确认密码</label>
              <div class="input-wrapper">
                <i class="fas fa-check input-icon"></i>
                <input v-model="registerForm.confirmPassword" :type="showRegPwd ? 'text' : 'password'" placeholder="请再次输入密码">
              </div>
            </div>
            <p v-if="registerError" class="error-msg">{{ registerError }}</p>
            <p v-if="registerSuccess" class="success-msg">{{ registerSuccess }}</p>
            <button type="submit" class="login-btn" :class="{ loading: registerLoading }" :disabled="registerLoading">
              <span v-if="!registerLoading">注册</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> 注册中...</span>
            </button>
            <a href="#" class="back-link" @click.prevent="switchView('login')"><i class="fas fa-arrow-left"></i> 已有账号？去登录</a>
          </form>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'

const router = useRouter()
const appStore = useAppStore()

// 当前视图：login / forgot / register
const currentView = ref('login')

// 密码可见性
const showPwd = ref(false)
const showForgotPwd = ref(false)
const showRegPwd = ref(false)

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

const isLogging = ref(false)

// 忘记密码
const forgotStep = ref(1)
const forgotForm = reactive({
  username: '',
  newPassword: '',
  confirmPassword: ''
})
const forgotLoading = ref(false)
const forgotError = ref('')
const forgotSuccess = ref('')

// 注册
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})
const registerLoading = ref(false)
const registerError = ref('')
const registerSuccess = ref('')

// Toast
const toast = reactive({ show: false, message: '', type: 'info' })

// ========== 本地用户存储 ==========
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('app_users') || '{}')
  } catch { return {} }
}

function saveUsers(users) {
  localStorage.setItem('app_users', JSON.stringify(users))
}

// 初始化默认测试账号
function initDefaultUsers() {
  const users = getUsers()
  if (!users['admin']) {
    users['admin'] = 'admin123'
    saveUsers(users)
  }
}

// ========== Toast ==========
function showToast(message, type = 'info', duration = 3000) {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, duration)
}

// ========== 视图切换 ==========
function switchView(view) {
  currentView.value = view
  // 重置表单状态
  forgotStep.value = 1
  forgotError.value = ''
  forgotSuccess.value = ''
  registerError.value = ''
  registerSuccess.value = ''
}

// ========== 从userList获取用户完整信息 ==========
function getUserFromList(username) {
  try {
    const list = JSON.parse(localStorage.getItem('app_user_list') || '[]')
    return list.find(u => u.username === username)
  } catch { return null }
}

// ========== 登录 ==========
async function handleLogin() {
  if (!loginForm.username.trim()) {
    showToast('请输入用户名', 'error')
    return
  }
  if (!loginForm.password) {
    showToast('请输入密码', 'error')
    return
  }

  isLogging.value = true

  // 模拟请求延迟
  await new Promise(resolve => setTimeout(resolve, 800))

  const users = getUsers()
  const storedPwd = users[loginForm.username.trim()]

  isLogging.value = false

  if (!storedPwd) {
    showToast('用户名不存在，请先注册', 'error')
    return
  }

  if (storedPwd !== loginForm.password) {
    showToast('密码错误', 'error')
    return
  }

  // 检查用户是否被禁用
  const userData = getUserFromList(loginForm.username.trim())
  if (userData && userData.status === 'disabled') {
    showToast('该账号已被禁用，请联系管理员', 'error')
    return
  }

  // 登录成功 - 使用userList中的完整信息
  showToast('登录成功，正在跳转...', 'success')
  const loginData = userData ? {
    id: userData.id,
    name: userData.name,
    avatar: userData.name.slice(0, 2),
    role: userData.roleName || '用户',
    department: userData.department || '',
    email: userData.email || '',
    phone: userData.phone || '',
    username: userData.username
  } : {
    name: loginForm.username.trim(),
    avatar: loginForm.username.trim().substring(0, 2).toUpperCase(),
    role: '用户',
    department: '',
    username: loginForm.username.trim()
  }
  appStore.login(loginData)

  setTimeout(() => {
    router.replace('/chat')
  }, 600)
}

// ========== 忘记密码 - 第一步：验证用户名 ==========
async function handleForgotStep1() {
  if (!forgotForm.username.trim()) {
    forgotError.value = '请输入用户名'
    return
  }

  const users = getUsers()
  if (!users[forgotForm.username.trim()]) {
    forgotError.value = '该用户名不存在，请检查后重试'
    return
  }

  forgotLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 600))
  forgotLoading.value = false
  forgotError.value = ''

  // 进入第二步
  forgotStep.value = 2
}

// ========== 忘记密码 - 第二步：重置密码 ==========
async function handleForgotStep2() {
  forgotError.value = ''
  forgotSuccess.value = ''

  if (!forgotForm.newPassword) {
    forgotError.value = '请输入新密码'
    return
  }
  if (forgotForm.newPassword.length < 6) {
    forgotError.value = '密码至少需要6位'
    return
  }
  if (forgotForm.newPassword !== forgotForm.confirmPassword) {
    forgotError.value = '两次输入的密码不一致'
    return
  }

  forgotLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 800))

  const username = forgotForm.username.trim()
  // 更新旧格式密码
  const users = getUsers()
  users[username] = forgotForm.newPassword
  saveUsers(users)

  // 同步更新app_user_list
  try {
    const userList = JSON.parse(localStorage.getItem('app_user_list') || '[]')
    const idx = userList.findIndex(u => u.username === username)
    if (idx !== -1) {
      userList[idx].password = forgotForm.newPassword
      localStorage.setItem('app_user_list', JSON.stringify(userList))
    }
  } catch (e) { /* ignore */ }

  forgotLoading.value = false
  forgotSuccess.value = '密码重置成功！3秒后返回登录页...'

  setTimeout(() => {
    switchView('login')
    loginForm.username = username
    loginForm.password = ''
  }, 2000)
}

// ========== 注册 ==========
async function handleRegister() {
  registerError.value = ''
  registerSuccess.value = ''

  if (!registerForm.username.trim()) {
    registerError.value = '请输入用户名'
    return
  }
  if (registerForm.username.trim().length < 3) {
    registerError.value = '用户名至少需要3位字符'
    return
  }
  if (!registerForm.password) {
    registerError.value = '请输入密码'
    return
  }
  if (registerForm.password.length < 6) {
    registerError.value = '密码至少需要6位'
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    registerError.value = '两次输入的密码不一致'
    return
  }

  const users = getUsers()
  if (users[registerForm.username.trim()]) {
    registerError.value = '该用户名已被注册，请更换后重试'
    return
  }

  registerLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 800))

  const username = registerForm.username.trim()
  // 创建用户到旧格式（兼容）
  users[username] = registerForm.password
  saveUsers(users)

  // 同步创建到app_user_list（用户管理系统）
  try {
    const userList = JSON.parse(localStorage.getItem('app_user_list') || '[]')
    const exists = userList.find(u => u.username === username)
    if (!exists) {
      userList.push({
        id: Date.now(),
        username: username,
        password: registerForm.password,
        name: username,
        role: 'user',
        roleName: '用户',
        department: '',
        email: '',
        phone: '',
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10)
      })
      localStorage.setItem('app_user_list', JSON.stringify(userList))
    }
  } catch (e) { /* ignore */ }

  registerLoading.value = false
  registerSuccess.value = '注册成功！即将返回登录页...'

  showToast('注册成功！请使用新账号登录', 'success')

  setTimeout(() => {
    switchView('login')
    loginForm.username = username
    loginForm.password = ''
  }, 1500)
}

// ========== 初始化 ==========
onMounted(() => {
  initDefaultUsers()
  if (localStorage.getItem('user')) {
    router.replace('/chat')
  }
})
</script>

<style scoped>
/* 页面背景 */
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4ff 0%, #eef2ff 30%, #f5f3ff 60%, #f8fafc 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.login-page::before {
  content: '';
  position: absolute;
  top: -150px;
  left: -100px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(59,130,246,.06), transparent 70%);
  border-radius: 50%;
}

.login-page::after {
  content: '';
  position: absolute;
  bottom: -120px;
  right: -80px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(139,92,246,.06), transparent 70%);
  border-radius: 50%;
}

/* 居中卡片容器 */
.login-container {
  display: flex;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .08), 0 2px 8px rgba(0, 0, 0, .04);
  overflow: hidden;
  position: relative;
  z-index: 1;
  max-width: 960px;
  width: 90%;
}

/* 左侧品牌区 */
.login-brand {
  width: 420px;
  flex-shrink: 0;
  background: linear-gradient(160deg, #f0f7ff 0%, #eef2ff 50%, #faf5ff 100%);
  padding: 56px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.login-brand::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -30px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(59,130,246,.07), transparent 70%);
  border-radius: 50%;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 36px;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 28px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,.04);
  border: 1px solid rgba(148,163,184,.1);
}

.logo-img {
  height: 56px;
  width: auto;
  object-fit: contain;
}

.brand-title {
  font-size: 34px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 14px;
  letter-spacing: 1px;
  text-align: center;
}

.brand-desc {
  font-size: 15px;
  color: #475569;
  line-height: 1.7;
  margin-bottom: 42px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: rgba(255,255,255,.65);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(148,163,184,.12);
  transition: all .25s ease;
}

.feature-item:hover {
  transform: translateX(4px);
  box-shadow: 0 3px 12px rgba(59,130,246,.06);
  border-color: rgba(59,130,246,.2);
}

.feature-icon {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  font-size: 15px;
  flex-shrink: 0;
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.feature-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.feature-desc {
  font-size: 12px;
  color: #64748b;
}

/* 右侧表单区域 */
.login-form-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56px 48px;
}

.form-panel {
  width: 100%;
  max-width: 340px;
  animation: fadeIn .35s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
}

.form-subtitle {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  width: 100%;
  padding: 11px 14px 11px 38px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: #0f172a;
  background: #f8fafc;
  transition: all .2s ease;
  outline: none;
}

.input-wrapper input:focus {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59,130,246,.1);
}

.input-wrapper input::placeholder {
  color: #94a3b8;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  font-size: 14px;
  pointer-events: none;
}

.input-icon.right {
  left: auto;
  right: 12px;
  cursor: pointer;
  pointer-events: auto;
  transition: color .2s;
}

.input-icon.right:hover { color: #64748b; }
.input-icon.right.off { opacity: .4; }

.login-btn {
  width: 100%;
  padding: 13px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all .2s ease;
  margin-top: 2px;
  margin-bottom: 18px;
}

.login-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(37,99,235,.35);
}

.login-btn:disabled {
  opacity: .8;
  cursor: wait;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.form-links {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
}

.link {
  font-size: 13px;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
}

.link:hover { color: #1d4ed8; }

.link.primary {
  color: #2563eb;
}

.link.primary:hover { color: #1d4ed8; }

.agreement-text {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
}

.agreement-text a {
  color: #2563eb;
  text-decoration: none;
}

.agreement-text a:hover {
  text-decoration: underline;
}

/* 错误/成功提示 */
.error-msg {
  font-size: 13px;
  color: #ef4444;
  margin-bottom: 14px;
  margin-top: -6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.success-msg {
  font-size: 13px;
  color: #10b981;
  margin-bottom: 14px;
  margin-top: -6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 返回链接 */
.back-link {
  display: block;
  text-align: center;
  font-size: 13px;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  margin-top: 6px;
  transition: color .2s;
}

.back-link:hover { color: #2563eb; }

/* Toast */
.toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  z-index: 9999;
  animation: toastIn .3s ease;
  box-shadow: 0 8px 24px rgba(0,0,0,.12);
}

.toast.info    { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.toast.success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.toast.error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* 响应式 */
@media (max-width: 800px) {
  .login-container {
    flex-direction: column;
    max-width: 420px;
    width: 94%;
  }
  .login-brand {
    width: 100%;
    padding: 36px 32px;
  }
  .brand-title { font-size: 26px; }
  .brand-desc { margin-bottom: 24px; }
  .login-form-area {
    padding: 32px 32px 40px;
  }
}
</style>
