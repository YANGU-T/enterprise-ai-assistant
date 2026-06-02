<template>
  <div class="agent-config">
    <div class="config-header">
      <div class="header-info">
        <h2>Agent 配置中心</h2>
        <p>管理和配置平台AI Agent，设置Agent能力、触发条件和执行策略</p>
      </div>
      <button class="create-btn" @click="openCreate"><i class="fas fa-plus"></i> 新建 Agent</button>
    </div>

    <div class="agent-grid">
      <div v-for="agent in agents" :key="agent.id" class="agent-card">
        <div class="agent-card-header">
          <div class="agent-icon" :style="{ background: agent.color }"><i :class="agent.icon"></i></div>
          <div class="agent-status" :class="agent.status"><span class="status-dot"></span>{{ statusText(agent.status) }}</div>
        </div>
        <div class="agent-card-body">
          <h3>{{ agent.name }}</h3>
          <p>{{ agent.description }}</p>
          <div class="agent-tags"><span v-for="tag in agent.tags" :key="tag" class="tag">{{ tag }}</span></div>
          <div class="agent-stats">
            <div class="agent-stat"><span class="stat-val">{{ agent.executions }}</span><span class="stat-lbl">执行次数</span></div>
            <div class="agent-stat"><span class="stat-val">{{ agent.successRate }}%</span><span class="stat-lbl">成功率</span></div>
            <div class="agent-stat"><span class="stat-val">{{ agent.avgTime }}</span><span class="stat-lbl">平均耗时</span></div>
          </div>
        </div>
        <div class="agent-card-footer">
          <button class="footer-btn" @click="editAgent(agent)"><i class="fas fa-edit"></i> 编辑</button>
          <button class="footer-btn" @click="toggleAgent(agent)"><i :class="agent.status === 'active' ? 'fas fa-pause' : 'fas fa-play'"></i> {{ agent.status === 'active' ? '停用' : '启用' }}</button>
          <button class="footer-btn danger" @click="deleteAgent(agent.id)"><i class="fas fa-trash"></i> 删除</button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingId ? '编辑 Agent' : '新建 Agent' }}</h3>
          <button class="close-btn" @click="closeModal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Agent 名称</label>
            <input v-model="form.name" type="text" placeholder="输入Agent名称">
          </div>
          <div class="form-group">
            <label>路由路径</label>
            <input v-model="form.path" type="text" placeholder="/agent/your-agent-name" :disabled="!!editingId">
            <p class="form-hint" v-if="!editingId">路径需以 /agent/ 开头，用于侧边栏导航跳转</p>
            <p class="form-hint" v-else>已有Agent不可修改路由路径</p>
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="form.description" placeholder="输入Agent功能描述" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>图标</label>
            <div class="icon-picker">
              <button v-for="icon in icons" :key="icon" class="icon-btn" :class="{ active: form.icon === icon }" @click="form.icon = icon"><i :class="icon"></i></button>
            </div>
          </div>
          <div class="form-group">
            <label>颜色</label>
            <div class="color-picker">
              <button v-for="color in colors" :key="color" class="color-btn" :class="{ active: form.color === color }" :style="{ background: color }" @click="form.color = color"></button>
            </div>
          </div>
          <div class="form-group">
            <label>能力标签</label>
            <div class="tags-input">
              <span v-for="(tag, i) in form.tags" :key="i" class="tag">{{ tag }} <button @click="form.tags.splice(i, 1)"><i class="fas fa-times"></i></button></span>
              <input v-model="newTag" @keydown.enter.prevent="addTag" placeholder="输入标签回车添加">
            </div>
          </div>
          <div class="form-group">
            <label>触发方式</label>
            <select v-model="form.trigger">
              <option value="manual">手动触发</option>
              <option value="auto">自动触发</option>
              <option value="scheduled">定时触发</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeModal">取消</button>
          <button class="save-btn" @click="saveAgent">{{ editingId ? '保存' : '创建' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAppStore } from '@/stores'

const appStore = useAppStore()
const showModal = ref(false)
const editingId = ref(null)
const newTag = ref('')

const icons = ['fas fa-file-alt','fas fa-chart-bar','fas fa-code','fas fa-envelope','fas fa-robot','fas fa-search','fas fa-database','fas fa-calendar','fas fa-comments','fas fa-tasks','fas fa-cogs','fas fa-shield-alt']
const colors = ['#6366f1','#8b5cf6','#06b6d4','#059669','#d97706','#dc2626','#ec4899','#3b82f6']

const form = reactive({ name: '', description: '', path: '', icon: 'fas fa-robot', color: '#6366f1', tags: [], trigger: 'manual' })

// 从store获取动态Agent列表
const agents = computed(() => appStore.dynamicAgents)

function statusText(s) { return { active: '运行中', inactive: '已停用' }[s] || s }
function toggleAgent(agent) {
  appStore.toggleDynamicAgentStatus(agent.id)
  appStore.showModal('状态更新', `Agent "${agent.name}" 已${agent.status === 'active' ? '启用' : '停用'}`, 'success')
}
function deleteAgent(id) {
  const a = agents.value.find(x => x.id === id)
  if (!a) return
  if (confirm(`确定删除 "${a.name}"？删除后侧边栏AI助手菜单将同步移除。`)) {
    appStore.deleteDynamicAgent(id)
    appStore.showModal('已删除', `Agent "${a.name}" 已删除，侧边栏菜单已同步更新`, 'success')
  }
}
function editAgent(agent) {
  editingId.value = agent.id
  Object.assign(form, { name: agent.name, description: agent.description, path: agent.path, icon: agent.icon, color: agent.color, tags: [...agent.tags], trigger: 'manual' })
  showModal.value = true
}
function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', description: '', path: '', icon: 'fas fa-robot', color: '#6366f1', tags: [], trigger: 'manual' })
  showModal.value = true
}
function addTag() { if (newTag.value.trim() && !form.tags.includes(newTag.value.trim())) { form.tags.push(newTag.value.trim()) } newTag.value = '' }
function saveAgent() {
  if (!form.name.trim()) { appStore.showModal('错误', '请输入Agent名称', 'error'); return }
  if (!form.path.trim()) { appStore.showModal('错误', '请输入路由路径', 'error'); return }
  // 检查路径格式
  if (!form.path.startsWith('/agent/')) { appStore.showModal('错误', '路由路径必须以 /agent/ 开头', 'error'); return }
  if (editingId.value) {
    appStore.updateDynamicAgent(editingId.value, {
      name: form.name,
      description: form.description,
      path: form.path,
      icon: form.icon,
      color: form.color,
      tags: [...form.tags]
    })
    appStore.showModal('更新成功', `Agent "${form.name}" 已更新，侧边栏菜单已同步`, 'success')
  } else {
    appStore.addDynamicAgent({
      name: form.name,
      description: form.description,
      path: form.path,
      icon: form.icon,
      color: form.color,
      tags: [...form.tags]
    })
    appStore.showModal('创建成功', `Agent "${form.name}" 已创建，侧边栏AI助手菜单已同步添加`, 'success')
  }
  closeModal()
}
function closeModal() { showModal.value = false; editingId.value = null }
</script>

