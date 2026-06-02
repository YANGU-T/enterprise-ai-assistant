<template>
  <div class="agent-page">
    <div class="agent-header">
      <div class="agent-title">
        <div class="agent-icon resume"><i class="fas fa-user-check"></i></div>
        <div>
          <h2>简历筛选Agent</h2>
          <p>配置岗位要求，AI自动匹配人才库中的优质候选人</p>
        </div>
      </div>
      <div class="agent-actions">
        <button class="action-btn" @click="goToChat"><i class="fas fa-comments"></i> AI对话</button>
        <button class="action-btn" @click="openPlatformConfig"><i class="fas fa-cloud-download-alt"></i> 平台配置</button>
        <button class="action-btn primary" @click="startMatch"><i class="fas fa-search"></i> 智能匹配</button>
      </div>
    </div>

    <div class="agent-content">
      <!-- 左侧：岗位配置 -->
      <div class="input-section">
        <div class="section-card">
          <h3><i class="fas fa-briefcase"></i> 岗位要求配置</h3>
          <div class="form-group">
            <label>岗位名称</label>
            <input v-model="job.title" type="text" placeholder="如：前端开发工程师" @input="onJobTitleChange">
            <div v-if="isLoadingSkills" class="ai-loading-hint"><i class="fas fa-spinner fa-spin"></i> AI正在分析岗位技能需求...</div>
          </div>
          <div class="form-group">
            <label>岗位描述</label>
            <textarea v-model="job.description" placeholder="简要描述岗位职责和工作内容..." rows="3" @input="onJobDescriptionChange"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>工作年限</label>
              <div class="range-inputs">
                <input v-model="job.expMin" type="number" placeholder="最低">
                <span>~</span>
                <input v-model="job.expMax" type="number" placeholder="最高">
              </div>
            </div>
            <div class="form-group">
              <label>学历要求</label>
              <select v-model="job.education">
                <option value="">不限</option>
                <option value="大专">大专</option>
                <option value="本科">本科</option>
                <option value="硕士">硕士</option>
                <option value="博士">博士</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>薪资范围</label>
              <select v-model="job.salary">
                <option value="面议">面议</option>
                <option value="10-15k">10-15K</option>
                <option value="15-25k">15-25K</option>
                <option value="25-40k">25-40K</option>
                <option value="40k+">40K+</option>
              </select>
            </div>
            <div class="form-group">
              <label>工作地点</label>
              <select v-model="job.location">
                <option value="北京">北京</option>
                <option value="上海">上海</option>
                <option value="广州">广州</option>
                <option value="深圳">深圳</option>
                <option value="杭州">杭州</option>
                <option value="远程">远程</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>必备技能</label>
            <div v-if="aiRecommendedSkills.length" class="ai-rec-section">
              <div class="ai-rec-label"><i class="fas fa-magic"></i> AI智能推荐</div>
              <div class="ai-skill-recs">
                <span v-for="s in aiRecommendedSkills" :key="s" class="rec-skill" @click="addRecommendedSkill(s)">
                  {{ s }} <i class="fas fa-plus"></i>
                </span>
              </div>
            </div>
            <div class="tags-input">
              <span v-for="(tag, i) in job.skills" :key="i" class="tag">
                {{ tag }} <button @click="job.skills.splice(i, 1)"><i class="fas fa-times"></i></button>
              </span>
              <input v-model="newSkill" @keydown.enter.prevent="addSkill" placeholder="输入技能回车添加">
            </div>

          </div>
        </div>
      </div>

      <!-- 右侧：匹配结果 -->
      <div class="result-section">
        <div class="section-card">
          <div class="result-header">
            <h3><i class="fas fa-list-ol"></i> 匹配结果</h3>
            <span v-if="candidates.length" class="result-count">{{ candidates.filter(c=>c.matchLevel==='A').length }}/{{ candidates.length }} 推荐</span>
          </div>
          <div v-if="!candidates.length && !isMatching" class="empty-state">
            <div class="empty-state-inner">
              <i class="fas fa-users"></i>
              <p>配置岗位要求后，系统将自动匹配人才库中的优质候选人</p>
              <p class="empty-hint">AI将根据岗位需求、技能匹配度、学历背景等多维度进行智能评分</p>
            </div>
          </div>
          <div v-if="isMatching" class="matching-state">
            <div class="matching-state-inner">
              <div class="matching-spinner"><i class="fas fa-spinner fa-spin"></i></div>
              <p>正在全网匹配候选人...</p>
              <span>AI正在分析岗位需求与候选人简历的匹配度</span>
            </div>
          </div>
          <div v-if="candidates.length" class="candidate-list">
            <div v-for="c in candidates" :key="c.id" class="candidate-item" @click="viewResume(c)">
              <div class="candidate-level" :class="c.matchLevel">{{ c.matchLevel }}</div>
              <div class="candidate-info">
                <div class="candidate-name">
                  {{ c.name }}
                  <span class="exp">{{ c.experience }}年经验</span>
                  <span class="candidate-status" :class="c.status">{{ c.statusText }}</span>
                </div>
                <div class="candidate-edu">{{ c.education }} · {{ c.school }} · {{ c.currentCompany }}</div>
                <div class="candidate-skills">
                  <span v-for="s in c.skills" :key="s" class="skill" :class="{ match: job.skills.includes(s) }">{{ s }}</span>
                </div>
                <div class="candidate-meta">
                  <span><i class="fas fa-map-marker-alt"></i> {{ c.location }}</span>
                  <span><i class="fas fa-coins"></i> {{ c.expectedSalary }}</span>
                  <span><i class="fas fa-clock"></i> {{ c.updateTime }}</span>
                </div>
              </div>
              <div class="candidate-score-wrap">
                <div class="candidate-score" :class="c.matchLevel">{{ c.score }}%</div>
                <span class="score-label">匹配度</span>
              </div>
              <div class="candidate-actions">
                <button class="r-btn primary" @click.stop="greetCandidate(c)" title="打招呼"><i class="fas fa-handshake"></i></button>
                <button class="r-btn" @click.stop="viewResume(c)" title="查看详情"><i class="fas fa-eye"></i></button>
                <button class="r-btn" @click.stop="sendToChat(c)" title="AI分析"><i class="fas fa-robot"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 简历详情弹窗 -->
    <div class="resume-modal-overlay" v-if="showResumeModal" @click.self="showResumeModal=false">
      <div class="resume-modal">
        <div class="resume-modal-header">
          <h3><i class="fas fa-user"></i> 候选人详情</h3>
          <button class="modal-close" @click="showResumeModal=false"><i class="fas fa-times"></i></button>
        </div>
        <div class="resume-modal-body" v-if="selectedCandidate">
          <div class="resume-profile">
            <div class="resume-avatar">{{ selectedCandidate.name.charAt(0) }}</div>
            <div class="resume-basic">
              <h4>{{ selectedCandidate.name }}</h4>
              <p>{{ selectedCandidate.education }} · {{ selectedCandidate.school }} · {{ selectedCandidate.experience }}年经验</p>
            </div>
            <div class="resume-score" :class="selectedCandidate.matchLevel">{{ selectedCandidate.score }}%</div>
          </div>
          <div class="resume-section">
            <h5>现任公司</h5>
            <p>{{ selectedCandidate.currentCompany }} · {{ selectedCandidate.currentTitle }}</p>
          </div>
          <div class="resume-section">
            <h5>技能标签</h5>
            <div class="resume-skills">
              <span v-for="s in selectedCandidate.skills" :key="s" class="skill" :class="{ match: job.skills.includes(s) }">{{ s }}</span>
            </div>
          </div>
          <div class="resume-section">
            <h5>工作经历</h5>
            <div v-for="(exp, i) in selectedCandidate.workHistory" :key="i" class="work-item">
              <div class="work-company">{{ exp.company }}</div>
              <div class="work-title">{{ exp.title }} · {{ exp.period }}</div>
              <div class="work-desc">{{ exp.desc }}</div>
            </div>
          </div>
          <div class="resume-section">
            <h5>自我评价</h5>
            <p class="resume-summary">{{ selectedCandidate.summary }}</p>
          </div>
        </div>
        <div class="resume-modal-footer">
          <button class="action-btn" @click="showResumeModal=false">关闭</button>
          <button class="action-btn" @click="sendToChat(selectedCandidate)"><i class="fas fa-robot"></i> AI分析</button>
          <button class="action-btn primary" @click="greetCandidate(selectedCandidate)"><i class="fas fa-handshake"></i> 打招呼</button>
        </div>
      </div>
    </div>

    <!-- 平台配置弹窗 -->
    <div class="platform-modal-overlay" v-if="showPlatformConfig" @click.self="closePlatformConfig">
      <div class="platform-modal">
        <div class="platform-modal-header">
          <h3><i class="fas fa-cloud-download-alt"></i> 简历获取平台配置</h3>
          <button class="modal-close" @click="closePlatformConfig"><i class="fas fa-times"></i></button>
        </div>
        <div class="platform-modal-body">
          <p class="platform-desc">配置简历来源平台，AI将从这些平台搜索匹配候选人</p>
          <div class="platform-list">
            <div v-for="(p, i) in resumePlatforms" :key="i" class="platform-item">
              <div class="platform-info">
                <div class="platform-icon" :style="{ background: p.color || '#6366f1' }">
                  <i :class="p.icon || 'fas fa-globe'"></i>
                </div>
                <div class="platform-meta">
                  <div class="platform-name">{{ p.name }}</div>
                  <div class="platform-url">{{ p.url || '未配置' }}</div>
                </div>
              </div>
              <button class="platform-delete" @click="deletePlatform(i)" title="删除平台">
                <i class="fas fa-trash"></i>
              </button>
            </div>
            <div v-if="!resumePlatforms.length" class="empty-platforms">
              <i class="fas fa-database"></i>
              <p>暂无配置平台，请添加简历来源</p>
            </div>
          </div>
          <div class="add-platform-form">
            <div class="form-row">
              <div class="form-group" style="flex:2">
                <label>平台名称</label>
                <input v-model="newPlatform.name" type="text" placeholder="如：BOSS直聘、猎聘">
              </div>
              <div class="form-group" style="flex:3">
                <label>API地址（选填）</label>
                <input v-model="newPlatform.url" type="text" placeholder="https://api.example.com/resume">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group" style="flex:2">
                <label>图标类名</label>
                <input v-model="newPlatform.icon" type="text" placeholder="fas fa-building">
              </div>
              <div class="form-group" style="flex:2">
                <label>主题色</label>
                <input v-model="newPlatform.color" type="color" style="height:38px;padding:4px 8px">
              </div>
            </div>
            <button class="add-platform-btn" @click="addPlatform" :disabled="!newPlatform.name.trim()">
              <i class="fas fa-plus"></i> 添加平台
            </button>
          </div>
        </div>
        <div class="platform-modal-footer">
          <button class="cancel-btn" @click="closePlatformConfig">关闭</button>
          <button class="save-btn" @click="savePlatformConfig"><i class="fas fa-check"></i> 保存配置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'

