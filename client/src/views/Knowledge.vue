<template>
  <div class="knowledge-page">
    <div class="page-header">
      <div class="page-title-area">
        <h2>知识库</h2>
        <p>管理企业知识文档、FAQ和最佳实践</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline">
          <i class="fas fa-search"></i> 搜索知识库
        </button>
        <button class="btn btn-primary">
          <i class="fas fa-plus"></i> 新建文档
        </button>
      </div>
    </div>
    
    <div class="scroll-area">
      <!-- 知识库统计 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #e0f2fe; color: #0284c7;">
            <i class="fas fa-book"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">156</div>
            <div class="stat-label">文档总数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #dcfce7; color: #16a34a;">
            <i class="fas fa-question-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">89</div>
            <div class="stat-label">FAQ条目</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #fef3c7; color: #d97706;">
            <i class="fas fa-download"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">2.4k</div>
            <div class="stat-label">本月访问</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #f3e8ff; color: #9333ea;">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">4.8</div>
            <div class="stat-label">平均评分</div>
          </div>
        </div>
      </div>
      
      <!-- 知识分类 -->
      <div class="card">
        <div class="card-header">
          <h3>知识分类</h3>
          <div class="card-actions">
            <button class="btn btn-sm btn-outline">
              <i class="fas fa-th"></i> 网格视图
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="category-grid">
            <div class="category-card" v-for="category in categories" :key="category.id">
              <div class="category-icon" :style="{ background: category.iconBg, color: category.iconColor }">
                <i :class="category.icon"></i>
              </div>
              <div class="category-info">
                <h4>{{ category.name }}</h4>
                <p>{{ category.description }}</p>
                <div class="category-meta">
                  <span>{{ category.count }} 篇文档</span>
                  <span>更新于 {{ category.lastUpdated }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 最近更新 -->
      <div class="card">
        <div class="card-header">
          <h3>最近更新</h3>
          <div class="card-actions">
            <button class="btn btn-sm btn-outline">
              <i class="fas fa-sort"></i> 排序
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="document-list">
            <div class="document-item" v-for="doc in recentDocuments" :key="doc.id">
              <div class="document-icon" :style="{ background: doc.iconBg, color: doc.iconColor }">
                <i :class="doc.icon"></i>
              </div>
              <div class="document-info">
                <div class="document-title">{{ doc.title }}</div>
                <div class="document-meta">
                  <span class="document-category">{{ doc.category }}</span>
                  <span class="document-author">{{ doc.author }}</span>
                  <span class="document-date">{{ doc.date }}</span>
                </div>
              </div>
              <div class="document-stats">
                <span class="views"><i class="fas fa-eye"></i> {{ doc.views }}</span>
                <span class="rating"><i class="fas fa-star"></i> {{ doc.rating }}</span>
              </div>
              <div class="document-actions">
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

const categories = ref([
  { id: 1, name: '产品文档', description: '产品功能说明、使用指南和最佳实践', icon: 'fas fa-cube', iconBg: '#e0f2fe', iconColor: '#0284c7', count: 45, lastUpdated: '2天前' },
  { id: 2, name: '技术文档', description: 'API文档、开发指南和架构设计', icon: 'fas fa-code', iconBg: '#dcfce7', iconColor: '#16a34a', count: 38, lastUpdated: '1天前' },
  { id: 3, name: 'FAQ', description: '常见问题解答和故障排除', icon: 'fas fa-question-circle', iconBg: '#fef3c7', iconColor: '#d97706', count: 89, lastUpdated: '3天前' },
  { id: 4, name: '培训材料', description: '新员工培训、技能提升课程', icon: 'fas fa-graduation-cap', iconBg: '#fee2e2', iconColor: '#dc2626', count: 24, lastUpdated: '1周前' },
  { id: 5, name: '政策制度', description: '公司规章制度、流程规范', icon: 'fas fa-gavel', iconBg: '#f3e8ff', iconColor: '#9333ea', count: 18, lastUpdated: '2周前' },
  { id: 6, name: '最佳实践', description: '行业最佳实践、案例分析', icon: 'fas fa-lightbulb', iconBg: '#fce7f3', iconColor: '#ec4899', count: 32, lastUpdated: '4天前' }
])

const recentDocuments = ref([
  { id: 1, title: 'Vue.js 3.0 最佳实践指南', category: '技术文档', author: '张工', date: '2小时前', views: 128, rating: 4.9, icon: 'fas fa-code', iconBg: '#dcfce7', iconColor: '#16a34a' },
  { id: 2, title: '企业AI助手使用手册', category: '产品文档', author: '李产品', date: '5小时前', views: 256, rating: 4.8, icon: 'fas fa-cube', iconBg: '#e0f2fe', iconColor: '#0284c7' },
  { id: 3, title: '新员工入职指南', category: '培训材料', author: 'HR部门', date: '1天前', views: 89, rating: 4.7, icon: 'fas fa-graduation-cap', iconBg: '#fee2e2', iconColor: '#dc2626' },
  { id: 4, title: 'API接口设计规范', category: '技术文档', author: '王架构', date: '2天前', views: 67, rating: 4.6, icon: 'fas fa-code', iconBg: '#dcfce7', iconColor: '#16a34a' },
  { id: 5, title: '客户服务流程优化', category: '最佳实践', author: '客服总监', date: '3天前', views: 145, rating: 4.5, icon: 'fas fa-lightbulb', iconBg: '#fce7f3', iconColor: '#ec4899' }
])
</script>

<style scoped>
.knowledge-page {
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

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.category-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.category-info {
  flex: 1;
}

.category-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.category-info p {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  line-height: 1.5;
}

.category-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #94a3b8;
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.document-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.document-info {
  flex: 1;
}

.document-title {
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 4px;
}

.document-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
}

.document-category {
  background: #e0f2fe;
  color: #0284c7;
  padding: 2px 8px;
  border-radius: 4px;
}

.document-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #64748b;
}

.document-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.document-actions {
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