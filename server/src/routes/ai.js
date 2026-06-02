import express from 'express'
import { body, validationResult } from 'express-validator'
import { searchWeb, buildSearchEnhancedPrompt, extractSearchQuery } from '../utils/webSearch.js'

const router = express.Router()

// ========== AI 模型提供商配置 ==========
const PROVIDER_ENDPOINTS = {
  OpenAI: {
    url: 'https://api.openai.com/v1/chat/completions',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    buildBody: (messages, model, params) => ({
      model,
      messages,
      temperature: params.temperature || 0.7,
      max_tokens: params.maxTokens || 4096,
      top_p: params.topP || 1.0
    }),
    extractResponse: (data) => data.choices?.[0]?.message?.content || ''
  },
  Anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    }),
    buildBody: (messages, model, params) => {
      // Anthropic要求将system单独提取
      const systemMsg = messages.find(m => m.role === 'system')
      const chatMsgs = messages.filter(m => m.role !== 'system')
      return {
        model,
        max_tokens: params.maxTokens || 4096,
        system: systemMsg?.content || '',
        messages: chatMsgs.map(m => ({ role: m.role, content: m.content }))
      }
    },
    extractResponse: (data) => data.content?.[0]?.text || ''
  },
  DeepSeek: {
    url: 'https://api.deepseek.com/chat/completions',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    buildBody: (messages, model, params) => {
      const body = {
        model,
        messages,
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || 4096,
        top_p: params.topP || 1.0
      }
      // DeepSeek联网搜索：通过web_search参数启用
      if (params.enableWebSearch) {
        body.web_search = true
      }
      return body
    },
    extractResponse: (data) => data.choices?.[0]?.message?.content || ''
  },
  '阿里云': {
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    buildBody: (messages, model, params) => {
      const body = {
        model: model.replace('qwen-', 'qwen-'), // 保持原始模型名
        messages,
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || 4096,
        top_p: params.topP || 1.0
      }
      // 阿里云联网搜索：通过enable_search参数启用
      if (params.enableWebSearch) {
        body.enable_search = true
      }
      return body
    },
    extractResponse: (data) => data.choices?.[0]?.message?.content || ''
  },
  '智谱AI': {
    url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    buildBody: (messages, model, params) => {
      const body = {
        model,
        messages,
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || 4096,
        top_p: params.topP || 1.0
      }
      // 智谱AI联网搜索：通过tools参数启用web_search
      if (params.enableWebSearch) {
        body.tools = [{
          type: 'web_search',
          web_search: {
            enable: true,
            search_query: messages[messages.length - 1]?.content || ''
          }
        }]
      }
      return body
    },
    extractResponse: (data) => data.choices?.[0]?.message?.content || ''
  },
  '小米MImo': {
    url: 'https://token-plan-cn.xiaomimimo.com/v1/chat/completions',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'api-key': apiKey
    }),
    buildBody: (messages, model, params) => ({
      model,
      messages,
      max_completion_tokens: params.maxTokens || 4096,
      temperature: params.temperature || 0.7
    }),
    extractResponse: (data) => data.choices?.[0]?.message?.content || ''
  },
  Google: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json'
    }),
    buildBody: (messages, model, params) => ({
      contents: messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      generationConfig: {
        temperature: params.temperature || 0.7,
        maxOutputTokens: params.maxTokens || 4096,
        topP: params.topP || 1.0
      }
    }),
    extractResponse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    buildUrl: (model, apiKey) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  }
}

// 模型ID到提供商的映射
const MODEL_PROVIDER_MAP = {
  'gpt-4o': 'OpenAI',
  'gpt-4-turbo': 'OpenAI',
  'gpt-3.5-turbo': 'OpenAI',
  'claude-3.5-sonnet': 'Anthropic',
  'claude-3-opus': 'Anthropic',
  'claude-3-sonnet': 'Anthropic',
  'deepseek-v3': 'DeepSeek',
  'deepseek-r1': 'DeepSeek',
  'deepseek-v4-flash': 'DeepSeek',
  'deepseek-v4-pro': 'DeepSeek',
  'deepseek-chat': 'DeepSeek',
  'deepseek-reasoner': 'DeepSeek',
  'qwen-max': '阿里云',
  'qwen-plus': '阿里云',
  'glm-4': '智谱AI',
  'gemini-2.0-pro': 'Google',
  'llama-3-70b': 'DeepSeek', // Llama通过DeepSeek API兼容
  'ernie-4.0': '百度',
  'mimo-v2.5-pro': '小米MImo',
  'mimo-v2-pro': '小米MImo',
  'mimo-v2-omni': '小米MImo'
}

