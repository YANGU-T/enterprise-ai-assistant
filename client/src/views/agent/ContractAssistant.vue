<template>
  <div class="contract-page">
    <!-- 顶部标题栏 - 与其他Agent保持一致 -->
    <div class="agent-header">
      <div class="agent-title">
        <div class="agent-icon contract"><i class="fas fa-file-contract"></i></div>
        <div>
          <h2>AI合同助手</h2>
          <p>智能生成合同文档，支持在线编辑与合规审查</p>
        </div>
      </div>
      <div class="agent-actions">
        <button class="action-btn" @click="showReviewPanel = true">
          <i class="fas fa-search"></i><span>合同审核</span>
        </button>
        <button class="action-btn" @click="showHistory = !showHistory">
          <i class="fas fa-history"></i><span>历史记录</span>
        </button>
      </div>
    </div>

    <div class="page-body">
      <!-- 左侧：合同生成面板 -->
      <div class="left-panel">
        <div class="panel-card">
          <div class="card-title"><i class="fas fa-cog"></i><span>合同生成配置</span></div>
          <div class="form-group">
            <label>合同模板</label>
            <select v-model="form.templateId" class="form-select">
              <option value="">请选择合同模板</option>
              <option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>甲方名称</label>
            <input v-model="form.partyA" type="text" class="form-input" placeholder="请输入甲方公司名称" />
          </div>
          <div class="form-group">
            <label>乙方名称</label>
            <input v-model="form.partyB" type="text" class="form-input" placeholder="请输入乙方公司名称" />
          </div>
          <div class="form-group">
            <label>合同金额（元）</label>
            <input v-model="form.amount" type="text" class="form-input" placeholder="请输入合同金额" />
          </div>
          <div class="form-group">
            <label>合同期限</label>
            <div class="date-range">
              <input v-model="form.startDate" type="date" class="form-input" />
              <span class="date-sep">至</span>
              <input v-model="form.endDate" type="date" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>关键条款/补充说明</label>
            <textarea v-model="form.notes" class="form-textarea" rows="4" placeholder="请输入需要特别说明的条款或补充信息..."></textarea>
          </div>
          <button class="generate-btn" :disabled="generating || !form.templateId" @click="generateContract">
            <i :class="generating ? 'fas fa-spinner fa-spin' : 'fas fa-magic'"></i>
            <span>{{ generating ? '正在生成...' : '生成合同' }}</span>
          </button>
        </div>
      </div>

      <!-- 右侧：合同预览 -->
      <div class="right-panel">
        <!-- 无合同状态 -->
        <div v-if="!contract" class="empty-state">
          <div class="empty-icon"><i class="fas fa-file-contract"></i></div>
          <h3>AI 合同助手</h3>
          <p>选择合同模板并填写基本信息，AI 将自动生成专业的合同文档</p>
          <div class="feature-list">
            <div class="feature-item"><i class="fas fa-check-circle"></i><span>智能生成合同条款</span></div>
            <div class="feature-item"><i class="fas fa-check-circle"></i><span>支持在线编辑修改</span></div>
            <div class="feature-item"><i class="fas fa-check-circle"></i><span>合同合规性审查</span></div>
          </div>
        </div>

        <!-- 有合同状态 -->
        <div v-else class="contract-preview">
          <div class="preview-header">
            <h2>{{ contract.title }}</h2>
            <div class="preview-actions">
              <button class="preview-btn" @click="editContract" :disabled="editing">
                <i class="fas fa-edit"></i><span>{{ editing ? '编辑中' : '编辑' }}</span>
              </button>
              <button class="preview-btn" @click="reviewContract">
                <i class="fas fa-search"></i><span>合规审查</span>
              </button>
              <button class="preview-btn primary" @click="saveContract">
                <i class="fas fa-save"></i><span>保存</span>
              </button>
            </div>
          </div>

          <div class="contract-meta">
            <div class="meta-item"><span class="meta-label">甲方：</span><span class="meta-value">{{ contract.partyA }}</span></div>
            <div class="meta-item"><span class="meta-label">乙方：</span><span class="meta-value">{{ contract.partyB }}</span></div>
            <div class="meta-item" v-if="contract.amount"><span class="meta-label">金额：</span><span class="meta-value amount">¥{{ Number(contract.amount).toLocaleString() }}</span></div>
            <div class="meta-item" v-if="contract.startDate"><span class="meta-label">期限：</span><span class="meta-value">{{ contract.startDate }} 至 {{ contract.endDate }}</span></div>
            <div class="meta-item"><span class="meta-label">生成时间：</span><span class="meta-value">{{ contract.generatedAt }}</span></div>
          </div>

          <div class="contract-content-area">
            <div v-if="!editing" class="contract-text" v-html="contract.content"></div>
            <textarea v-else v-model="editContent" class="edit-textarea"></textarea>
          </div>

          <div v-if="reviewResult" class="review-panel">
            <div class="review-header">
              <i class="fas fa-shield-alt"></i><span>合规审查结果</span>
              <span class="review-score" :class="reviewResult.level">{{ reviewResult.score }}分</span>
            </div>
            <div class="review-body">
              <div v-for="(item, idx) in reviewResult.items" :key="idx" class="review-item">
                <i :class="item.pass ? 'fas fa-check-circle pass' : 'fas fa-exclamation-triangle warn'"></i>
                <span>{{ item.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录侧边栏 -->
    <div v-if="showHistory" class="history-overlay" @click.self="showHistory = false">
      <div class="history-sidebar">
        <div class="history-header">
          <h3>历史记录</h3>
          <button class="close-btn" @click="showHistory = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="history-list">
          <div v-if="historyList.length === 0" class="history-empty">暂无历史记录</div>
          <div v-for="item in historyList" :key="item.id" class="history-item">
            <div class="history-item-content" @click="loadHistory(item)">
              <div class="history-title">{{ item.title }}</div>
              <div class="history-info">
                <span>{{ item.partyA }} ↔ {{ item.partyB }}</span>
                <span>{{ item.generatedAt }}</span>
              </div>
            </div>
            <button class="delete-btn" @click.stop="deleteHistory(item.id)" title="删除">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 合同审核面板 -->
    <div v-if="showReviewPanel" class="review-overlay" @click.self="showReviewPanel = false">
      <div class="review-panel-sidebar">
        <div class="review-panel-header">
          <h3><i class="fas fa-search"></i> 合同审核</h3>
          <button class="close-btn" @click="showReviewPanel = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="review-panel-body">
          <!-- 上传区域 -->
          <div class="upload-section">
            <div class="upload-area" @click="triggerUpload" @dragover.prevent @drop.prevent="handleDrop">
              <input ref="fileInput" type="file" accept=".txt,.doc,.docx,.pdf" @change="handleFileUpload" style="display: none" />
              <div v-if="!uploadedFile" class="upload-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>点击或拖拽上传合同文件</p>
                <span>支持 .txt, .doc, .docx, .pdf 格式</span>
              </div>
              <div v-else class="uploaded-file">
                <i class="fas fa-file-alt"></i>
                <div>
                  <p>{{ uploadedFile.name }}</p>
                  <span>{{ (uploadedFile.size / 1024).toFixed(1) }} KB</span>
                </div>
                <button class="remove-file" @click.stop="removeFile"><i class="fas fa-times"></i></button>
              </div>
            </div>
          </div>

          <!-- 审核选项 -->
          <div class="review-options">
            <h4>审核类型</h4>
            <label class="review-option">
              <input type="checkbox" v-model="reviewOptions.content" />
              <span>内容完整性审查</span>
            </label>
            <label class="review-option">
              <input type="checkbox" v-model="reviewOptions.format" />
              <span>格式规范性审查</span>
            </label>
            <label class="review-option">
              <input type="checkbox" v-model="reviewOptions.legal" />
              <span>法律风险审查</span>
            </label>
          </div>

          <!-- 开始审核按钮 -->
          <button class="start-review-btn" @click="startExternalReview" :disabled="!uploadedFile || isReviewing">
            <i :class="isReviewing ? 'fas fa-spinner fa-spin' : 'fas fa-search'"></i>
            <span>{{ isReviewing ? '正在审核...' : '开始审核' }}</span>
          </button>

          <!-- 审核结果 -->
          <div v-if="externalReviewResult" class="external-review-result">
            <div class="result-header">
              <h4>审核结果</h4>
              <span class="result-score" :class="externalReviewResult.level">
                {{ externalReviewResult.score }}分
              </span>
            </div>
            <div class="result-summary">
              <p>{{ externalReviewResult.summary }}</p>
            </div>
            <div class="result-items">
              <div v-for="(item, idx) in externalReviewResult.items" :key="idx" class="result-item">
                <div class="result-item-header">
                  <i :class="item.type === 'error' ? 'fas fa-times-circle' : item.type === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle'"></i>
                  <span class="result-item-title">{{ item.title }}</span>
                </div>
                <p class="result-item-desc">{{ item.description }}</p>
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
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'

const router = useRouter()
const appStore = useAppStore()

const templates = ref([
  { id: 'service', name: '技术服务合同' },
  { id: 'procurement', name: '采购合同' },
  { id: 'labor', name: '劳动合同' },
  { id: 'nda', name: '保密协议（NDA）' },
  { id: 'cooperation', name: '合作协议' },
  { id: 'lease', name: '租赁合同' }
])

const form = ref({ templateId: '', partyA: '', partyB: '', amount: '', startDate: '', endDate: '', notes: '' })
const generating = ref(false)
const contract = ref(null)
const editing = ref(false)
const editContent = ref('')
const reviewResult = ref(null)
const showHistory = ref(false)
const historyList = ref([])

// 合同审核相关状态
const showReviewPanel = ref(false)
const uploadedFile = ref(null)
const fileInput = ref(null)
const isReviewing = ref(false)
const externalReviewResult = ref(null)
const reviewOptions = ref({ content: true, format: true, legal: true })

// 初始化历史记录
try { const saved = localStorage.getItem('contract_history'); if (saved) historyList.value = JSON.parse(saved) } catch(e) {}

function goBack() { router.push('/agents') }

function generateContract() {
  if (!form.value.templateId) return
  generating.value = true
  reviewResult.value = null

  setTimeout(() => {
    const tpl = templates.value.find(t => t.id === form.value.templateId)
    contract.value = {
      id: Date.now(),
      title: tpl.name,
      templateId: form.value.templateId,
      partyA: form.value.partyA || '甲方公司',
      partyB: form.value.partyB || '乙方公司',
      amount: form.value.amount,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      content: buildContent(),
      generatedAt: new Date().toLocaleString('zh-CN')
    }
    generating.value = false
    appStore.showModal('生成成功', '合同已生成，请查看右侧预览', 'success')
  }, 2000)
}

function buildContent() {
  const A = form.value.partyA || '甲方公司'
  const B = form.value.partyB || '乙方公司'
  const amt = form.value.amount ? Number(form.value.amount).toLocaleString() : '______'
  const sd = form.value.startDate || '____年__月__日'
  const ed = form.value.endDate || '____年__月__日'
  const notes = form.value.notes || '无'
  const now = new Date().toLocaleString('zh-CN')
  const tid = form.value.templateId

  if (tid === 'nda') return `<h2>保密协议（NDA）</h2><p><strong>甲方（披露方）：</strong>${A}</p><p><strong>乙方（接收方）：</strong>${B}</p><h3>第一条 保密信息定义</h3><p>保密信息指甲方在合作过程中向乙方披露的所有商业秘密、技术秘密、经营信息等，包括但不限于技术方案、产品设计、客户信息、财务数据、营销策略。以下信息不属于保密信息：公开信息、接收方独立开发的信息、第三方合法披露的信息。</p><h3>第二条 保密义务</h3><p>乙方应对保密信息承担严格的保密义务，未经甲方书面同意，不得向任何第三方披露。乙方应采取合理的安全措施保护保密信息，仅可在合作目的范围内使用。</p><h3>第三条 保密期限</h3><p>本协议保密期限自 <strong>${sd}</strong> 至 <strong>${ed}</strong>。保密义务不因本协议终止而终止。</p><h3>第四条 违约责任</h3><p>违反保密义务的一方应赔偿对方因此遭受的全部损失，包括直接损失和合理的间接损失。</p><h3>第五条 其他</h3><p>本协议一式两份，双方各执一份，自签字盖章之日起生效。补充说明：${notes}</p><p style="text-align:right;margin-top:30px;color:#888;">生成时间：${now}</p>`

  if (tid === 'procurement') return `<h2>采购合同</h2><p><strong>甲方（采购方）：</strong>${A}</p><p><strong>乙方（供货方）：</strong>${B}</p><h3>第一条 采购物品</h3><p>甲方向乙方采购以下物品（详见附件《采购清单》），物品的质量标准应符合国家标准或行业标准，乙方应提供产品合格证明和质量保证书。</p><h3>第二条 价格与付款</h3><p>本合同采购总金额为人民币 <strong>¥${amt}</strong> 元。付款方式：货到验收合格后30日内支付全款。乙方应提供正规增值税专用发票。</p><h3>第三条 交货与验收</h3><p>交货时间：合同签订后约定工作日内。交货地点：甲方指定地点。甲方应在收到货物后5个工作日内完成验收。</p><h3>第四条 质量保证</h3><p>乙方保证所供物品为全新正品，质保期自验收合格之日起计算。质保期内因质量问题产生的维修或更换费用由乙方承担。</p><h3>第五条 违约责任</h3><p>乙方逾期交货的，每逾期一日应支付合同总额0.3%的违约金。物品质量不符合约定的，甲方有权退货并要求赔偿。</p><h3>第六条 合同期限</h3><p>本合同有效期自 <strong>${sd}</strong> 至 <strong>${ed}</strong>。补充说明：${notes}</p><p style="text-align:right;margin-top:30px;color:#888;">生成时间：${now}</p>`

  if (tid === 'labor') return `<h2>劳动合同</h2><p><strong>甲方（用人单位）：</strong>${A}</p><p><strong>乙方（劳动者）：</strong>${B}</p><h3>第一条 合同期限</h3><p>本合同为固定期限劳动合同，期限自 <strong>${sd}</strong> 至 <strong>${ed}</strong>。试用期按法律规定执行。</p><h3>第二条 工作内容与地点</h3><p>乙方同意在甲方安排的岗位工作，工作地点以甲方实际安排为准。</p><h3>第三条 劳动报酬</h3><p>乙方月工资为人民币 <strong>¥${amt}</strong> 元。甲方依法为乙方缴纳社会保险和住房公积金。</p><h3>第四条 工作时间与休假</h3><p>甲方实行标准工时制度，乙方依法享受国家规定的法定节假日和带薪年休假。</p><h3>第五条 合同解除</h3><p>双方可依据《劳动合同法》的规定解除本合同。合同终止或解除时，甲方应依法支付经济补偿。</p><h3>第六条 争议解决</h3><p>因本合同引起的争议，双方应先协商解决；协商不成的，可申请劳动仲裁。补充说明：${notes}</p><p style="text-align:right;margin-top:30px;color:#888;">生成时间：${now}</p>`

  if (tid === 'cooperation') return `<h2>合作协议</h2><p><strong>甲方：</strong>${A}</p><p><strong>乙方：</strong>${B}</p><h3>第一条 合作内容</h3><p>双方同意在约定领域开展合作，合作方式包括资源共享、技术合作、市场推广等。</p><h3>第二条 合作期限</h3><p>合作期限自 <strong>${sd}</strong> 至 <strong>${ed}</strong>，期满可协商续约。</p><h3>第三条 投入与分配</h3><p>本合同合作金额为人民币 <strong>¥${amt}</strong> 元。合作收益按双方约定比例分配。</p><h3>第四条 权利与义务</h3><p>双方应按约定履行义务，积极配合推进合作项目。未经对方同意，不得转让合作权益。</p><h3>第五条 保密与知识产权</h3><p>双方对合作中知悉的对方商业秘密承担保密义务。合作产生的知识产权由双方共同所有。</p><h3>第六条 违约与争议</h3><p>违约方应赔偿守约方直接损失。争议协商解决，协商不成提交甲方所在地法院诉讼。补充说明：${notes}</p><p style="text-align:right;margin-top:30px;color:#888;">生成时间：${now}</p>`

  if (tid === 'lease') return `<h2>租赁合同</h2><p><strong>甲方（出租方）：</strong>${A}</p><p><strong>乙方（承租方）：</strong>${B}</p><h3>第一条 租赁物</h3><p>甲方将约定租赁物出租给乙方使用，租赁物状况以双方确认的交接清单为准。</p><h3>第二条 租赁期限</h3><p>租赁期限自 <strong>${sd}</strong> 至 <strong>${ed}</strong>。续租应提前30日书面通知。</p><h3>第三条 租金与支付</h3><p>月租金为人民币 <strong>¥${amt}</strong> 元，乙方应于每月约定日前支付当月租金。</p><h3>第四条 使用与维护</h3><p>乙方应按约定用途使用租赁物，未经甲方同意不得改变用途或转租。正常维修由甲方负责，使用不当造成的损坏费用由乙方承担。</p><h3>第五条 违约责任</h3><p>乙方逾期支付租金的，每逾期一日支付应付租金0.5%的滞纳金。提前解除合同应提前30日书面通知。补充说明：${notes}</p><p style="text-align:right;margin-top:30px;color:#888;">生成时间：${now}</p>`

  // 默认：技术服务合同
  return `<h2>技术服务合同</h2><p><strong>甲方（委托方）：</strong>${A}</p><p><strong>乙方（受托方）：</strong>${B}</p><h3>第一条 服务内容</h3><p>乙方为甲方提供技术服务，包括但不限于系统设计、软件开发、技术咨询、系统集成、技术支持。具体服务内容、技术要求和验收标准以双方确认的《技术需求说明书》为准。</p><h3>第二条 合同金额与支付</h3><p>本合同总金额为人民币 <strong>¥${amt}</strong> 元。付款方式分阶段支付：合同签订后5个工作日内支付30%预付款；中期验收通过后支付40%；终验通过后支付30%尾款。</p><h3>第三条 合同期限</h3><p>本合同有效期自 <strong>${sd}</strong> 至 <strong>${ed}</strong>。如需延期，双方另行协商签订补充协议。</p><h3>第四条 双方权利义务</h3><p>甲方有权监督项目进度，乙方应保证服务质量按时交付，指派专人负责项目实施和沟通。甲方应按约定提供必要资料和配合。</p><h3>第五条 知识产权</h3><p>本合同项下开发的软件及文档知识产权归甲方所有。乙方不得将技术成果用于其他商业用途，应保证交付物不侵犯第三方知识产权。</p><h3>第六条 保密条款</h3><p>双方对本合同涉及的商业秘密和技术秘密承担保密义务，保密期限为合同终止后三年。违反保密义务应承担全部损失。</p><h3>第七条 违约责任</h3><p>违约方应承担违约责任并赔偿损失。因乙方原因延期的，每延迟一天支付合同总额0.5%违约金。</p><h3>第八条 争议解决</h3><p>争议双方先友好协商，协商不成向甲方所在地人民法院提起诉讼。本合同一式两份，双方各执一份，自签字盖章之日起生效。补充说明：${notes}</p><p style="text-align:right;margin-top:30px;color:#888;">生成时间：${now}</p>`
}

function editContract() {
  if (!contract.value) return
  editing.value = true
  editContent.value = contract.value.content.replace(/<[^>]*>/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

function saveContract() {
  if (editing.value) {
    contract.value.content = editContent.value.split('\n').map(line => {
      line = line.trim()
      if (!line) return ''
      if (line.startsWith('第') && line.includes('章')) return `<h3>${line}</h3>`
      return `<p>${line}</p>`
    }).join('\n')
    editing.value = false
  }
  const exists = historyList.value.findIndex(h => h.id === contract.value.id)
  if (exists === -1) historyList.value.unshift({ ...contract.value })
  else historyList.value[exists] = { ...contract.value }
  try { localStorage.setItem('contract_history', JSON.stringify(historyList.value)) } catch(e) {}
  appStore.showModal('保存成功', '合同已保存到历史记录', 'success')
}

function reviewContract() {
  if (!contract.value) return
  reviewResult.value = {
    score: 85, level: 'good',
    items: [
      { pass: true, text: '合同主体信息完整，甲方乙方信息明确' },
      { pass: true, text: '合同金额条款清晰，支付方式明确' },
      { pass: true, text: '保密条款设置合理，保密期限明确' },
      { pass: true, text: '违约责任条款完整，违约金比例合理' },
      { pass: false, text: '建议补充不可抗力条款' },
      { pass: false, text: '建议明确争议解决的管辖法院' },
      { pass: true, text: '知识产权条款设置合理' },
      { pass: true, text: '合同期限约定明确' }
    ]
  }
  appStore.showModal('审查完成', '合规审查已完成，请查看审查结果', 'info')
}

function loadHistory(item) {
  contract.value = { ...item }
  editing.value = false
  reviewResult.value = null
  showHistory.value = false
}

function deleteHistory(id) {
  if (!confirm('确定要删除此历史记录吗？')) return
  historyList.value = historyList.value.filter(item => item.id !== id)
  try { localStorage.setItem('contract_history', JSON.stringify(historyList.value)) } catch(e) {}
  appStore.showModal('删除成功', '历史记录已删除', 'success')
}

// 合同审核相关函数
function triggerUpload() {
  fileInput.value.click()
}

function handleFileUpload(e) {
  const file = e.target.files[0]
  if (file) {
    uploadedFile.value = file
    externalReviewResult.value = null
  }
}

function handleDrop(e) {
  const file = e.dataTransfer.files[0]
  if (file) {
    uploadedFile.value = file
    externalReviewResult.value = null
  }
}

function removeFile() {
  uploadedFile.value = null
  externalReviewResult.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function startExternalReview() {
  if (!uploadedFile.value) return
  isReviewing.value = true
  externalReviewResult.value = null

  // 模拟审核过程
  setTimeout(() => {
    const fileName = uploadedFile.value.name.toLowerCase()
    const isContract = fileName.includes('合同') || fileName.includes('contract') || 
                       fileName.includes('协议') || fileName.includes('agreement')
    
    if (isContract) {
      externalReviewResult.value = {
        score: 82,
        level: 'good',
        summary: '该合同文件整体结构完整，主要条款齐全，但存在部分需要完善的细节。',
        items: [
          { type: 'success', title: '合同主体信息', description: '甲乙双方信息明确，主体资格描述清晰' },
          { type: 'success', title: '标的物描述', description: '合同标的描述具体，数量和质量要求明确' },
          { type: 'warning', title: '付款条款', description: '建议明确付款时间节点和付款方式，避免歧义' },
          { type: 'warning', title: '违约责任', description: '违约金比例偏低，建议提高至合同总额的10-15%' },
          { type: 'error', title: '不可抗力条款', description: '缺少不可抗力条款，建议补充自然灾害、政策变化等情况的处理方式' },
          { type: 'success', title: '争议解决', description: '争议解决条款设置合理，管辖法院明确' }
        ]
      }
    } else {
      externalReviewResult.value = {
        score: 65,
        level: 'warning',
        summary: '该文件可能不是标准合同格式，建议检查文件内容。',
        items: [
          { type: 'warning', title: '文件格式', description: '未检测到标准合同格式，可能是其他类型的文档' },
          { type: 'warning', title: '内容识别', description: 'AI无法准确识别合同关键条款，请人工核实' },
          { type: 'info', title: '建议', description: '建议上传标准格式的合同文件以获得更准确的审核结果' }
        ]
      }
    }
    
    isReviewing.value = false
    appStore.showModal('审核完成', '合同审核已完成，请查看审核结果', 'info')
  }, 2000)
}
</script>

<style scoped>
.contract-page { display: flex; flex-direction: column; height: 100vh; background: #f5f7fa; position: relative; padding: 24px; }
/* Agent Header - 与其他Agent保持一致 */
.agent-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.agent-title { display: flex; align-items: center; gap: 16px; }
.agent-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; }
.agent-icon.contract { background: linear-gradient(135deg, #10b981, #059669); }
.agent-title h2 { font-size: 20px; font-weight: 800; color: #1f2937; }
.agent-title p { font-size: 13px; color: #6b7280; margin-top: 2px; }
.agent-actions { display: flex; gap: 10px; }
.action-btn { padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; font-family: inherit; background: #fff; color: #374151; transition: all 0.2s; }
.action-btn:hover { border-color: #10b981; color: #10b981; }
.action-btn.primary { background: #10b981; color: #fff; border-color: #10b981; }
.action-btn.primary:hover { background: #059669; }
.page-body { flex: 1; display: flex; gap: 20px; padding: 0; overflow: hidden; }
.left-panel { width: 340px; flex-shrink: 0; overflow-y: auto; }
.panel-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.card-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
.card-title i { color: #6366f1; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
.form-input, .form-select, .form-textarea { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; color: #1f2937; background: #fff; transition: all 0.2s; font-family: inherit; box-sizing: border-box; }
.form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.form-textarea { resize: vertical; min-height: 80px; }
.date-range { display: flex; align-items: center; gap: 8px; }
.date-sep { color: #9ca3af; font-size: 13px; }
.generate-btn { width: 100%; padding: 10px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; margin-top: 8px; }
.generate-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
.generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.right-panel { flex: 1; min-width: 0; background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow-y: auto; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px; text-align: center; }
.empty-icon { width: 80px; height: 80px; background: linear-gradient(135deg, #ede9fe, #e0e7ff); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 36px; color: #6366f1; margin-bottom: 20px; }
.empty-state h3 { font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
.empty-state p { font-size: 14px; color: #6b7280; margin-bottom: 24px; }
.feature-list { display: flex; flex-direction: column; gap: 10px; }
.feature-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; }
.feature-item i { color: #10b981; }
.contract-preview { padding: 24px; }
.preview-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
.preview-header h2 { font-size: 20px; font-weight: 700; color: #1f2937; }
.preview-actions { display: flex; gap: 8px; }
.preview-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; background: #fff; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; color: #6b7280; cursor: pointer; transition: all 0.2s; }
.preview-btn:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
.preview-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.preview-btn.primary { background: #6366f1; color: #fff; border-color: #6366f1; }
.preview-btn.primary:hover { background: #4f46e5; }
.contract-meta { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; padding: 16px; background: #f9fafb; border-radius: 8px; }
.meta-item { font-size: 13px; }
.meta-label { color: #6b7280; }
.meta-value { color: #1f2937; font-weight: 500; }
.meta-value.amount { color: #dc2626; font-weight: 700; }
.contract-content-area { min-height: 200px; }
.contract-text { font-size: 14px; line-height: 1.8; color: #374151; }
.contract-text :deep(h2) { font-size: 20px; font-weight: 700; color: #1f2937; margin: 24px 0 12px; text-align: center; }
.contract-text :deep(h3) { font-size: 15px; font-weight: 600; color: #1f2937; margin: 20px 0 8px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
.contract-text :deep(p) { margin: 8px 0; }
.contract-text :deep(strong) { color: #111827; }
.edit-textarea { width: 100%; min-height: 400px; padding: 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; line-height: 1.8; color: #374151; font-family: inherit; resize: vertical; box-sizing: border-box; }
.edit-textarea:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.review-panel { margin-top: 24px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; }
.review-header { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #0369a1; margin-bottom: 12px; }
.review-header i { font-size: 16px; }
.review-score { margin-left: auto; padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 700; }
.review-score.good { background: #d1fae5; color: #065f46; }
.review-score.warning { background: #fef3c7; color: #92400e; }
.review-score.danger { background: #fee2e2; color: #991b1b; }
.review-body { display: flex; flex-direction: column; gap: 8px; }
.review-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; }
.review-item i.pass { color: #10b981; }
.review-item i.warn { color: #f59e0b; }
.history-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 100; display: flex; justify-content: flex-end; }
.history-sidebar { width: 360px; background: #fff; height: 100%; display: flex; flex-direction: column; box-shadow: -4px 0 20px rgba(0,0,0,0.1); }
.history-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; }
.history-header h3 { font-size: 15px; font-weight: 600; color: #1f2937; }
.close-btn { background: none; border: none; font-size: 16px; color: #6b7280; cursor: pointer; padding: 4px; }
.close-btn:hover { color: #ef4444; }
.history-list { flex: 1; overflow-y: auto; padding: 12px; }
.history-empty { text-align: center; color: #9ca3af; font-size: 13px; padding: 40px; }
.history-item { display: flex; align-items: center; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 8px; transition: all 0.2s; }
.history-item:hover { border-color: #10b981; background: #ecfdf5; }
.history-item-content { flex: 1; cursor: pointer; min-width: 0; }
.history-title { font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.history-info { display: flex; justify-content: space-between; font-size: 12px; color: #9ca3af; }
.delete-btn { background: none; border: none; color: #9ca3af; cursor: pointer; padding: 6px; border-radius: 4px; transition: all 0.2s; flex-shrink: 0; margin-left: 8px; }
.delete-btn:hover { color: #ef4444; background: #fef2f2; }

/* 合同审核面板 */
.review-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 100; display: flex; justify-content: flex-end; }
.review-panel-sidebar { width: 420px; background: #fff; height: 100%; display: flex; flex-direction: column; box-shadow: -4px 0 20px rgba(0,0,0,0.1); }
.review-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; }
.review-panel-header h3 { font-size: 15px; font-weight: 600; color: #1f2937; display: flex; align-items: center; gap: 8px; }
.review-panel-header h3 i { color: #10b981; }
.review-panel-body { flex: 1; overflow-y: auto; padding: 20px; }

/* 上传区域 */
.upload-section { margin-bottom: 20px; }
.upload-area { border: 2px dashed #d1d5db; border-radius: 12px; padding: 30px; text-align: center; cursor: pointer; transition: all 0.2s; }
.upload-area:hover { border-color: #10b981; background: #ecfdf5; }
.upload-placeholder i { font-size: 40px; color: #9ca3af; margin-bottom: 12px; }
.upload-placeholder p { font-size: 14px; color: #374151; margin-bottom: 4px; }
.upload-placeholder span { font-size: 12px; color: #9ca3af; }
.uploaded-file { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f0fdf4; border-radius: 8px; }
.uploaded-file i { font-size: 24px; color: #10b981; }
.uploaded-file div { flex: 1; text-align: left; }
.uploaded-file p { font-size: 14px; font-weight: 500; color: #1f2937; }
.uploaded-file span { font-size: 12px; color: #6b7280; }
.remove-file { background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px; }
.remove-file:hover { color: #ef4444; }

/* 审核选项 */
.review-options { margin-bottom: 20px; }
.review-options h4 { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 10px; }
.review-option { display: flex; align-items: center; gap: 8px; padding: 8px 0; font-size: 13px; color: #374151; cursor: pointer; }
.review-option input[type="checkbox"] { accent-color: #10b981; }

/* 开始审核按钮 */
.start-review-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
.start-review-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
.start-review-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* 审核结果 */
.external-review-result { margin-top: 20px; background: #f9fafb; border-radius: 12px; padding: 16px; }
.result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.result-header h4 { font-size: 14px; font-weight: 600; color: #1f2937; }
.result-score { padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 700; }
.result-score.good { background: #d1fae5; color: #065f46; }
.result-score.warning { background: #fef3c7; color: #92400e; }
.result-score.danger { background: #fee2e2; color: #991b1b; }
.result-summary { margin-bottom: 16px; }
.result-summary p { font-size: 13px; color: #374151; line-height: 1.6; }
.result-items { display: flex; flex-direction: column; gap: 10px; }
.result-item { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
.result-item-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.result-item-header i { font-size: 14px; }
.result-item-header .fa-times-circle { color: #ef4444; }
.result-item-header .fa-exclamation-triangle { color: #f59e0b; }
.result-item-header .fa-check-circle { color: #10b981; }
.result-item-title { font-size: 13px; font-weight: 600; color: #1f2937; }
.result-item-desc { font-size: 12px; color: #6b7280; line-height: 1.5; margin: 0; }
</style>
