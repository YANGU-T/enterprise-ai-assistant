import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

// 根据环境变量选择数据库配置
let sequelize

if (process.env.DATABASE_URL) {
  // 使用连接字符串（云平台部署）
  sequelize = new Sequelize(process.env.DATABASE_URL, {
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
} else {
  // 使用单独的配置项（本地开发）
  sequelize = new Sequelize(
    process.env.DB_NAME || 'enterprise_ai_assistant',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  )
}

export default sequelize