const router = useRouter()
const appStore = useAppStore()
const newSkill = ref('')
const isMatching = ref(false)
const showResumeModal = ref(false)
const selectedCandidate = ref(null)
const aiRecommendedSkills = ref([])
const isLoadingSkills = ref(false)
let jobTitleDebounce = null

// 组件挂载时不再自动填充，保持空状态
// onMounted 已移除自动推荐逻辑，改为用户输入后触发

onMounted(() => {
  // 如果已有岗位标题，触发一次推荐
  if (job.value.title.trim()) {
    recommendSkills()
  }
})

const job = ref({
  title: '',
  description: '',
  expMin: null,
  expMax: null,
  education: '',
  salary: '面议',
  location: '北京',
  skills: []
})

const candidates = ref([])

// 简历获取平台配置
const showPlatformConfig = ref(false)
const resumePlatforms = ref(loadPlatforms())
const newPlatform = ref({ name: '', url: '', icon: 'fas fa-globe', color: '#6366f1' })

function loadPlatforms() {
  try {
    const saved = localStorage.getItem('resume_platforms')
    if (saved) return JSON.parse(saved)
  } catch (e) { /* ignore */ }
  return [
    { name: 'BOSS直聘', url: 'https://www.zhipin.com', icon: 'fas fa-building', color: '#5dc2af' },
    { name: '猎聘', url: 'https://www.liepin.com', icon: 'fas fa-search-dollar', color: '#f5a623' },
    { name: '前程无忧', url: 'https://www.51job.com', icon: 'fas fa-briefcase', color: '#e4393c' },
    { name: '拉勾网', url: 'https://www.lagou.com', icon: 'fas fa-laptop-code', color: '#00b38a' }
  ]
}

