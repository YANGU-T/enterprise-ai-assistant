# 企业AI助手 - 云平台部署详细步骤

## 概述

本指南将帮助您将企业AI助手的后端服务部署到免费的云平台（Render），并将数据库从SQLite迁移到PostgreSQL。

## 前提条件

1. GitHub账号
2. Render账号（免费）
3. 本地已安装Node.js和npm
4. 项目代码已推送到GitHub

## 第一步：准备数据库

### 1.1 创建Render PostgreSQL数据库

1. 访问 [render.com](https://render.com) 并登录
2. 点击 **"New"** → **"PostgreSQL"**
3. 配置数据库：
   - **Name**: `enterprise-ai-db`
   - **Database**: `enterprise_ai_assistant`
   - **User**: `enterprise_ai_user`
   - **Region**: 选择离您最近的区域
   - **Plan**: 选择 **"Free"**（免费计划）
4. 点击 **"Create Database"**
5. 记录以下信息（稍后需要）：
   - **Internal Database URL**
   - **External Database URL**
   - **Hostname**
   - **Port**
   - **Database**
   - **Username**
   - **Password**

### 1.2 测试数据库连接

在本地测试连接（可选）：

```bash
# 安装PostgreSQL客户端（如果尚未安装）
# Windows: 下载安装 https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql-client

# 测试连接
psql "postgresql://username:password@hostname:port/database"
```

## 第二步：准备代码

### 2.1 安装PostgreSQL依赖

```bash
cd server
npm install pg pg-hstore
npm uninstall sqlite3 sqlite
```

### 2.2 更新环境变量

编辑 `server/.env.production` 文件：

```env
# 服务器配置
PORT=3000
NODE_ENV=production

# PostgreSQL 数据库配置（使用Render提供的连接字符串）
DATABASE_URL=postgresql://username:password@hostname:port/database

# JWT密钥（生成一个随机字符串）
JWT_SECRET=your-super-secret-jwt-key-here

# 博查AI API Key
BOCHA_API_KEY=sk-eeea0ef033be4bcca7f7be5fd5c67ee9
```

### 2.3 验证代码更改

确保以下文件已正确更新：

1. `server/package.json` - 已添加pg依赖
2. `server/src/config/database.js` - PostgreSQL配置
3. `server/src/models/User.js` - Sequelize模型
4. `server/src/database/init.js` - 新的初始化逻辑

## 第三步：部署后端到Render

### 3.1 推送代码到GitHub

```bash
# 添加所有更改
git add .

# 提交更改
git commit -m "准备部署到Render - PostgreSQL迁移"

# 推送到GitHub
git push origin main
```

### 3.2 创建Render Web Service

1. 在Render控制台点击 **"New"** → **"Web Service"**
2. 连接您的GitHub仓库
3. 选择仓库和分支
4. 配置服务：

   - **Name**: `enterprise-ai-backend`
   - **Region**: 选择与数据库相同的区域
   - **Runtime**: **Node**
   - **Build Command**: 
     ```bash
     cd server && npm install
     ```
   - **Start Command**: 
     ```bash
     cd server && npm start
     ```
   - **Plan**: **Free**（免费计划）

### 3.3 配置环境变量

在Render服务配置页面，点击 **"Environment"** 标签，添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | PostgreSQL连接字符串 | 从Render数据库页面获取 |
| `NODE_ENV` | `production` | 生产环境 |
| `JWT_SECRET` | 随机字符串 | 用于JWT加密，例如：`my-super-secret-key-123` |
| `BOCHA_API_KEY` | `sk-eeea0ef033be4bcca7f7be5fd5c67ee9` | 博查AI API密钥 |

### 3.4 部署服务

1. 点击 **"Create Web Service"**
2. Render将自动开始部署
3. 等待部署完成（通常需要2-5分钟）
4. 部署成功后，您将获得一个URL，例如：`https://enterprise-ai-backend.onrender.com`

### 3.5 初始化数据库

部署完成后，需要初始化数据库：

1. 在Render服务页面，点击 **"Shell"** 标签
2. 运行以下命令：

```bash
cd server && npm run db:init
```

3. 或者，如果您想重置数据库：

```bash
cd server && npm run db:reset
```

## 第四步：部署前端

### 4.1 更新前端API地址

编辑 `client/.env.production` 文件（如果不存在则创建）：

```env
VITE_API_URL=https://enterprise-ai-backend.onrender.com
```

### 4.2 部署到Vercel（推荐）

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 **"New Project"**
3. 导入您的GitHub仓库
4. 配置项目：
   - **Framework Preset**: **Vite**
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 添加环境变量：
   - `VITE_API_URL`: `https://enterprise-ai-backend.onrender.com`
6. 点击 **"Deploy"**

### 4.3 或者部署到Netlify

1. 访问 [netlify.com](https://netlify.com) 并登录
2. 点击 **"New site from Git"**
3. 选择GitHub仓库
4. 配置：
   - **Build command**: `cd client && npm run build`
   - **Publish directory**: `client/dist`
5. 添加环境变量：
   - `VITE_API_URL`: `https://enterprise-ai-backend.onrender.com`
6. 点击 **"Deploy site"**

## 第五步：测试部署

### 5.1 测试后端API

访问以下URL测试后端是否正常工作：

```
https://enterprise-ai-backend.onrender.com/api/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2026-06-02T...",
  "uptime": ...
}
```

### 5.2 测试前端

1. 访问Vercel/Netlify提供的前端URL
2. 尝试登录：
   - 用户名: `admin`
   - 密码: `admin123`
3. 测试各个功能模块

## 第六步：数据迁移（可选）

如果您有重要的SQLite数据需要迁移：

### 6.1 本地迁移

1. 将SQLite数据库文件复制到server目录
2. 运行迁移脚本：

```bash
cd server
npm run db:migrate
```

### 6.2 验证迁移结果

1. 检查用户表是否正确迁移
2. 测试登录功能
3. 验证其他数据

## 常见问题解决

### Q1: 部署失败，错误信息：`Cannot find module 'pg'`

**解决方案：**
确保在 `server/package.json` 中添加了pg依赖：
```bash
cd server
npm install pg pg-hstore
git add . && git commit -m "添加pg依赖" && git push
```

### Q2: 数据库连接失败

**解决方案：**
1. 检查 `DATABASE_URL` 环境变量是否正确
2. 确保数据库服务正在运行
3. 检查防火墙设置

### Q3: JWT错误

**解决方案：**
确保设置了 `JWT_SECRET` 环境变量，并且长度足够（建议32字符以上）

### Q4: 前端无法连接后端

**解决方案：**
1. 检查 `VITE_API_URL` 环境变量是否正确
2. 确保后端服务已启动
3. 检查CORS配置

### Q5: 免费计划限制

Render免费计划限制：
- 服务会在15分钟无活动后休眠
- 首次请求可能需要30秒启动
- 每月750小时免费使用时间
- 数据库存储限制：1GB

## 监控和维护

### 查看日志

在Render控制台：
1. 点击您的服务
2. 点击 **"Logs"** 标签
3. 查看实时日志

### 数据库备份

Render免费计划不提供自动备份，建议：
1. 定期手动导出数据
2. 使用 `pg_dump` 命令备份

### 性能监控

1. 监控服务响应时间
2. 检查数据库连接数
3. 监控内存和CPU使用情况

## 安全建议

1. **使用强密码**：为数据库和JWT设置强密码
2. **限制数据库访问**：只允许应用服务器访问
3. **启用HTTPS**：Render默认提供HTTPS
4. **定期更新依赖**：保持npm包更新
5. **监控异常**：设置错误警报

## 成本估算

### 免费计划

- **Render Web Service**: 免费（750小时/月）
- **Render PostgreSQL**: 免费（1GB存储）
- **Vercel/Netlify前端**: 免费

### 付费升级（如果需要）

如果流量增加，可以考虑：
- Render Starter计划：$7/月
- 更大的数据库存储
- 更好的性能

## 回滚方案

如果部署失败需要回滚：

1. **代码回滚**：
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **数据库回滚**：
   - 如果使用免费计划，数据库无法回滚
   - 建议在迁移前备份数据

3. **重新部署**：
   - 在Render控制台重新部署旧版本

## 下一步

部署完成后，您可以：

1. **配置自定义域名**：在Vercel/Netlify中添加自定义域名
2. **设置CI/CD**：配置自动部署
3. **添加监控**：使用Sentry等工具监控错误
4. **优化性能**：添加缓存、优化查询
5. **扩展功能**：添加更多API端点

## 获取帮助

如果遇到问题：

1. 查看Render文档：https://render.com/docs
2. 查看Vercel文档：https://vercel.com/docs
3. 检查项目日志
4. 在GitHub Issues中提问

## 总结

完成以上步骤后，您的企业AI助手将：
- ✅ 后端部署在Render（免费）
- ✅ 数据库使用PostgreSQL（免费）
- ✅ 前端部署在Vercel/Netlify（免费）
- ✅ 支持HTTPS访问
- ✅ 自动扩展（根据流量）

恭喜您完成部署！🎉