// ========== AI 对话代理接口 ==========
router.post('/chat', [
  body('messages').isArray().withMessage('消息列表不能为空'),
  body('model').notEmpty().withMessage('模型ID不能为空')
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

    const { messages, model, config = {} } = req.body
    const provider = config.provider || MODEL_PROVIDER_MAP[model]
    const customEndpoint = config.endpoint

    console.log('[AI Chat] 收到请求:', {
      model,
      provider,
      endpoint: customEndpoint || '(使用默认)',
      hasApiKey: !!config.apiKey,
      enableWebSearch: config.enableWebSearch
    })

    // 如果提供了自定义endpoint，使用自定义endpoint调用API
    if (customEndpoint && customEndpoint.trim()) {
      const apiKey = config.apiKey
      if (!apiKey) {
        // 没有API Key时返回错误提示
        return res.status(401).json({
          success: false,
          message: '请先配置 API 密钥',
          hint: '请在「设置 → AI模型配置」中填入正确的 API 密钥'
        })
      }

      // 智能补全 endpoint
      let finalEndpoint = customEndpoint.trim()
      // 如果用户只填写了 base URL（如 https://api.deepseek.com），自动补全 /chat/completions
      if (!finalEndpoint.includes('/chat/completions') && !finalEndpoint.includes('/messages')) {
        finalEndpoint = finalEndpoint.replace(/\/+$/, '') + '/chat/completions'
        console.log('[AI Chat] 自动补全 endpoint:', finalEndpoint)
      }

      // 使用自定义endpoint调用API（假设是OpenAI兼容格式）
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
      
      const body = {
        model,
        messages,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 4096,
        top_p: config.topP || 1.0
      }
      // 自定义endpoint也支持联网搜索（OpenAI兼容格式）
      if (config.enableWebSearch) {
        body.web_search = true
        body.enable_search = true
      }

      const response = await fetch(finalEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60000) // 60秒超时
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '未知错误')
        console.error(`AI API 错误 [自定义]:`, response.status, errorText)
        let hint = ''
        if (response.status === 404) {
          hint = `，请检查：
1. API接口地址是否正确（当前: ${customEndpoint}）
2. 模型名称是否与服务商一致（当前: ${model}）
3. 参考文档：https://api-docs.deepseek.com/zh-cn/`
        }
        if (response.status === 401 || response.status === 403) hint = '，请检查API密钥是否正确'
        return res.status(response.status).json({
          success: false,
          message: `AI服务请求失败: ${response.status}${hint}`,
          error: errorText
        })
      }

      // 安全解析JSON响应
      const rawText = await response.text()
      let data
      try {
        data = JSON.parse(rawText)
      } catch (parseErr) {
        console.error('自定义endpoint返回非JSON响应:', rawText.substring(0, 500))
        return res.status(502).json({
          success: false,
          message: `AI服务返回了非JSON响应（可能是HTML错误页面），请检查API地址是否正确`,
          error: rawText.substring(0, 200),
          hint: `当前endpoint: ${finalEndpoint}，返回内容开头: ${rawText.substring(0, 100)}...`
        })
      }
      const content = data.choices?.[0]?.message?.content || ''

      return res.json({
        success: true,
        data: {
          content,
          model,
          provider: provider || '自定义',
          simulated: false,
          timestamp: new Date().toISOString()
        }
      })
    }

    // 没有自定义endpoint时，使用预定义的提供商配置
    if (!provider) {
      // 没有提供商也没有endpoint，返回错误提示
      return res.status(400).json({
        success: false,
        message: '模型未配置',
        hint: `请在「设置 → AI模型配置」中配置模型的 API 接口地址和 API 密钥`
      })
    }

    const providerConfig = PROVIDER_ENDPOINTS[provider]
    if (!providerConfig) {
      return res.status(400).json({
        success: false,
        message: `不支持的提供商: ${provider}`
      })
    }

    const apiKey = config.apiKey
    if (!apiKey) {
      // 没有API Key时返回错误提示
      return res.status(401).json({
        success: false,
        message: '请先配置 API 密钥',
        hint: '请在「设置 → AI模型配置」中填入正确的 API 密钥'
      })
    }

    // 调用真实AI API
    const url = providerConfig.buildUrl
      ? providerConfig.buildUrl(model, apiKey)
      : providerConfig.url

    const headers = providerConfig.buildHeaders(apiKey)
    const body = providerConfig.buildBody(messages, model, {
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      topP: config.topP,
      enableWebSearch: config.enableWebSearch
    })

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000) // 60秒超时
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '未知错误')
      console.error(`AI API 错误 [${provider}]:`, response.status, errorText)
      return res.status(response.status).json({
        success: false,
        message: `AI服务请求失败: ${response.status}`,
        error: errorText
      })
    }

    // 安全解析JSON响应
    const rawText = await response.text()
    let data
    try {
      data = JSON.parse(rawText)
    } catch (parseErr) {
      console.error(`${provider} 返回非JSON响应:`, rawText.substring(0, 500))
      return res.status(502).json({
        success: false,
        message: `AI服务返回了非JSON响应，请检查API配置`,
        error: rawText.substring(0, 200),
        hint: `提供商: ${provider}，URL: ${url}，返回内容开头: ${rawText.substring(0, 100)}...`
      })
    }
    const content = providerConfig.extractResponse(data)

    res.json({
      success: true,
      data: {
        content,
        model,
        provider,
        simulated: false,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('AI对话请求错误:', error)
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return res.status(408).json({
        success: false,
        message: 'AI服务请求超时（60秒），请稍后重试或检查网络连接'
      })
    }
    // 网络连接错误
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || 
        error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' ||
        error.message?.includes('fetch failed') || error.message?.includes('NetworkError')) {
      return res.status(502).json({
        success: false,
        message: `网络连接失败，无法连接到AI服务`,
        error: error.message,
        hint: `请检查：1. API地址是否正确 2. 网络是否正常 3. 目标服务是否可用`
      })
    }
    // 其他未知错误
    res.status(500).json({
      success: false,
      message: `AI服务请求失败: ${error.message}`,
      error: error.message
    })
  }
})