function openPlatformConfig() {
  showPlatformConfig.value = true
}

function closePlatformConfig() {
  showPlatformConfig.value = false
}

function addPlatform() {
  if (!newPlatform.value.name.trim()) return
  resumePlatforms.value.push({
    name: newPlatform.value.name.trim(),
    url: newPlatform.value.url.trim(),
    icon: newPlatform.value.icon.trim() || 'fas fa-globe',
    color: newPlatform.value.color || '#6366f1'
  })
  newPlatform.value = { name: '', url: '', icon: 'fas fa-globe', color: '#6366f1' }
}

function deletePlatform(index) {
  resumePlatforms.value.splice(index, 1)
}

function savePlatformConfig() {
  try {
    localStorage.setItem('resume_platforms', JSON.stringify(resumePlatforms.value))
    appStore.showModal('保存成功', `已保存 ${resumePlatforms.value.length} 个简历获取平台`, 'success')
    showPlatformConfig.value = false
  } catch (e) {
    appStore.showModal('保存失败', '配置保存失败，请重试', 'error')
  }
}

// 保存平台配置到 localStorage
watch(resumePlatforms, (val) => {
  try { localStorage.setItem('resume_platforms', JSON.stringify(val)) } catch (e) { /* ignore */ }
}, { deep: true })

function addSkill() {
  if (newSkill.value.trim() && !job.value.skills.includes(newSkill.value.trim())) {
    job.value.skills.push(newSkill.value.trim())
  }
  newSkill.value = ''
}

