import sequelize from '../config/database.js'
import User from '../models/User.js'
import { fileURLToPath } from 'url'

async function initializeDatabase() {
  try {
    // 测试数据库连接
    await sequelize.authenticate()
    console.log('📦 数据库连接成功')

    // 同步所有模型（创建表）
    await sequelize.sync({ force: false })
    console.log('✅ 数据库表创建完成')

    // 创建默认管理员用户
    const adminExists = await User.findOne({ where: { username: 'admin' } })
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123',  // 会被hook自动加密
        name: 'MI',
        role: '管理员',
        department: '技术部',
        avatar: 'MI'
      })
      console.log('👤 默认管理员用户已创建')
    }

    console.log('🎉 数据库初始化完成')
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此文件
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase()
}

export default initializeDatabase