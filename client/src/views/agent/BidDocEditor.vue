<template>
  <div class="editor-page">
    <div class="editor-header">
      <div class="editor-title">
        <div class="back-btn" @click="goBack"><i class="fas fa-arrow-left"></i></div>
        <div>
          <h2>{{ bidInfo.projectName || '标书文档' }} - 标书编辑</h2>
          <p>标书类型: {{ bidInfo.bidTypeName }} · 生成时间: {{ bidInfo.createTime }}</p>
        </div>
      </div>
      <div class="editor-actions">
        <button class="action-btn" @click="goToChat"><i class="fas fa-comments"></i> AI对话</button>
        <button class="action-btn" @click="copyContent"><i class="fas fa-copy"></i> 复制</button>
        <button class="action-btn" @click="download"><i class="fas fa-download"></i> 下载</button>
        <button class="action-btn primary" @click="saveBidDoc"><i class="fas fa-save"></i> 保存标书</button>
      </div>
    </div>

    <div class="editor-content">
      <div class="section-panel">
        <h3 class="panel-title"><i class="fas fa-list-ul"></i> 标书目录</h3>
        <div class="section-nav">
          <div v-for="(sec, i) in sections" :key="i" class="section-nav-item" :class="{ active: activeSection === i }" @click="activeSection = i">
            <span class="sec-num">{{ i + 1 }}</span>
            <span class="sec-name">{{ sec.title }}</span>
            <i v-if="sec.edited" class="fas fa-circle edited-dot"></i>
          </div>
        </div>
      </div>
      <div class="editor-main">
        <div v-if="sections[activeSection]" class="editor-section">
          <div class="section-header">
            <div class="section-title-row">
              <h3>{{ sections[activeSection].title }}</h3>
              <div class="section-tools">
                <button class="tool-btn" @click="aiPolishSection" title="AI润色"><i class="fas fa-magic"></i> AI润色</button>
                <button class="tool-btn" @click="regenerateSection" title="重新生成"><i class="fas fa-sync-alt"></i> 重新生成</button>
                <button class="tool-btn danger" @click="removeSection" title="删除章节" v-if="sections.length > 1"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            <p class="section-desc">{{ sections[activeSection].description }}</p>
          </div>
          <div class="editor-textarea-wrap">
            <textarea class="editor-textarea" v-model="sections[activeSection].content" @input="markEdited" rows="20" placeholder="在此编辑标书内容..."></textarea>
          </div>
          <div class="section-footer">
            <span class="word-count">{{ sections[activeSection].content.length }} 字</span>
            <button class="add-section-btn" @click="addNewSection"><i class="fas fa-plus"></i> 添加章节</button>
          </div>
        </div>
      </div>
      <div class="preview-panel">
        <h3 class="panel-title"><i class="fas fa-eye"></i> 实时预览</h3>
        <div class="preview-content" ref="previewRef">
          <div v-for="(sec, i) in sections" :key="i" class="preview-section" :class="{ active: activeSection === i }" @click="activeSection = i">
            <h4>{{ i + 1 }}. {{ sec.title }}</h4>
            <div class="preview-text" v-html="renderPreview(sec.content)"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const activeSection = ref(0)

const bidInfo = reactive({
  projectName: '',
  bidType: 'tech',
  bidTypeName: '技术标书',
  company: '',
  createTime: '',
  extra: ''
})

const sections = ref([])

const defaultSections = [
  { title: '投标函', description: '投标承诺书与报价声明', content: '', edited: false },
  { title: '法定代表人授权书', description: '法定代表人身份证明与授权委托书', content: '', edited: false },
  { title: '投标人基本情况', description: '企业资质、组织架构与人员配置', content: '', edited: false },
  { title: '商务响应表', description: '对招标文件商务条款的逐条响应', content: '', edited: false },
  { title: '技术方案', description: '技术架构、实施方案与技术保障', content: '', edited: false },
  { title: '项目管理方案', description: '项目组织、进度计划与质量保障', content: '', edited: false },
  { title: '售后服务方案', description: '售后服务承诺与运维保障', content: '', edited: false },
  { title: '业绩证明材料', description: '类似项目业绩与案例介绍', content: '', edited: false },
  { title: '报价明细', description: '详细报价清单与费用说明', content: '', edited: false }
]

