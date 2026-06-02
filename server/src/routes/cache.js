import express from 'express'
import { getDatabase } from '../utils/database.js'

const router = express.Router()

// 初始化缓存表
async function initCacheTable() {
  const db = await getDatabase()
  await db.exec(`
    CREATE TABLE IF NOT EXISTS data_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cache_key TEXT UNIQUE NOT NULL,
      cache_data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  return db
}

// 获取缓存数据
router.get('/:key', async (req, res) => {
  try {
    const db = await initCacheTable()
    const row = await db.get('SELECT cache_data, updated_at FROM data_cache WHERE cache_key = ?', [req.params.key])
    if (row) {
      res.json({
        success: true,
        data: JSON.parse(row.cache_data),
        updatedAt: row.updated_at
      })
    } else {
      res.json({ success: true, data: null })
    }
  } catch (err) {
    console.error('Cache read error:', err)
    res.status(500).json({ success: false, message: '读取缓存失败' })
  }
})

// 保存缓存数据
router.post('/:key', async (req, res) => {
  try {
    const db = await initCacheTable()
    const data = JSON.stringify(req.body)
    await db.run(
      `INSERT INTO data_cache (cache_key, cache_data, updated_at) 
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(cache_key) DO UPDATE SET 
         cache_data = excluded.cache_data,
         updated_at = CURRENT_TIMESTAMP`,
      [req.params.key, data]
    )
    res.json({ success: true, message: '缓存已保存' })
  } catch (err) {
    console.error('Cache write error:', err)
    res.status(500).json({ success: false, message: '保存缓存失败' })
  }
})

// 删除缓存
router.delete('/:key', async (req, res) => {
  try {
    const db = await initCacheTable()
    await db.run('DELETE FROM data_cache WHERE cache_key = ?', [req.params.key])
    res.json({ success: true, message: '缓存已删除' })
  } catch (err) {
    console.error('Cache delete error:', err)
    res.status(500).json({ success: false, message: '删除缓存失败' })
  }
})

// 获取所有缓存键（用于调试）
router.get('/', async (req, res) => {
  try {
    const db = await initCacheTable()
    const rows = await db.all('SELECT cache_key, updated_at FROM data_cache ORDER BY updated_at DESC')
    res.json({ success: true, data: rows })
  } catch (err) {
    console.error('Cache list error:', err)
    res.status(500).json({ success: false, message: '获取缓存列表失败' })
  }
})

export default router
