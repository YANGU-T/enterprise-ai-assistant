# 项目结构说明

## 完整目录结构

```
enterprise-ai-assistant/
├── 📁 client/                          # 前端项目 (Vue.js 3)
│   ├── 📁 src/
│   │   ├── 📁 assets/                  # 静态资源
│   │   │   └── main.css               # 全局样式
│   │   ├── 📁 components/             # 组件
│   │   │   ├── 📁 common/             # 通用组件
│   │   │   │   ├── ModalOverlay.vue   # 模态框组件
│   │   │   │   └── NotificationToast.vue # 通知提示组件
│   │   │   └── 📁 layout/             # 布局组件
│   │   │       ├── AppHeader.vue      # 顶部导航栏
│   │   │       └── AppSidebar.vue     # 侧边栏导航
│   │   ├── 📁 router/                 # 路由配置
│   │   │   └── index.js              # 路由定义
│   │   ├── 📁 stores/                 # 状态管理
│   │   │   └── index.js              # Pinia Store
│   │   ├── 📁 views/                  # 页面视图
│   │   │   ├── Dashboard.vue         # 仪表盘
│   │   │   ├── Workflow.vue          # 工作流管理
│   │   │   ├── Approval.vue          # 审批中心
│   │   │   └── Tasks.vue             # 任务管理
│   │   ├── App.vue                   # 主应用组件
│   │   └── main.js                   # 入口文件
│   ├── 📁 public/                     # 公共静态文件
│   ├── Dockerfile                    # Docker配置
│   ├── index.html                    # HTML模板
│   ├── package.json                  # 依赖配置
│   ├── postcss.config.js             # PostCSS配置
│   ├── tailwind.config.js            # Tailwind CSS配置
│   └── vite.config.js                # Vite配置
│
├── 📁 server/                          # 后端项目 (Express.js)
│   ├── 📁 src/
│   │   ├── 📁 database/               # 数据库
│   │   │   └── init.js               # 数据库初始化
│   │   ├── 📁 routes/                 # API路由
│   │   │   ├── auth.js               # 认证路由
│   │   │   ├── workflows.js          # 工作流路由
│   │   │   ├── approvals.js          # 审批路由
│   │   │   ├── tasks.js              # 任务路由
│   │   │   ├── projects.js           # 项目路由
│   │   │   ├── ai.js                 # AI路由
│   │   │   └── notifications.js      # 通知路由
│   │   └── index.js                  # 服务器入口
│   ├── Dockerfile                    # Docker配置
│   ├── .env                          # 环境变量
│   ├── .env.example                  # 环境变量示例
│   └── package.json                  # 依赖配置
│
├── 📄 docker-compose.yml               # Docker Compose配置
├── 📄 package.json                     # 根目录配置
├── 📄 README.md                        # 项目说明
├── 📄 PROJECT_STRUCTURE.md             # 项目结构说明
├── 📄 start.bat                        # Windows启动脚本
├── 📄 start.sh                         # Linux/Mac启动脚本
└── 📄 .gitignore                       # Git忽略文件
```

## 核心模块说明

### 1. 仪表盘 (Dashboard)
- 数据概览卡片
- 实时统计图表
- 快捷操作入口
- 待办事项列表
- 最近活动记录

### 2. 工作流管理 (Workflow)
- 工作流模板库
- 申请记录管理
- 审批流程处理
- AI端到端执行

### 3. 审批中心 (Approval)
- 待审批列表
- 批量审批操作
- 审批历史记录
- 统计分析

### 4. 任务管理 (Task)
- 任务列表视图
- 任务看板视图
- 任务状态管理
- 优先级设置

### 5. 项目管理 (Project)
- 项目生命周期
- 里程碑管理
- 进度跟踪
- 风险监控

### 6. AI工作台 (AI Workbench)
- 角色专属工作流
- AI智能建议
- 自动化执行
- 联动通知

### 7. 通知中心 (Notification)
- 实时消息推送
- 消息分类标记
- 联动通知

## API接口

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `PUT /api/auth/password` - 修改密码

### 工作流相关
- `GET /api/workflows` - 获取工作流列表
- `POST /api/workflows` - 创建工作流
- `PUT /api/workflows/:id` - 更新工作流
- `DELETE /api/workflows/:id` - 删除工作流
- `POST /api/workflows/:id/execute` - 执行工作流

### 审批相关
- `GET /api/approvals` - 获取审批列表
- `POST /api/approvals` - 创建审批
- `POST /api/approvals/:id/approve` - 批准审批
- `POST /api/approvals/:id/reject` - 驳回审批

### 任务相关
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务
- `PATCH /api/tasks/:id/status` - 更新任务状态

### 项目相关
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目
- `PATCH /api/projects/:id/progress` - 更新项目进度
- `POST /api/projects/:id/milestones` - 添加里程碑

### AI相关
- `GET /api/ai/executions` - 获取AI执行记录
- `POST /api/ai/execute` - 执行AI任务
- `GET /api/ai/suggestions` - 获取AI建议
- `GET /api/ai/workbench` - 获取AI工作台数据

### 通知相关
- `GET /api/notifications` - 获取通知列表
- `GET /api/notifications/unread-count` - 获取未读通知数量
- `POST /api/notifications` - 创建通知
- `PATCH /api/notifications/:id/read` - 标记通知为已读
- `PATCH /api/notifications/read-all` - 标记所有通知为已读
- `DELETE /api/notifications/:id` - 删除通知
- `DELETE /api/notifications` - 清空所有通知

## 技术栈

### 前端
- **Vue.js 3** - 渐进式JavaScript框架
- **Vite** - 下一代前端构建工具
- **Pinia** - Vue.js 状态管理库
- **Vue Router** - Vue.js 官方路由管理器
- **Tailwind CSS** - 实用优先的CSS框架
- **Chart.js** - 简单灵活的JavaScript图表库
- **Axios** - 基于Promise的HTTP客户端

### 后端
- **Express.js** - 快速、开放、极简的Web框架
- **SQLite** - 轻量级嵌入式数据库
- **JWT** - JSON Web Token身份验证
- **bcrypt** - 密码哈希库
- **express-validator** - 表单验证中间件
- **helmet** - 安全中间件
- **cors** - 跨域资源共享中间件

### 开发工具
- **ESLint** - 代码规范检查
- **Prettier** - 代码格式化
- **Docker** - 容器化部署
- **Git** - 版本控制

## 功能特性

### 1. 模块联动
- 工作流审批触发通知
- 任务完成更新项目进度
- AI代理执行操作并记录日志
- 实时数据同步

### 2. 逻辑闭环
- 完整的审批流程
- 任务生命周期管理
- 项目进度跟踪
- AI智能建议

### 3. 响应式设计
- 完美还原企业级界面
- 支持多种屏幕尺寸
- 流畅的动画效果

### 4. 安全性
- JWT身份验证
- 密码加密存储
- CORS跨域保护
- 安全头部设置

## 部署说明

### 开发环境
```bash
# 安装依赖
npm run install:all

# 初始化数据库
npm run db:init

# 启动开发服务器
npm run dev
```

### 生产环境
```bash
# 构建前端
npm run build

# 启动后端
npm start
```

### Docker部署
```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 默认账号

- **用户名**: admin
- **密码**: password

## 注意事项

1. 首次运行需要初始化数据库
2. 环境变量文件已自动创建，如需修改请编辑 `server/.env`
3. 前端开发服务器默认端口为5173，后端为3000
4. 数据库文件默认存储在 `server/database.sqlite`
5. 生产环境部署时请修改JWT密钥