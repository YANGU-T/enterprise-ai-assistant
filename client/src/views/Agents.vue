<template>
  <div class="agents-page">
    <div class="page-header">
      <div class="page-title-area">
        <h2>Agent管理</h2>
        <p>管理AI代理，配置自动化工作流程</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline">
          <i class="fas fa-cog"></i> 配置
        </button>
        <button class="btn btn-primary">
          <i class="fas fa-plus"></i> 新建Agent
        </button>
      </div>
    </div>
    
    <div class="scroll-area">
      <!-- Agent统计 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #e0f2fe; color: #0284c7;">
            <i class="fas fa-robot"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">6</div>
            <div class="stat-label">活跃Agent</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #dcfce7; color: #16a34a;">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">12</div>
            <div class="stat-label">已完成任务</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #fef3c7; color: #d97706;">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">3</div>
            <div class="stat-label">等待执行</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #fee2e2; color: #dc2626;">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">1</div>
            <div class="stat-label">错误</div>
          </div>
        </div>
      </div>
      
      <!-- Agent列表 -->
      <div class="card">
        <div class="card-header">
          <h3>Agent列表</h3>
          <div class="card-actions">
            <button class="btn btn-sm btn-outline">
              <i class="fas fa-filter"></i> 筛选
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="agent-list">
            <div class="agent-item" v-for="agent in agents" :key="agent.id">
              <div class="agent-icon" :style="{ background: agent.iconBg, color: agent.iconColor }">
                <i :class="agent.icon"></i>
              </div>
              <div class="agent-info">
                <div class="agent-name">{{ agent.name }}</div>
                <div class="agent-description">{{ agent.description }}</div>
                <div class="agent-meta">
                  <span class="agent-status" :class="agent.statusClass">{{ agent.status }}</span>
                  <span class="agent-tasks">任务: {{ agent.tasks }}</span>
                  <span class="agent-success">成功率: {{ agent.successRate }}%</span>
                </div>
              </div>
              <div class="agent-actions">
                <button class="btn btn-sm btn-outline">
                  <i class="fas fa-play"></i> 运行
                </button>
                <button class="btn btn-sm btn-outline">
                  <i class="fas fa-cog"></i> 配置
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 最近执行 -->
      <div class="card">
        <div class="card-header">
          <h3>最近执行记录</h3>
        </div>
        <div class="card-body">
          <div class="execution-list">
            <div class="execution-item" v-for="execution in recentExecutions" :key="execution.id">
              <div class="execution-icon" :style="{ background: execution.iconBg, color: execution.iconColor }">
                <i :class="execution.icon"></i>
              </div>
              <div class="execution-info">
                <div class="execution-name">{{ execution.name }}</div>
                <div class="execution-meta">
                  <span class="execution-status" :class="execution.statusClass">{{ execution.status }}</span>
                  <span class="execution-time">{{ execution.time }}</span>
                </div>
              </div>
              <div class="execution-result">
                {{ execution.result }}
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

const agents = ref([
  { id: 1, name: '文档处理Agent', description: '自动处理文档转换、格式化和摘要生成', icon: 'fas fa-file-alt', iconBg: '#e0f2fe', iconColor: '#0284c7', status: '运行中', statusClass: 'status-active', tasks: 24, successRate: 95 },
  { id: 2, name: '数据分析Agent', description: '自动收集、清洗和分析业务数据', icon: 'fas fa-chart-line', iconBg: '#dcfce7', iconColor: '#16a34a', status: '运行中', statusClass: 'status-active', tasks: 18, successRate: 88 },
  { id: 3, name: '客户服务Agent', description: '自动回复客户咨询和处理常见问题', icon: 'fas fa-headset', iconBg: '#fef3c7', iconColor: '#d97706', status: '暂停', statusClass: 'status-warning', tasks: 42, successRate: 92 },
  { id: 4, name: '代码审查Agent', description: '自动审查代码质量并提供改进建议', icon: 'fas fa-code', iconBg: '#fee2e2', iconColor: '#dc2626', status: '错误', statusClass: 'status-danger', tasks: 8, successRate: 75 },
  { id: 5, name: '会议安排Agent', description: '自动安排会议、发送提醒和整理纪要', icon: 'fas fa-calendar', iconBg: '#f3e8ff', iconColor: '#9333ea', status: '运行中', statusClass: 'status-active', tasks: 15, successRate: 97 },
  { id: 6, name: '邮件管理Agent', description: '自动分类、回复和归档邮件', icon: 'fas fa-envelope', iconBg: '#fce7f3', iconColor: '#ec4899', status: '运行中', statusClass: 'status-active', tasks: 56, successRate: 90 }
])

const recentExecutions = ref([
  { id: 1, name: '文档处理Agent - 生成月度报告', status: '成功', statusClass: 'status-completed', time: '10分钟前', result: '生成报告完成，共15页', icon: 'fas fa-file-alt', iconBg: '#dcfce7', iconColor: '#16a34a' },
  { id: 2, name: '数据分析Agent - 销售数据清洗', status: '进行中', statusClass: 'status-active', time: '25分钟前', result: '处理进度: 65%', icon: 'fas fa-chart-line', iconBg: '#e0f2fe', iconColor: '#0284c7' },
  { id: 3, name: '客户服务Agent - 回复客户咨询', status: '成功', statusClass: 'status-completed', time: '1小时前', result: '已回复3位客户', icon: 'fas fa-headset', iconBg: '#dcfce7', iconColor: '#16a34a' },
  { id: 4, name: '代码审查Agent - 审查前端代码', status: '失败', statusClass: 'status-danger', time: '2小时前', result: '发现5个严重问题', icon: 'fas fa-code', iconBg: '#fee2e2', iconColor: '#dc2626' }
])
</script>

<style scoped>
.agents-page {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
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

.agent-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.agent-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.agent-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.agent-info {
  flex: 1;
}

.agent-name {
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.agent-description {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
}

.agent-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #64748b;
}

.agent-status {
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

.agent-actions {
  display: flex;
  gap: 8px;
}

.execution-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.execution-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.execution-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.execution-info {
  flex: 1;
}

.execution-name {
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 4px;
}

.execution-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
}

.execution-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.execution-result {
  font-size: 14px;
  color: #374151;
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