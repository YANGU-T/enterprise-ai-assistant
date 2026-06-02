import express from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// 模拟通知数据
let notifications = [
  {
    id: 1,
    title: '新审批待处理',
    message: '张明辉提交的出差申请等待审批',
    type: 'approval',
    read: false,
    userId: 1,
    createdAt: '2026-05-27T10:30:00Z'
  },
  {
    id: 2,
    title: '任务即将到期',
    message: '客户演示PPT定稿将于明天到期',
    type: 'task',
    read: false,
    userId: 1,
    createdAt: '2026-05-27T10:25:00Z'
  },
  {
    id: 3,
    title: 'AI执行完成',
    message: '周报生成流程已完成',
    type: 'ai',
    read: true,
    userId: 1,
    createdAt: '2026-05-27T09:15:00Z'
  },
  {
    id: 4,
    title: '项目进度更新',
    message: '上海客户拜访项目进度已更新至75%',
    type: 'project',
    read: true,
    userId: 1,
    createdAt: '2026-05-27T09:00:00Z'
  },
  {
    id: 5,
    title: '系统维护通知',
    message: '系统将于今晚22:00-23:00进行维护',
    type: 'system',
    read: true,
    userId: 1,
    createdAt: '2026-05-27T08:00:00Z'
  }
]

// 获取所有通知
router.get('/', (req, res) => {
  try {
    const { type, read, userId } = req.query
    let filteredNotifications = [...notifications]

    if (type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === type)
    }

    if (read !== undefined) {
      filteredNotifications = filteredNotifications.filter(n => n.read === (read === 'true'))
    }

    if (userId) {
      filteredNotifications = filteredNotifications.filter(n => n.userId === parseInt(userId))
    }

    // 按时间倒序排列
    filteredNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    res.json({
      success: true,
      data: filteredNotifications
    })
  } catch (error) {
    console.error('获取通知列表错误:', error)
    res.status(500).json({
      success: false,
      message: '获取通知列表失败'
    })
  }
})

// 获取未读通知数量
router.get('/unread-count', (req, res) => {
  try {
    const { userId } = req.query
    let unreadCount = notifications.filter(n => !n.read).length

    if (userId) {
      unreadCount = notifications.filter(n => !n.read && n.userId === parseInt(userId)).length
    }

    res.json({
      success: true,
      data: { count: unreadCount }
    })
  } catch (error) {
    console.error('获取未读通知数量错误:', error)
    res.status(500).json({
      success: false,
      message: '获取未读通知数量失败'
    })
  }
})

// 创建通知
router.post('/', [
  body('title').notEmpty().withMessage('通知标题不能为空'),
  body('message').notEmpty().withMessage('通知内容不能为空')
], (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '验证失败',
        errors: errors.array()
      })
    }

    const { title, message, type, userId } = req.body

    const newNotification = {
      id: notifications.length + 1,
      title,
      message,
      type: type || 'info',
      read: false,
      userId: userId || 1,
      createdAt: new Date().toISOString()
    }

    notifications.push(newNotification)

    res.status(201).json({
      success: true,
      message: '通知创建成功',
      data: newNotification
    })
  } catch (error) {
    console.error('创建通知错误:', error)
    res.status(500).json({
      success: false,
      message: '创建通知失败'
    })
  }
})

// 标记通知为已读
router.patch('/:id/read', (req, res) => {
  try {
    const notification = notifications.find(n => n.id === parseInt(req.params.id))
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: '通知不存在'
      })
    }

    notification.read = true

    res.json({
      success: true,
      message: '通知已标记为已读',
      data: notification
    })
  } catch (error) {
    console.error('标记通知已读错误:', error)
    res.status(500).json({
      success: false,
      message: '标记通知已读失败'
    })
  }
})

// 标记所有通知为已读
router.patch('/read-all', (req, res) => {
  try {
    const { userId } = req.query

    if (userId) {
      notifications.forEach(n => {
        if (n.userId === parseInt(userId)) {
          n.read = true
        }
      })
    } else {
      notifications.forEach(n => {
        n.read = true
      })
    }

    res.json({
      success: true,
      message: '所有通知已标记为已读'
    })
  } catch (error) {
    console.error('标记所有通知已读错误:', error)
    res.status(500).json({
      success: false,
      message: '标记所有通知已读失败'
    })
  }
})

// 删除通知
router.delete('/:id', (req, res) => {
  try {
    const notificationIndex = notifications.findIndex(n => n.id === parseInt(req.params.id))
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '通知不存在'
      })
    }

    notifications.splice(notificationIndex, 1)

    res.json({
      success: true,
      message: '通知删除成功'
    })
  } catch (error) {
    console.error('删除通知错误:', error)
    res.status(500).json({
      success: false,
      message: '删除通知失败'
    })
  }
})

// 清空所有通知
router.delete('/', (req, res) => {
  try {
    const { userId } = req.query

    if (userId) {
      notifications = notifications.filter(n => n.userId !== parseInt(userId))
    } else {
      notifications = []
    }

    res.json({
      success: true,
      message: '所有通知已清空'
    })
  } catch (error) {
    console.error('清空通知错误:', error)
    res.status(500).json({
      success: false,
      message: '清空通知失败'
    })
  }
})

export default router