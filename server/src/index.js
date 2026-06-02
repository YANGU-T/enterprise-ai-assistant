import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// 导入路由
import authRoutes from './routes/auth.js'
import workflowRoutes from './routes/workflows.js'
import approvalRoutes from './routes/approvals.js'
import taskRoutes from './routes/tasks.js'
import projectRoutes from './routes/projects.js'
import aiRoutes from './routes/ai.js'
import notificationRoutes from './routes/notifications.js'
import cacheRoutes from './routes/cache.js'

// 配置环境变量
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(helmet()) // 安全头部
app.use(cors()) // 跨域
app.use(compression()) // 压缩
app.use(morgan('dev')) // 日志
app.use(express.json()) // JSON解析
app.use(express.urlencoded({ extended: true })) // URL编码

// 静态文件
app.use(express.static(join(__dirname, '../public')))

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/workflows', workflowRoutes)
app.use('/api/approvals', approvalRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/cache', cacheRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
  console.log(`📊 API文档: http://localhost:${PORT}/api/health`)
  console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`)
})

export default app