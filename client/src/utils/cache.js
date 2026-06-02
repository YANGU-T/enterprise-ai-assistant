/**
 * 前端数据缓存工具
 * 同时使用localStorage和服务器SQLite进行数据持久化
 */

const CACHE_PREFIX = 'app_cache_'

// localStorage 缓存操作
export const localCache = {
  get(key) {
    try {
      const data = localStorage.getItem(CACHE_PREFIX + key)
      return data ? JSON.parse(data) : null
    } catch (e) {
      return null
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value))
      return true
    } catch (e) {
      return false
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(CACHE_PREFIX + key)
      return true
    } catch (e) {
      return false
    }
  }
}

// 服务器缓存操作
export const serverCache = {
  async get(key) {
    try {
      const res = await fetch(`/api/cache/${encodeURIComponent(key)}`)
      if (!res.ok) return null
      const result = await res.json()
      return result.success ? result.data : null
    } catch (e) {
      return null
    }
  },
  
  async set(key, value) {
    try {
      const res = await fetch(`/api/cache/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
      })
      return res.ok
    } catch (e) {
      return false
    }
  },
  
  async remove(key) {
    try {
      const res = await fetch(`/api/cache/${encodeURIComponent(key)}`, {
        method: 'DELETE'
      })
      return res.ok
    } catch (e) {
      return false
    }
  }
}

// 组合缓存：优先localStorage，异步同步到服务器
export const cache = {
  get(key) {
    return localCache.get(key)
  },
  
  set(key, value) {
    localCache.set(key, value)
    // 异步同步到服务器，不阻塞主流程
    serverCache.set(key, value).catch(() => {})
    return true
  },
  
  async getWithServer(key) {
    // 先从localStorage读取
    const localData = localCache.get(key)
    if (localData) return localData
    
    // localStorage没有，尝试从服务器读取
    const serverData = await serverCache.get(key)
    if (serverData) {
      // 同步到localStorage
      localCache.set(key, serverData)
      return serverData
    }
    
    return null
  },
  
  remove(key) {
    localCache.remove(key)
    serverCache.remove(key).catch(() => {})
  }
}

// 模块特定的缓存键名
export const CACHE_KEYS = {
  BID_RESULTS: 'bid_match_results',
  BID_COMPANY: 'bid_company_config',
  BID_PRODUCTS: 'bid_products_config',
  BID_PLATFORMS: 'bid_platforms',
  SOLUTION_HISTORY: 'solution_gen_history',
  CONTRACT_HISTORY: 'contract_history',
  BID_DOC_HISTORY: 'bid_doc_history',
  WORKBENCH_TASKS: 'workbench_tasks',
  WORKBENCH_SCHEDULES: 'workbench_schedules'
}

// 批量同步所有模块数据到服务器
export async function syncAllToServer() {
  const keys = Object.values(CACHE_KEYS)
  const promises = keys.map(async key => {
    const data = localCache.get(key)
    if (data) {
      await serverCache.set(key, data)
    }
  })
  await Promise.allSettled(promises)
}

// 从服务器恢复所有数据到localStorage
export async function restoreAllFromServer() {
  const keys = Object.values(CACHE_KEYS)
  const promises = keys.map(async key => {
    const localData = localCache.get(key)
    if (!localData) {
      const serverData = await serverCache.get(key)
      if (serverData) {
        localCache.set(key, serverData)
      }
    }
  })
  await Promise.allSettled(promises)
}
