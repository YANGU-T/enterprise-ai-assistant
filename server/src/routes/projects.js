import express from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// 模拟项目数据
let projects = [
  {
    id: 1,
    name: '上海客户拜访',
    description: 'A公司客户拜访项目，包括出差、会议、演示等环节。',
    status: 'in_progress',
    progress: 75,
    startDate: '2026-06-15',
    endDate: '2026-06-25',
    managerId: 2,
    managerName: '张明辉',
    teamSize: 6,
    budget: 50000,
    spent: 32000,
    risks: 2,
    milestones: [
      { name: '需求确认', status: 'completed', date: '2026-06-15' },
      { name: '出差审批 + 差旅预支', status: 'completed', date: '2026-06-16' },
      { name: '客户演示', status: 'in_progress', date: '2026-06-20' },
      { name: '合同签订', status: 'pending', date: '2026-06-25' }
    ],
    createdAt: '2026-05-01',
    updatedAt: '2026-05-27'
  },
  {
    id: 2,
    name: '前端架构升级',
    description: '对现有前端架构进行升级，提升性能和可维护性。',
    status: 'in_progress',
    progress: 45,
    startDate: '2026-05-20',
    endDate: '2026-06-30',
    managerId: 3,
    managerName: '赵海涛',
    teamSize: 4,
    budget: 20000,
    spent: 8000,
    risks: 1,
    milestones: [
      { name: '需求分析', status: 'completed', date: '2026-05-25' },
      { name: '技术选型', status: 'completed', date: '2026-05-30' },
      { name: '开发实施', status: 'in_progress', date: '2026-06-15' },
      { name: '测试验收', status: 'pending', date: '2026-06-30' }
    ],
    createdAt: '2026-05-15',
    updatedAt: '2026-05-27'
  },
  {
    id: 3,
    name: 'Q2季度总结',
    description: '汇总Q2季度各部门工作数据，生成季度报告。',
    status: 'planning',
    progress: 10,
    startDate: '2026-05-25',
    endDate: '2026-06-05',
    managerId: 1,
    managerName: 'MI',
    teamSize: 8,
    budget: 5000,
    spent: 1000,
    risks: 0,
    milestones: [
      { name: '数据收集', status: 'in_progress', date: '2026-05-30' },
      { name: '数据分析', status: 'pending', date: '2026-06-02' },
      { name: '报告撰写', status: 'pending', date: '2026-06-04' },
      { name: '汇报演示', status: 'pending', date: '2026-06-05' }
    ],
    createdAt: '2026-05-20',
    updatedAt: '2026-05-27'
  }
]

// 获取所有项目
router.get('/', (req, res) => {
  try {
    const { status, managerId } = req.query
    let filteredProjects = [...projects]

    if (status) {
      filteredProjects = filteredProjects.filter(p => p.status === status)
    }

    if (managerId) {
      filteredProjects = filteredProjects.filter(p => p.managerId === parseInt(managerId))
    }

    res.json({
      success: true,
      data: filteredProjects
    })
  } catch (error) {
    console.error('获取项目列表错误:', error)
    res.status(500).json({
      success: false,
      message: '获取项目列表失败'
    })
  }
})

// 获取单个项目
router.get('/:id', (req, res) => {
  try {
    const project = projects.find(p => p.id === parseInt(req.params.id))
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      })
    }

    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('获取项目详情错误:', error)
    res.status(500).json({
      success: false,
      message: '获取项目详情失败'
    })
  }
})

// 创建项目
router.post('/', [
  body('name').notEmpty().withMessage('项目名称不能为空'),
  body('managerId').isInt().withMessage('负责人ID必须是整数')
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

    const { name, description, startDate, endDate, managerId, managerName, teamSize, budget } = req.body

    const newProject = {
      id: projects.length + 1,
      name,
      description: description || '',
      status: 'planning',
      progress: 0,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || null,
      managerId,
      managerName: managerName || '未分配',
      teamSize: teamSize || 1,
      budget: budget || 0,
      spent: 0,
      risks: 0,
      milestones: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    projects.push(newProject)

    res.status(201).json({
      success: true,
      message: '项目创建成功',
      data: newProject
    })
  } catch (error) {
    console.error('创建项目错误:', error)
    res.status(500).json({
      success: false,
      message: '创建项目失败'
    })
  }
})

// 更新项目
router.put('/:id', (req, res) => {
  try {
    const projectIndex = projects.findIndex(p => p.id === parseInt(req.params.id))
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      })
    }

    const { name, description, status, progress, startDate, endDate, managerId, managerName, teamSize, budget, risks } = req.body

    if (name) projects[projectIndex].name = name
    if (description !== undefined) projects[projectIndex].description = description
    if (status) projects[projectIndex].status = status
    if (progress !== undefined) projects[projectIndex].progress = progress
    if (startDate) projects[projectIndex].startDate = startDate
    if (endDate) projects[projectIndex].endDate = endDate
    if (managerId) projects[projectIndex].managerId = managerId
    if (managerName) projects[projectIndex].managerName = managerName
    if (teamSize) projects[projectIndex].teamSize = teamSize
    if (budget) projects[projectIndex].budget = budget
    if (risks !== undefined) projects[projectIndex].risks = risks

    projects[projectIndex].updatedAt = new Date().toISOString()

    res.json({
      success: true,
      message: '项目更新成功',
      data: projects[projectIndex]
    })
  } catch (error) {
    console.error('更新项目错误:', error)
    res.status(500).json({
      success: false,
      message: '更新项目失败'
    })
  }
})

// 删除项目
router.delete('/:id', (req, res) => {
  try {
    const projectIndex = projects.findIndex(p => p.id === parseInt(req.params.id))
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      })
    }

    projects.splice(projectIndex, 1)

    res.json({
      success: true,
      message: '项目删除成功'
    })
  } catch (error) {
    console.error('删除项目错误:', error)
    res.status(500).json({
      success: false,
      message: '删除项目失败'
    })
  }
})

// 更新项目进度
router.patch('/:id/progress', [
  body('progress').isInt({ min: 0, max: 100 }).withMessage('进度必须是0-100的整数')
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

    const project = projects.find(p => p.id === parseInt(req.params.id))
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      })
    }

    const { progress } = req.body
    project.progress = progress
    project.updatedAt = new Date().toISOString()

    // 自动更新状态
    if (progress === 100) {
      project.status = 'completed'
    } else if (progress > 0) {
      project.status = 'in_progress'
    }

    res.json({
      success: true,
      message: '项目进度更新成功',
      data: project
    })
  } catch (error) {
    console.error('更新项目进度错误:', error)
    res.status(500).json({
      success: false,
      message: '更新项目进度失败'
    })
  }
})

// 添加里程碑
router.post('/:id/milestones', [
  body('name').notEmpty().withMessage('里程碑名称不能为空'),
  body('date').notEmpty().withMessage('里程碑日期不能为空')
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

    const project = projects.find(p => p.id === parseInt(req.params.id))
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      })
    }

    const { name, date } = req.body

    const newMilestone = {
      name,
      date,
      status: 'pending'
    }

    project.milestones.push(newMilestone)
    project.updatedAt = new Date().toISOString()

    res.status(201).json({
      success: true,
      message: '里程碑添加成功',
      data: newMilestone
    })
  } catch (error) {
    console.error('添加里程碑错误:', error)
    res.status(500).json({
      success: false,
      message: '添加里程碑失败'
    })
  }
})

export default router