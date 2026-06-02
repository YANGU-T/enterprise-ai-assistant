<template>
  <div class="settings-page">
    <div class="page-header">
      <div class="page-title-area">
        <h2>系统设置</h2>
        <p>管理系统配置、用户权限和个性化设置</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline">
          <i class="fas fa-undo"></i> 重置默认
        </button>
        <button class="btn btn-primary">
          <i class="fas fa-save"></i> 保存设置
        </button>
      </div>
    </div>
    
    <div class="scroll-area">
      <div class="settings-layout">
        <!-- 设置导航 -->
        <div class="settings-nav">
          <div class="nav-item" v-for="section in settingsSections" :key="section.id" :class="{ active: activeSection === section.id }" @click="activeSection = section.id">
            <i :class="section.icon"></i>
            <span>{{ section.name }}</span>
          </div>
        </div>
        
        <!-- 设置内容 -->
        <div class="settings-content">
          <!-- 个人设置 -->
          <div class="settings-section" v-if="activeSection === 'personal'">
            <div class="section-header">
              <h3>个人设置</h3>
              <p>管理您的个人信息和偏好设置</p>
            </div>
            <div class="settings-form">
              <div class="form-group">
                <label>头像</label>
                <div class="avatar-upload">
                  <div class="avatar-preview">
                    <i class="fas fa-user"></i>
                  </div>
                  <button class="btn btn-sm btn-outline">更换头像</button>
                </div>
              </div>
              <div class="form-group">
                <label>姓名</label>
                <input type="text" class="input-field" value="张三" />
              </div>
              <div class="form-group">
                <label>邮箱</label>
                <input type="email" class="input-field" value="zhangsan@company.com" />
              </div>
              <div class="form-group">
                <label>手机号</label>
                <input type="tel" class="input-field" value="138****8888" />
              </div>
              <div class="form-group">
                <label>部门</label>
                <input type="text" class="input-field" value="技术部" disabled />
              </div>
              <div class="form-group">
                <label>语言</label>
                <select class="input-field">
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- 通知设置 -->
          <div class="settings-section" v-if="activeSection === 'notifications'">
            <div class="section-header">
              <h3>通知设置</h3>
              <p>配置通知方式和提醒规则</p>
            </div>
            <div class="settings-form">
              <div class="form-group">
                <label>邮件通知</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="emailNotify" checked />
                  <label for="emailNotify"></label>
                </div>
              </div>
              <div class="form-group">
                <label>短信通知</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="smsNotify" />
                  <label for="smsNotify"></label>
                </div>
              </div>
              <div class="form-group">
                <label>桌面通知</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="desktopNotify" checked />
                  <label for="desktopNotify"></label>
                </div>
              </div>
              <div class="form-group">
                <label>通知音效</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="soundNotify" checked />
                  <label for="soundNotify"></label>
                </div>
              </div>
              <div class="form-group">
                <label>免打扰时间</label>
                <div class="time-range">
                  <input type="time" class="input-field" value="22:00" />
                  <span>至</span>
                  <input type="time" class="input-field" value="08:00" />
                </div>
              </div>
            </div>
          </div>
          
          <!-- 安全设置 -->
          <div class="settings-section" v-if="activeSection === 'security'">
            <div class="section-header">
              <h3>安全设置</h3>
              <p>管理账号安全和登录设置</p>
            </div>
            <div class="settings-form">
              <div class="form-group">
                <label>修改密码</label>
                <button class="btn btn-outline">修改密码</button>
              </div>
              <div class="form-group">
                <label>两步验证</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="twoFactor" />
                  <label for="twoFactor"></label>
                </div>
              </div>
              <div class="form-group">
                <label>登录设备管理</label>
                <button class="btn btn-outline">查看设备</button>
              </div>
              <div class="form-group">
                <label>登录历史</label>
                <button class="btn btn-outline">查看历史</button>
              </div>
            </div>
          </div>
          
          <!-- 系统设置 -->
          <div class="settings-section" v-if="activeSection === 'system'">
            <div class="section-header">
              <h3>系统设置</h3>
              <p>管理系统全局配置（需要管理员权限）</p>
            </div>
            <div class="settings-form">
              <div class="form-group">
                <label>系统名称</label>
                <input type="text" class="input-field" value="企业AI助手中控平台" />
              </div>
              <div class="form-group">
                <label>系统Logo</label>
                <div class="logo-upload">
                  <div class="logo-preview">
                    <i class="fas fa-robot"></i>
                  </div>
                  <button class="btn btn-sm btn-outline">更换Logo</button>
                </div>
              </div>
              <div class="form-group">
                <label>数据备份</label>
                <div class="backup-actions">
                  <button class="btn btn-outline">立即备份</button>
                  <button class="btn btn-outline">恢复数据</button>
                </div>
              </div>
              <div class="form-group">
                <label>系统日志</label>
                <button class="btn btn-outline">查看日志</button>
              </div>
            </div>
          </div>
          
          <!-- 关于 -->
          <div class="settings-section" v-if="activeSection === 'about'">
            <div class="section-header">
              <h3>关于系统</h3>
              <p>系统版本和相关信息</p>
            </div>
            <div class="about-info">
              <div class="about-logo">
                <i class="fas fa-robot"></i>
              </div>
              <div class="about-details">
                <h4>企业AI助手中控平台</h4>
                <p>版本: v2.1.0</p>
                <p>构建时间: 2026-05-27</p>
                <p>技术栈: Vue.js 3 + Express.js</p>
                <p>数据库: SQLite</p>
              </div>
              <div class="about-links">
                <a href="#" class="about-link">用户手册</a>
                <a href="#" class="about-link">API文档</a>
                <a href="#" class="about-link">更新日志</a>
                <a href="#" class="about-link">技术支持</a>
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

