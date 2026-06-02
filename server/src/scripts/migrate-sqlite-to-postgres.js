import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import User from '../models/User.js'
import sequelize from '../config/database.js'
import { fileURLToPath } from 'url'

async function migrateData() {
  try {
    console.log('🔄 开始从SQLite迁移到PostgreSQL...')

    // 检查SQLite数据库文件是否存在
    const fs = await import('fs')
    const sqlitePath = './database.sqlite'
    
    if (!fs.existsSync(sqlitePath)) {
      console.log('⚠️  SQLite数据库文件不存在，跳过迁移')
      console.log('正在初始化新的PostgreSQL数据库...')
      
      await sequelize.sync({ force: true })
      console.log('✅ PostgreSQL数据库表已创建')
      
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
      
      await sequelize.close()
      console.log('🎉 数据库初始化完成')
      return
    }

    // 连接SQLite数据库
    const sqliteDb = await open({
      filename: sqlitePath,
      driver: sqlite3.Database
    })

    console.log('📦 SQLite数据库连接成功')

    // 同步PostgreSQL模型（创建表）
    await sequelize.sync({ force: true })
    console.log('✅ PostgreSQL数据库表已创建')

    // 迁移用户数据
    console.log('👥 迁移用户数据...')
    const users = await sqliteDb.all('SELECT * FROM users')
    
    for (const user of users) {
      await User.create({
        id: user.id,
        username: user.username,
        password: user.password,  // 已经是加密的
        name: user.name,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        created_at: user.created_at,
        updated_at: user.updated_at
      })
    }
    console.log(`✅ 迁移了 ${users.length} 个用户`)

    // 这里可以添加其他表的迁移逻辑
    // 例如：工作流、审批、任务、项目、通知、AI执行记录等

    console.log('🎉 数据迁移完成')
    console.log('')
    console.log('迁移统计:')
    console.log(`- 用户: ${users.length} 条记录`)
    console.log('')
    console.log('注意: 其他表的数据需要手动迁移或重新创建')

    await sqliteDb.close()
    await sequelize.close()

  } catch (error) {
    console.error('❌ 数据迁移失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此文件
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrateData()
}

export default migrateData