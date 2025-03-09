import { debug } from '../utils/debug'

class AIService {
  constructor() {
    this.config = null
    this.initialized = false
    this.controller = null
  }

  initialize(config) {
    this.config = {
      apiType: config.apiType || 'openai',
      apiKey: config.apiKey,
      apiEndpoint: config.apiEndpoint || 'https://api.openai.com/v1',
      model: config.model || 'gpt-3.5-turbo',
      temperature: config.temperature || 0.7
    }
    
    this.initialized = true
    debug.log('AI服务初始化完成:', { 
      apiType: this.config.apiType,
      model: this.config.model,
      endpoint: this.config.apiEndpoint
    })
  }

  // 流式发送消息
  async * streamMessage(content, context = '') {
    if (!this.initialized) {
      throw new Error('AI服务未初始化')
    }

    try {
      let messages = []

      // 添加系统消息
      messages.push({
        role: 'system',
        content: `你是一个专业的写作助手。${
          context ? '请基于以下上下文回答问题：\n\n' + context : ''
        }`
      })

      // 添加用户消息
      messages.push({
        role: 'user',
        content
      })

      debug.log('发送流式消息:', { content, hasContext: !!context })

      // 创建AbortController用于取消请求
      this.controller = new AbortController()
      const signal = this.controller.signal

      const response = await fetch(
        `${this.config.apiEndpoint}/chat/completions`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify({
            model: this.config.model,
            messages,
            temperature: this.config.temperature,
            max_tokens: 2000,
            stream: true
          }),
          signal
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // 解码新的数据块并添加到缓冲区
        buffer += decoder.decode(value, { stream: true })

        // 处理缓冲区中的完整事件
        while (buffer.includes('\n')) {
          const newlineIndex = buffer.indexOf('\n')
          const line = buffer.slice(0, newlineIndex)
          buffer = buffer.slice(newlineIndex + 1)

          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const json = JSON.parse(data)
              const content = json.choices[0]?.delta?.content
              if (content) {
                yield content
              }
            } catch (e) {
              debug.error('解析数据出错:', e)
            }
          }
        }
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        debug.log('请求被取消')
        return
      }
      debug.error('AI服务错误:', error)
      throw error
    } finally {
      this.controller = null
    }
  }

  // 取消当前请求
  cancelRequest() {
    if (this.controller) {
      this.controller.abort()
      this.controller = null
      debug.log('已取消当前请求')
    }
  }

  // 获取当前配置
  getConfig() {
    return this.config
  }

  // 验证配置
  async validateConfig() {
    try {
      let response = ''
      for await (const chunk of this.streamMessage('测试消息')) {
        response += chunk
      }
      return { valid: true, response }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }
}

// 导出单例实例
export const aiService = new AIService()

// 开发环境下的调试功能
if (import.meta.env.DEV) {
  window._aiService = aiService
  window._aiDebug = {
    getConfig: () => aiService.getConfig(),
    testStream: async (msg = '测试') => {
      console.log('开始流式输出测试...')
      try {
        for await (const chunk of aiService.streamMessage(msg)) {
          console.log('收到数据:', chunk)
        }
        console.log('流式输出完成')
      } catch (e) {
        console.error('测试失败:', e)
      }
    },
    cancelTest: () => aiService.cancelRequest(),
    validateConfig: () => aiService.validateConfig()
  }
}