const demoContents = {
  '投标函': (b) => `致：${b.projectName || '招标人'}\n\n我方已仔细阅读了${b.projectName || '本项目'}的招标文件，决定参加该项目的投标。我方愿意按照招标文件的要求承担本项目的实施任务，并郑重承诺：\n\n1. 我方投标报价为：${b.budget || '详见报价明细'}\n2. 我方承诺严格按照招标文件的要求履行合同义务\n3. 我方承诺在投标有效期内不撤销投标文件\n4. 我方承诺遵守国家法律法规和行业规范\n\n特此函告。`,
  '法定代表人授权书': (b) => `## 法定代表人身份证明\n\n单位名称：${b.company || '投标单位'}\n单位性质：\n地址：\n成立时间：\n经营期限：\n姓名：  性别：  年龄：  职务：\n系${b.company || '投标单位'}的法定代表人。\n\n特此证明。\n\n## 授权委托书\n\n本人（姓名）系（投标人名称）的法定代表人，现委托（姓名）为我方代理人。代理人根据授权，以我方名义签署、递交、撤回、修改${b.projectName || '本项目'}投标文件和处理有关事宜，其法律后果由我方承担。`,
  '投标人基本情况': (b) => `## 企业概况\n\n企业名称：${b.company || '投标单位'}\n注册地址：\n注册资本：\n成立日期：\n统一社会信用代码：\n\n## 资质证书\n\n| 证书名称 | 证书编号 | 有效期 |\n|----------|----------|--------|\n| - | - | - |\n\n## 组织架构\n\n公司设有技术部、市场部、项目管理部、质量管理部等部门，拥有一支经验丰富的专业团队。\n\n## 人员配置\n\n拟派项目经理及核心技术人员名单如下：\n\n| 姓名 | 职务 | 职称 | 从业年限 |\n|------|------|------|----------|\n| - | - | - | - |`,
  '商务响应表': (b) => `## 商务条款响应表\n\n| 序号 | 招标文件条款 | 投标文件响应 | 响应情况 |\n|------|------------|------------|---------|\n| 1 | 投标有效期 | 90天 | 完全响应 |\n| 2 | 工期要求 | 按招标文件要求 | 完全响应 |\n| 3 | 质量要求 | 达到合格标准 | 完全响应 |\n| 4 | 付款方式 | 按招标文件要求 | 完全响应 |\n| 5 | 质保期 | 按招标文件要求 | 完全响应 |\n\n## 偏离说明\n\n无偏离。`,
  '技术方案': (b) => `## 技术架构设计\n\n本项目采用先进、成熟的技术架构，确保系统的稳定性、可扩展性和安全性。\n\n## 技术选型\n\n- 前端框架：Vue.js 3 / React 18\n- 后端框架：Spring Boot 3 / Node.js\n- 数据库：MySQL 8.0 / PostgreSQL 15\n- 缓存：Redis 7\n- 消息队列：RabbitMQ / Kafka\n\n## 实施方案\n\n1. 需求调研与分析\n2. 系统设计与原型确认\n3. 核心功能开发\n4. 系统集成与测试\n5. 部署上线与培训\n\n## 技术保障\n\n- 7×24小时技术支持\n- 定期系统巡检\n- 紧急故障响应\n- 版本升级服务`,
  '项目管理方案': (b) => `## 项目组织架构\n\n成立专项项目组，设项目经理1名，负责项目整体协调与管理。\n\n## 进度计划\n\n| 阶段 | 工作内容 | 工期 |\n|------|---------|------|\n| 一 | 需求调研与方案设计 | 2周 |\n| 二 | 系统开发与测试 | 6周 |\n| 三 | 集成部署与验收 | 2周 |\n| 四 | 培训与上线 | 1周 |\n\n## 质量保障\n\n- 建立质量管理体系\n- 实施代码审查制度\n- 执行全面测试策略\n- 定期质量评审会议`,
  '售后服务方案': (b) => `## 服务承诺\n\n1. 提供不少于1年的免费质保期\n2. 7×24小时技术支持热线\n3. 故障响应时间：一般问题2小时，紧急问题30分钟\n4. 定期系统巡检与维护\n\n## 培训计划\n\n| 培训对象 | 培训内容 | 培训时长 |\n|----------|---------|---------|\n| 系统管理员 | 系统运维管理 | 2天 |\n| 业务用户 | 系统操作使用 | 1天 |\n| 技术人员 | 技术架构与二次开发 | 3天 |\n\n## 运维体系\n\n- 远程监控与诊断\n- 定期健康检查\n- 知识库与文档维护\n- 版本管理与升级`,
  '业绩证明材料': (b) => `## 类似项目业绩\n\n| 序号 | 项目名称 | 客户名称 | 合同金额 | 完成时间 |\n|------|---------|---------|---------|---------|\n| 1 | - | - | - | - |\n| 2 | - | - | - | - |\n| 3 | - | - | - | - |\n\n## 客户评价\n\n（此处附客户评价或验收报告）\n\n## 典型案例介绍\n\n### 案例一\n项目名称：\n项目内容：\n实施效果：\n\n### 案例二\n项目名称：\n项目内容：\n实施效果：`,
  '报价明细': (b) => `## 投标报价汇总表\n\n| 序号 | 费用项目 | 金额(元) | 备注 |\n|------|---------|---------|------|\n| 1 | 软件系统开发费 | - | 含需求分析、设计、开发、测试 |\n| 2 | 硬件设备采购费 | - | 服务器、存储、网络设备 |\n| 3 | 实施服务费 | - | 部署、数据迁移、培训 |\n| 4 | 年度运维费 | - | 首年运维支持 |\n| 5 | 税金 | - | 按国家规定 |\n| | 合计 | - | |\n\n## 报价说明\n\n1. 本报价为含税价\n2. 报价有效期：90天\n3. 最终报价以合同为准\n\n${b.extra ? '## 特殊说明\n\n' + b.extra : ''}`
}