// ========== 联网搜索增强的AI对话接口 ==========
router.post('/chat-with-search', [
  body('messages').isArray().withMessage('消息列表不能为空'),
  body('model').notEmpty().withMessage('模型ID不能为空')
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

    const { messages, model, config = {} } = req.body
    const provider = config.provider || MODEL_PROVIDER_MAP[model]
    
    console.log('[AI Chat+Search] 收到请求:', {
      model,
      provider,
      enableWebSearch: true
    })

    // 1. 提取最后一条用户消息进行搜索
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()
    const userQuery = lastUserMsg?.content || ''
    
    // 2. 执行联网搜索
    console.log('[AI Chat+Search] 正在搜索:', userQuery.substring(0, 50))
    const searchQuery = extractSearchQuery(userQuery)
    const searchResults = await searchWeb(searchQuery, 5)
    console.log('[AI Chat+Search] 搜索结果:', searchResults.length, '条')
    
    // 3. 构建增强的提示词
    const enhancedPrompt = buildSearchEnhancedPrompt(userQuery, searchResults)
    
    // 4. 替换最后一条用户消息为增强版本
    const enhancedMessages = messages.map((m, i) => {
      if (m.role === 'user' && i === messages.length - 1) {
        return { ...m, content: enhancedPrompt }
      }
      return m
    })

    // 5. 调用AI API（复用现有逻辑）
    let apiKey = config.apiKey
    let endpoint = config.endpoint
    let headers, body, url

    if (endpoint && endpoint.trim()) {
      // 使用自定义endpoint
      let finalEndpoint = endpoint.trim()
      if (!finalEndpoint.includes('/chat/completions') && !finalEndpoint.includes('/messages')) {
        finalEndpoint = finalEndpoint.replace(/\/+$/, '') + '/chat/completions'
      }
      url = finalEndpoint
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
      body = {
        model,
        messages: enhancedMessages,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 4096,
        top_p: config.topP || 1.0
      }
    } else if (provider) {
      // 使用预定义提供商
      const providerConfig = PROVIDER_ENDPOINTS[provider]
      if (!providerConfig) {
        return res.status(400).json({ success: false, message: `不支持的提供商: ${provider}` })
      }
      url = providerConfig.buildUrl ? providerConfig.buildUrl(model, apiKey) : providerConfig.url
      headers = providerConfig.buildHeaders(apiKey)
      body = providerConfig.buildBody(enhancedMessages, model, {
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        topP: config.topP,
        enableWebSearch: false // 已经手动搜索了
      })
    } else {
      return res.status(400).json({ success: false, message: '请配置AI模型' })
    }

    if (!apiKey) {
      return res.status(401).json({ success: false, message: '请先配置 API 密钥' })
    }

    // 6. 调用AI API
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000)
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '未知错误')
      console.error(`AI API 错误:`, response.status, errorText)
      return res.status(response.status).json({
        success: false,
        message: `AI服务请求失败: ${response.status}`,
        error: errorText
      })
    }

    // 安全解析JSON
    const rawText = await response.text()
    let data
    try {
      data = JSON.parse(rawText)
    } catch (parseErr) {
      return res.status(502).json({
        success: false,
        message: 'AI服务返回了非JSON响应',
        error: rawText.substring(0, 200)
      })
    }

    const content = (provider === 'Anthropic' ? data.content?.[0]?.text : data.choices?.[0]?.message?.content) || ''

    res.json({
      success: true,
      data: {
        content,
        model,
        provider: provider || '自定义',
        simulated: false,
        searchResults: searchResults.map(r => ({ title: r.title, snippet: r.snippet })),
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('AI联网搜索对话错误:', error)
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return res.status(408).json({
        success: false,
        message: '请求超时，请稍后重试'
      })
    }
    res.status(500).json({
      success: false,
      message: `请求失败: ${error.message}`,
      error: error.message
    })
  }
})