<style scoped>
.agent-config { padding: 24px; height: 100vh; overflow-y: auto; }
.config-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.config-header h2 { font-size: 20px; font-weight: 800; color: var(--text-primary); }
.config-header p { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
.create-btn { padding: 10px 20px; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; font-family: inherit; }
.create-btn:hover { background: var(--primary-dark); }
.agent-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
.agent-card { background: var(--bg-white); border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; transition: all var(--tr); }
.agent-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.agent-card-header { padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); }
.agent-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; }
.agent-status { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; }
.agent-status .status-dot { width: 8px; height: 8px; border-radius: 50%; }
.agent-status.active { color: #059669; } .agent-status.active .status-dot { background: #059669; }
.agent-status.inactive { color: var(--text-muted); } .agent-status.inactive .status-dot { background: var(--text-muted); }
.agent-card-body { padding: 20px; }
.agent-card-body h3 { font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
.agent-card-body p { font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px; }
.agent-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.agent-tags .tag { font-size: 11px; padding: 3px 8px; background: var(--bg-surface); border-radius: 4px; color: var(--text-muted); }
.agent-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
.agent-stat { text-align: center; }
.stat-val { display: block; font-size: 16px; font-weight: 800; color: var(--text-primary); }
.stat-lbl { font-size: 11px; color: var(--text-muted); }
.agent-card-footer { display: flex; border-top: 1px solid var(--border); }
.footer-btn { flex: 1; padding: 12px; background: none; border: none; border-right: 1px solid var(--border); cursor: pointer; font-size: 13px; font-weight: 500; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; gap: 6px; font-family: inherit; transition: all var(--tr); }
.footer-btn:last-child { border-right: none; }
.footer-btn:hover { background: #eef2ff; color: var(--primary); }
.footer-btn.danger:hover { background: #fee2e2; color: #dc2626; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-content { background: var(--bg-white); border-radius: var(--radius-lg); width: 520px; max-height: 80vh; overflow-y: auto; }
.modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { font-size: 16px; font-weight: 700; }
.close-btn { background: none; border: none; font-size: 16px; color: var(--text-muted); cursor: pointer; padding: 4px; }
.modal-body { padding: 24px; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; font-family: inherit; color: var(--text-primary); }
.form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.icon-picker, .color-picker { display: flex; flex-wrap: wrap; gap: 8px; }
.icon-btn { width: 36px; height: 36px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-white); cursor: pointer; font-size: 14px; color: var(--text-muted); display: flex; align-items: center; justify-content: center; transition: all var(--tr); }
.icon-btn.active { border-color: var(--primary); color: var(--primary); background: #eef2ff; }
.color-btn { width: 32px; height: 32px; border: 2px solid transparent; border-radius: 50%; cursor: pointer; transition: all var(--tr); }
.color-btn.active { border-color: var(--text-primary); transform: scale(1.1); }
.tags-input { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); min-height: 38px; align-items: center; }
.tags-input .tag { font-size: 11px; padding: 2px 8px; background: #eef2ff; border-radius: 4px; color: var(--primary); display: flex; align-items: center; gap: 4px; }
.tags-input .tag button { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 10px; padding: 0; }
.tags-input input { border: none; outline: none; flex: 1; min-width: 100px; font-size: 13px; font-family: inherit; }
.modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }
.cancel-btn { padding: 8px 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-secondary); font-family: inherit; }
.save-btn { padding: 8px 20px; background: var(--primary); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-weight: 600; color: #fff; font-family: inherit; }
.save-btn:hover { background: var(--primary-dark); }
.form-hint { font-size: 11px; color: var(--text-muted); margin: 4px 0 0; opacity: 0.8; }
.form-group input:disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; }
</style>