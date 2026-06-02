<template>
  <div class="editor-page">
    <div class="editor-header">
      <div class="editor-title">
        <div class="back-btn" @click="goBack"><i class="fas fa-arrow-left"></i></div>
        <div>
          <h2>{{ projectInfo.name || '解决方案' }} - 方案编辑</h2>
          <p>{{ projectInfo.industry }} · 预算: {{ projectInfo.budget }} · 周期: {{ projectInfo.timeline }}</p>
        </div>
      </div>
      <div class="editor-actions">
        <button class="action-btn" @click="goToChat"><i class="fas fa-comments"></i> AI对话</button>
        <button class="action-btn" @click="copyContent"><i class="fas fa-copy"></i> 复制</button>
        <button class="action-btn" @click="download"><i class="fas fa-download"></i> 下载</button>
        <button class="action-btn primary" @click="saveSolution"><i class="fas fa-save"></i> 保存方案</button>
      </div>
    </div>

    <div class="editor-content">
      <div class="section-panel">
        <h3 class="panel-title"><i class="fas fa-list-ul"></i> 方案章节</h3>
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
            <textarea class="editor-textarea" v-model="sections[activeSection].content" @input="markEdited" rows="20" placeholder="在此编辑章节内容..."></textarea>
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
const previewRef = ref(null)

const projectInfo = reactive({
  name: '',
  industry: '',
  budget: '',
  timeline: '',
  requirements: '',
  techStack: ''
})

const sections = ref([])

const defaultSections = {
  '信息技术': [
    { title: '项目概述', description: '项目背景、目标与范围说明', content: '', edited: false },
    { title: '需求分析', description: '业务需求、功能需求与非功能需求', content: '', edited: false },
    { title: '技术架构设计', description: '系统架构、技术选型与部署方案', content: '', edited: false },
    { title: '实施方案', description: '项目阶段划分、里程碑与交付物', content: '', edited: false },
    { title: '项目团队', description: '人员配置、角色分工与沟通机制', content: '', edited: false },
    { title: '预算与报价', description: '费用明细、付款方式与税务说明', content: '', edited: false },
    { title: '风险管理', description: '风险识别、应对措施与保障机制', content: '', edited: false }
  ],
  '建筑工程': [
    { title: '工程概况', description: '项目名称、建设规模与地理位置', content: '', edited: false },
    { title: '施工方案', description: '施工组织、技术方案与工艺流程', content: '', edited: false },
    { title: '施工进度计划', description: '工期安排、关键节点与资源配置', content: '', edited: false },
    { title: '质量保证措施', description: '质量标准、检验方法与验收流程', content: '', edited: false },
    { title: '安全生产措施', description: '安全制度、应急预案与防护措施', content: '', edited: false },
    { title: '施工组织设计', description: '管理机构、人员配置与职责分工', content: '', edited: false },
    { title: '报价明细', description: '工程量清单、单价与总价汇总', content: '', edited: false }
  ],
  '医疗卫生': [
    { title: '项目概述', description: '项目背景、建设目标与实施范围', content: '', edited: false },
    { title: '需求分析', description: '医疗业务流程与信息化需求梳理', content: '', edited: false },
    { title: '系统架构', description: '技术架构、集成方案与数据标准', content: '', edited: false },
    { title: '实施计划', description: '实施步骤、里程碑与验收标准', content: '', edited: false },
    { title: '合规与安全', description: '医疗规范、数据安全与隐私保护', content: '', edited: false },
    { title: '培训与运维', description: '培训方案、运维体系与售后服务', content: '', edited: false },
    { title: '投资预算', description: '软硬件费用、实施费用与运维费用', content: '', edited: false }
  ],
  '教育培训': [
    { title: '项目概述', description: '项目背景、教学目标与实施范围', content: '', edited: false },
    { title: '需求分析', description: '教学需求、用户需求与功能需求', content: '', edited: false },
    { title: '平台设计', description: '平台架构、功能模块与用户体验', content: '', edited: false },
    { title: '课程内容', description: '课程体系、资源建设与教学模式', content: '', edited: false },
    { title: '实施计划', description: '上线步骤、推广计划与运营方案', content: '', edited: false },
    { title: '技术支持', description: '系统运维、技术保障与迭代升级', content: '', edited: false },
    { title: '项目预算', description: '开发费用、内容费用与运营费用', content: '', edited: false }
  ],
  '金融服务': [
    { title: '项目概述', description: '项目背景、业务目标与实施范围', content: '', edited: false },
    { title: '需求分析', description: '金融业务流程与系统功能需求', content: '', edited: false },
    { title: '技术方案', description: '架构设计、技术选型与安全方案', content: '', edited: false },
    { title: '安全合规', description: '监管要求、安全标准与审计机制', content: '', edited: false },
    { title: '实施计划', description: '阶段划分、里程碑与交付物', content: '', edited: false },
    { title: '运维保障', description: '运维体系、应急响应与灾备方案', content: '', edited: false },
    { title: '投资预算', description: '开发费用、安全费用与运维费用', content: '', edited: false }
  ],
  '智能制造': [
    { title: '项目概述', description: '项目背景、智能化目标与实施范围', content: '', edited: false },
    { title: '现状诊断', description: '产线现状、痛点分析与改进方向', content: '', edited: false },
    { title: '技术方案', description: 'MES/IoT/大数据等技术实施方案', content: '', edited: false },
    { title: '设备集成', description: '设备接入、数据采集与边缘计算', content: '', edited: false },
    { title: '实施路径', description: '分阶段实施计划与里程碑', content: '', edited: false },
    { title: '运维与培训', description: '运维体系、人员培训与持续优化', content: '', edited: false },
    { title: '投资预算', description: '硬件费用、软件费用与实施费用', content: '', edited: false }
  ]
}

