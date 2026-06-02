# 数据库迁移指南：SQLite → PostgreSQL

## 概述

本指南帮助您将企业AI助手中的数据库从SQLite迁移到PostgreSQL，以便部署到云平台。

## 迁移步骤

### 1. 安装PostgreSQL驱动

```bash
cd server
npm install pg pg-hstore sequelize
npm uninstall sqlite3 sqlite
```

### 2. 创建PostgreSQL配置

创建 `server/src/config/database.js`：

```javascript
import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

export default sequelize
```

### 3. 修改数据模型

创建 `server/src/models/User.js`：

```javascript
import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
import bcrypt from 'bcryptjs'

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    validate: {
      len: [3, 50]
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'admin', 'manager']]
    }
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
      }
    }
  }
})

// 实例方法：验证密码
User.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password)
}

// 隐藏密码字段
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get())
  delete values.password
  return values
}

export default User
```

### 4. 修改数据库初始化

修改 `server/src/database/init.js`：

```javascript
import sequelize from '../config/database.js'
import User from '../models/User.js'

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
if (process.argv[1] === import.meta.url) {
  initializeDatabase()
}

export default initializeDatabase
```

### 5. 修改路由文件

以 `server/src/routes/auth.js` 为例：

```javascript
import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    // 查找用户
    const user = await User.findOne({ where: { username } })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      })
    }

    // 验证密码
    const isValidPassword = await user.validPassword(password)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      })
    }

    // 生成JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      success: true,
      data: {
        token,
        user: user.toJSON()
      }
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 获取用户信息
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未授权'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    res.json({
      success: true,
      data: user.toJSON()
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

export default router
```

### 6. 更新环境变量

在 `.env` 文件中添加：

```env
# PostgreSQL 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/enterprise_ai_assistant

# 或者使用单独的配置项
DB_HOST=localhost
DB_PORT=5432
DB_NAME=enterprise_ai_assistant
DB_USER=username
DB_PASSWORD=password
```

### 7. 数据迁移脚本

创建 `server/src/scripts/migrate-sqlite-to-postgres.js`：

```javascript
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import User from '../models/User.js'
import sequelize from '../config/database.js'

async function migrateData() {
  try {
    // 连接SQLite数据库
    const sqliteDb = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    })

    // 同步PostgreSQL模型
    await sequelize.sync({ force: true })

    // 迁移用户数据
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

    await sqliteDb.close()
    await sequelize.close()

    console.log('🎉 数据迁移完成')
  } catch (error) {
    console.error('❌ 数据迁移失败:', error)
    process.exit(1)
  }
}

migrateData()
```

## 云平台部署配置

### Render 部署

1. **环境变量配置：**
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   NODE_ENV=production
   JWT_SECRET=your-secret-key
   BOCHA_API_KEY=your-bocha-api-key
   ```

2. **构建命令：**
   ```bash
   cd server && npm install
   ```

3. **启动命令：**
   ```bash
   cd server && npm start
   ```

### Railway 部署

1. **自动检测配置：**
   - Railway 会自动检测 `package.json` 中的 `start` 脚本
   - 确保 `server/package.json` 中有正确的启动命令

2. **环境变量：**
   - 在 Railway 控制台中添加所有必要的环境变量
   - 包括 `DATABASE_URL`、`JWT_SECRET` 等

## 测试迁移

### 1. 本地测试

```bash
# 启动PostgreSQL服务
# 创建数据库
createdb enterprise_ai_assistant

# 运行迁移脚本
node src/scripts/migrate-sqlite-to-postgres.js

# 启动应用
npm run dev
```

### 2. 验证数据

1. 检查用户表是否正确迁移
2. 测试登录功能
3. 验证API接口

## 常见问题

### Q1: 连接字符串格式错误

**错误：** `connection refused`

**解决：** 检查连接字符串格式：
```
postgresql://username:password@hostname:port/database
```

### Q2: SSL连接问题

**错误：** `SSL connection error`

**解决：** 在Sequelize配置中添加SSL选项：
```javascript
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
}
```

### Q3: 表不存在

**错误：** `relation "users" does not exist`

**解决：** 确保在应用启动时调用了 `sequelize.sync()`

## 回滚方案

如果迁移失败，可以：

1. 恢复SQLite配置
2. 重新部署旧版本
3. 检查错误日志

## 监控和维护

1. **定期备份：** 使用云平台提供的备份功能
2. **性能监控：** 监控数据库连接和查询性能
3. **日志记录：** 启用详细的日志记录

## 安全建议

1. **使用强密码：** 为数据库用户设置强密码
2. **限制访问：** 只允许应用服务器访问数据库
3. **加密连接：** 始终使用SSL连接
4. **定期更新：** 保持依赖包更新

## 性能优化

1. **连接池配置：** 合理设置连接池大小
2. **索引优化：** 为常用查询字段添加索引
3. **查询优化：** 避免N+1查询问题
4. **缓存策略：** 实现适当的缓存机制