<template>
  <div class="agent-page">
    <div class="agent-header">
      <div class="agent-title">
        <div class="agent-icon bid"><i class="fas fa-search-dollar"></i></div>
        <div>
          <h2>招投标匹配Agent</h2>
          <p>配置企业信息，自动匹配全网公开招标项目，AI辅助标书制作与查重</p>
        </div>
      </div>
      <div class="agent-actions">
        <button class="action-btn" @click="goToWorkbench"><i class="fas fa-chart-bar"></i> 业务概览</button>
        <button class="action-btn primary" @click="startMatch"><i class="fas fa-search"></i> 智能匹配</button>
        <!-- 招标平台配置 -->
        <div class="platform-config-wrapper">
          <button class="action-btn" @click="showPlatformConfig = !showPlatformConfig">
            <i class="fas fa-cog"></i> 平台配置
          </button>
          <div v-if="showPlatformConfig" class="platform-dropdown" @click.stop>
            <div class="platform-header">
              <span>招标平台配置</span>
              <button @click="showPlatformConfig = false"><i class="fas fa-times"></i></button>
            </div>
            <!-- 搜索/添加栏 -->
            <div class="platform-search-bar">
              <button class="platform-add-btn" @click="openAddPlatform">
                <i class="fas fa-plus"></i> 添加平台
              </button>
            </div>
            <!-- 平台列表 -->
            <div class="platform-list">
              <div v-for="p in platforms" :key="p.id" class="platform-item">
                <label class="platform-check">
                  <input type="checkbox" v-model="p.selected" @change="autoSavePlatforms">
                  <div class="platform-info">
                    <span class="platform-name">{{ p.name }}</span>
                    <span class="platform-url" v-if="p.url">{{ p.url }}</span>
                  </div>
                </label>
                <span class="platform-tag" :class="{ custom: p.custom }">{{ p.custom ? '自定义' : p.tag }}</span>
                <div class="platform-actions" v-if="p.custom">
                  <button class="platform-edit-btn" @click="editPlatform(p)" title="编辑"><i class="fas fa-pen"></i></button>
                  <button class="platform-del-btn" @click="deletePlatform(p)" title="删除"><i class="fas fa-trash"></i></button>
                </div>
              </div>
            </div>
            <div class="platform-footer">
              <span>已选 {{ platforms.filter(p => p.selected).length }} 个平台</span>
              <button class="platform-save-btn" @click="savePlatformConfig">确认</button>
            </div>

            <!-- 添加/编辑平台弹窗 -->
            <div v-if="showPlatformEdit" class="platform-edit-overlay" @click.self="showPlatformEdit = false">
              <div class="platform-edit-panel" @click.stop>
                <h4><i class="fas" :class="editingPlatform ? 'fa-pen' : 'fa-plus-circle'"></i> {{ editingPlatform ? '编辑平台' : '添加平台' }}</h4>
                <div class="form-group">
                  <label>平台名称</label>
                  <input v-model="platformForm.name" placeholder="输入平台名称" type="text">
                </div>
                <div class="form-group">
                  <label>平台网址（选填）</label>
                  <input v-model="platformForm.url" placeholder="https://example.com" type="text">
                </div>
                <div class="form-group">
                  <label>平台标签</label>
                  <input v-model="platformForm.tag" placeholder="自定义标签" type="text">
                </div>
                <div class="platform-edit-footer">
                  <button class="action-btn" @click="showPlatformEdit = false">取消</button>
                  <button class="action-btn primary" @click="savePlatform">{{ editingPlatform ? '保存修改' : '添加' }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="agent-content">
      <!-- 左侧：企业配置 + AI工具 -->
      <div class="input-section">
        <!-- 企业资质配置 -->
        <div class="section-card">
          <h3><i class="fas fa-certificate"></i> 企业资质配置</h3>
          <div class="form-row">
            <div class="form-group">
              <label>企业名称</label>
              <input v-model="company.name" type="text" placeholder="输入企业全称">
            </div>
            <div class="form-group">
              <label>统一社会信用代码</label>
              <input v-model="company.creditCode" type="text" placeholder="18位统一社会信用代码">
            </div>
          </div>
          <div class="form-group">
            <label>资质证书</label>
            <div class="tags-input">
              <span v-for="(cert, i) in company.certifications" :key="i" class="tag">
                {{ cert }} <button @click="company.certifications.splice(i, 1)"><i class="fas fa-times"></i></button>
              </span>
              <input v-model="newCert" @keydown.enter.prevent="addCert" placeholder="输入资质证书回车添加">
            </div>
            <div class="quick-certs">
              <button v-for="cert in quickCerts" :key="cert" @click="addQuickCert(cert)">{{ cert }}</button>
            </div>
          </div>
          <!-- 资料上传入口 -->
          <div class="form-group">
            <label>资质资料上传</label>
            <div class="cert-upload-zone" @click="triggerCertUpload" @drop.prevent="handleCertDrop" @dragover.prevent>
              <i class="fas fa-cloud-upload-alt"></i>
              <p>拖拽或点击上传资质资料</p>
              <span>支持 .pdf, .jpg, .png 格式，支持OCR自动识别</span>
              <input type="file" ref="certFileInput" @change="handleCertFile" hidden accept=".pdf,.jpg,.jpeg,.png" multiple>
            </div>
            <div v-if="uploadedCertFiles.length" class="uploaded-files">
              <div v-for="(f, i) in uploadedCertFiles" :key="i" class="uploaded-file-item">
                <i class="fas fa-file-alt"></i>
                <div class="file-info">
                  <span class="file-name">{{ f.name }}</span>
                  <span class="file-status" :class="f.status">
                    {{ f.status === 'ocr-done' ? 'OCR识别完成' : f.status === 'ocr-ing' ? '识别中...' : '待识别' }}
                  </span>
                </div>
                <button @click="uploadedCertFiles.splice(i, 1)"><i class="fas fa-times"></i></button>
              </div>
            </div>
            <button v-if="uploadedCertFiles.some(f => f.status === 'ready')" class="ocr-btn" @click="startOCR">
              <i class="fas fa-magic"></i> 开始OCR识别
            </button>
          </div>
        </div>

        <!-- 产品资料配置 -->
        <div class="section-card">
          <h3><i class="fas fa-box"></i> 产品与服务</h3>
          <div class="form-group">
            <label>主营产品/服务</label>
            <div class="tags-input">
              <span v-for="(prod, i) in products.items" :key="i" class="tag">
                {{ prod }} <button @click="products.items.splice(i, 1)"><i class="fas fa-times"></i></button>
              </span>
              <input v-model="newProduct" @keydown.enter.prevent="addProduct" placeholder="输入产品/服务回车添加">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>行业领域</label>
              <select v-model="products.industry">
                <option value="it">信息技术</option>
                <option value="construction">建筑工程</option>
                <option value="medical">医疗卫生</option>
                <option value="education">教育培训</option>
                <option value="finance">金融服务</option>
                <option value="manufacturing">智能制造</option>
              </select>
            </div>
            <div class="form-group">
              <label>目标区域</label>
              <select v-model="products.region">
                <option value="nationwide">全国</option>
                <option value="beijing">北京</option>
                <option value="shanghai">上海</option>
                <option value="guangzhou">广州</option>
                <option value="shenzhen">深圳</option>
                <option value="other">其他地区</option>
              </select>
            </div>
          </div>
        </div>

        <!-- AI标书工具 - 始终显示 -->
        <div class="section-card tools-card">
          <h3><i class="fas fa-tools"></i> AI标书工具</h3>
          <div class="tool-grid">
            <div class="tool-item" @click="openBidMaker">
              <div class="tool-icon" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
                <i class="fas fa-file-alt"></i>
              </div>
              <div class="tool-body">
                <div class="tool-name">AI标书制作</div>
                <div class="tool-desc">根据招标要求自动生成专业标书，支持多种格式模板</div>
              </div>
              <i class="fas fa-chevron-right tool-arrow"></i>
            </div>
            <div class="tool-item" @click="openBidChecker">
              <div class="tool-icon" style="background: linear-gradient(135deg, #059669, #10b981)">
                <i class="fas fa-check-double"></i>
              </div>
              <div class="tool-body">
                <div class="tool-name">AI标书查重</div>
                <div class="tool-desc">智能检测标书内容重复率，优化表述，规避废标风险</div>
              </div>
              <i class="fas fa-chevron-right tool-arrow"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：匹配结果 -->
      <div class="result-section">
        <div class="section-card">
          <div class="result-header">
            <h3><i class="fas fa-chart-line"></i> 匹配结果</h3>
            <span v-if="results.length" class="result-count">{{ results.length }} 条匹配</span>
          </div>
          <div v-if="!results.length && !isMatching" class="empty-state">
            <div class="empty-state-inner">
              <i class="fas fa-inbox"></i>
              <p>配置企业资质信息后，系统将自动抓取全网公开招标信息进行智能匹配</p>
              <p class="empty-hint">支持的招标平台：政府采购网、公共资源交易中心、企业招标平台等</p>
            </div>
          </div>
          <div v-if="isMatching" class="matching-state">
            <div class="matching-state-inner">
              <div class="matching-spinner"><i class="fas fa-spinner fa-spin"></i></div>
              <p>正在全网抓取招标信息...</p>
              <span>AI正在分析{{ company.name }}与公开招标项目的匹配度</span>
            </div>
          </div>
          <div v-if="results.length" class="result-list">
            <div v-for="r in results" :key="r.id" class="result-item">
              <div class="ri-header">
                <span class="ri-source">{{ r.source }}</span>
                <span class="ri-pubtime">{{ r.publishTime }}</span>
              </div>
              <div class="ri-title" @click="viewDetail(r)">{{ r.title }}</div>
              <div class="ri-region">{{ r.region }}</div>
              <div class="ri-badges">
                <span class="ri-match">匹配度 <strong>{{ r.score }}</strong></span>
                <span class="ri-status" :class="r.status">{{ r.statusLabel }}</span>
                <span class="ri-type">{{ r.bidType }}</span>
                <span class="ri-amount">{{ r.amount }}</span>
              </div>
              <div class="ri-details">
                <div class="ri-detail-row"><label>文件费:</label><span>{{ r.fileFee }}</span></div>
                <div class="ri-detail-row"><label>采购单位</label><span>{{ r.procurementUnit }}</span></div>
                <div class="ri-detail-row"><label>文件截止时间</label><span>{{ r.fileDeadline }}</span></div>
                <div class="ri-detail-row"><label>投标截止时间</label><span>{{ r.bidDeadline }}</span></div>
              </div>
              <div class="ri-keywords">
                <span v-for="tag in r.tags" :key="tag" class="keyword-tag">{{ tag }}</span>
              </div>
              <div class="ri-actions">
                <button class="ri-action-btn" @click="viewReport(r)">查询报告</button>
                <button class="ri-action-btn primary" @click="viewDetail(r)">查看详情</button>
                <button class="ri-action-btn danger" @click="deleteResult(r)">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目详情弹窗 -->
    <div class="project-modal-overlay" v-if="showProjectModal" @click.self="closeProjectModal">
      <div class="project-modal">
        <div class="project-modal-header">
          <h3>商机详情</h3>
          <button class="modal-close" @click="closeProjectModal"><i class="fas fa-times"></i></button>
        </div>
        <div class="project-modal-body" v-if="selectedProject">
          <div class="project-status-tags">
            <span class="status-tag new">新发布</span>
            <span class="status-tag contact">待联系</span>
          </div>
          <div class="project-title-row">
            <h2>{{ selectedProject.title }}</h2>
            <div class="match-ring">
              <span class="match-score">{{ selectedProject.score }}</span>
              <span class="match-label">匹配度</span>
            </div>
          </div>
          <div class="project-info-grid">
            <div class="info-cell"><label>招标单位</label><p>{{ selectedProject.company }}</p></div>
            <div class="info-cell"><label>预算金额</label><p>{{ selectedProject.budget }}</p></div>
            <div class="info-cell"><label>所在地区</label><p>{{ selectedProject.region }}</p></div>
            <div class="info-cell"><label>发布时间</label><p>2026-04-18</p></div>
            <div class="info-cell"><label>截止日期</label><p>{{ selectedProject.deadline }}</p></div>
            <div class="info-cell"><label>当前阶段</label><p>立项决策</p></div>
          </div>
          <div class="project-requirements">
            <h4><i class="fas fa-star"></i> 投标要求</h4>
            <div class="req-list">
              <div class="req-item"><i class="fas fa-check"></i> 具备相关资质证书与行业认证</div>
              <div class="req-item"><i class="fas fa-check"></i> 近三年类似项目业绩不少于3个</div>
              <div class="req-item"><i class="fas fa-check"></i> 注册资金不低于500万元</div>
            </div>
          </div>
        </div>
        <div class="project-modal-footer">
          <button class="action-btn primary" @click="enterProcess"><i class="fas fa-clipboard-list"></i> 进入流程</button>
          <button class="action-btn" @click="addToWorkbench"><i class="fas fa-plus"></i> 加入工作台</button>
          <button class="action-btn" @click="closeProjectModal">关闭</button>
        </div>
      </div>
    </div>

    <!-- 查询报告弹窗 -->
    <div class="report-modal-overlay" v-if="showReportModal" @click.self="showReportModal=false">
      <div class="report-modal">
        <div class="report-modal-header">
          <h3><i class="fas fa-chart-bar"></i> 招标分析报告</h3>
          <button class="modal-close" @click="showReportModal=false"><i class="fas fa-times"></i></button>
        </div>
        <div class="report-modal-body" v-if="reportData">
          <!-- 报告概览 -->
          <div class="report-overview">
            <div class="report-title">{{ reportData.project.title }}</div>
            <div class="report-meta">
              <span><i class="fas fa-clock"></i> 生成时间：{{ reportData.generatedAt }}</span>
              <span><i class="fas fa-building"></i> 采购单位：{{ reportData.project.procurementUnit }}</span>
            </div>
            <div class="report-summary-grid">
              <div class="summary-card">
                <div class="summary-label">匹配度</div>
                <div class="summary-value" :style="{ color: reportData.summary.matchColor }">{{ reportData.project.score }}%</div>
                <div class="summary-level">{{ reportData.summary.matchLevel }}匹配</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">风险等级</div>
                <div class="summary-value risk">{{ reportData.summary.riskLevel }}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">投标建议</div>
                <div class="summary-value rec">{{ reportData.summary.recommendation }}</div>
              </div>
            </div>
          </div>

          <!-- 项目解读 -->
          <div class="report-section">
            <h4><i class="fas fa-file-alt"></i> 项目解读</h4>
            <div class="report-content">
              <p v-for="(line, i) in reportData.analysis.project解读" :key="i">{{ line }}</p>
            </div>
          </div>

          <!-- 资质匹配分析 -->
          <div class="report-section">
            <h4><i class="fas fa-check-circle"></i> 资质匹配分析</h4>
            <div class="qual-table">
              <div class="qual-row qual-header">
                <span>资质项</span><span>状态</span><span>说明</span>
              </div>
              <div v-for="q in reportData.analysis.资质匹配" :key="q.item" class="qual-row">
                <span>{{ q.item }}</span>
                <span class="qual-status" :class="q.status === '满足' ? 'pass' : q.status === '部分满足' ? 'partial' : 'fail'">{{ q.status }}</span>
                <span>{{ q.detail }}</span>
              </div>
            </div>
          </div>

          <!-- 竞争分析 -->
          <div class="report-section">
            <h4><i class="fas fa-users"></i> 竞争分析</h4>
            <div class="compete-grid">
              <div class="compete-item">
                <div class="compete-label">预估竞争者</div>
                <div class="compete-value">{{ reportData.analysis.竞争分析.estimatedCompetitors }} 家</div>
              </div>
              <div class="compete-item">
                <div class="compete-label">中标概率</div>
                <div class="compete-value win">{{ reportData.analysis.竞争分析.winProbability }}%</div>
              </div>
            </div>
            <div class="advantages-section">
              <div class="adv-title"><i class="fas fa-trophy"></i> 竞争优势</div>
              <div class="adv-list">
                <span v-for="a in reportData.analysis.竞争分析.competitiveAdvantages" :key="a" class="adv-tag">{{ a }}</span>
              </div>
            </div>
            <div v-if="reportData.analysis.竞争分析.potentialRisks.length" class="risks-section">
              <div class="risk-title"><i class="fas fa-exclamation-triangle"></i> 潜在风险</div>
              <div class="risk-list">
                <div v-for="(r, i) in reportData.analysis.竞争分析.potentialRisks" :key="i" class="risk-item">{{ r }}</div>
              </div>
            </div>
          </div>

          <!-- 投标策略 -->
          <div class="report-section">
            <h4><i class="fas fa-chess"></i> 投标策略建议</h4>
            <div class="strategy-grid">
              <div class="strategy-item">
                <div class="strategy-label"><i class="fas fa-coins"></i> 报价策略</div>
                <div class="strategy-text">{{ reportData.analysis.投标策略.报价策略 }}</div>
              </div>
              <div class="strategy-item">
                <div class="strategy-label"><i class="fas fa-cogs"></i> 技术方案</div>
                <div class="strategy-text">{{ reportData.analysis.投标策略.技术方案 }}</div>
              </div>
              <div class="strategy-item">
                <div class="strategy-label"><i class="fas fa-shield-alt"></i> 风险控制</div>
                <div class="strategy-text">{{ reportData.analysis.投标策略.风险控制 }}</div>
              </div>
            </div>
            <div class="timeline-section">
              <div class="timeline-title"><i class="fas fa-calendar-alt"></i> 时间规划</div>
              <div class="timeline-list">
                <div v-for="t in reportData.analysis.投标策略.时间规划" :key="t.phase" class="timeline-item">
                  <div class="timeline-phase">{{ t.phase }}</div>
                  <div class="timeline-deadline">{{ t.deadline }}</div>
                  <div class="timeline-status" :class="t.status === '已完成' ? 'done' : 'pending'">{{ t.status }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="report-modal-footer">
          <button class="action-btn" @click="showReportModal=false">关闭</button>
          <button class="action-btn primary" @click="sendToChat(reportData.project)"><i class="fas fa-robot"></i> AI深度分析</button>
        </div>
      </div>
    </div>

    <!-- AI标书制作弹窗 -->
    <div class="bid-modal-overlay" v-if="showBidModal" @click.self="showBidModal=false">
      <div class="bid-modal">
        <div class="bid-modal-header">
          <h3>
            <i :class="bidModalType==='make'?'fas fa-file-alt':'fas fa-check-double'"></i>
            {{ bidModalType === 'make' ? 'AI标书制作' : 'AI标书查重' }}
          </h3>
          <button class="bid-modal-close" @click="showBidModal=false"><i class="fas fa-times"></i></button>
        </div>
        <div class="bid-modal-body">
          <div v-if="bidModalType === 'make'" class="bid-make-form">
            <div class="form-group">
              <label>目标项目</label>
              <select v-model="bidMakeForm.projectName" class="project-select">
                <option value="" disabled>请选择目标项目</option>
                <option v-for="r in results" :key="r.id" :value="r.title">
                  {{ r.title }} (匹配度: {{ r.score }}%)
                </option>
                <option value="__custom__">其他项目（手动输入）</option>
              </select>
              <input v-if="bidMakeForm.projectName === '__custom__'" 
                     v-model="bidMakeForm.customProjectName" 
                     type="text" 
                     placeholder="请输入项目名称" 
                     style="margin-top: 8px">
            </div>
            <div class="form-group">
              <label>标书类型</label>
              <select v-model="bidMakeForm.bidType">
                <option value="tech">技术标书</option>
                <option value="business">商务标书</option>
                <option value="price">报价标书</option>
                <option value="full">完整标书</option>
              </select>
            </div>
            <div class="form-group">
              <label>补充要求（选填）</label>
              <textarea v-model="bidMakeForm.extra" placeholder="补充特殊要求或注意事项..." rows="3"></textarea>
            </div>
          </div>
          <div v-else class="bid-check-form">
            <div class="form-group">
              <label>上传标书文件</label>
              <div class="check-upload" @click="triggerBidUpload" @drop.prevent="handleBidDrop" @dragover.prevent>
                <i class="fas fa-cloud-upload-alt"></i>
                <p>拖拽或点击上传标书文件</p>
                <span>支持 .docx, .pdf 格式</span>
                <input type="file" ref="bidFileInput" @change="handleBidFile" hidden accept=".docx,.pdf" multiple>
              </div>
              <div v-if="bidCheckFiles.length" class="file-list">
                <div v-for="(f, i) in bidCheckFiles" :key="i" class="file-item">
                  <i class="fas fa-file-alt"></i><span>{{ f.name }}</span>
                  <button @click="bidCheckFiles.splice(i, 1)"><i class="fas fa-times"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bid-modal-footer">
          <button class="action-btn" @click="showBidModal=false">取消</button>
          <button class="action-btn primary" @click="executeBidAction">
            <i class="fas fa-magic"></i> {{ bidModalType === 'make' ? '开始生成标书' : '开始查重分析' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'

const router = useRouter()
const appStore = useAppStore()
const bidFileInput = ref(null)
const newCert = ref('')
const newProduct = ref('')
const bidCheckFiles = ref([])
const showBidModal = ref(false)
const bidModalType = ref('make')
const isMatching = ref(false)
const certFileInput = ref(null)
const uploadedCertFiles = ref([])
const showPlatformConfig = ref(false)
const showPlatformEdit = ref(false)
const editingPlatform = ref(null)
const platformForm = reactive({ name: '', url: '', tag: '' })

// 平台数据：从localStorage加载，合并默认平台
function getDefaultPlatforms() {
  return [
    { id: 1, name: '中国政府采购网', tag: '政府采购', selected: true, url: 'https://www.ccgp.gov.cn', custom: false },
    { id: 2, name: '全国公共资源交易平台', tag: '公共资源', selected: true, url: 'https://www.ggzy.gov.cn', custom: false },
    { id: 3, name: '中国招标投标公共服务平台', tag: '招标投标', selected: true, url: 'https://www.cebpubservice.com', custom: false },
    { id: 4, name: '央企采购平台', tag: '央企', selected: false, url: '', custom: false },
    { id: 5, name: '军队采购网', tag: '军队', selected: false, url: 'https://www.plap.cn', custom: false },
    { id: 6, name: '各省市政府采购网', tag: '地方', selected: true, url: '', custom: false }
  ]
}

function loadPlatforms() {
  try {
    const saved = localStorage.getItem('bid_platforms')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) { /* ignore */ }
  return getDefaultPlatforms()
}

const platforms = ref(loadPlatforms())

const company = ref({ 
  name: '某科技有限公司', 
  creditCode: '91110108MA0XXXXXXX', 
  certifications: ['ISO9001', 'CMMI3', '软件企业认证'] 
})
const products = ref({ 
  items: ['智慧政务平台', '数字化转型咨询', '信息化系统集成'], 
  industry: 'it',
  region: 'nationwide'
})
const quickCerts = ['ISO9001', 'ISO14001', 'ISO27001', 'CMMI3', 'CMMI5', '高新技术企业', '信息系统集成资质', '涉密资质']
const results = ref(loadCachedResults())

const bidMakeForm = ref({
  projectName: '',
  customProjectName: '',
  bidType: 'tech',
  extra: ''
})

// 企业资质操作
function addCert() { 
  if (newCert.value.trim() && !company.value.certifications.includes(newCert.value.trim())) { 
    company.value.certifications.push(newCert.value.trim()) 
  } 
  newCert.value = '' 
}
function addQuickCert(cert) { 
  if (!company.value.certifications.includes(cert)) company.value.certifications.push(cert) 
}
function addProduct() { 
  if (newProduct.value.trim() && !products.value.items.includes(newProduct.value.trim())) { 
    products.value.items.push(newProduct.value.trim()) 
  } 
  newProduct.value = '' 
}

// 智能匹配
function startMatch() {
  isMatching.value = true
  results.value = []
  setTimeout(() => {
    results.value = [
      { id: 1, title: '空管局内外网技术服务及设备续保应急服务、办公设备维护服务', company: 'XX市政务服务管理局', budget: '500-600万', region: '北京', score: 78, level: 'high', deadline: '2025-07-15', tags: ['运维', '维护', '动环'], source: '中国政府采购网', publishTime: '2026-05-19 10:36:00', status: 'done', statusLabel: '已完成', bidType: '公开招标公告', amount: '1225.000000 万元', fileFee: '500', procurementUnit: '中国民用航空局空中交通管理局', fileDeadline: '2026-05-26 16:00:00', bidDeadline: '2026-06-09 09:30:00' },
      { id: 2, title: '企业数字化转型咨询与实施项目', company: '某大型国有企业集团', budget: '200-300万', region: '上海', score: 88, level: 'high', deadline: '2025-06-30', tags: ['数字化转型', '咨询服务'], source: '中国政府采购网', publishTime: '2026-05-18 09:20:00', status: 'new', statusLabel: '新发现', bidType: '公开招标公告', amount: '280.000000 万元', fileFee: '300', procurementUnit: '某大型国有企业集团', fileDeadline: '2026-06-10 17:00:00', bidDeadline: '2026-06-25 10:00:00' },
      { id: 3, title: '区域医疗信息化系统升级改造', company: '某省级三甲医院', budget: '350-400万', region: '广州', score: 75, level: 'medium', deadline: '2025-08-01', tags: ['医疗信息化', '系统集成'], source: '中国政府采购网', publishTime: '2026-05-17 14:15:00', status: 'contact', statusLabel: '已联系', bidType: '竞争性磋商', amount: '380.000000 万元', fileFee: '0', procurementUnit: '某省级三甲医院', fileDeadline: '2026-06-05 16:00:00', bidDeadline: '2026-06-20 09:30:00' },
      { id: 4, title: '教育培训云平台开发项目', company: '某教育科技集团', budget: '150-200万', region: '深圳', score: 62, level: 'medium', deadline: '2025-07-20', tags: ['教育平台', '云服务'], source: '中国政府采购网', publishTime: '2026-05-16 11:00:00', status: 'making', statusLabel: '制作中', bidType: '邀请招标', amount: '180.000000 万元', fileFee: '200', procurementUnit: '某教育科技集团', fileDeadline: '2026-06-01 17:00:00', bidDeadline: '2026-06-15 10:00:00' },
      { id: 5, title: '大数据分析平台搭建项目', company: '某省级大数据局', budget: '800-1000万', region: '杭州', score: 56, level: 'low', deadline: '2025-08-15', tags: ['大数据', '数据分析'], source: '中国政府采购网', publishTime: '2026-05-15 16:30:00', status: 'bid', statusLabel: '已投标', bidType: '公开招标公告', amount: '950.000000 万元', fileFee: '800', procurementUnit: '某省级大数据局', fileDeadline: '2026-05-30 16:00:00', bidDeadline: '2026-06-10 09:30:00' }
    ]
    isMatching.value = false
    // 缓存匹配结果到localStorage
    saveResultsToCache()
    // 同步到服务器缓存
    syncResultsToServer()
    appStore.showModal('匹配完成', `已从全网公开招标平台抓取到 ${results.value.length} 条匹配信息`, 'success')
  }, 2000)
}

// 数据缓存函数
function loadCachedResults() {
  try {
    const cached = localStorage.getItem('bid_match_results')
    if (cached) return JSON.parse(cached)
  } catch (e) { /* ignore */ }
  return []
}

function saveResultsToCache() {
  try {
    localStorage.setItem('bid_match_results', JSON.stringify(results.value))
    // 同时保存企业配置
    localStorage.setItem('bid_company_config', JSON.stringify(company.value))
    localStorage.setItem('bid_products_config', JSON.stringify(products.value))
  } catch (e) { /* ignore */ }
}

function loadCachedConfig() {
  try {
    const cc = localStorage.getItem('bid_company_config')
    if (cc) company.value = { ...company.value, ...JSON.parse(cc) }
    const pc = localStorage.getItem('bid_products_config')
    if (pc) products.value = { ...products.value, ...JSON.parse(pc) }
  } catch (e) { /* ignore */ }
}

// 同步数据到服务器缓存
async function syncResultsToServer() {
  try {
    await fetch('/api/cache/bid-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        results: results.value,
        company: company.value,
        products: products.value,
        timestamp: Date.now()
      })
    })
  } catch (e) { /* 静默失败，不影响用户体验 */ }
}

// 组件挂载时加载缓存的配置
onMounted(() => {
  loadCachedConfig()
})

// AI标书工具
function openBidMaker() {
  bidModalType.value = 'make'
  showBidModal.value = true
}
function openBidChecker() {
  bidModalType.value = 'check'
  showBidModal.value = true
}
function openBidMakerWithResult(r) {
  const typeNames = { tech: '技术标书', business: '商务标书', price: '报价标书', full: '完整标书' }
  const bidData = {
    bidInfo: {
      projectName: r.title,
      bidType: 'tech',
      bidTypeName: '技术标书',
      company: company.value.name,
      createTime: new Date().toLocaleString(),
      extra: ''
    }
  }
  router.push({
    path: '/agent/bid-doc-editor',
    query: { data: encodeURIComponent(JSON.stringify(bidData)) }
  })
}

// 标书上传
function triggerBidUpload() { bidFileInput.value?.click() }
function handleBidFile(e) { bidCheckFiles.value.push(...Array.from(e.target.files)) }
function handleBidDrop(e) { bidCheckFiles.value.push(...Array.from(e.dataTransfer.files)) }

function executeBidAction() {
  if (bidModalType.value === 'make') {
    const selectedProject = bidMakeForm.value.projectName
    const customName = bidMakeForm.value.customProjectName?.trim()
    const projectName = selectedProject === '__custom__' ? customName : selectedProject
    
    if (!projectName) {
      appStore.showModal('提示', selectedProject === '__custom__' ? '请输入项目名称' : '请选择目标项目', 'warning')
      return
    }
    const typeNames = { tech: '技术标书', business: '商务标书', price: '报价标书', full: '完整标书' }
    const bidData = {
      bidInfo: {
        projectName,
        bidType: bidMakeForm.value.bidType,
        bidTypeName: typeNames[bidMakeForm.value.bidType] || '标书',
        company: company.value.name,
        createTime: new Date().toLocaleString(),
        extra: bidMakeForm.value.extra
      }
    }
    showBidModal.value = false
    bidMakeForm.value = { projectName: '', customProjectName: '', bidType: 'tech', extra: '' }
    // 跳转至标书编辑页面
    router.push({
      path: '/agent/bid-doc-editor',
      query: { data: encodeURIComponent(JSON.stringify(bidData)) }
    })
  } else {
    if (!bidCheckFiles.value.length) {
      appStore.showModal('提示', '请先上传需要查重的标书文件', 'warning')
      return
    }
    appStore.showModal('AI标书查重',
      `已提交 ${bidCheckFiles.value.length} 个文件进行查重分析...\n\n系统将检测：内容重复率、语句相似度、段落结构分析，并给出优化建议。`,
      'success'
    )
    showBidModal.value = false
    bidCheckFiles.value = []
  }
}

function goToWorkbench() {
  const data = {
    results: results.value,
    totalOpps: 746 // 商机总数（可从后端获取）
  }
  router.push({
    path: '/agent/bid-workbench',
    query: { data: encodeURIComponent(JSON.stringify(data)) }
  })
}

// 资质资料上传
function triggerCertUpload() { certFileInput.value?.click() }
function handleCertFile(e) {
  const files = Array.from(e.target.files)
  uploadedCertFiles.value.push(...files.map(f => ({ name: f.name, status: 'ready', file: f })))
}
function handleCertDrop(e) {
  const files = Array.from(e.dataTransfer.files)
  uploadedCertFiles.value.push(...files.map(f => ({ name: f.name, status: 'ready', file: f })))
}

// OCR识别
function startOCR() {
  const readyFiles = uploadedCertFiles.value.filter(f => f.status === 'ready')
  readyFiles.forEach(f => f.status = 'ocr-ing')
  // 模拟OCR识别
  setTimeout(() => {
    readyFiles.forEach(f => {
      f.status = 'ocr-done'
      // 模拟OCR结果：自动提取资质信息
      if (f.name.includes('ISO')) {
        const certName = f.name.replace(/\.(pdf|jpg|png)$/i, '')
        if (!company.value.certifications.includes(certName)) {
          company.value.certifications.push(certName)
        }
      }
    })
    appStore.showModal('OCR识别完成', `已识别 ${readyFiles.length} 个文件，资质信息已自动提取`, 'success')
  }, 2000)
}

// 平台配置
function savePlatformConfig() {
  const selected = platforms.value.filter(p => p.selected)
  savePlatformsToStorage()
  showPlatformConfig.value = false
  appStore.showModal('平台配置已保存', `已选择 ${selected.length} 个招标信息平台：${selected.map(p => p.name).join('、')}`, 'success')
}

function savePlatformsToStorage() {
  localStorage.setItem('bid_platforms', JSON.stringify(platforms.value))
}

function autoSavePlatforms() {
  savePlatformsToStorage()
}

function openAddPlatform() {
  editingPlatform.value = null
  platformForm.name = ''
  platformForm.url = ''
  platformForm.tag = ''
  showPlatformEdit.value = true
}

function editPlatform(p) {
  editingPlatform.value = p
  platformForm.name = p.name
  platformForm.url = p.url || ''
  platformForm.tag = p.tag
  showPlatformEdit.value = true
}

function savePlatform() {
  if (!platformForm.name.trim()) {
    appStore.showModal('提示', '请输入平台名称', 'warning')
    return
  }

  if (editingPlatform.value) {
    // 编辑
    editingPlatform.value.name = platformForm.name.trim()
    editingPlatform.value.url = platformForm.url.trim()
    editingPlatform.value.tag = platformForm.tag.trim() || '自定义'
  } else {
    // 新增
    const maxId = Math.max(0, ...platforms.value.map(p => p.id))
    platforms.value.push({
      id: maxId + 1,
      name: platformForm.name.trim(),
      url: platformForm.url.trim(),
      tag: platformForm.tag.trim() || '自定义',
      selected: true,
      custom: true
    })
  }

  const isEdit = !!editingPlatform.value
  savePlatformsToStorage()
  showPlatformEdit.value = false
  editingPlatform.value = null

  appStore.showModal(
    isEdit ? '平台已更新' : '平台已添加',
    `平台"${platformForm.name.trim()}"已保存`,
    'success'
  )
}

function deletePlatform(p) {
  if (confirm(`确定要删除平台"${p.name}"吗？`)) {
    const idx = platforms.value.findIndex(x => x.id === p.id)
    if (idx > -1) {
      platforms.value.splice(idx, 1)
      savePlatformsToStorage()
      appStore.showModal('平台已删除', `已删除平台"${p.name}"`, 'info')
    }
  }
}
const showProjectModal = ref(false)
const selectedProject = ref(null)

function viewDetail(r) {
  selectedProject.value = r
  showProjectModal.value = true
}

function closeProjectModal() {
  showProjectModal.value = false
  selectedProject.value = null
}

function enterProcess() {
  appStore.showModal('进入流程', `已进入"${selectedProject.value.title}"的投标流程`, 'success')
  showProjectModal.value = false
}

function addToWorkbench() {
  if (!selectedProject.value) return
  const p = selectedProject.value
  // 将商机作为高优先级任务添加到工作台
  appStore.addSharedTask({
    title: `【招投标】${p.title}`,
    priority: p.score >= 80 ? 'high' : p.score >= 60 ? 'medium' : 'low',
    deadline: p.deadline || '待定',
    agent: '招投标匹配'
  })
  // 同时添加一个日程提醒
  appStore.addSharedSchedule({
    time: p.deadline || '待定',
    title: `投标截止：${p.title}`,
    type: '任务'
  })
  appStore.showModal('加入工作台', `已将"${p.title}"作为任务添加到工作台，并创建投标截止日程提醒`, 'success')
  showProjectModal.value = false
}
function sendToChat(r) { 
  router.push({ path: '/chat/bid-matching', query: { from: 'agent', type: 'bid-matching', result: JSON.stringify(r) } }) 
}

// 报告弹窗状态
const showReportModal = ref(false)
const reportData = ref(null)

function viewReport(r) {
  // 生成详细的招标分析报告
  const matchLevel = r.score >= 80 ? '高' : r.score >= 60 ? '中' : '低'
  const matchColor = r.score >= 80 ? '#059669' : r.score >= 60 ? '#d97706' : '#dc2626'
  const riskLevel = r.score >= 80 ? '低风险' : r.score >= 60 ? '中风险' : '高风险'
  
  reportData.value = {
    project: r,
    generatedAt: new Date().toLocaleString(),
    summary: {
      matchLevel,
      matchColor,
      riskLevel,
      recommendation: r.score >= 80 ? '强烈建议投标' : r.score >= 60 ? '建议评估后投标' : '谨慎考虑'
    },
    analysis: {
      project解读: [
        `本项目为「${r.title}」，采购单位为${r.procurementUnit}。`,
        `项目类型：${r.bidType}，预算金额：${r.amount}。`,
        `所在区域：${r.region}，发布时间：${r.publishTime}。`,
        `投标截止时间：${r.bidDeadline}，文件截止时间：${r.fileDeadline}。`
      ],
      资质匹配: [
        { item: '企业基本资质', status: '满足', detail: '企业注册资金、经营范围符合要求' },
        { item: '行业认证', status: '满足', detail: 'ISO9001、CMMI3等认证齐全' },
        { item: '项目经验', status: r.score >= 70 ? '满足' : '部分满足', detail: r.score >= 70 ? '近三年有类似项目经验' : '需补充相关项目案例' },
        { item: '技术能力', status: r.score >= 60 ? '满足' : '需加强', detail: r.score >= 60 ? '核心技术团队能力匹配' : '需引入外部技术资源' }
      ],
      竞争分析: {
        estimatedCompetitors: Math.floor(Math.random() * 8) + 5,
        winProbability: Math.min(95, Math.max(15, r.score + Math.floor(Math.random() * 10) - 5)),
        competitiveAdvantages: [
          '技术方案成熟度高',
          '行业经验丰富',
          '价格竞争力强'
        ],
        potentialRisks: [
          r.score < 70 ? '资质匹配度偏低，需重点补充' : null,
          r.fileFee === '0' ? '无文件费，竞争可能更激烈' : null,
          '投标时间紧张，需尽快准备'
        ].filter(Boolean)
      },
      投标策略: {
        报价策略: r.score >= 80 ? '建议采用适中报价，预留8-12%利润空间' : '建议采用竞争性报价，控制利润在5-8%',
        技术方案: '突出企业核心优势，提供差异化解决方案，强调成功案例',
        风险控制: '制定详细的项目实施计划，准备应急预案，购买相关保险',
        时间规划: [
          { phase: '文件获取', deadline: r.fileDeadline, status: r.status === 'new' ? '待执行' : '已完成' },
          { phase: '方案编制', deadline: '截止前7天', status: '待执行' },
          { phase: '标书审核', deadline: '截止前3天', status: '待执行' },
          { phase: '投标提交', deadline: r.bidDeadline, status: '待执行' }
        ]
      }
    }
  }
  showReportModal.value = true
}

function deleteResult(r) {
  if (confirm(`确定要删除「${r.title}」吗？`)) {
    const idx = results.value.findIndex(x => x.id === r.id)
    if (idx > -1) {
      results.value.splice(idx, 1)
      saveResultsToCache()
    }
  }
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
.result-list { flex: 1; overflow-y: auto; min-height: 0; }
.agent-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.agent-title { display: flex; align-items: center; gap: 16px; }
.agent-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; }
.agent-icon.bid { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
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

/* 表单样式 */
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { margin-bottom: 14px; }
.form-group:last-child { margin-bottom: 0; }
.form-group label { display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: inherit; background: #f9fafb; transition: all var(--tr); }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.form-group textarea { resize: vertical; min-height: 60px; }
.tags-input { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); min-height: 38px; align-items: center; background: #f9fafb; }
.tags-input:focus-within { border-color: var(--primary); background: #fff; }
.tag { font-size: 11px; padding: 3px 10px; background: #eef2ff; border-radius: 6px; color: var(--primary); display: flex; align-items: center; gap: 5px; font-weight: 500; }
.tag button { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 10px; padding: 0; opacity: .6; }
.tag button:hover { opacity: 1; }
.tags-input input { border: none; outline: none; flex: 1; min-width: 80px; font-size: 13px; font-family: inherit; background: transparent; }
.quick-certs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.quick-certs button { padding: 4px 10px; font-size: 11px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; color: #374151; font-family: inherit; transition: all var(--tr); }
.quick-certs button:hover { background: #eef2ff; border-color: var(--primary); color: var(--primary); }

/* AI标书工具卡片 */
.tools-card { background: linear-gradient(135deg, #fafbff, #f5f3ff); border-color: #e0e7ff; }
.tool-grid { display: flex; flex-direction: column; gap: 10px; }
.tool-item { display: flex; align-items: center; gap: 14px; padding: 14px; border: 1px solid #e0e7ff; border-radius: var(--radius-sm); cursor: pointer; transition: all var(--tr); background: #fff; }
.tool-item:hover { border-color: var(--primary); box-shadow: 0 2px 8px rgba(99,102,241,.12); transform: translateX(2px); }
.tool-item:active { transform: translateX(0); }
.tool-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; flex-shrink: 0; }
.tool-body { flex: 1; min-width: 0; }
.tool-name { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
.tool-desc { font-size: 12px; color: var(--text-muted); line-height: 1.4; }
.tool-arrow { color: var(--text-muted); font-size: 12px; transition: all var(--tr); }
.tool-item:hover .tool-arrow { color: var(--primary); transform: translateX(3px); }

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

.result-list { display: flex; flex-direction: column; gap: 12px; }
.result-item { background: var(--bg-white); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; transition: all var(--tr); }
.result-item:hover { border-color: var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.ri-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.ri-source { font-size: 12px; color: var(--primary); background: #eef2ff; padding: 3px 10px; border-radius: 6px; font-weight: 500; }
.ri-pubtime { font-size: 12px; color: var(--text-muted); }
.ri-title { font-size: 15px; font-weight: 700; color: var(--text-primary); line-height: 1.5; margin-bottom: 8px; cursor: pointer; }
.ri-title:hover { color: var(--primary); }
.ri-region { display: inline-block; font-size: 12px; color: var(--text-secondary); background: #f3f4f6; padding: 3px 10px; border-radius: 6px; margin-bottom: 10px; }
.ri-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.ri-match { font-size: 12px; color: #d97706; background: #fff7ed; border: 1px solid #fed7aa; padding: 3px 10px; border-radius: 6px; font-weight: 500; }
.ri-match strong { font-size: 16px; font-weight: 800; margin-left: 2px; }
.ri-status { font-size: 12px; padding: 3px 10px; border-radius: 6px; font-weight: 500; }
.ri-status.done { color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; }
.ri-status.new { color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; }
.ri-status.contact { color: #7c3aed; background: #f5f3ff; border: 1px solid #ddd6fe; }
.ri-status.making { color: #d97706; background: #fffbeb; border: 1px solid #fde68a; }
.ri-status.bid { color: #0891b2; background: #ecfeff; border: 1px solid #a5f3fc; }
.ri-status.win { color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; }
.ri-status.lose { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; }
.ri-type, .ri-amount { font-size: 12px; color: var(--text-secondary); background: #f9fafb; border: 1px solid #e5e7eb; padding: 3px 10px; border-radius: 6px; font-weight: 500; }
.ri-details { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin-bottom: 12px; }
.ri-detail-row { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.ri-detail-row label { color: var(--text-muted); font-size: 12px; min-width: 72px; }
.ri-detail-row span { color: var(--text-primary); font-weight: 500; }
.ri-keywords { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
.keyword-tag { font-size: 11px; padding: 3px 10px; background: #fdf2f8; border-radius: 6px; color: #db2777; font-weight: 500; }
.ri-actions { display: flex; gap: 10px; }
.ri-action-btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-white); cursor: pointer; font-size: 13px; font-weight: 500; color: var(--text-secondary); font-family: inherit; transition: all var(--tr); }
.ri-action-btn:hover { border-color: var(--primary); color: var(--primary); background: #eef2ff; }
.ri-action-btn.primary { background: var(--primary); color: #fff; border-color: var(--primary); }
.ri-action-btn.primary:hover { background: var(--primary-dark); }
.ri-action-btn.danger { color: #dc2626; border-color: #fecaca; background: #fef2f2; }
.ri-action-btn.danger:hover { background: #fee2e2; border-color: #fca5a5; }

/* 弹窗 */
.bid-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn .2s ease; }
.bid-modal { background: #fff; border-radius: var(--radius-lg); width: 480px; max-height: 80vh; overflow-y: auto; box-shadow: var(--shadow-lg); animation: slideUp .25s ease; }
.bid-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.bid-modal-header h3 { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
.bid-modal-header h3 i { color: var(--primary); }
.bid-modal-close { width: 32px; height: 32px; border: none; background: #f3f4f6; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 14px; transition: all var(--tr); }
.bid-modal-close:hover { background: #fee2e2; color: #dc2626; }
.bid-modal-body { padding: 20px 24px; }
.bid-modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border); }
.check-upload { border: 2px dashed var(--border); border-radius: var(--radius); padding: 28px; text-align: center; cursor: pointer; transition: all var(--tr); }
.check-upload:hover { border-color: var(--primary); background: var(--primary-50); }
.check-upload i { font-size: 28px; color: var(--primary); margin-bottom: 10px; }
.check-upload p { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.check-upload span { font-size: 11px; color: var(--text-muted); }
.file-list { margin-top: 12px; }
.file-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: var(--primary-50); border-radius: var(--radius-sm); margin-bottom: 6px; font-size: 12px; }
.file-item i { color: var(--primary); }
.file-item span { flex: 1; }
.file-item button { background: none; border: none; color: var(--text-muted); cursor: pointer; }

/* 项目详情弹窗 */
.project-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn .2s ease; }
.project-modal { background: #fff; border-radius: var(--radius-lg); width: 640px; max-height: 85vh; overflow-y: auto; box-shadow: var(--shadow-lg); animation: slideUp .25s ease; }
.project-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.project-modal-header h3 { font-size: 16px; font-weight: 700; color: var(--text-primary); }
.modal-close { width: 32px; height: 32px; border: none; background: #f3f4f6; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 14px; transition: all var(--tr); }
.modal-close:hover { background: #fee2e2; color: #dc2626; }
.project-modal-body { padding: 24px; }
.project-status-tags { display: flex; gap: 8px; margin-bottom: 16px; }
.status-tag { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; }
.status-tag.new { background: #dbeafe; color: #2563eb; }
.status-tag.contact { background: #f3f4f6; color: #6b7280; }
.project-title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 16px; }
.project-title-row h2 { font-size: 18px; font-weight: 700; color: var(--text-primary); flex: 1; line-height: 1.4; }
.match-ring { width: 76px; height: 76px; border-radius: 50%; border: 3px solid #10b981; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
.match-score { font-size: 22px; font-weight: 800; color: #10b981; }
.match-label { font-size: 10px; color: var(--text-muted); }
.project-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
.info-cell { background: #f9fafb; padding: 12px 14px; border-radius: var(--radius-sm); }
.info-cell label { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; display: block; }
.info-cell p { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.project-requirements h4 { font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
.project-requirements h4 i { color: #dc2626; }
.req-list { display: flex; flex-direction: column; gap: 8px; }
.req-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #f9fafb; border-radius: var(--radius-sm); font-size: 13px; color: var(--text-primary); }
.req-item i { color: #059669; font-size: 12px; }
.project-modal-footer { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

/* 查询报告弹窗 */
.report-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn .2s ease; }
.report-modal { background: #fff; border-radius: var(--radius-lg); width: 720px; max-height: 85vh; overflow-y: auto; box-shadow: var(--shadow-lg); animation: slideUp .25s ease; }
.report-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: #fff; z-index: 1; }
.report-modal-header h3 { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
.report-modal-header h3 i { color: var(--primary); }
.report-modal-body { padding: 24px; }
.report-modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border); position: sticky; bottom: 0; background: #fff; }

/* 报告概览 */
.report-overview { margin-bottom: 24px; }
.report-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.report-meta { display: flex; gap: 20px; font-size: 12px; color: var(--text-muted); margin-bottom: 16px; }
.report-meta i { margin-right: 4px; }
.report-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.summary-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: var(--radius-sm); padding: 16px; text-align: center; }
.summary-label { font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
.summary-value { font-size: 24px; font-weight: 800; }
.summary-value.risk { font-size: 16px; color: #d97706; }
.summary-value.rec { font-size: 14px; color: var(--primary); }
.summary-level { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

/* 报告区块 */
.report-section { margin-bottom: 24px; }
.report-section h4 { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.report-section h4 i { color: var(--primary); }
.report-content p { font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 6px; }

/* 资质表格 */
.qual-table { border: 1px solid #e5e7eb; border-radius: var(--radius-sm); overflow: hidden; }
.qual-row { display: grid; grid-template-columns: 120px 80px 1fr; padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
.qual-row:last-child { border-bottom: none; }
.qual-header { background: #f9fafb; font-weight: 600; color: var(--text-secondary); }
.qual-status.pass { color: #059669; font-weight: 600; }
.qual-status.partial { color: #d97706; font-weight: 600; }
.qual-status.fail { color: #dc2626; font-weight: 600; }

/* 竞争分析 */
.compete-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.compete-item { background: #f9fafb; padding: 14px; border-radius: var(--radius-sm); text-align: center; }
.compete-label { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
.compete-value { font-size: 20px; font-weight: 700; color: var(--text-primary); }
.compete-value.win { color: #059669; }
.advantages-section, .risks-section { margin-bottom: 12px; }
.adv-title, .risk-title { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.adv-title i { color: #d97706; }
.risk-title i { color: #dc2626; }
.adv-list { display: flex; flex-wrap: wrap; gap: 6px; }
.adv-tag { font-size: 11px; padding: 4px 10px; background: #d1fae5; color: #059669; border-radius: 6px; font-weight: 500; }
.risk-list { display: flex; flex-direction: column; gap: 6px; }
.risk-item { font-size: 12px; padding: 8px 12px; background: #fef2f2; color: #991b1b; border-radius: var(--radius-sm); border-left: 3px solid #dc2626; }

/* 投标策略 */
.strategy-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.strategy-item { background: #f9fafb; padding: 14px; border-radius: var(--radius-sm); }
.strategy-label { font-size: 12px; font-weight: 600; color: var(--primary); margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
.strategy-text { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
.timeline-section { margin-top: 16px; }
.timeline-title { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
.timeline-title i { color: var(--primary); }
.timeline-list { display: flex; flex-direction: column; gap: 8px; }
.timeline-item { display: grid; grid-template-columns: 100px 1fr 80px; align-items: center; padding: 10px 14px; background: #f9fafb; border-radius: var(--radius-sm); font-size: 13px; }
.timeline-phase { font-weight: 600; color: var(--text-primary); }
.timeline-deadline { color: var(--text-secondary); }
.timeline-status { text-align: center; font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: 4px; }
.timeline-status.done { background: #d1fae5; color: #059669; }
.timeline-status.pending { background: #fef3c7; color: #d97706; }

/* 项目选择下拉框 */
.project-select { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: inherit; background: #f9fafb; transition: all var(--tr); cursor: pointer; }
.project-select:focus { outline: none; border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }

/* 资质资料上传 */
.cert-upload-zone { border: 2px dashed var(--border); border-radius: var(--radius); padding: 24px; text-align: center; cursor: pointer; transition: all var(--tr); }
.cert-upload-zone:hover { border-color: var(--primary); background: var(--primary-50); }
.cert-upload-zone i { font-size: 28px; color: var(--primary); margin-bottom: 8px; }
.cert-upload-zone p { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.cert-upload-zone span { font-size: 11px; color: var(--text-muted); }
.uploaded-files { margin-top: 10px; }
.uploaded-file-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: #f9fafb; border-radius: var(--radius-sm); margin-bottom: 6px; font-size: 12px; }
.uploaded-file-item i:first-child { color: var(--primary); }
.uploaded-file-item .file-info { flex: 1; display: flex; flex-direction: column; }
.uploaded-file-item .file-name { font-weight: 600; color: var(--text-primary); }
.uploaded-file-item .file-status { font-size: 11px; color: var(--text-muted); }
.uploaded-file-item .file-status.ocr-done { color: #059669; }
.uploaded-file-item .file-status.ocr-ing { color: #d97706; }
.uploaded-file-item button { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; }
.ocr-btn { margin-top: 8px; padding: 8px 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; font-family: inherit; transition: all var(--tr); }
.ocr-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,.3); }

/* 平台配置 */
.platform-config-wrapper { position: relative; }
.platform-dropdown { position: absolute; top: 100%; right: 0; margin-top: 8px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-lg); width: 380px; z-index: 100; animation: fadeIn .2s ease; }
.platform-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border); }
.platform-header span { font-size: 14px; font-weight: 700; color: var(--text-primary); }
.platform-header button { background: none; border: none; color: var(--text-muted); cursor: pointer; }
.platform-search-bar { padding: 10px 16px; border-bottom: 1px solid #f3f4f6; }
.platform-add-btn { width: 100%; padding: 8px 12px; border: 1px dashed var(--border); border-radius: 8px; background: #f8fafc; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--primary); display: flex; align-items: center; justify-content: center; gap: 6px; font-family: inherit; transition: all .2s; }
.platform-add-btn:hover { background: #eef2ff; border-color: var(--primary); }
.platform-list { padding: 4px 16px; max-height: 280px; overflow-y: auto; }
.platform-list::-webkit-scrollbar { width: 4px; }
.platform-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.platform-item { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid #f8fafc; }
.platform-item:last-child { border-bottom: none; }
.platform-check { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; cursor: pointer; }
.platform-check input[type="checkbox"] { accent-color: var(--primary); width: 16px; height: 16px; flex-shrink: 0; }
.platform-info { min-width: 0; }
.platform-name { font-size: 13px; font-weight: 600; color: var(--text-primary); display: block; }
.platform-url { font-size: 11px; color: var(--text-muted); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.platform-tag { font-size: 10px; padding: 2px 8px; background: #eef2ff; color: var(--primary); border-radius: 4px; white-space: nowrap; flex-shrink: 0; }
.platform-tag.custom { background: #fef3c7; color: #d97706; }
.platform-actions { display: flex; gap: 4px; flex-shrink: 0; }
.platform-edit-btn, .platform-del-btn { width: 26px; height: 26px; border: 1px solid var(--border); border-radius: 6px; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; transition: all .2s; }
.platform-edit-btn { color: var(--text-muted); }
.platform-edit-btn:hover { background: #eef2ff; border-color: var(--primary); color: var(--primary); }
.platform-del-btn { color: var(--text-muted); }
.platform-del-btn:hover { background: #fef2f2; border-color: #dc2626; color: #dc2626; }
.platform-footer { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-top: 1px solid var(--border); }
.platform-footer span { font-size: 12px; color: var(--text-muted); }
.platform-save-btn { padding: 6px 16px; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 12px; font-weight: 600; font-family: inherit; }

/* 平台编辑弹窗 */
.platform-edit-overlay { position: absolute; inset: 0; background: rgba(255,255,255,.92); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; z-index: 10; }
.platform-edit-panel { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 20px; width: 90%; box-shadow: 0 8px 24px rgba(0,0,0,.08); }
.platform-edit-panel h4 { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.platform-edit-panel h4 i { color: var(--primary); }
.platform-edit-panel .form-group { margin-bottom: 14px; }
.platform-edit-panel .form-group label { display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
.platform-edit-panel .form-group input { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; font-family: inherit; background: #f9fafb; transition: all .2s; }
.platform-edit-panel .form-group input:focus { outline: none; border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.platform-edit-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
</style>