<template>
  <div class="user-management">
    <div class="page-header">
      <div class="header-info">
        <h2><i class="fas fa-users-cog"></i> 用户管理</h2>
        <p>管理平台账号、角色权限和菜单配置</p>
      </div>
      <button class="btn-primary" @click="openAddUser">
        <i class="fas fa-plus"></i> 添加用户
      </button>
    </div>

    <div class="tabs">
      <button :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">
        <i class="fas fa-users"></i> 用户列表
      </button>
      <button :class="{ active: activeTab === 'roles' }" @click="activeTab = 'roles'">
        <i class="fas fa-user-shield"></i> 角色权限
      </button>
      <button :class="{ active: activeTab === 'menus' }" @click="activeTab = 'menus'">
        <i class="fas fa-sitemap"></i> 菜单权限
      </button>
    </div>

    <!-- 用户列表 Tab -->
    <div v-if="activeTab === 'users'" class="tab-content">
      <div class="search-bar">
        <div class="search-input">
          <i class="fas fa-search"></i>
          <input v-model="searchQuery" placeholder="搜索用户名、姓名、部门..." type="text">
        </div>
        <select v-model="filterRole" class="filter-select">
          <option value="">全部角色</option>
          <option v-for="r in appStore.roles" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>
        <select v-model="filterStatus" class="filter-select">
          <option value="">全部状态</option>
          <option value="active">正常</option>
          <option value="disabled">已禁用</option>
        </select>
      </div>

      <div class="user-table">
        <div class="table-header">
          <span class="col-avatar">头像</span>
          <span class="col-name">用户名</span>
          <span class="col-real">姓名</span>
          <span class="col-role">角色</span>
          <span class="col-dept">部门</span>
          <span class="col-email">邮箱</span>
          <span class="col-phone">手机</span>
          <span class="col-status">状态</span>
          <span class="col-time">创建时间</span>
          <span class="col-actions">操作</span>
        </div>
        <div v-if="filteredUsers.length === 0" class="empty-state">
          <i class="fas fa-user-slash"></i>
          <p>暂无匹配用户</p>
        </div>
        <div
          v-for="u in filteredUsers"
          :key="u.id"
          class="table-row"
          :class="{ disabled: u.status === 'disabled' }"
        >
          <span class="col-avatar">
            <div class="user-avatar-sm">{{ u.name.slice(0, 2) }}</div>
          </span>
          <span class="col-name">{{ u.username }}</span>
          <span class="col-real">{{ u.name }}</span>
          <span class="col-role">
            <span class="role-badge" :class="u.role">{{ u.roleName }}</span>
          </span>
          <span class="col-dept">{{ u.department || '-' }}</span>
          <span class="col-email">{{ u.email || '-' }}</span>
          <span class="col-phone">{{ u.phone || '-' }}</span>
          <span class="col-status">
            <span class="status-dot" :class="u.status"></span>
            {{ u.status === 'active' ? '正常' : '已禁用' }}
          </span>
          <span class="col-time">{{ u.createdAt }}</span>
          <span class="col-actions">
            <button class="action-btn" @click="editUser(u)" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn" @click="toggleStatus(u)" :title="u.status === 'active' ? '禁用' : '启用'">
              <i :class="u.status === 'active' ? 'fas fa-ban' : 'fas fa-check-circle'"></i>
            </button>
            <button
              v-if="u.username !== currentUsername"
              class="action-btn danger"
              @click="removeUser(u)"
              title="删除"
            >
              <i class="fas fa-trash-alt"></i>
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- 角色权限 Tab -->
    <div v-if="activeTab === 'roles'" class="tab-content">
      <div class="roles-grid">
        <div v-for="role in appStore.roles" :key="role.id" class="role-card">
          <div class="role-card-header">
            <div class="role-icon" :class="role.id">
              <i :class="getRoleIcon(role.id)"></i>
            </div>
            <div>
              <h4>{{ role.name }}</h4>
              <p>{{ role.description }}</p>
            </div>
          </div>
          <div class="role-stats">
            <span>用户数：{{ getUserCountByRole(role.id) }}</span>
          </div>
          <div class="role-permissions">
            <h5>可访问菜单：</h5>
            <div class="perm-tags">
              <span v-for="path in (appStore.menuPermissions[role.id] || [])" :key="path" class="perm-tag">
                {{ getMenuName(path) }}
              </span>
              <span v-if="!(appStore.menuPermissions[role.id] || []).length" class="no-perm">暂无权限</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 菜单权限配置 Tab -->
    <div v-if="activeTab === 'menus'" class="tab-content">
      <div class="menu-perm-config">
        <p class="config-tip">
          <i class="fas fa-info-circle"></i>
          为不同角色勾选可访问的菜单项，保存后立即生效。
        </p>
        <div class="perm-table">
          <div class="perm-table-header">
            <span class="col-menu">菜单项</span>
            <span v-for="role in appStore.roles" :key="role.id" class="col-role-check">{{ role.name }}</span>
          </div>
          <div v-for="menu in allMenus" :key="menu.path" class="perm-table-row">
            <span class="col-menu">
              <i :class="menu.icon"></i> {{ menu.label }}
            </span>
            <span v-for="role in appStore.roles" :key="role.id" class="col-role-check">
              <label class="check-wrap">
                <input
                  type="checkbox"
                  :checked="(tempPerms[role.id] || []).includes(menu.path)"
                  @change="togglePerm(role.id, menu.path)"
                >
                <span class="check-mark"></span>
              </label>
            </span>
          </div>
        </div>
        <div class="perm-actions">
          <button class="btn-secondary" @click="resetPerms">恢复默认</button>
          <button class="btn-primary" @click="savePerms">保存配置</button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑用户弹窗 -->
    <div v-if="showUserModal" class="modal-overlay" @click.self="showUserModal = false">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>{{ editingUser ? '编辑用户' : '添加用户' }}</h3>
          <button class="modal-close" @click="showUserModal = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>用户名 <span class="required">*</span></label>
              <input v-model="userForm.username" placeholder="请输入用户名" :disabled="!!editingUser" />
            </div>
            <div class="form-group">
              <label>姓名 <span class="required">*</span></label>
              <input v-model="userForm.name" placeholder="请输入姓名" />
            </div>
            <div class="form-group">
              <label>密码</label>
              <input v-model="userForm.password" type="password" :placeholder="editingUser ? '留空则不修改' : '请输入密码'" />
            </div>
            <div class="form-group">
              <label>角色 <span class="required">*</span></label>
              <select v-model="userForm.role">
                <option v-for="r in appStore.roles" :key="r.id" :value="r.id">{{ r.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>部门</label>
              <input v-model="userForm.department" placeholder="请输入部门" />
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input v-model="userForm.email" type="email" placeholder="请输入邮箱" />
            </div>
            <div class="form-group">
              <label>手机号</label>
              <input v-model="userForm.phone" placeholder="请输入手机号" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showUserModal = false">取消</button>
          <button class="btn-primary" @click="saveUser">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useAppStore } from '@/stores'

const appStore = useAppStore()

const activeTab = ref('users')
const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const showUserModal = ref(false)
const editingUser = ref(null)
const userForm = reactive({
  username: '',
  name: '',
  password: '',
  role: 'user',
  department: '',
  email: '',
  phone: ''
})

// 临时菜单权限编辑状态
const tempPerms = ref({})

// 当前登录用户名
const currentUsername = computed(() => appStore.user.username)

// 所有菜单项定义
const allMenus = [
  { path: '/chat', label: 'AI 对话', icon: 'fas fa-comments' },
  { path: '/workbench', label: '个人工作台', icon: 'fas fa-briefcase' },
  { path: '/agents', label: 'Agent 配置', icon: 'fas fa-robot' },
  { path: '/agent/bid-workbench', label: '招投标工作台', icon: 'fas fa-briefcase' },
  { path: '/agent/solution-gen', label: '解决方案生成', icon: 'fas fa-file-invoice' },
  { path: '/agent/resume-filter', label: '简历筛选', icon: 'fas fa-user-check' },
  { path: '/agent/solution-editor', label: '方案编辑', icon: 'fas fa-pen-fancy' },
  { path: '/agent/bid-doc-editor', label: '标书编辑', icon: 'fas fa-file-alt' },
  { path: '/admin/users', label: '用户管理', icon: 'fas fa-users-cog' }
]

const filteredUsers = computed(() => {
  return appStore.userList.filter(u => {
    if (filterRole.value && u.role !== filterRole.value) return false
    if (filterStatus.value && u.status !== filterStatus.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return u.username.toLowerCase().includes(q) ||
             u.name.toLowerCase().includes(q) ||
             (u.department || '').toLowerCase().includes(q)
    }
    return true
  })
})

function getRoleIcon(roleId) {
  const icons = { admin: 'fas fa-crown', editor: 'fas fa-pen', user: 'fas fa-user' }
  return icons[roleId] || 'fas fa-user'
}

function getUserCountByRole(roleId) {
  return appStore.userList.filter(u => u.role === roleId).length
}

function getMenuName(path) {
  const m = allMenus.find(m => m.path === path)
  return m ? m.label : path
}

function openAddUser() {
  editingUser.value = null
  Object.assign(userForm, { username: '', name: '', password: '', role: 'user', department: '', email: '', phone: '' })
  showUserModal.value = true
}

function editUser(u) {
  editingUser.value = u
  Object.assign(userForm, {
    username: u.username,
    name: u.name,
    password: '',
    role: u.role,
    department: u.department || '',
    email: u.email || '',
    phone: u.phone || ''
  })
  showUserModal.value = true
}

function saveUser() {
  if (!userForm.username.trim() || !userForm.name.trim()) {
    appStore.showModal('提示', '用户名和姓名不能为空', 'warning')
    return
  }

  if (editingUser.value) {
    // 编辑
    const updates = {
      name: userForm.name,
      role: userForm.role,
      department: userForm.department,
      email: userForm.email,
      phone: userForm.phone
    }
    if (userForm.password.trim()) {
      updates.password = userForm.password
    }
    appStore.updateUser(editingUser.value.id, updates)
    appStore.addNotification({ title: '用户已更新', message: `用户 ${userForm.name} 信息已更新`, type: 'system' })
  } else {
    // 新增
    const exists = appStore.userList.find(u => u.username === userForm.username)
    if (exists) {
      appStore.showModal('提示', '用户名已存在', 'warning')
      return
    }
    appStore.addUser({
      ...userForm,
      password: userForm.password || '123456'
    })
    appStore.addNotification({ title: '用户已添加', message: `新用户 ${userForm.name} 已创建`, type: 'system' })
  }
  showUserModal.value = false
}

function removeUser(u) {
  if (confirm(`确定要删除用户 "${u.name}" 吗？`)) {
    appStore.deleteUser(u.id)
    appStore.addNotification({ title: '用户已删除', message: `用户 ${u.name} 已被删除`, type: 'system' })
  }
}

function toggleStatus(u) {
  appStore.toggleUserStatus(u.id)
  const newStatus = u.status === 'active' ? '正常' : '已禁用'
  appStore.addNotification({ title: '用户状态变更', message: `用户 ${u.name} 状态已改为${newStatus}`, type: 'system' })
}

// 菜单权限临时编辑
function togglePerm(roleId, path) {
  if (!tempPerms.value[roleId]) tempPerms.value[roleId] = []
  const idx = tempPerms.value[roleId].indexOf(path)
  if (idx === -1) {
    tempPerms.value[roleId].push(path)
  } else {
    tempPerms.value[roleId].splice(idx, 1)
  }
}

function savePerms() {
  Object.entries(tempPerms.value).forEach(([roleId, paths]) => {
    appStore.updateMenuPermissions(roleId, paths)
  })
  appStore.addNotification({ title: '菜单权限已更新', message: '菜单权限配置已保存', type: 'system' })
}

function resetPerms() {
  if (confirm('确定恢复默认菜单权限配置吗？')) {
    tempPerms.value = JSON.parse(JSON.stringify({
      admin: allMenus.map(m => m.path),
      editor: allMenus.filter(m => m.path !== '/admin/users').map(m => m.path),
      user: allMenus.filter(m => !['/agents', '/admin/users'].includes(m.path)).map(m => m.path)
    }))
    savePerms()
  }
}

// 初始化临时权限
onMounted(() => {
  tempPerms.value = JSON.parse(JSON.stringify(appStore.menuPermissions))
})
</script>

<style scoped>
.user-management {
  height: 100vh;
  padding: 28px 32px;
  overflow-y: auto;
  background: #f8fafc;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.page-header h2 i {
  color: #6366f1;
}

.page-header p {
  font-size: 13px;
  color: #64748b;
}

.btn-primary {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border: none;
  color: #fff;
  box-shadow: 0 4px 12px rgba(99,102,241,.3);
  transition: all .2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99,102,241,.4);
}

