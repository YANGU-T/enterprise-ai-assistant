<template>
  <div class="projects-page">
    <div class="page-header">
      <div class="page-title-area">
        <h2>项目管理</h2>
        <p>管理和跟踪企业项目的进度、资源和风险</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline">
          <i class="fas fa-filter"></i> 筛选
        </button>
        <button class="btn btn-primary">
          <i class="fas fa-plus"></i> 新建项目
        </button>
      </div>
    </div>
    
    <div class="scroll-area">
      <!-- 项目统计 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #e0f2fe; color: #0284c7;">
            <i class="fas fa-project-diagram"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">12</div>
            <div class="stat-label">进行中项目</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #dcfce7; color: #16a34a;">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">8</div>
            <div class="stat-label">已完成项目</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #fef3c7; color: #d97706;">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">3</div>
            <div class="stat-label">即将到期</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #fee2e2; color: #dc2626;">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">2</div>
            <div class="stat-label">风险项目</div>
          </div>
        </div>
      </div>
      
      <!-- 项目列表 -->
      <div class="card">
        <div class="card-header">
          <h3>项目列表</h3>
          <div class="card-actions">
            <button class="btn btn-sm btn-outline">
              <i class="fas fa-sort"></i> 排序
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="project-list">
            <div class="project-item" v-for="project in projects" :key="project.id">
              <div class="project-info">
                <div class="project-name">{{ project.name }}</div>
                <div class="project-meta">
                  <span class="project-status" :class="project.statusClass">{{ project.status }}</span>
                  <span class="project-date">截止: {{ project.deadline }}</span>
                </div>
              </div>
              <div class="project-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: project.progress + '%' }"></div>
                </div>
                <span class="progress-text">{{ project.progress }}%</span>
              </div>
              <div class="project-actions">
                <button class="btn btn-sm btn-outline">
                  <i class="fas fa-eye"></i> 查看
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

const projects = ref([
  { id: 1, name: '企业AI助手开发', status: '进行中', statusClass: 'status-active', deadline: '2026-06-30', progress: 65 },
  { id: 2, name: '客户管理系统升级', status: '进行中', statusClass: 'status-active', deadline: '2026-07-15', progress: 40 },
  { id: 3, name: '数据分析平台建设', status: '已完成', statusClass: 'status-completed', deadline: '2026-05-20', progress: 100 },
  { id: 4, name: '移动应用开发', status: '即将到期', statusClass: 'status-warning', deadline: '2026-06-01', progress: 85 },
  { id: 5, name: '云基础设施迁移', status: '风险', statusClass: 'status-danger', deadline: '2026-06-10', progress: 30 }
])
</script>

<style scoped>
.projects-page {
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

.project-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.project-info {
  flex: 1;
}

.project-name {
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 4px;
}

.project-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
}

.project-status {
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

.project-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 200px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #64748b;
  min-width: 40px;
}

.project-actions {
  display: flex;
  gap: 8px;
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