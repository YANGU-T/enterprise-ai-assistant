import express from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// 模拟工作流数据
let workflows = [
  {
    id: 1,
    name: '出差审批流',
    description: '申请→审批→差旅预支→报销→归档',
    type: 'travel',
    status: 'active',
    steps: ['申请', '审批', '差旅预支', '报销', '归档'],
    usage: 23,
    createdBy: 1,
    createdAt: '2026-05-01',
    updatedAt: '2026-05-27'
  },
  {
    id: 2,
    name: '新员工入职',
    description: 'Offer→合同→设备→IT权限→培训→导师',
    type: 'onboarding',
    status: 'active',
    steps: ['Offer', '合同', '设备', 'IT权限', '培训', '导师'],
    usage: 8,
    createdBy: 1,
    createdAt: '2026-05-10',
    updatedAt: '2026-05-27'
  },
  {
    id: 3,
    name: '费用报销',
    description: '提交→审批→财务处理→到账',
    type: 'reimbursement',
    status: 'active',
    steps: ['提交', '审批', '财务处理', '到账'],
    usage: 45,
    createdBy: 1,
    createdAt: '2026-04-15',
    updatedAt: '2026-05-27'
  }
]

// 获取所有工作流
router.get('/', (req, res) => {
  try {
    const { status, type } = req.query
    let filteredWorkflows = [...workflows]

    if (status) {
      filteredWorkflows = filteredWorkflows.filter(w => w.status === status)
    }

    if (type) {
      filteredWorkflows = filteredWorkflows.filter(w => w.type === type)
    }

    res.json({
      success: true,
      data: filteredWorkflows
    })
  } catch (error) {
    console.error('获取工作流列表错误:', error)
    res.status(500).json({
      success: false,
      message: '获取工作流列表失败'
    })
  }
})

// 获取单个工作流
router.get('/:id', (req, res) => {
  try {
    const workflow = workflows.find(w => w.id === parseInt(req.params.id))
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: '工作流不存在'
      })
    }

    res.json({
      success: true,
      data: workflow
    })
  } catch (error) {
    console.error('获取工作流详情错误:', error)
    res.status(500).json({
      success: false,
      message: '获取工作流详情失败'
    })
  }
})

// 创建工作流
router.post('/', [
  body('name').notEmpty().withMessage('工作流名称不能为空'),
  body('description').notEmpty().withMessage('工作流描述不能为空'),
  body('type').notEmpty().withMessage('工作流类型不能为空')
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

    const { name, description, type, steps } = req.body

    const newWorkflow = {
      id: workflows.length + 1,
      name,
      description,
      type,
      status: 'active',
      steps: steps || [],
      usage: 0,
      createdBy: req.user?.userId || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    workflows.push(newWorkflow)

    res.status(201).json({
      success: true,
      message: '工作流创建成功',
      data: newWorkflow
    })
  } catch (error) {
    console.error('创建工作流错误:', error)
    res.status(500).json({
      success: false,
      message: '创建工作流失败'
    })
  }
})

// 更新工作流
router.put('/:id', (req, res) => {
  try {
    const workflowIndex = workflows.findIndex(w => w.id === parseInt(req.params.id))
    if (workflowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '工作流不存在'
      })
    }

    const { name, description, type, steps, status } = req.body

    if (name) workflows[workflowIndex].name = name
    if (description) workflows[workflowIndex].description = description
    if (type) workflows[workflowIndex].type = type
    if (steps) workflows[workflowIndex].steps = steps
    if (status) workflows[workflowIndex].status = status

    workflows[workflowIndex].updatedAt = new Date().toISOString()

    res.json({
      success: true,
      message: '工作流更新成功',
      data: workflows[workflowIndex]
    })
  } catch (error) {
    console.error('更新工作流错误:', error)
    res.status(500).json({
      success: false,
      message: '更新工作流失败'
    })
  }
})

// 删除工作流
router.delete('/:id', (req, res) => {
  try {
    const workflowIndex = workflows.findIndex(w => w.id === parseInt(req.params.id))
    if (workflowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '工作流不存在'
      })
    }

    workflows.splice(workflowIndex, 1)

    res.json({
      success: true,
      message: '工作流删除成功'
    })
  } catch (error) {
    console.error('删除工作流错误:', error)
    res.status(500).json({
      success: false,
      message: '删除工作流失败'
    })
  }
})

// 执行工作流
router.post('/:id/execute', (req, res) => {
  try {
    const workflow = workflows.find(w => w.id === parseInt(req.params.id))
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: '工作流不存在'
      })
    }

    // 模拟执行
    workflow.usage += 1
    workflow.updatedAt = new Date().toISOString()

    res.json({
      success: true,
      message: '工作流执行成功',
      data: {
        workflowId: workflow.id,
        executedAt: new Date().toISOString(),
        status: 'completed'
      }
    })
  } catch (error) {
    console.error('执行工作流错误:', error)
    res.status(500).json({
      success: false,
      message: '执行工作流失败'
    })
  }
})

export default router