function onJobTitleChange() {
  // 本地静态推荐立即生效
  recommendSkills()
  // 防抖调用 AI 推荐
  if (jobTitleDebounce) clearTimeout(jobTitleDebounce)
  if (!job.value.title.trim()) {
    aiRecommendedSkills.value = []
    return
  }
  jobTitleDebounce = setTimeout(() => recommendSkillsAI(), 800)
}

function onJobDescriptionChange() {
  // 岗位描述变化时也触发 AI 推荐（不需要依赖标题有值）
  if (jobTitleDebounce) clearTimeout(jobTitleDebounce)
  const hasContent = job.value.title.trim() || job.value.description.trim()
  if (!hasContent) {
    aiRecommendedSkills.value = []
    return
  }
  jobTitleDebounce = setTimeout(() => recommendSkillsAI(), 800)
}

function recommendSkills() {
  const title = job.value.title.toLowerCase()
  const map = {
    '前端': ['Vue.js', 'React', 'TypeScript', 'HTML5', 'CSS3', 'Webpack', 'Vite', 'ES6+', 'Tailwind CSS'],
    '后端': ['Java', 'Python', 'Node.js', 'Go', 'Spring Boot', 'MySQL', 'Redis', 'MongoDB'],
    '全栈': ['Vue.js', 'React', 'Node.js', 'Python', 'TypeScript', 'PostgreSQL', 'Docker'],
    'java': ['Java', 'Spring Boot', 'Spring Cloud', 'MySQL', 'Redis', 'Kafka', 'Maven'],
    'python': ['Python', 'Django', 'Flask', 'FastAPI', 'Pandas', 'NumPy', 'Docker'],
    '运维': ['Docker', 'Kubernetes', 'Linux', 'CI/CD', 'Nginx', 'Prometheus', 'Terraform'],
    '测试': ['Selenium', 'Jest', 'Cypress', 'Postman', 'JUnit', '自动化测试', 'Python'],
    '产品': ['Axure', 'XMind', '数据分析', '用户研究', 'PRD文档', 'Figma', 'SQL'],
    'ui': ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'UI/UX设计', '设计系统'],
    '设计': ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', '设计系统', '交互设计'],
    '数据': ['Python', 'SQL', 'Pandas', 'NumPy', 'Spark', 'Hadoop', 'Tableau'],
    '算法': ['Python', 'TensorFlow', 'PyTorch', '机器学习', '深度学习', 'NLP'],
    'android': ['Kotlin', 'Java', 'Android SDK', 'Jetpack Compose', 'Flutter'],
    'ios': ['Swift', 'Objective-C', 'UIKit', 'SwiftUI', 'CocoaPods'],
    '嵌入式': ['C/C++', 'RTOS', 'STM32', 'ARM', 'Linux驱动', '物联网'],
    '安全': ['渗透测试', '漏洞分析', 'Wireshark', 'Kali Linux', '密码学'],
    '架构': ['微服务', '分布式系统', '系统设计', 'DDD', '高并发', 'Docker', 'Kubernetes'],
    '项目经理': ['PMP', 'Scrum', 'Jira', '需求管理', '风险管理', '敏捷开发', '项目管理'],
    '经理': ['团队管理', '项目管理', '沟通协调', 'Scrum', 'OKR', '数据分析'],
    '总监': ['战略规划', '团队管理', '预算管理', 'OKR', '数据分析', '业务增长'],
    'hr': ['招聘', '人才管理', '绩效考核', '薪酬福利', '劳动法', '组织发展'],
    '人力': ['招聘', '人才管理', '绩效考核', '薪酬福利', '劳动法', '组织发展'],
    '销售': ['客户关系管理', 'CRM', '商务谈判', '市场分析', '销售策略', '渠道管理'],
    '市场': ['市场分析', '品牌管理', '数字营销', 'SEO', 'SEM', '社交媒体', '内容营销'],
    '财务': ['财务报表', '成本核算', '税务筹划', '审计', 'ERP', 'SAP'],
    '法务': ['合同审查', '法律合规', '知识产权', '劳动法', '公司法'],
    '客服': ['客户满意度', '投诉处理', 'CRM', '沟通技巧', '工单系统']
  }
  let recs = []
  for (const [key, skills] of Object.entries(map)) {
    if (title.includes(key)) recs.push(...skills)
  }
  // 如果没有匹配到任何关键词，提供通用推荐
  if (recs.length === 0 && title.length >= 2) {
    recs = ['沟通能力', '团队协作', '数据分析', 'Office', '项目管理', '学习能力']
  }
  aiRecommendedSkills.value = [...new Set(recs)].filter(s => !job.value.skills.includes(s)).slice(0, 8)
}