const demoContents = {
  '项目概述': (p) => `## 项目背景\n\n${p.name}旨在通过${p.industry}领域的专业技术与服务，为客户提供高效、可靠的解决方案。本项目基于行业最佳实践和前沿技术，结合客户的实际需求，制定科学合理的实施方案。\n\n## 项目目标\n\n- 构建${p.requirements || '满足业务需求的核心系统'}\n- 确保项目在${p.budget || '预算范围内'}完成\n- 按时交付，项目周期为${p.timeline || '待定'}\n- 达到行业领先的技术水平与服务质量\n\n## 项目范围\n\n本项目涵盖需求分析、系统设计、开发实施、测试验收及上线运维等全生命周期服务。`,
  '需求分析': (p) => `## 业务需求\n\n根据前期沟通，项目的核心需求包括：\n\n1. ${p.requirements || '业务功能需求待补充'}\n2. 系统需具备高可用性与可扩展性\n3. 支持多用户并发访问\n4. 满足行业规范与标准\n\n## 功能需求\n\n- 核心业务流程自动化\n- 数据实时采集与分析\n- 可视化监控与报表\n- 用户权限管理与审计\n\n## 非功能需求\n\n- 系统可用性 ≥ 99.9%\n- 数据响应时间 < 2秒\n- 支持横向扩展\n- 数据备份与灾难恢复`,
  '技术架构设计': (p) => `## 架构设计理念\n\n采用微服务架构设计，前后端分离，确保系统的高可用性、可扩展性和易维护性。${p.techStack && p.techStack !== '不限' ? '推荐技术栈：' + p.techStack + '。' : '技术选型将根据实际需求确定。'}\n\n## 系统架构图\n\n展示层 → Web端 / 移动端 / 大屏\n接入层 → API网关 / 负载均衡\n服务层 → 业务微服务集群\n数据层 → 关系数据库 / 缓存 / 搜索引擎\n\n## 关键技术选型\n\n- 前端：Vue.js / React\n- 后端：Spring Cloud / Node.js\n- 数据库：MySQL / PostgreSQL / MongoDB\n- 缓存：Redis\n- 消息队列：Kafka / RabbitMQ`,
  '实施方案': (p) => `## 项目阶段划分\n\n| 阶段 | 内容 | 工期 |\n|------|------|------|\n| 第一阶段 | 需求调研与方案设计 | 2-3周 |\n| 第二阶段 | 核心功能开发 | 4-6周 |\n| 第三阶段 | 系统集成与测试 | 2-3周 |\n| 第四阶段 | 部署上线与培训 | 1-2周 |\n\n## 关键里程碑\n\n- 里程碑1：需求确认与方案评审\n- 里程碑2：系统原型确认\n- 里程碑3：功能开发完成\n- 里程碑4：系统验收与上线\n\n## 交付物清单\n\n- 需求规格说明书\n- 系统设计文档\n- 源代码与部署包\n- 测试报告\n- 用户操作手册\n- 运维手册`,
  '项目团队': (p) => `## 人员配置\n\n| 角色 | 人数 | 职责 |\n|------|------|------|\n| 项目经理 | 1 | 项目整体管理与协调 |\n| 技术负责人 | 1 | 技术方案与架构设计 |\n| 前端工程师 | 2-3 | 前端界面开发 |\n| 后端工程师 | 2-3 | 服务端开发 |\n| 测试工程师 | 1-2 | 测试与质量保障 |\n| 运维工程师 | 1 | 部署与运维支持 |\n\n## 沟通机制\n\n- 每日站会\n- 周进度汇报\n- 月度里程碑评审\n- 问题升级机制`,
  '预算与报价': (p) => `## 费用概览\n\n项目总预算约${p.budget || '待确认'}，包含以下费用：\n\n## 费用明细\n\n| 费用类别 | 金额 | 说明 |\n|----------|------|------|\n| 人力成本 | 根据实际评估 | 开发、测试、运维人员费用 |\n| 软件授权 | 根据实际评估 | 第三方软件、中间件授权 |\n| 硬件设备 | 根据实际评估 | 服务器、存储、网络设备 |\n| 实施服务 | 根据实际评估 | 部署、培训、数据迁移 |\n| 年度运维 | 根据实际评估 | 首年运维支持费用 |\n\n## 付款方式\n\n- 合同签订：30%\n- 原型确认：30%\n- 验收上线：30%\n- 质保期满：10%`,
  '风险管理': (p) => `## 风险识别\n\n| 风险类型 | 风险描述 | 可能性 | 影响程度 |\n|----------|----------|--------|----------|\n| 技术风险 | 技术选型不当 | 中 | 高 |\n| 进度风险 | 项目延期 | 中 | 高 |\n| 需求风险 | 需求频繁变更 | 高 | 中 |\n| 人员风险 | 核心人员变动 | 低 | 高 |\n| 沟通风险 | 需求理解偏差 | 中 | 中 |\n\n## 应对措施\n\n1. **技术风险**：前期充分技术调研，选择成熟稳定方案\n2. **进度风险**：设置里程碑节点，建立预警机制\n3. **需求风险**：采用敏捷开发，定期评审，控制范围\n4. **人员风险**：建立知识文档体系，多人备份关键岗位\n5. **沟通风险**：建立定期沟通机制，及时对齐需求`,
  '工程概况': (p) => `## 工程基本情况\n\n${p.name}位于${p.region || '待定'}，总建筑面积约${p.requirements || '待定'}。本项目为${p.industry}领域重点工程，旨在打造行业标杆。\n\n## 主要建设内容\n\n- 主体建筑工程\n- 配套设施工程\n- 室外景观工程\n- 机电安装工程\n\n## 工期要求\n\n总工期${p.timeline || '待定'}，计划开工日期以监理工程师签发的开工令为准。`,
  '施工方案': (p) => `## 施工总体部署\n\n根据工程特点和现场条件，采用分区段、分专业的流水施工组织方式。\n\n## 主要施工方法\n\n1. **基础工程**：采用机械开挖与人工清槽相结合\n2. **主体结构**：采用钢筋混凝土框架结构\n3. **屋面工程**：采用防水卷材与涂料复合防水\n4. **装饰装修**：按样板先行原则组织施工\n\n## 质量保证措施\n\n- 严格执行"三检"制度\n- 材料进场检验\n- 过程质量控制\n- 隐蔽工程验收`,
  '施工进度计划': (p) => `## 总体进度安排\n\n工程总工期${p.timeline || '待定'}，分三个阶段实施：\n\n## 关键线路\n\n土方开挖 → 基础施工 → 主体结构 → 屋面工程 → 装饰装修 → 竣工验收\n\n## 工期保证措施\n\n- 配备充足的人力、物力资源\n- 采用先进的施工技术和工艺\n- 加强进度动态管理\n- 建立进度预警与调整机制`,
  '质量保证措施': (p) => `## 质量目标\n\n确保工程质量达到国家现行验收规范的合格标准。\n\n## 质量管理体系\n\n建立完善的质量管理体系，严格执行ISO9001质量管理标准。\n\n## 质量控制要点\n\n1. 原材料质量控制\n2. 施工过程质量控制\n3. 分项工程质量检验\n4. 竣工验收质量控制\n\n## 质量检测计划\n\n制定详细的质量检测计划，确保各工序质量符合设计和规范要求。`,
  '安全生产措施': (p) => `## 安全管理目标\n\n杜绝重大安全事故，轻伤频率控制在1‰以下。\n\n## 安全管理制度\n\n- 安全生产责任制\n- 安全技术交底制度\n- 安全检查制度\n- 安全教育培训制度\n\n## 应急预案\n\n制定火灾、高处坠落、触电、物体打击等专项应急预案，定期组织演练。`,
  '施工组织设计': (p) => `## 组织机构设置\n\n成立项目经理部，设项目经理1人，项目技术负责人1人，配备各专业管理人员。\n\n## 人员配置\n\n| 岗位 | 人数 | 职责 |\n|------|------|------|\n| 项目经理 | 1 | 全面负责项目管理 |\n| 技术负责人 | 1 | 技术管理与质量控制 |\n| 施工员 | 2 | 现场施工管理 |\n| 质检员 | 1 | 质量检查与验收 |\n| 安全员 | 1 | 安全管理与监督 |\n| 资料员 | 1 | 工程资料管理 |`,
  '报价明细': (p) => `## 工程量清单报价\n\n| 序号 | 项目名称 | 单位 | 数量 | 单价(元) | 合价(元) |\n|------|----------|------|------|----------|----------|\n| 1 | 分部分项工程 | 项 | 1 | - | - |\n| 2 | 措施项目 | 项 | 1 | - | - |\n| 3 | 其他项目 | 项 | 1 | - | - |\n| 4 | 规费 | 项 | 1 | - | - |\n| 5 | 税金 | 项 | 1 | - | - |\n\n## 投标总价\n\n投标总价：${p.budget || '待报价'}`,
  '系统架构': (p) => `## 总体架构\n\n采用分层架构设计，包括数据层、服务层、应用层和展示层。\n\n## 数据架构\n\n- 数据源：HIS、PACS、LIS、EMR等\n- 数据集成：ETL/ESB数据交换\n- 数据存储：数据仓库+数据湖\n- 数据应用：BI分析、AI辅助诊断\n\n## 集成方案\n\n- 标准接口：HL7/FHIR/DICOM\n- 集成平台：ESB企业服务总线\n- 数据中心：统一临床数据中心\n\n## 数据安全\n\n- 数据分级分类保护\n- 访问权限控制\n- 数据加密传输与存储\n- 操作审计与追溯`,
  '合规与安全': (p) => `## 合规要求\n\n- ${p.techStack || '等保三级'}\n- 互联互通标准化成熟度测评\n- 电子病历系统应用水平分级\n- 智慧服务/管理分级评估\n\n## 数据安全\n\n- 患者隐私保护\n- 数据脱敏与匿名化\n- 安全审计日志\n- 应急响应预案\n\n## 业务连续性\n\n- 双活数据中心\n- RPO<1小时，RTO<2小时\n- 定期灾备演练`,
  '培训与运维': (p) => `## 培训方案\n\n| 培训对象 | 培训内容 | 培训时长 |\n|----------|----------|----------|\n| 管理人员 | 系统管理、报表分析 | 2天 |\n| 医护人员 | 临床操作、业务流程 | 3天 |\n| 技术人员 | 系统维护、故障处理 | 5天 |\n\n## 运维体系\n\n- 7×24小时运维支持\n- 定期巡检与健康检查\n- 版本管理与升级服务\n- 备件保障与应急响应`,
  '投资预算': (p) => `## 投资概算\n\n| 项目 | 金额(万元) | 说明 |\n|------|-----------|------|\n| 硬件设备 | 根据实际 | 服务器、存储、网络 |\n| 软件许可 | 根据实际 | 操作系统、数据库、中间件 |\n| 应用软件 | 根据实际 | 定制开发费用 |\n| 实施服务 | 根据实际 | 实施、培训、数据迁移 |\n| 运维服务 | 根据实际 | 首年运维费用 |\n\n## 资金来源\n\n项目总投资约${p.budget || '待确认'}。`,
  '平台设计': (p) => `## 平台架构\n\n采用SaaS架构设计，支持多租户、高并发、弹性扩展。\n\n## 功能模块\n\n- 用户管理：学员、教师、管理员\n- 课程管理：课程创建、发布、分类\n- 学习管理：视频、文档、测验\n- 直播互动：实时直播、互动问答\n- 数据分析：学习数据、行为分析\n- 运营管理：活动、推广、变现\n\n## 用户体验\n\n- 响应式设计，支持多端访问\n- 个性化学习路径推荐\n- 游戏化学习激励机制\n- 社交化学习社区`,
  '课程内容': (p) => `## 课程体系建设\n\n- 基础课程：夯实基础知识\n- 专业课程：深化专业能力\n- 实战课程：项目驱动学习\n- 拓展课程：前沿技术探索\n\n## 资源建设\n\n- 视频课程：高清录制、多终端适配\n- 课件资源：PPT、PDF、源码\n- 习题库：选择题、编程题、案例题\n- 项目实战：真实场景项目案例\n\n## 教学模式\n\n- 录播自学+直播答疑\n- 项目实战+导师辅导\n- 小组协作+竞赛激励`,
  '安全合规': (p) => `## 安全架构\n\n- 网络安全：防火墙、WAF、入侵检测\n- 应用安全：OWASP Top 10防护\n- 数据安全：加密、脱敏、备份\n- 运维安全：堡垒机、审计日志\n\n## 合规要求\n\n- ${p.techStack || '等保四级'}\n- PCI-DSS支付卡行业标准\n- 金融行业信息系统安全规范\n- 数据安全法与个人信息保护法\n\n## 审计机制\n\n- 操作日志全量记录\n- 定期安全审计\n- 第三方渗透测试\n- 合规检查自动化`,
  '现状诊断': (p) => `## 产线现状\n\n对现有产线进行全面调研与评估，梳理现有设备、系统、工艺流程。\n\n## 痛点分析\n\n- 数据采集不全面，信息孤岛\n- 生产计划依赖人工经验\n- 质量追溯困难\n- 设备维护被动响应\n\n## 改进方向\n\n- 建设MES系统实现生产数字化\n- 部署IoT设备实现设备联网\n- 建立大数据分析平台\n- 实现预测性维护`,
  '设备集成': (p) => `## 设备接入方案\n\n- PLC数据采集：西门子/三菱/欧姆龙\n- CNC数据采集：Fanuc/西门子/Siemens\n- 传感器部署：温度/振动/压力\n- 边缘计算：实时数据处理\n\n## 数据标准\n\n- 设备数据统一建模\n- OPC UA通信协议\n- 数据标签标准化\n- 时序数据存储\n\n## 网络架构\n\n- 工业以太网+5G专网\n- 安全隔离与访问控制\n- 边缘-云端协同`,
  '运维与培训': (p) => `## 运维体系\n\n- 设备远程监控与诊断\n- 备件管理与库存优化\n- 工单管理与派单系统\n- 知识库与经验沉淀\n\n## 人员培训\n\n- 系统操作培训\n- 数据分析技能培训\n- 设备维护技能培训\n- 持续学习平台\n\n## 持续优化\n\n- KPI看板与指标监控\n- 持续改进机制\n- 最佳实践推广`,
  '实施路径': (p) => `## 分阶段实施\n\n| 阶段 | 时间 | 目标 |\n|------|------|------|\n| 第一阶段 | 1-3月 | 设备联网与数据采集 |\n| 第二阶段 | 4-6月 | MES系统上线 |\n| 第三阶段 | 7-9月 | 大数据平台搭建 |\n| 第四阶段 | 10-12月 | AI应用落地 |\n\n## 关键成功因素\n\n- 高层支持与资源保障\n- 业务与IT深度融合\n- 数据质量持续治理\n- 组织变革与能力提升`
}

