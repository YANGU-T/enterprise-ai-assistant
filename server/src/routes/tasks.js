import express from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// 模拟任务数据
let tasks = [
  {
    id: 1,
    title: '完成客户演示PPT定稿',
    description: '为A公司客户演示准备PPT，包含产品介绍、案例分析和报价方案。',
    projectId: 1,
    assigneeId: 3,
    assigneeName: '赵海涛',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-05-28',
    tags: ['演示', '客户'],
    createdAt: '2026-05-20',
    updatedAt: '2026-05-27'
  },
  {
    id: 2,
    title: '前端架构评审',
    description: '对前端架构进行评审，提出优化建议。',
    projectId: 2,
    assigneeId: 3,
    assigneeName: '赵海涛',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-05-29',
    tags: ['技术', '评审'],
    createdAt: '2026-05-22',
    updatedAt: '2026-05-27'
  },
  {
    id: 3,
    title: '新员工入职培训',
    description: '为新入职员工提供公司文化、制度和技能培训。',
    projectId: null,
    assigneeId: 4,
    assigneeName: '王丽华',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2026-05-30',
    tags: ['HR', '培训'],
    createdAt: '2026-05-25',
    updatedAt: '2026-05-27'
  },
  {
    id: 4,
    title: 'Q2季度报告',
    description: '汇总Q2季度各部门工作数据，生成季度报告。',
    projectId: null,
    assigneeId: 1,
    assigneeName: 'MI',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-05-31',
    tags: ['报告', '季度'],
    createdAt: '2026-05-23',
    updatedAt: '2026-05-27'
  }
]

// 获取所有任务
router.get('/', (req, res) => {
  try {
    const { status, priority, assigneeId, projectId } = req.query
    let filteredTasks = [...tasks]

    if (status) {
      filteredTasks = filteredTasks.filter(t => t.status === status)
    }

    if (priority) {
      filteredTasks = filteredTasks.filter(t => t.priority === priority)
    }

    if (assigneeId) {
      filteredTasks = filteredTasks.filter(t => t.assigneeId === parseInt(assigneeId))
    }

    if (projectId) {
      filteredTasks = filteredTasks.filter(t => t.projectId === parseInt(projectId))
    }

    res.json({
      success: true,
      data: filteredTasks
    })
  } catch (error) {
    console.error('获取任务列表错误:', error)
    res.status(500).json({
      success: false,
      message: '获取任务列表失败'
    })
  }
})

// 获取单个任务
router.get('/:id', (req, res) => {
  try {
    const task = tasks.find(t => t.id === parseInt(req.params.id))
    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      })
    }

    res.json({
      success: true,
      data: task
    })
  } catch (error) {
    console.error('获取任务详情错误:', error)
    res.status(500).json({
      success: false,
      message: '获取任务详情失败'
    })
  }
})

// 创建任务
router.post('/', [
  body('title').notEmpty().withMessage('任务标题不能为空'),
  body('assigneeId').isInt().withMessage('负责人ID必须是整数')
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

    const { title, description, projectId, assigneeId, assigneeName, priority, dueDate, tags } = req.body

    const newTask = {
      id: tasks.length + 1,
      title,
      description: description || '',
      projectId: projectId || null,
      assigneeId,
      assigneeName: assigneeName || '未分配',
      status: 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    tasks.push(newTask)

    res.status(201).json({
      success: true,
      message: '任务创建成功',
      data: newTask
    })
  } catch (error) {
    console.error('创建任务错误:', error)
    res.status(500).json({
      success: false,
      message: '创建任务失败'
    })
  }
})

// 更新任务
router.put('/:id', (req, res) => {
  try {
    const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id))
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      })
    }

    const { title, description, status, priority, dueDate, tags, assigneeId, assigneeName } = req.body

    if (title) tasks[taskIndex].title = title
    if (description !== undefined) tasks[taskIndex].description = description
    if (status) tasks[taskIndex].status = status
    if (priority) tasks[taskIndex].priority = priority
    if (dueDate) tasks[taskIndex].dueDate = dueDate
    if (tags) tasks[taskIndex].tags = tags
    if (assigneeId) tasks[taskIndex].assigneeId = assigneeId
    if (assigneeName) tasks[taskIndex].assigneeName = assigneeName

    tasks[taskIndex].updatedAt = new Date().toISOString()

    res.json({
      success: true,
      message: '任务更新成功',
      data: tasks[taskIndex]
    })
  } catch (error) {
    console.error('更新任务错误:', error)
    res.status(500).json({
      success: false,
      message: '更新任务失败'
    })
  }
})

// 删除任务
router.delete('/:id', (req, res) => {
  try {
    const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id))
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      })
    }

    tasks.splice(taskIndex, 1)

    res.json({
      success: true,
      message: '任务删除成功'
    })
  } catch (error) {
    console.error('删除任务错误:', error)
    res.status(500).json({
      success: false,
      message: '删除任务失败'
    })
  }
})

// 更新任务状态
router.patch('/:id/status', [
  body('status').isIn(['todo', 'in_progress', 'done']).withMessage('无效的任务状态')
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

    const task = tasks.find(t => t.id === parseInt(req.params.id))
    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      })
    }

    const { status } = req.body
    task.status = status
    task.updatedAt = new Date().toISOString()

    res.json({
      success: true,
      message: '任务状态更新成功',
      data: task
    })
  } catch (error) {
    console.error('更新任务状态错误:', error)
    res.status(500).json({
      success: false,
      message: '更新任务状态失败'
    })
  }
})

export default router