const activeSection = ref('personal')

const settingsSections = ref([
  { id: 'personal', name: '个人设置', icon: 'fas fa-user' },
  { id: 'notifications', name: '通知设置', icon: 'fas fa-bell' },
  { id: 'security', name: '安全设置', icon: 'fas fa-shield-alt' },
  { id: 'system', name: '系统设置', icon: 'fas fa-cog' },
  { id: 'about', name: '关于', icon: 'fas fa-info-circle' }
])
</script>

<style scoped>
.settings-page {
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

.settings-layout {
  display: flex;
  gap: 24px;
  height: 100%;
}

.settings-nav {
  width: 200px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
  font-size: 14px;
}

.nav-item:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.nav-item.active {
  background: #3b82f6;
  color: white;
}

.nav-item i {
  width: 20px;
  text-align: center;
}

.settings-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.settings-section {
  height: 100%;
}

.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.section-header p {
  font-size: 14px;
  color: #64748b;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.form-group label {
  width: 120px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.input-field {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #3b82f6;
}

.input-field:disabled {
  background: #f8fafc;
  color: #94a3b8;
}

.avatar-upload,
.logo-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-preview,
.logo-preview {
  width: 64px;
  height: 64px;
  background: #f1f5f9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #94a3b8;
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e2e8f0;
  transition: 0.3s;
  border-radius: 24px;
  width: 100%;
  height: 100%;
}

.toggle-switch label:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + label {
  background-color: #3b82f6;
}

.toggle-switch input:checked + label:before {
  transform: translateX(24px);
}

.time-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-range span {
  color: #64748b;
}

.backup-actions {
  display: flex;
  gap: 12px;
}

.about-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 40px;
  text-align: center;
}

.about-logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
}

.about-details h4 {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12px;
}

.about-details p {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
}

.about-links {
  display: flex;
  gap: 24px;
  margin-top: 16px;
}

.about-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.about-link:hover {
  text-decoration: underline;
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