// 模拟AI执行记录
let aiExecutions = [
  {
    id: 1,
    taskId: 'travel',
    taskName: '出差申请',
    input: '安排下周三上海客户拜访',
    steps: [
      { title: '自动填写出差申请表', status: 'completed', time: '0.3s' },
      { title: '提交审批流程', status: 'completed', time: '0.2s' },
      { title: '创建差旅预支申请', status: 'completed', time: '0.4s' },
      { title: '预约会议室', status: 'completed', time: '0.3s' }
    ],
    status: 'completed',
    result: '出差申请已提交，差旅预支申请已创建，会议室已预约。',
    executedBy: 1,
    executedAt: '2026-05-27T10:30:00Z'
  },
  {
    id: 2,
    taskId: 'report',
    taskName: '生成周报',
    input: '生成本周工作周报',
    steps: [
      { title: '收集Git提交记录', status: 'completed', time: '0.5s' },
      { title: '汇总任务完成情况', status: 'completed', time: '0.3s' },
      { title: 'AI生成周报内容', status: 'completed', time: '0.8s' },
      { title: '保存周报文档', status: 'completed', time: '0.2s' }
    ],
    status: 'completed',
    result: '周报已生成，包含12项任务完成情况和5项下周计划。',
    executedBy: 1,
    executedAt: '2026-05-27T09:15:00Z'
  }
]

// 获取AI执行记录
router.get('/executions', (req, res) => {
  try {
    const { taskId, status } = req.query
    let filteredExecutions = [...aiExecutions]

    if (taskId) {
      filteredExecutions = filteredExecutions.filter(e => e.taskId === taskId)
    }

    if (status) {
      filteredExecutions = filteredExecutions.filter(e => e.status === status)
    }

    res.json({
      success: true,
      data: filteredExecutions
    })
  } catch (error) {
    console.error('获取AI执行记录错误:', error)
    res.status(500).json({
      success: false,
      message: '获取AI执行记录失败'
    })
  }
})

