import express from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express.Router()

// 模拟用户数据
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'MI',
    role: '管理员',
    department: '技术部',
    avatar: 'MI'
  }
]

// 用户登录
router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '验证失败',
        errors: errors.array()
      })
    }

    const { username, password } = req.body

    // 查找用户
    const user = users.find(u => u.username === username)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      })
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      })
    }

    // 生成JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: userInfo
      }
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({
      success: false,
      message: '登录失败'
    })
  }
})

// 用户注册
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('用户名至少3个字符'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6个字符'),
  body('name').notEmpty().withMessage('姓名不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '验证失败',
        errors: errors.array()
      })
    }

    const { username, password, name, department } = req.body

    // 检查用户名是否已存在
    if (users.find(u => u.username === username)) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      name,
      role: '用户',
      department: department || '未分配',
      avatar: name.charAt(0)
    }

    users.push(newUser)

    // 生成JWT
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = newUser

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: userInfo
      }
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({
      success: false,
      message: '注册失败'
    })
  }
})

// 获取当前用户信息
router.get('/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId)
  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    })
  }

  const { password: _, ...userInfo } = user
  res.json({
    success: true,
    data: userInfo
  })
})

// 更新用户信息
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    const { name, department } = req.body
    if (name) user.name = name
    if (department) user.department = department

    const { password: _, ...userInfo } = user
    res.json({
      success: true,
      message: '更新成功',
      data: userInfo
    })
  } catch (error) {
    console.error('更新用户信息错误:', error)
    res.status(500).json({
      success: false,
      message: '更新失败'
    })
  }
})

// 修改密码
router.put('/password', authenticateToken, [
  body('oldPassword').notEmpty().withMessage('旧密码不能为空'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6个字符')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '验证失败',
        errors: errors.array()
      })
    }

    const user = users.find(u => u.id === req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    const { oldPassword, newPassword } = req.body

    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '旧密码错误'
      })
    }

    // 加密新密码
    user.password = await bcrypt.hash(newPassword, 10)

    res.json({
      success: true,
      message: '密码修改成功'
    })
  } catch (error) {
    console.error('修改密码错误:', error)
    res.status(500).json({
      success: false,
      message: '修改密码失败'
    })
  }
})

// 认证中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌'
    })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: '令牌无效或已过期'
      })
    }
    req.user = user
    next()
  })
}

export default router