import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let db = null

export async function getDatabase() {
  if (db) return db
  
  db = await open({
    filename: join(__dirname, '../../data/cache.db'),
    driver: sqlite3.Database
  })
  
  // 启用WAL模式提高性能
  await db.exec('PRAGMA journal_mode=WAL')
  await db.exec('PRAGMA synchronous=NORMAL')
  
  return db
}

export async function closeDatabase() {
  if (db) {
    await db.close()
    db = null
  }
}
