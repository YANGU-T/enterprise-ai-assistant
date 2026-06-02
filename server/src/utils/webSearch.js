/**
 * 联网搜索工具 - 使用博查AI (BochaAI) Web Search API
 * 文档参考：https://bocha-ai.feishu.cn/wiki/RXEOw02rFiwzGSkd9mUcqoeAnNK
 * 
 * 配置方式：在 server/.env 文件中设置 BOCHA_API_KEY=你的API密钥
 */

import dotenv from 'dotenv'
dotenv.config()

const BOCHA_API_URL = 'https://api.bocha.cn/v1/web-search'

/**
 * 获取博查AI API Key
 * 优先从环境变量读取，也支持从请求配置中传入
 */
function getBochaApiKey(overrideKey) {
  const key = overrideKey || process.env.BOCHA_API_KEY
  if (!key) {
    console.warn('[WebSearch] 未配置博查AI API Key，请在 server/.env 中设置 BOCHA_API_KEY')
  }
  return key
}

/**
 * 使用博查AI搜索网页内容
 * @param {string} query - 搜索关键词
 * @param {number} maxResults - 最大结果数
 * @param {string} [apiKeyOverride] - 可选的API Key覆盖
 * @returns {Promise<Array>} 搜索结果列表
 */
export async function searchWeb(query, maxResults = 5, apiKeyOverride = null) {
  const apiKey = getBochaApiKey(apiKeyOverride)
  if (!apiKey) {
    console.warn('[WebSearch] 无API Key，跳过联网搜索')
    return []
  }

  if (!query || query.trim().length === 0) {
    return []
  }

  try {
    console.log('[WebSearch] 正在搜索:', query.substring(0, 80))

    const response = await fetch(BOCHA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query.trim(),
        freshness: 'noLimit'
      }),
      signal: AbortSignal.timeout(15000)
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '未知错误')
      console.error('[WebSearch] API请求失败:', response.status, errorText.substring(0, 200))
      return []
    }

    const rawText = await response.text()
    let data
    try {
      data = JSON.parse(rawText)
    } catch (parseErr) {
      console.error('[WebSearch] API返回非JSON响应:', rawText.substring(0, 200))
      return []
    }

    // 解析博查AI响应（兼容Bing Search API格式）
    return parseBochaResults(data, maxResults)
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      console.error('[WebSearch] 搜索请求超时(15秒)')
    } else {
      console.error('[WebSearch] 搜索失败:', error.message)
    }
    return []
  }
}

/**
 * 解析博查AI搜索结果
 * 响应格式兼容Bing Search API
 */
function parseBochaResults(data, maxResults) {
  const results = []

  try {
    // 博查AI响应结构：data.webPages.value[]
    const webPages = data?.webPages?.value || data?.data?.webPages?.value || []

    for (const item of webPages) {
      if (results.length >= maxResults) break

      if (item.name && item.snippet) {
        results.push({
          title: cleanText(item.name),
          url: item.url || '',
          snippet: cleanText(item.snippet),
          siteName: item.siteName || '',
          datePublished: item.datePublished || ''
        })
      }
    }

    // 备用解析：如果响应结构不同，尝试其他字段
    if (results.length === 0 && data) {
      // 尝试直接从顶层解析
      const items = Array.isArray(data) ? data : (data.results || data.items || [])
      for (const item of items) {
        if (results.length >= maxResults) break
        if (item.title || item.name) {
          results.push({
            title: cleanText(item.title || item.name || ''),
            url: item.url || item.link || '',
            snippet: cleanText(item.snippet || item.description || item.summary || ''),
            siteName: item.siteName || '',
            datePublished: item.datePublished || ''
          })
        }
      }
    }
  } catch (err) {
    console.error('[WebSearch] 解析搜索结果失败:', err.message)
  }

  console.log('[WebSearch] 解析到', results.length, '条结果')
  return results
}

/**
 * 清理文本内容
 */
function cleanText(text) {
  if (!text) return ''
  return text
    .replace(/<[^>]+>/g, '') // 移除HTML标签
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 构建联网搜索增强的提示词
 * @param {string} userQuery - 用户原始问题
 * @param {Array} searchResults - 搜索结果
 * @returns {string} 增强后的提示词
 */
export function buildSearchEnhancedPrompt(userQuery, searchResults) {
  if (!searchResults || searchResults.length === 0) {
    return userQuery
  }

  const searchContext = searchResults
    .map((r, i) => {
      let entry = `[${i + 1}] ${r.title}\n${r.snippet}`
      if (r.url) entry += `\n来源: ${r.url}`
      if (r.datePublished) entry += `\n发布时间: ${r.datePublished}`
      return entry
    })
    .join('\n\n')

  return `请根据以下联网搜索结果回答用户的问题。如果搜索结果中有相关信息，请引用并整合到回答中。如果搜索结果中没有相关信息，请基于你的知识回答，并说明这是基于你的训练数据。

【联网搜索结果】
${searchContext}

【用户问题】
${userQuery}

请用中文回答，确保信息准确、有条理。如果涉及最新信息，请标注信息来源。`
}

/**
 * 提取用户问题中的搜索关键词
 * @param {string} message - 用户消息
 * @returns {string} 优化后的搜索关键词
 */
export function extractSearchQuery(message) {
  if (!message) return ''

  // 移除常见的无关词汇，保留核心关键词
  const stopWords = ['请', '帮我', '怎么', '如何', '什么是', '是什么', '的', '了', '吗', '呢', '吧', '啊']
  let query = message.trim()

  // 如果消息太短，直接使用
  if (query.length < 5) return query

  // 移除标点符号
  query = query.replace(/[，。！？、；：""''（）【】《》\?\!\.\,]/g, ' ')

  // 压缩空格
  query = query.replace(/\s+/g, ' ').trim()

  // 限制搜索词长度
  if (query.length > 100) {
    query = query.substring(0, 100)
  }

  return query.trim()
}