async function recommendSkillsAI() {
  const title = job.value.title.trim()
  const desc = job.value.description.trim()
  if (!title && !desc) return
  if (title && title.length < 2 && !desc) return
  
  isLoadingSkills.value = true
  
  try {
    const models = appStore.modelConfig.models || []
    const currentModelId = appStore.modelConfig.currentModel
    const currentModelInfo = models.find(m => m.id === currentModelId) || models.find(m => m.status === 'active')
    
    // 如果没有配置模型，直接使用本地推荐
    if (!currentModelInfo) {
      console.warn('未配置AI模型，使用本地推荐')
      recommendSkills()
      return
    }
    
    const provider = currentModelInfo?.provider || ''
    const endpoint = currentModelInfo?.endpoint || ''
    const apiKey = currentModelInfo?.apiKey || ''

    let modelName = currentModelInfo?.name || ''
    if (!modelName || modelName === currentModelInfo?.id || modelName.startsWith('model-')) {
      const defaultModels = {
        'OpenAI': 'gpt-4o', 'Anthropic': 'claude-3.5-sonnet', 'DeepSeek': 'deepseek-v4-flash',
        '阿里云': 'qwen-max', '智谱AI': 'glm-4', 'Google': 'gemini-2.0-pro', '小米MImo': 'mimo-v2.5-pro'
      }
      modelName = defaultModels[provider] || 'gpt-4o'
    }

    const userContent = `岗位名称：${title}${job.value.description ? '\n岗位描述：' + job.value.description : ''}，请列出该岗位的必备技能`

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: '你是一个专业的HR技术顾问。根据用户提供的岗位名称和岗位描述，列出该岗位最核心的技能要求。只返回技能名称，用英文逗号分隔，不要编号，不要解释，最多返回12个技能。注意：1. 除软件开发类岗位的技术名词（如Vue.js、React、Python等）可保留英文外，其他岗位的技能描述请尽量使用中文（如"市场分析"、"客户关系管理"、"财务报表编制"等）；2. 技能应与岗位描述高度相关。' },
          { role: 'user', content: userContent }
        ],
        model: modelName,
        config: { provider, endpoint, apiKey, temperature: 0.3, maxTokens: 300, enableWebSearch: appStore.modelConfig.enableWebSearch }
      })
    })

    const result = await response.json()
    if (result.success && result.data?.content) {
      const skills = result.data.content
        .replace(/[\d.]+[\s)）]*/g, '')  // 去除编号
        .split(/[,，、\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 1 && s.length < 30)
      
      const uniqueSkills = [...new Set(skills)].filter(s => !job.value.skills.includes(s))
      if (uniqueSkills.length > 0) {
        aiRecommendedSkills.value = uniqueSkills.slice(0, 12)
      } else {
        // AI返回的内容无法解析为技能，保留本地推荐
        console.warn('AI返回内容无法解析，保留本地推荐')
      }
    } else {
      // API返回失败，保留本地推荐
      console.warn('AI技能推荐API返回失败:', result.message)
    }
  } catch (e) {
    // AI 推荐失败时保留本地静态推荐
    console.warn('AI技能推荐失败，使用本地推荐:', e.message)
  } finally {
    isLoadingSkills.value = false
  }
}

function addRecommendedSkill(s) {
  if (!job.value.skills.includes(s)) job.value.skills.push(s)
  recommendSkills()
}