// 执行AI任务
router.post('/execute', [
  body('taskId').notEmpty().withMessage('任务ID不能为空'),
  body('input').notEmpty().withMessage('输入内容不能为空')
], (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '验证失败',
        errors: errors.array()
      })
    }

    const { taskId, input } = req.body

    // 模拟AI执行
    const steps = generateAISteps(taskId)
    const result = generateAIResult(taskId, input)

    const newExecution = {
      id: aiExecutions.length + 1,
      taskId,
      taskName: getTaskName(taskId),
      input,
      steps,
      status: 'completed',
      result,
      executedBy: req.user?.userId || 1,
      executedAt: new Date().toISOString()
    }

    aiExecutions.push(newExecution)

    // 模拟执行延迟
    setTimeout(() => {
      res.json({
        success: true,
        message: 'AI任务执行成功',
        data: newExecution
      })
    }, 1000)
  } catch (error) {
    console.error('执行AI任务错误:', error)
    res.status(500).json({
      success: false,
      message: '执行AI任务失败'
    })
  }
})

// 获取AI建议
router.get('/suggestions', (req, res) => {
  try {
    const { context } = req.query

    // 模拟AI建议
    const suggestions = [
      {
        id: 1,
        type: 'workflow',
        title: '优化出差审批流程',
        description: '建议将出差审批流程从5步简化为3步，可减少40%的处理时间。',
        confidence: 0.85,
        impact: 'high'
      },
      {
        id: 2,
        type: 'task',
        title: '任务优先级调整',
        description: '检测到「客户演示PPT」和「前端架构评审」存在时间冲突，建议调整优先级。',
        confidence: 0.92,
        impact: 'medium'
      },
      {
        id: 3,
        type: 'resource',
        title: '资源分配优化',
        description: '赵海涛当前任务负载过高，建议将部分任务分配给陈思雨。',
        confidence: 0.78,
        impact: 'high'
      }
    ]

    res.json({
      success: true,
      data: suggestions
    })
  } catch (error) {
    console.error('获取AI建议错误:', error)
    res.status(500).json({
      success: false,
      message: '获取AI建议失败'
    })
  }
})

// 获取AI工作台数据
router.get('/workbench', (req, res) => {
  try {
    const { roleId } = req.query

    // 模拟AI工作台数据
    const workbenchData = {
      roles: [
        {
          id: 'hr',
          name: 'HR',
          description: '人力资源管理',
          stages: [
            { id: 'recruit', name: '招聘', status: 'active', count: 3 },
            { id: 'onboard', name: '入职', status: 'done', count: 2 },
            { id: 'train', name: '培训', status: 'pending', count: 1 },
            { id: 'assess', name: '考核', status: 'pending', count: 0 }
          ]
        },
        {
          id: 'sales',
          name: '销售',
          description: '销售业务管理',
          stages: [
            { id: 'lead', name: '线索', status: 'active', count: 5 },
            { id: 'demo', name: '演示', status: 'pending', count: 2 },
            { id: 'proposal', name: '方案', status: 'pending', count: 1 },
            { id: 'close', name: '成交', status: 'pending', count: 0 }
          ]
        },
        {
          id: 'tech',
          name: '技术',
          description: '技术研发管理',
          stages: [
            { id: 'design', name: '设计', status: 'done', count: 4 },
            { id: 'develop', name: '开发', status: 'active', count: 6 },
            { id: 'test', name: '测试', status: 'pending', count: 2 },
            { id: 'deploy', name: '部署', status: 'pending', count: 0 }
          ]
        }
      ],
      notifications: [
        {
          id: 1,
          title: '新员工入职提醒',
          description: '明天有2名新员工入职，请准备相关材料。',
          type: 'info',
          time: '1小时前'
        },
        {
          id: 2,
          title: '客户演示准备',
          description: 'A公司客户演示将于下周三进行，请确保PPT准备完毕。',
          type: 'warning',
          time: '2小时前'
        }
      ]
    }

    res.json({
      success: true,
      data: workbenchData
    })
  } catch (error) {
    console.error('获取AI工作台数据错误:', error)
    res.status(500).json({
      success: false,
      message: '获取AI工作台数据失败'
    })
  }
})

