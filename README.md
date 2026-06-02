# 企业AI助手中控平台

一个完整的企业级AI助手中控平台，包含前后端分离架构，支持多模块联动和逻辑闭环。

## 项目特性

- **前后端分离**：Vue.js 3 + Express.js
- **模块化设计**：仪表盘、工作流、审批、任务管理、项目管理、AI工作台等
- **实时联动**：模块间数据互通，操作触发连锁反应
- **AI增强**：智能审批、自动填充、风险预测
- **响应式UI**：基于现有设计系统，完美还原企业级界面

## 项目结构

```
enterprise-ai-assistant/
├── client/                 # Vue.js 前端
│   ├── src/
│   │   ├── components/     # 通用组件
│   │   ├── views/          # 页面视图
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── router/         # Vue Router
│   │   └── assets/         # 静态资源
│   ├── public/
│   └── package.json
├── server/                 # Express 后端
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── services/       # 业务逻辑
│   │   └── middleware/     # 中间件
│   ├── config/             # 配置文件
│   └── package.json
├── shared/                 # 共享代码
│   └── types/              # TypeScript 类型定义
└── package.json            # 根目录配置
```

## 快速开始

### 方式一：使用启动脚本（推荐）

**Windows：**
```bash
# 双击运行 start.bat 或在命令行执行
start.bat
```

**Linux/Mac：**
```bash
# 添加执行权限并运行
chmod +x start.sh
./start.sh
```

### 方式二：手动启动

#### 1. 安装依赖

```bash
# 安装所有依赖（根目录、客户端、服务端）
npm run install:all
```

#### 2. 配置环境变量

环境变量文件已自动创建，如需修改请编辑 `server/.env` 文件。

#### 3. 初始化数据库

```bash
# 初始化数据库并创建表结构
npm run db:init
```

#### 4. 启动开发服务器

```bash
# 同时启动前端和后端开发服务器
npm run dev
```

前端将运行在 `http://localhost:5173`
后端将运行在 `http://localhost:3000`

### 方式三：使用Docker

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 5. 构建生产版本

```bash
npm run build
```

## 核心模块

### 1. 仪表盘 (Dashboard)
- 数据概览卡片
- 实时统计图表
- 快捷操作入口

### 2. 工作流管理 (Workflow)
- 流程模板库
- 申请提交与审批
- AI端到端执行

### 3. 审批中心 (Approval)
- 待办审批列表
- 批量审批操作
- 审批历史记录

### 4. 任务管理 (Task)
- 任务看板视图
- 任务分配与跟踪
- 进度统计

### 5. 项目管理 (Project)
- 项目生命周期管理
- 里程碑与任务融合
- 风险监控

### 6. AI工作台 (AI Workbench)
- 角色专属工作流
- AI智能建议
- 自动化执行

### 7. 通知中心 (Notification)
- 实时消息推送
- 消息分类与标记
- 联动通知

## API 接口

### 认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/profile` - 获取用户信息

### 工作流
- `GET /api/workflows` - 获取工作流列表
- `POST /api/workflows` - 创建工作流
- `PUT /api/workflows/:id` - 更新工作流
- `DELETE /api/workflows/:id` - 删除工作流

### 审批
- `GET /api/approvals` - 获取审批列表
- `POST /api/approvals/:id/approve` - 批准审批
- `POST /api/approvals/:id/reject` - 驳回审批

### 任务
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务

### 项目
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `PUT /api/projects/:id` - 更新项目

### AI
- `POST /api/ai/execute` - 执行AI任务
- `GET /api/ai/suggestions` - 获取AI建议

## 技术栈

### 前端
- Vue.js 3 (Composition API)
- Vite (构建工具)
- Pinia (状态管理)
- Vue Router (路由)
- Tailwind CSS (样式)
- Chart.js (图表)

### 后端
- Express.js (Web框架)
- SQLite/PostgreSQL (数据库)
- JWT (身份验证)
- bcrypt (密码加密)
- cors (跨域处理)

### 开发工具
- ESLint (代码规范)
- Prettier (代码格式化)
- Git (版本控制)

## 部署

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
# 构建前端
npm run build

# 启动后端
npm start
```

### Docker 部署
```bash
docker-compose up -d
```

### 云平台部署（推荐）

#### 1. Render 部署（免费）

**步骤：**

1. **注册 Render 账号**
   - 访问 [render.com](https://render.com)
   - 使用 GitHub 账号注册

2. **创建 PostgreSQL 数据库**
   - 在 Render 控制台点击 "New" → "PostgreSQL"
   - 选择免费计划
   - 记录数据库连接字符串

3. **部署后端服务**
   - 点击 "New" → "Web Service"
   - 连接 GitHub 仓库
   - 配置：
     - **Runtime**: Node
     - **Build Command**: `cd server && npm install`
     - **Start Command**: `cd server && npm start`
     - **Environment Variables**:
       - `DATABASE_URL`: PostgreSQL 连接字符串
       - `NODE_ENV`: production
       - `JWT_SECRET`: 自定义密钥
       - `BOCHA_API_KEY`: 博查AI API Key

4. **修改代码支持 PostgreSQL**
   ```bash
   # 安装 PostgreSQL 驱动
   cd server
   npm install pg pg-hstore
   ```

5. **更新数据库配置**
   - 修改 `server/src/database/init.js` 使用 PostgreSQL
   - 修改 `server/src/utils/database.js` 使用 PostgreSQL

#### 2. Railway 部署（免费额度）

**步骤：**

1. **注册 Railway 账号**
   - 访问 [railway.app](https://railway.app)
   - 使用 GitHub 账号注册

2. **创建项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"

3. **添加 PostgreSQL 数据库**
   - 在项目中点击 "New" → "Database" → "PostgreSQL"
   - 记录数据库连接字符串

4. **配置环境变量**
   - 在服务设置中添加环境变量：
     - `DATABASE_URL`: PostgreSQL 连接字符串
     - `NODE_ENV`: production
     - `JWT_SECRET`: 自定义密钥

5. **部署配置**
   - Railway 会自动检测 Node.js 项目
   - 确保 `package.json` 中有正确的 `start` 脚本

#### 3. 数据库迁移（SQLite → PostgreSQL）

**安装依赖：**
```bash
cd server
npm install pg pg-hstore sequelize
```

**修改数据库配置：**
```javascript
// server/src/config/database.js
import { Sequelize } from 'sequelize'

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
})

export default sequelize
```

**修改数据模型：**
```javascript
// 使用 Sequelize 定义模型
import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user'
  },
  department: DataTypes.STRING,
  avatar: DataTypes.STRING
})

export default User
```

#### 4. 前端部署（Vercel/Netlify）

**Vercel 部署：**
1. 访问 [vercel.com](https://vercel.com)
2. 导入 GitHub 仓库
3. 配置：
   - **Framework Preset**: Vite
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: `client/dist`
4. 添加环境变量：
   - `VITE_API_URL`: 后端服务 URL

**Netlify 部署：**
1. 访问 [netlify.com](https://netlify.com)
2. 导入 GitHub 仓库
3. 配置：
   - **Build command**: `cd client && npm run build`
   - **Publish directory**: `client/dist`
4. 添加环境变量：
   - `VITE_API_URL`: 后端服务 URL

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目维护：MI
- 邮箱：your-email@example.com
- 项目链接：https://github.com/your-username/enterprise-ai-assistant