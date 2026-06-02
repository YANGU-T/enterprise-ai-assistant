<template>
  <div class="ai-workbench-page">
    <div class="page-header">
      <div class="page-title-area">
        <h2>AI工作台</h2>
        <p>使用AI工具提升工作效率，自动化处理任务</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline">
          <i class="fas fa-history"></i> 历史记录
        </button>
        <button class="btn btn-primary">
          <i class="fas fa-robot"></i> 新建AI任务
        </button>
      </div>
    </div>
    
    <div class="scroll-area">
      <!-- AI工具网格 -->
      <div class="ai-tools-grid">
        <div class="ai-tool-card" v-for="tool in aiTools" :key="tool.id">
          <div class="tool-icon" :style="{ background: tool.iconBg, color: tool.iconColor }">
            <i :class="tool.icon"></i>
          </div>
          <div class="tool-info">
            <h3>{{ tool.name }}</h3>
            <p>{{ tool.description }}</p>
          </div>
          <button class="btn btn-sm btn-outline">使用</button>
        </div>
      </div>
      
      <!-- 最近任务 -->
      <div class="card">
        <div class="card-header">
          <h3>最近AI任务</h3>
          <div class="card-actions">
            <button class="btn btn-sm btn-outline">
              <i class="fas fa-filter"></i> 筛选
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="task-list">
            <div class="task-item" v-for="task in recentTasks" :key="task.id">
              <div class="task-icon" :style="{ background: task.iconBg, color: task.iconColor }">
                <i :class="task.icon"></i>
              </div>
              <div class="task-info">
                <div class="task-name">{{ task.name }}</div>
                <div class="task-meta">
                  <span class="task-status" :class="task.statusClass">{{ task.status }}</span>
                  <span class="task-time">{{ task.time }}</span>
                </div>
              </div>
              <div class="task-actions">
                <button class="btn btn-sm btn-outline">
                  <i class="fas fa-eye"></i> 查看
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- AI助手 -->
      <div class="card">
        <div class="card-header">
          <h3>AI助手</h3>
        </div>
        <div class="card-body">
          <div class="ai-assistant">
            <div class="assistant-header">
              <div class="assistant-avatar">
                <i class="fas fa-robot"></i>
              </div>
              <div class="assistant-info">
                <h4>企业AI助手</h4>
                <p>随时为您提供智能支持</p>
              </div>
            </div>
            <div class="assistant-chat">
              <div class="chat-messages">
                <div class="message ai-message">
                  <div class="message-content">
                    <p>您好！我是企业AI助手，可以帮您处理文档、分析数据、生成报告等任务。有什么可以帮您的吗？</p>
                  </div>
                </div>
              </div>
              <div class="chat-input">
                <input type="text" placeholder="输入您的问题或需求..." class="input-field">
                <button class="btn btn-primary">
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const aiTools = ref([
  { id: 1, name: '文档生成', description: '自动生成各类文档和报告', icon: 'fas fa-file-alt', iconBg: '#e0f2fe', iconColor: '#0284c7' },
  { id: 2, name: '数据分析', description: '智能分析数据并生成可视化图表', icon: 'fas fa-chart-bar', iconBg: '#dcfce7', iconColor: '#16a34a' },
  { id: 3, name: '代码助手', description: '辅助编写和审查代码', icon: 'fas fa-code', iconBg: '#fef3c7', iconColor: '#d97706' },
  { id: 4, name: '会议纪要', description: '自动整理会议内容和要点', icon: 'fas fa-users', iconBg: '#fee2e2', iconColor: '#dc2626' },
  { id: 5, name: '邮件撰写', description: '智能撰写和回复邮件', icon: 'fas fa-envelope', iconBg: '#f3e8ff', iconColor: '#9333ea' },
  { id: 6, name: '翻译服务', description: '多语言文档翻译', icon: 'fas fa-language', iconBg: '#fce7f3', iconColor: '#ec4899' }
])

const recentTasks = ref([
  { id: 1, name: '月度销售报告生成', status: '已完成', statusClass: 'status-completed', time: '2小时前', icon: 'fas fa-file-alt', iconBg: '#dcfce7', iconColor: '#16a34a' },
  { id: 2, name: '客户数据分析', status: '进行中', statusClass: 'status-active', time: '1小时前', icon: 'fas fa-chart-bar', iconBg: '#e0f2fe', iconColor: '#0284c7' },
  { id: 3, name: '项目文档翻译', status: '等待中', statusClass: 'status-warning', time: '30分钟前', icon: 'fas fa-language', iconBg: '#fef3c7', iconColor: '#d97706' },
  { id: 4, name: '代码审查报告', status: '失败', statusClass: 'status-danger', time: '15分钟前', icon: 'fas fa-code', iconBg: '#fee2e2', iconColor: '#dc2626' }
])
</script>

<style scoped>
.ai-workbench-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title-area h2 {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.page-title-area p {
  color: #64748b;
  font-size: 14px;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.ai-tools-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.ai-tool-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.ai-tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tool-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.tool-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.tool-info p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.card-body {
  padding: 20px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.task-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.task-info {
  flex: 1;
}

.task-name {
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 4px;
}

.task-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
}

.task-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-active {
  background: #dcfce7;
  color: #16a34a;
}

.status-completed {
  background: #e0f2fe;
  color: #0284c7;
}

.status-warning {
  background: #fef3c7;
  color: #d97706;
}

.status-danger {
  background: #fee2e2;
  color: #dc2626;
}

.ai-assistant {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.assistant-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.assistant-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.assistant-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 2px;
}

.assistant-info p {
  font-size: 14px;
  color: #64748b;
}

.assistant-chat {
  padding: 16px;
}

.chat-messages {
  margin-bottom: 16px;
}

.message {
  margin-bottom: 12px;
}

.message-content {
  background: #f1f5f9;
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 80%;
}

.ai-message .message-content {
  background: #e0f2fe;
  color: #0c4a6e;
}

.chat-input {
  display: flex;
  gap: 12px;
}

.input-field {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #3b82f6;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-outline {
  background: white;
  border: 1px solid #e2e8f0;
  color: #374151;
}

.btn-outline:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-primary {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}
</style>