.btn-secondary {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  transition: all .2s;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 12px;
  padding: 4px;
  border: 1px solid #e2e8f0;
  width: fit-content;
}

.tabs button {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  transition: all .2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tabs button.active {
  background: #6366f1;
  color: #fff;
  box-shadow: 0 2px 8px rgba(99,102,241,.3);
}

.tabs button:hover:not(.active) {
  background: #f1f5f9;
  color: #1e293b;
}

.tab-content {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 24px;
}

/* Search bar */
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  transition: all .2s;
}

.search-input:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
  background: #fff;
}

.search-input i {
  color: #94a3b8;
  font-size: 13px;
}

.search-input input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 0;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  color: #1e293b;
}

.filter-select {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  font-family: inherit;
  background: #f8fafc;
  color: #475569;
  cursor: pointer;
  outline: none;
}

.filter-select:focus {
  border-color: #6366f1;
}

/* User table */
.user-table {
  overflow-x: auto;
}

.table-header, .table-row {
  display: grid;
  grid-template-columns: 50px 90px 80px 80px 90px 150px 120px 80px 100px 100px;
  align-items: center;
  padding: 10px 8px;
  gap: 8px;
}

.table-header {
  background: #f8fafc;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: .5px;
  margin-bottom: 4px;
}

.table-row {
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  color: #1e293b;
  transition: background .15s;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row.disabled {
  opacity: .5;
}

.user-avatar-sm {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.role-badge {
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.role-badge.admin {
  background: #fef3c7;
  color: #d97706;
}

.role-badge.editor {
  background: #dbeafe;
  color: #2563eb;
}

.role-badge.user {
  background: #d1fae5;
  color: #059669;
}

.status-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 6px;
}

.status-dot.active {
  background: #10b981;
}

.status-dot.disabled {
  background: #94a3b8;
}

.col-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 12px;
  transition: all .2s;
}

.action-btn:hover {
  background: #eef2ff;
  border-color: #6366f1;
  color: #6366f1;
}

.action-btn.danger:hover {
  background: #fef2f2;
  border-color: #ef4444;
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 48px;
  color: #94a3b8;
}

.empty-state i {
  font-size: 40px;
  margin-bottom: 12px;
  opacity: .3;
}

/* Roles grid */
.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.role-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  transition: all .2s;
}

