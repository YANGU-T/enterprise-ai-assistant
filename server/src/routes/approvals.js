import express from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// 模拟审批数据
let approvals = [
  {
    id: 1,
    title: '上海出差申请',
    type: 'travel',
    submitterId: 2,
    submitterName: '张明辉',
    submitterRole: '销售经理',
    description: '申请6月15日至6月25日前往上海拜访客户A公司，预计费用12000元。',
    amount: 12000,
    status: 'pending',
    urgent: true,
    approverId: 1,
    createdAt: '2026-05-27',
    updatedAt: '2026-05-27'
  },
  {
    id: 2,
    title: '设备采购申请',
    type: 'purchase',
    submitterId: 3,
    submitterName: '陈思雨',
    submitterRole: '前端开发',
    description: '申请采购MacBook Pro M3 Max一台，用于前端开发工作。',
    amount: 25000,
    status: 'pending',
    urgent: false,
    approverId: 1,
    createdAt: '2026-05-26',
    updatedAt: '2026-05-26'
  },
  {
    id: 3,
    title: '请假申请',
    type: 'leave',
    submitterId: 4,
    submitterName: '王丽华',
    submitterRole: '产品经理',
    description: '申请6月20日至6月22日年假，共3天。',
    amount: null,
    status: 'pending',
    urgent: false,
    approverId: 1,
    createdAt: '2026-05-25',
    updatedAt: '2026-05-25'
  }
]

// 获取所有审批
router.get('/', (req, res) => {
  try {
    const { status, type, urgent } = req.query
    let filteredApprovals = [...approvals]

    if (status) {
      filteredApprovals = filteredApprovals.filter(a => a.status === status)
    }

    if (type) {
      filteredApprovals = filteredApprovals.filter(a => a.type === type)
    }

    if (urgent === 'true') {
      filteredApprovals = filteredApprovals.filter(a => a.urgent)
    }

    res.json({
      success: true,
      data: filteredApprovals
    })
  } catch (error) {
    console.error('获取审批列表错误:', error)
    res.status(500).json({
      success: false,
      message: '获取审批列表失败'
    })
  }
})

// 获取单个审批
router.get('/:id', (req, res) => {
  try {
    const approval = approvals.find(a => a.id === parseInt(req.params.id))
    if (!approval) {
      return res.status(404).json({
        success: false,
        message: '审批不存在'
      })
    }

    res.json({
      success: true,
      data: approval
    })
  } catch (error) {
    console.error('获取审批详情错误:', error)
    res.status(500).json({
      success: false,
      message: '获取审批详情失败'
    })
  }
})

// 创建审批
router.post('/', [
  body('title').notEmpty().withMessage('审批标题不能为空'),
  body('type').notEmpty().withMessage('审批类型不能为空'),
  body('description').notEmpty().withMessage('审批描述不能为空')
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

    const { title, type, description, amount, urgent } = req.body

    const newApproval = {
      id: approvals.length + 1,
      title,
      type,
      submitterId: req.user?.userId || 1,
      submitterName: req.user?.name || '当前用户',
      submitterRole: req.user?.role || '用户',
      description,
      amount: amount || null,
      status: 'pending',
      urgent: urgent || false,
      approverId: 1, // 默认审批人
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    approvals.push(newApproval)

    res.status(201).json({
      success: true,
      message: '审批创建成功',
      data: newApproval
    })
  } catch (error) {
    console.error('创建审批错误:', error)
    res.status(500).json({
      success: false,
      message: '创建审批失败'
    })
  }
})

// 批准审批
router.post('/:id/approve', (req, res) => {
  try {
    const approval = approvals.find(a => a.id === parseInt(req.params.id))
    if (!approval) {
      return res.status(404).json({
        success: false,
        message: '审批不存在'
      })
    }

    if (approval.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '审批已处理'
      })
    }

    approval.status = 'approved'
    approval.updatedAt = new Date().toISOString()
    approval.approvedAt = new Date().toISOString()
    approval.approvedBy = req.user?.userId || 1

    res.json({
      success: true,
      message: '审批已批准',
      data: approval
    })
  } catch (error) {
    console.error('批准审批错误:', error)
    res.status(500).json({
      success: false,
      message: '批准审批失败'
    })
  }
})

// 驳回审批
router.post('/:id/reject', [
  body('reason').notEmpty().withMessage('驳回原因不能为空')
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

    const approval = approvals.find(a => a.id === parseInt(req.params.id))
    if (!approval) {
      return res.status(404).json({
        success: false,
        message: '审批不存在'
      })
    }

    if (approval.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '审批已处理'
      })
    }

    const { reason } = req.body

    approval.status = 'rejected'
    approval.rejectionReason = reason
    approval.updatedAt = new Date().toISOString()
    approval.rejectedAt = new Date().toISOString()
    approval.rejectedBy = req.user?.userId || 1

    res.json({
      success: true,
      message: '审批已驳回',
      data: approval
    })
  } catch (error) {
    console.error('驳回审批错误:', error)
    res.status(500).json({
      success: false,
      message: '驳回审批失败'
    })
  }
})

export default router