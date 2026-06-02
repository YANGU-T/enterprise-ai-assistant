import sequelize from '../config/database.js'
import User from '../models/User.js'
import { fileURLToPath } from 'url'

async function resetDatabase() {
  try {
    console.log('⚠️  警告: 此操作将删除所有数据并重新创建表')
    console.log('正在重置数据库...')

    // 强制同步所有模型（删除并重新创建表）
    await sequelize.sync({ force: true })
    console.log('✅ 数据库表已重新创建')

    // 创建默认管理员用户
    const admin = await User.create({
      username: 'admin',
      password: 'admin123',
      name: 'MI',
      role: '管理员',
      department: '技术部',
      avatar: 'MI'
    })
    console.log('👤 默认管理员用户已创建')

    // 创建测试用户
    const testUser = await User.create({
      username: 'test',
      password: 'test123',
      name: '测试用户',
      role: 'user',
      department: '测试部',
      avatar: 'TU'
    })
    console.log('👤 测试用户已创建')

    console.log('🎉 数据库重置完成')
    console.log('')
    console.log('默认登录信息:')
    console.log('管理员 - 用户名: admin, 密码: admin123')
    console.log('测试用户 - 用户名: test, 密码: test123')

    await sequelize.close()
  } catch (error) {
    console.error('❌ 数据库重置失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此文件
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  resetDatabase()
}

export default resetDatabase