.role-card:hover {
  border-color: #c7d2fe;
  box-shadow: 0 4px 16px rgba(99,102,241,.08);
}

.role-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.role-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.role-icon.admin {
  background: #fef3c7;
  color: #d97706;
}

.role-icon.editor {
  background: #dbeafe;
  color: #2563eb;
}

.role-icon.user {
  background: #d1fae5;
  color: #059669;
}

.role-card-header h4 {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2px;
}

.role-card-header p {
  font-size: 12px;
  color: #64748b;
}

.role-stats {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
}

.role-permissions h5 {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.perm-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.perm-tag {
  padding: 3px 10px;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 11px;
  color: #475569;
  font-weight: 500;
}

.no-perm {
  font-size: 12px;
  color: #94a3b8;
  font-style: italic;
}

/* Menu permissions config */
.config-tip {
  padding: 12px 16px;
  background: #eff6ff;
  border-radius: 10px;
  font-size: 13px;
  color: #2563eb;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.perm-table {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.perm-table-header, .perm-table-row {
  display: grid;
  grid-template-columns: 1fr repeat(3, 80px);
  align-items: center;
  padding: 12px 16px;
}

.perm-table-header {
  background: #f8fafc;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.perm-table-row {
  border-top: 1px solid #f1f5f9;
  font-size: 13px;
  color: #1e293b;
}

.perm-table-row:hover {
  background: #f8fafc;
}

.col-menu i {
  width: 18px;
  color: #6366f1;
  margin-right: 8px;
}

.col-role-check {
  text-align: center;
}

.check-wrap {
  display: inline-flex;
  cursor: pointer;
}

.check-wrap input {
  display: none;
}

.check-mark {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 5px;
  transition: all .2s;
  position: relative;
}

.check-wrap input:checked + .check-mark {
  background: #6366f1;
  border-color: #6366f1;
}

.check-wrap input:checked + .check-mark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.perm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Modal */
.modal-overlay {
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-dialog {
  background: #fff;
  border-radius: 20px;
  width: 560px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(0,0,0,.15);
  animation: slideUp .25s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  font-size: 17px;
  font-weight: 800;
  color: #1e293b;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all .2s;
}

.modal-close:hover {
  background: #fee2e2;
  color: #dc2626;
}

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: all .2s;
  background: #f8fafc;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
  background: #fff;
}

.form-group input:disabled {
  background: #f1f5f9;
  color: #94a3b8;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
}

/* Responsive */
@media (max-width: 1200px) {
  .table-header, .table-row {
    grid-template-columns: 40px 80px 70px 70px 80px 120px 100px 70px 90px 90px;
  }
}
</style>