function startMatch() {
  isMatching.value = true
  candidates.value = []
  setTimeout(() => {
    candidates.value = [
      {
        id: 1, name: '张伟', experience: 5, education: '硕士', school: '清华大学',
        currentCompany: '某互联网大厂', currentTitle: '高级前端工程师',
        skills: ['Vue.js', 'React', 'TypeScript', 'Node.js', 'Webpack'],
        score: 95, matchLevel: 'A', location: '北京', expectedSalary: '30-40K',
        status: 'active', statusText: '在职看机会', updateTime: '3天前更新',
        workHistory: [
          { company: '某互联网大厂', title: '高级前端工程师', period: '2022至今', desc: '负责核心业务前端架构设计，主导前端工程化体系建设，团队5人' },
          { company: '某科技公司', title: '前端开发工程师', period: '2019-2022', desc: '参与电商平台前端开发，使用Vue.js重构老旧系统，性能提升40%' }
        ],
        summary: '5年前端开发经验，精通Vue.js和React生态，有大型项目架构经验，注重代码质量和团队协作'
      },
      {
        id: 2, name: '李娜', experience: 4, education: '本科', school: '北京大学',
        currentCompany: '某创业公司', currentTitle: '前端负责人',
        skills: ['Vue.js', 'TypeScript', 'Vite', 'CSS3', 'Git'],
        score: 88, matchLevel: 'A', location: '北京', expectedSalary: '25-35K',
        status: 'active', statusText: '在职看机会', updateTime: '1周前更新',
        workHistory: [
          { company: '某创业公司', title: '前端负责人', period: '2023至今', desc: '带领3人前端团队，负责公司全线产品的前端开发和技术选型' },
          { company: '某互联网公司', title: '前端开发', period: '2020-2023', desc: '参与多个B端产品开发，熟悉组件库设计和前端工程化' }
        ],
        summary: '4年前端经验，有团队管理经验，技术视野开阔，学习能力强'
      },
      {
        id: 3, name: '王磊', experience: 3, education: '本科', school: '浙江大学',
        currentCompany: '某科技公司', currentTitle: '前端工程师',
        skills: ['React', 'JavaScript', 'CSS', 'Webpack', 'Node.js'],
        score: 75, matchLevel: 'B', location: '杭州', expectedSalary: '20-30K',
        status: 'active', statusText: '在职看机会', updateTime: '2周前更新',
        workHistory: [
          { company: '某科技公司', title: '前端工程师', period: '2022至今', desc: '负责后台管理系统开发，使用React + Ant Design技术栈' }
        ],
        summary: '3年前端经验，React技术栈为主，代码规范，注重用户体验'
      },
      {
        id: 4, name: '赵敏', experience: 6, education: '硕士', school: '复旦大学',
        currentCompany: '某外企', currentTitle: '资深前端工程师',
        skills: ['Vue.js', 'React', 'TypeScript', 'Docker', 'CI/CD'],
        score: 92, matchLevel: 'A', location: '上海', expectedSalary: '35-45K',
        status: 'passive', statusText: '暂不考虑', updateTime: '1月前更新',
        workHistory: [
          { company: '某外企', title: '资深前端工程师', period: '2021至今', desc: '负责全球化产品的前端开发，支持多语言和国际化' },
          { company: '某互联网公司', title: '前端开发', period: '2018-2021', desc: '参与电商平台前端开发' }
        ],
        summary: '6年前端经验，有外企工作经验，英语流利，技术全面'
      },
      {
        id: 5, name: '陈刚', experience: 2, education: '本科', school: '武汉大学',
        skills: ['HTML', 'CSS', 'JavaScript', 'Vue.js'],
        score: 52, matchLevel: 'B', location: '深圳', expectedSalary: '12-18K',
        status: 'active', statusText: '随时到岗', updateTime: '3天前更新',
        currentCompany: '某小型公司', currentTitle: '初级前端',
        workHistory: [
          { company: '某小型公司', title: '初级前端', period: '2023至今', desc: '负责公司官网和内部系统前端开发' }
        ],
        summary: '2年前端经验，基础扎实，学习意愿强，希望进入大平台发展'
      }
    ]
    isMatching.value = false
    const platforms = resumePlatforms.value.map(p => p.name).join('、')
    appStore.showModal('匹配完成', `已从${platforms || '人才库'}中匹配到 ${candidates.value.length} 位候选人，其中 ${candidates.value.filter(c=>c.matchLevel==='A').length } 位为A级推荐`, 'success')
  }, 2000)
}

function viewResume(c) {
  selectedCandidate.value = c
  showResumeModal.value = true
}

function greetCandidate(c) {
  appStore.showModal('打招呼', `已向 ${c.name} 发送面试邀约消息\n\n"您好 ${c.name}，我们对您的背景很感兴趣，${job.value.title}岗位是否方便沟通？"`, 'success')
  showResumeModal.value = false
}

function goToChat() {
  router.push({ path: '/chat/resume-filter', query: { from: 'agent', type: 'resume-filter' } })
}

function sendToChat(c) {
  router.push({
    path: '/chat/resume-filter',
    query: { from: 'agent', type: 'resume-filter', candidate: JSON.stringify(c) }
  })
}
</script>

