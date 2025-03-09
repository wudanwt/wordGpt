import { wpsApi } from '../utils/wpsApi'
import { debug } from '../utils/debug'

class DocumentService {
  constructor() {
    this.lastOperation = null
    this.operationHistory = []
  }

  // 获取当前文档
  getCurrentDocument() {
    return wpsApi.getCurrentDocument()
  }

  // 获取选中的文本
  getSelectedText() {
    try {
      const text = wpsApi.getSelectedText()
      if (text) {
        debug.log('获取选中文本:', { length: text.length })
      }
      return text
    } catch (error) {
      debug.error('获取选中文本失败:', error)
      return null
    }
  }

  // 获取文档全文
  getDocumentText() {
    try {
      const text = wpsApi.getDocumentText()
      if (text) {
        debug.log('获取文档文本:', { length: text.length })
      }
      return text
    } catch (error) {
      debug.error('获取文档文本失败:', error)
      return null
    }
  }

  // 在当前位置插入文本
  async insertText(text) {
    try {
      debug.log('插入文本:', { length: text.length })
      
      const operation = {
        type: 'insert',
        text,
        timestamp: Date.now()
      }

      // 保存历史记录
      this.lastOperation = operation
      this.operationHistory.push(operation)

      // 执行插入操作
      await wpsApi.insertText(text)
      debug.log('文本插入成功')

      // 发送提示
      this.showHint('已插入生成的文本')

      return true
    } catch (error) {
      debug.error('插入文本失败:', error)
      this.showHint('插入文本失败: ' + error.message)
      throw error
    }
  }

  // 获取文档信息
  getDocumentInfo() {
    try {
      const doc = this.getCurrentDocument()
      if (!doc) return null

      return {
        name: doc.Name,
        path: doc.FullName,
        pageCount: doc.PageCount,
        wordCount: doc.WordCount,
        modified: doc.Saved ? false : true
      }
    } catch (error) {
      debug.error('获取文档信息失败:', error)
      return null
    }
  }

  // 获取最后一次操作
  getLastOperation() {
    return this.lastOperation
  }

  // 获取操作历史
  getOperationHistory() {
    return this.operationHistory
  }

  // 清除操作历史
  clearHistory() {
    this.operationHistory = []
    this.lastOperation = null
  }

  // 显示提示
  showHint(message) {
    try {
      wpsApi.showAlert(message, 'AI助手')
    } catch (error) {
      debug.error('显示提示失败:', error)
      console.log('[提示]', message)
    }
  }

  // 测试文档操作
  async testOperations() {
    try {
      const info = this.getDocumentInfo()
      if (!info) {
        debug.warn('无法获取文档信息')
        return false
      }

      debug.log('文档信息:', info)

      const text = this.getSelectedText()
      debug.log('当前选中文本:', text)

      await this.insertText('测试插入')
      debug.log('测试插入成功')

      return true
    } catch (error) {
      debug.error('文档操作测试失败:', error)
      return false
    }
  }
}

// 导出单例实例
export const documentService = new DocumentService()

// 开发环境下的调试功能
if (import.meta.env.DEV) {
  window._docService = documentService
  window._docDebug = {
    getInfo: () => documentService.getDocumentInfo(),
    getHistory: () => documentService.getOperationHistory(),
    testInsert: (text = 'Test') => documentService.insertText(text),
    testAll: () => documentService.testOperations(),
    clearHistory: () => documentService.clearHistory()
  }
}