// ========== 模拟响应生成（无API Key时使用）==========
function generateSimulatedResponse(messages, model, provider) {
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()
  const input = lastUserMsg?.content || ''

  const providerName = {
    'OpenAI': 'GPT',
    'Anthropic': 'Claude',
    'DeepSeek': 'DeepSeek',
    '阿里云': '通义千问',
    '智谱AI': 'GLM',
    'Google': 'Gemini',
    '百度': '文心一言'
  }[provider] || provider

  // 通用模拟响应模板
  return `[${providerName} 模拟响应 — 当前未配置 ${provider} API Key，以下为演示回复]

我理解您的需求。基于您的输入："${input.substring(0, 100)}${input.length > 100 ? '...' : ''}"

以下是基于 ${model} 模型能力的分析和建议：

**1. 需求分析**
根据您的描述，我可以帮您从以下几个方面进行处理：
- 任务拆解与优先级排序
- 资源调配与时间规划
- 风险识别与应对策略

**2. 执行建议**
- 建议先确认核心目标和关键约束条件
- 分阶段执行，每阶段设定明确的交付物
- 定期回顾进展并调整方案

**3. 可用工具推荐**
- 🤖 智能Agent：可自动执行重复性任务
- 📊 数据分析：可辅助决策和趋势判断
- 📝 文档生成：可自动生成报告和方案

---
💡 **提示**：要获取真实的AI模型响应，请在「设置 → AI模型配置」中配置对应提供商的 API Key。
   当前模型：${model} (${provider})`
}

// 模拟AI执行步骤
function generateAISteps(taskId) {
  const stepsMap = {
    travel: [
      { title: '自动填写出差申请表', status: 'completed', time: '0.3s' },
      { title: '提交审批流程', status: 'completed', time: '0.2s' },
      { title: '创建差旅预支申请', status: 'completed', time: '0.4s' },
      { title: '预约会议室', status: 'completed', time: '0.3s' }
    ],
    report: [
      { title: '收集Git提交记录', status: 'completed', time: '0.5s' },
      { title: '汇总任务完成情况', status: 'completed', time: '0.3s' },
      { title: 'AI生成周报内容', status: 'completed', time: '0.8s' },
      { title: '保存周报文档', status: 'completed', time: '0.2s' }
    ],
    reimbursement: [
      { title: '识别发票信息', status: 'completed', time: '0.4s' },
      { title: '校验报销标准', status: 'completed', time: '0.3s' },
      { title: '生成报销单', status: 'completed', time: '0.5s' },
      { title: '提交审批', status: 'completed', time: '0.2s' }
    ],
    meeting: [
      { title: '查找可用会议室', status: 'completed', time: '0.3s' },
      { title: '发送会议邀请', status: 'completed', time: '0.4s' },
      { title: '创建会议议程', status: 'completed', time: '0.5s' },
      { title: '预约设备', status: 'completed', time: '0.2s' }
    ]
  }

  return stepsMap[taskId] || [
    { title: '分析任务需求', status: 'completed', time: '0.3s' },
    { title: '执行任务', status: 'completed', time: '0.5s' },
    { title: '生成结果', status: 'completed', time: '0.4s' }
  ]
}

function generateAIResult(taskId, input) {
  const resultsMap = {
    travel: '出差申请已提交，差旅预支申请已创建，会议室已预约。',
    report: '周报已生成，包含本周工作概览和下周计划。',
    reimbursement: '报销单已生成并提交审批，预计3个工作日内处理。',
    meeting: '会议已安排，邀请已发送，会议室已预约。'
  }

  return resultsMap[taskId] || `任务「${input}」已执行完成。`
}

function getTaskName(taskId) {
  const namesMap = {
    travel: '出差申请',
    report: '生成周报',
    reimbursement: '费用报销',
    meeting: '会议安排'
  }

  return namesMap[taskId] || '自定义任务'
}

export default router