<style scoped>
.agent-page { padding: 24px; height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
.agent-header { flex-shrink: 0; }
.agent-content { flex: 1; min-height: 0; }
.input-section, .result-section { display: flex; flex-direction: column; min-height: 0; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
.input-section::-webkit-scrollbar, .result-section::-webkit-scrollbar { display: none; }
.input-section .section-card:last-child { margin-bottom: 0; }
.result-section .section-card { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.candidate-list { flex: 1; overflow-y: auto; min-height: 0; }
.agent-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.agent-title { display: flex; align-items: center; gap: 16px; }
.agent-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; }
.agent-icon.resume { background: linear-gradient(135deg, #d97706, #f59e0b); }
.agent-title h2 { font-size: 20px; font-weight: 800; color: var(--text-primary); }
.agent-title p { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
.agent-actions { display: flex; gap: 10px; }
.action-btn { padding: 8px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; font-family: inherit; background: var(--bg-white); color: var(--text-secondary); transition: all var(--tr); }
.action-btn:hover { border-color: var(--primary); color: var(--primary); }
.action-btn.primary { background: var(--primary); color: #fff; border-color: var(--primary); }
.action-btn.primary:hover { background: var(--primary-dark); }
.agent-content { display: grid; grid-template-columns: 380px 1fr; gap: 20px; align-items: stretch; min-height: 0; }
.section-card { background: var(--bg-white); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 16px; transition: all var(--tr); }
.section-card:hover { border-color: #d1d5db; }
.section-card h3 { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.section-card h3 i { color: var(--primary); width: 20px; }

/* 表单 */
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { margin-bottom: 14px; }
.form-group:last-child { margin-bottom: 0; }
.form-group label { display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: inherit; background: #f9fafb; transition: all var(--tr); }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.form-group textarea { resize: vertical; min-height: 60px; }
.range-inputs { display: flex; align-items: center; gap: 8px; }
.range-inputs input { flex: 1; }
.range-inputs span { color: var(--text-muted); }
.tags-input { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); min-height: 38px; align-items: center; background: #f9fafb; }
.tags-input:focus-within { border-color: var(--primary); background: #fff; }
.tag { font-size: 11px; padding: 3px 10px; background: #eef2ff; border-radius: 6px; color: var(--primary); display: flex; align-items: center; gap: 5px; font-weight: 500; }
.tag button { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 10px; padding: 0; opacity: .6; }
.tag button:hover { opacity: 1; }
.tags-input input { border: none; outline: none; flex: 1; min-width: 80px; font-size: 13px; font-family: inherit; background: transparent; }
/* AI智能推荐技能 */
.ai-rec-section { margin-bottom: 10px; }
.ai-rec-label { font-size: 11px; font-weight: 600; color: var(--primary); margin-bottom: 6px; display: flex; align-items: center; gap: 4px; }
.ai-skill-recs { display: flex; flex-wrap: wrap; gap: 6px; }
.rec-skill { font-size: 11px; padding: 4px 10px; background: linear-gradient(135deg, #eef2ff, #f5f3ff); border: 1px dashed var(--primary); border-radius: 6px; color: var(--primary); cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: 500; transition: all var(--tr); }
.rec-skill:hover { background: var(--primary); color: #fff; border-style: solid; }
.rec-skill i { font-size: 9px; }

/* 匹配结果 */
.result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.result-header h3 { margin-bottom: 0; }
.result-count { font-size: 12px; font-weight: 600; color: var(--primary); background: #eef2ff; padding: 4px 12px; border-radius: 12px; }
.empty-state { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; padding: 30px 20px; color: var(--text-muted); }
.empty-state-inner { display: flex; flex-direction: column; align-items: center; }
.empty-state-inner i { font-size: 48px; margin-bottom: 16px; opacity: .25; }
.empty-state-inner p { font-size: 14px; margin-bottom: 8px; }
.empty-hint { font-size: 12px !important; color: var(--text-muted); opacity: .7; }
.matching-state { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; padding: 30px 20px; }
.matching-state-inner { display: flex; flex-direction: column; align-items: center; }
.matching-spinner { font-size: 36px; color: var(--primary); margin-bottom: 16px; }
.matching-state-inner p { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
.matching-state-inner span { font-size: 12px; color: var(--text-muted); }

/* AI技能推荐加载提示 */
.ai-loading-hint { font-size: 11px; color: var(--primary); margin-top: 6px; display: flex; align-items: center; gap: 6px; }
.ai-loading-hint i { font-size: 11px; }

.candidate-list { display: flex; flex-direction: column; gap: 10px; }
.candidate-item { display: flex; align-items: center; gap: 14px; padding: 16px; border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer; transition: all var(--tr); }
.candidate-item:hover { border-color: var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,.06); transform: translateY(-1px); }
.candidate-level { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: #fff; flex-shrink: 0; }
.candidate-level.A { background: linear-gradient(135deg, #059669, #10b981); }
.candidate-level.B { background: linear-gradient(135deg, #d97706, #f59e0b); }
.candidate-level.C { background: linear-gradient(135deg, #6b7280, #9ca3af); }
.candidate-info { flex: 1; min-width: 0; }
.candidate-name { font-size: 14px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
.candidate-name .exp { font-size: 12px; font-weight: 400; color: var(--text-muted); }
.candidate-status { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 8px; }
.candidate-status.active { background: #d1fae5; color: #059669; }
.candidate-status.passive { background: #fef3c7; color: #d97706; }
.candidate-edu { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.candidate-skills { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.skill { font-size: 10px; padding: 2px 7px; background: var(--bg-surface); border-radius: 4px; color: var(--text-muted); }
.skill.match { background: #d1fae5; color: #059669; font-weight: 600; }
.candidate-meta { display: flex; gap: 14px; margin-top: 6px; font-size: 11px; color: var(--text-muted); }
.candidate-meta i { margin-right: 3px; }

.candidate-score-wrap { text-align: center; flex-shrink: 0; }
.candidate-score { font-size: 20px; font-weight: 800; min-width: 52px; }
.candidate-score.A { color: #059669; }
.candidate-score.B { color: #d97706; }
.candidate-score.C { color: #6b7280; }
.score-label { font-size: 10px; color: var(--text-muted); }

.candidate-actions { display: flex; gap: 6px; flex-shrink: 0; }
.r-btn { width: 34px; height: 34px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-white); cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; transition: all var(--tr); }
.r-btn:hover { border-color: var(--primary); color: var(--primary); background: #eef2ff; }
.r-btn.primary { background: var(--primary); color: #fff; border-color: var(--primary); }
.r-btn.primary:hover { background: var(--primary-dark); }

/* 简历弹窗 */
.resume-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn .2s ease; }
.resume-modal { background: #fff; border-radius: var(--radius-lg); width: 560px; max-height: 80vh; overflow-y: auto; box-shadow: var(--shadow-lg); animation: slideUp .25s ease; }
.resume-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.resume-modal-header h3 { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
.resume-modal-header h3 i { color: var(--primary); }
.modal-close { width: 32px; height: 32px; border: none; background: #f3f4f6; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 14px; transition: all var(--tr); }
.modal-close:hover { background: #fee2e2; color: #dc2626; }
.resume-modal-body { padding: 20px 24px; }
.resume-profile { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.resume-avatar { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; font-size: 22px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
.resume-basic { flex: 1; }
.resume-basic h4 { font-size: 18px; font-weight: 800; color: var(--text-primary); }
.resume-basic p { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
.resume-score { font-size: 24px; font-weight: 800; }
.resume-score.A { color: #059669; }
.resume-score.B { color: #d97706; }
.resume-score.C { color: #6b7280; }
.resume-section { margin-bottom: 18px; }
.resume-section h5 { font-size: 13px; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: .5px; }
.resume-section p { font-size: 13px; color: var(--text-primary); line-height: 1.6; }
.resume-skills { display: flex; flex-wrap: wrap; gap: 6px; }
.resume-skills .skill { font-size: 12px; padding: 3px 10px; }
.work-item { padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.work-item:last-child { border-bottom: none; }
.work-company { font-size: 14px; font-weight: 700; color: var(--text-primary); }
.work-title { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.work-desc { font-size: 13px; color: var(--text-secondary); margin-top: 6px; line-height: 1.5; }
.resume-summary { font-size: 13px; color: var(--text-secondary); line-height: 1.6; background: #f9fafb; padding: 12px; border-radius: var(--radius-sm); }
.resume-modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

/* 平台配置弹窗 */
.platform-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn .2s ease; }
.platform-modal { background: #fff; border-radius: var(--radius-lg); width: 520px; max-height: 80vh; overflow-y: auto; box-shadow: var(--shadow-lg); animation: slideUp .25s ease; }
.platform-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.platform-modal-header h3 { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
.platform-modal-header h3 i { color: var(--primary); }
.platform-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }
.platform-modal-body { padding: 20px 24px; }
.platform-list { display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto; margin-bottom: 16px; }
.platform-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; }
.platform-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.platform-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; flex-shrink: 0; }
.platform-meta { min-width: 0; }
.platform-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.platform-url { font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.platform-delete { width: 30px; height: 30px; border: none; background: none; border-radius: 6px; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all var(--tr); }
.platform-delete:hover { background: #fee2e2; color: #dc2626; }
.empty-platforms { text-align: center; padding: 24px; color: var(--text-muted); }
.empty-platforms i { font-size: 32px; margin-bottom: 8px; opacity: 0.3; }
.empty-platforms p { font-size: 12px; }
.add-platform-form { background: #f9fafb; border-radius: var(--radius); padding: 14px; }
.add-platform-form .form-row { display: flex; gap: 10px; margin-bottom: 10px; }
.add-platform-form .form-group { margin-bottom: 0; }
.add-platform-form .form-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; }
.add-platform-form .form-group input { width: 100%; padding: 7px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; font-family: inherit; background: #fff; }
.add-platform-form .form-group input:focus { outline: none; border-color: var(--primary); }
.add-platform-btn { width: 100%; padding: 8px 16px; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: inherit; transition: all var(--tr); }
.add-platform-btn:hover { background: var(--primary-dark); }
.add-platform-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.platform-modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border); }
.cancel-btn { padding: 8px 20px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-secondary); font-family: inherit; }
.save-btn { padding: 8px 20px; background: var(--primary); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-weight: 600; color: #fff; font-family: inherit; display: flex; align-items: center; gap: 6px; }
.save-btn:hover { background: var(--primary-dark); }
</style>