function generateContent(title, p) {
  const fn = demoContents[title]
  if (fn) return fn(p)
  return `## ${title}\n\n（此处为${p.industry}行业${p.name}项目的${title}内容，请根据实际情况编辑完善。）\n\n项目背景：${p.requirements || '待补充'}\n预算范围：${p.budget || '待确认'}\n项目周期：${p.timeline || '待确认'}`
}

function renderPreview(text) {
  if (!text) return '<p style="color:#9ca3af;font-size:12px;">暂无内容...</p>'
  return text
    .replace(/^## (.*$)/gm, '<h5>$1</h5>')
    .replace(/^### (.*$)/gm, '<h6>$1</h6>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\|(.*)\|$/gm, '<div class="table-row">$1</div>')
    .replace(/^\d+\.\s+(.*$)/gm, '<li>$1</li>')
    .replace(/^-\s+(.*$)/gm, '<li>$1</li>')
    .replace(/\n/g, '<br>')
}

onMounted(() => {
  const saved = route.query.data
  if (saved) {
    try {
      const data = JSON.parse(decodeURIComponent(saved))
      Object.assign(projectInfo, data.projectInfo || {})
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
  const ind = projectInfo.industry || '信息技术'
  sections.value = (defaultSections[ind] || defaultSections['信息技术']).map(s => ({
    ...s,
    content: generateContent(s.title, projectInfo)
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
  appStore.showModal('AI润色', `正在对"${sec.title}"进行智能润色...\n\n优化后的内容将自动替换当前章节。`, 'success')
  setTimeout(() => {
    sec.content = sec.content + '\n\n[AI已润色：优化了语句表达，增强了专业性和逻辑性。]'
    sec.edited = true
  }, 800)
}

function regenerateSection() {
  const sec = sections.value[activeSection.value]
  appStore.showModal('重新生成', `正在为"${sec.title}"重新生成内容...`, 'info')
  setTimeout(() => {
    sec.content = generateContent(sec.title, projectInfo)
    sec.edited = true
  }, 1000)
}

function saveSolution() {
  appStore.showModal('保存成功', '解决方案已保存到工作台', 'success')
}

function goBack() {
  router.push('/agent/solution-gen')
}

function goToChat() {
  router.push({ path: '/chat/solution-gen', query: { from: 'editor', type: 'solution-gen' } })
}

function copyContent() {
  const fullText = sections.value.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n---\n\n')
  navigator.clipboard.writeText(fullText)
  appStore.showModal('复制成功', '方案全文已复制到剪贴板', 'success')
}

function download() {
  appStore.showModal('下载方案', '文档导出功能开发中，即将支持 PDF / Word / Markdown 格式', 'info')
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

/* 章节导航 */
.section-panel { background: var(--bg-white); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; overflow-y: auto; }
.section-nav { display: flex; flex-direction: column; gap: 4px; }
.section-nav-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: all var(--tr); font-size: 12px; }
.section-nav-item:hover { background: #f3f4f6; }
.section-nav-item.active { background: linear-gradient(135deg, rgba(99,102,241,.1), rgba(139,92,246,.1)); border: 1px solid rgba(99,102,241,.2); }
.sec-num { width: 20px; height: 20px; border-radius: 6px; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
.section-nav-item.active .sec-num { background: var(--primary); color: #fff; }
.sec-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.edited-dot { font-size: 6px; color: var(--primary); }

/* 编辑器主体 */
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

/* 预览面板 */
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