function generateContent(title, b) {
  const fn = demoContents[title]
  if (fn) return fn(b)
  return `## ${title}\n\n（此处为标书${title}部分，请根据实际情况编辑完善。）\n\n项目名称：${b.projectName || '待填写'}\n投标单位：${b.company || '待填写'}`
}

function renderPreview(text) {
  if (!text) return '<p style="color:#9ca3af;font-size:12px;">暂无内容...</p>'
  return text
    .replace(/^## (.*$)/gm, '<h5>$1</h5>')
    .replace(/^### (.*$)/gm, '<h6>$1</h6>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\d+\.\s+(.*$)/gm, '<li>$1</li>')
    .replace(/^-\s+(.*$)/gm, '<li>$1</li>')
    .replace(/\n/g, '<br>')
}

onMounted(() => {
  const saved = route.query.data
  if (saved) {
    try {
      const data = JSON.parse(decodeURIComponent(saved))
      Object.assign(bidInfo, data.bidInfo || {})
      if (data.sections) {
        sections.value = data.sections
      } else {
        initSections()
      }
    } catch (e) {
      initSections()
    }
  } else {
    initSections()
  }
})

function initSections() {
  sections.value = defaultSections.map(s => ({
    ...s,
    content: generateContent(s.title, bidInfo)
  }))
}

function markEdited() {
  if (sections.value[activeSection.value]) {
    sections.value[activeSection.value].edited = true
  }
}

function addNewSection() {
  sections.value.push({
    title: '新建章节',
    description: '请添加章节描述',
    content: '',
    edited: true
  })
  activeSection.value = sections.value.length - 1
}

function removeSection() {
  if (sections.value.length <= 1) return
  sections.value.splice(activeSection.value, 1)
  activeSection.value = Math.max(0, activeSection.value - 1)
}

function aiPolishSection() {
  const sec = sections.value[activeSection.value]
  if (!sec.content.trim()) {
    appStore.showModal('提示', '请先输入章节内容', 'warning')
    return
  }
  appStore.showModal('AI润色', `正在对"${sec.title}"进行智能润色...`, 'success')
  setTimeout(() => {
    sec.content = sec.content + '\n\n[AI已润色：优化了语句表达，增强了专业性和规范性。]'
    sec.edited = true
  }, 800)
}

function regenerateSection() {
  const sec = sections.value[activeSection.value]
  appStore.showModal('重新生成', `正在为"${sec.title}"重新生成内容...`, 'info')
  setTimeout(() => {
    sec.content = generateContent(sec.title, bidInfo)
    sec.edited = true
  }, 1000)
}

function saveBidDoc() {
  // 保存标书到 localStorage 历史记录
  const historyRecord = {
    id: Date.now(),
    name: bidInfo.projectName || '未命名标书',
    bidType: bidInfo.bidType,
    bidTypeName: bidInfo.bidTypeName,
    company: bidInfo.company,
    sections: sections.value.map(s => ({ title: s.title, content: s.content })),
    time: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString()
  }

  let history = []
  try {
    const saved = localStorage.getItem('bid_doc_history')
    if (saved) history = JSON.parse(saved)
  } catch (e) { /* ignore */ }

  history.unshift(historyRecord)
  if (history.length > 20) history = history.slice(0, 20)
  localStorage.setItem('bid_doc_history', JSON.stringify(history))
  // 同步到服务器缓存
  syncToServer('bid_doc_history', history)

  appStore.showModal('保存成功', '标书已保存到工作台', 'success')
}

// 同步数据到服务器
async function syncToServer(key, data) {
  try {
    await fetch(`/api/cache/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  } catch (e) { /* 静默失败 */ }
}

function goBack() {
  router.push('/agent/bid-workbench')
}

function goToChat() {
  router.push({ path: '/chat/bid-matching', query: { from: 'editor', type: 'bid-matching' } })
}

function copyContent() {
  const fullText = sections.value.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n---\n\n')
  navigator.clipboard.writeText(fullText)
  appStore.showModal('复制成功', '标书全文已复制到剪贴板', 'success')
}

function download() {
  appStore.showModal('下载标书', '文档导出功能开发中，即将支持 PDF / Word 格式', 'info')
}
</script>

<style scoped>
.editor-page { padding: 24px; height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
.editor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0; }
.editor-title { display: flex; align-items: center; gap: 16px; }
.back-btn { width: 40px; height: 40px; border-radius: 10px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary); transition: all var(--tr); border: none; }
.back-btn:hover { background: var(--primary); color: #fff; }
.editor-title h2 { font-size: 18px; font-weight: 800; color: var(--text-primary); }
.editor-title p { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.editor-actions { display: flex; gap: 10px; }
.action-btn { padding: 8px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; font-family: inherit; background: var(--bg-white); color: var(--text-secondary); transition: all var(--tr); }
.action-btn:hover { border-color: var(--primary); color: var(--primary); }
.action-btn.primary { background: var(--primary); color: #fff; border-color: var(--primary); }
.action-btn.primary:hover { background: var(--primary-dark); }

.editor-content { display: grid; grid-template-columns: 200px 1fr 320px; gap: 16px; flex: 1; min-height: 0; }

.panel-title { font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.panel-title i { color: var(--primary); width: 16px; }

.section-panel { background: var(--bg-white); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; overflow-y: auto; }
.section-nav { display: flex; flex-direction: column; gap: 4px; }
.section-nav-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: all var(--tr); font-size: 12px; }
.section-nav-item:hover { background: #f3f4f6; }
.section-nav-item.active { background: linear-gradient(135deg, rgba(99,102,241,.1), rgba(139,92,246,.1)); border: 1px solid rgba(99,102,241,.2); }
.sec-num { width: 20px; height: 20px; border-radius: 6px; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
.section-nav-item.active .sec-num { background: var(--primary); color: #fff; }
.sec-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.edited-dot { font-size: 6px; color: var(--primary); }

.editor-main { background: var(--bg-white); border: 1px solid var(--border); border-radius: var(--radius); display: flex; flex-direction: column; overflow: hidden; }
.editor-section { display: flex; flex-direction: column; height: 100%; }
.section-header { padding: 16px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.section-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.section-title-row h3 { font-size: 16px; font-weight: 700; color: var(--text-primary); }
.section-tools { display: flex; gap: 6px; }
.tool-btn { padding: 5px 12px; font-size: 11px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; font-family: inherit; transition: all var(--tr); }
.tool-btn:hover { background: #eef2ff; border-color: var(--primary); color: var(--primary); }
.tool-btn.danger:hover { background: #fee2e2; border-color: #dc2626; color: #dc2626; }
.section-desc { font-size: 12px; color: var(--text-muted); }
.editor-textarea-wrap { flex: 1; padding: 16px 20px; overflow-y: auto; min-height: 0; }
.editor-textarea { width: 100%; height: 100%; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.8; font-family: inherit; resize: none; background: #fafafa; transition: all var(--tr); }
.editor-textarea:focus { outline: none; border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.section-footer { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; border-top: 1px solid var(--border); font-size: 12px; color: var(--text-muted); flex-shrink: 0; }
.add-section-btn { padding: 5px 12px; font-size: 11px; background: #eef2ff; border: 1px solid var(--primary); border-radius: 6px; cursor: pointer; color: var(--primary); display: flex; align-items: center; gap: 4px; font-family: inherit; transition: all var(--tr); }
.add-section-btn:hover { background: var(--primary); color: #fff; }

.preview-panel { background: var(--bg-white); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; overflow-y: auto; }
.preview-content { display: flex; flex-direction: column; gap: 16px; }
.preview-section { padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all var(--tr); }
.preview-section:hover { border-color: var(--primary); }
.preview-section.active { border-color: var(--primary); background: linear-gradient(135deg, rgba(99,102,241,.05), rgba(139,92,246,.05)); }
.preview-section h4 { font-size: 12px; font-weight: 700; color: var(--primary); margin-bottom: 8px; }
.preview-text { font-size: 11px; line-height: 1.7; color: var(--text-secondary); max-height: 120px; overflow: hidden; }
.preview-text :deep(h5) { font-size: 11px; font-weight: 700; margin: 6px 0 4px; color: var(--text-primary); }
.preview-text :deep(h6) { font-size: 10px; font-weight: 600; margin: 4px 0 2px; color: var(--text-muted); }
.preview-text :deep(strong) { font-weight: 700; }
.preview-text :deep(li) { margin-left: 12px; margin-bottom: 2px; }
</style>
