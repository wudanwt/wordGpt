// WPS API 封装
class WPSApi {
  constructor() {
    this._app = null
    this._initialized = false
  }

  // 获取WPS应用实例
  get app() {
    if (!this._app) {
      if (!window.Application) {
        throw new Error('WPS Application not available')
      }
      this._app = window.Application
    }
    return this._app
  }

  // 获取当前文档
  getCurrentDocument() {
    try {
      const doc = this.app?.ActiveDocument
      if (!doc) {
        throw new Error('没有打开的文档')
      }
      return doc
    } catch (error) {
      console.error('获取当前文档失败:', error)
      return null
    }
  }

  // 获取选中的文本
  getSelectedText() {
    try {
      const doc = this.getCurrentDocument()
      if (!doc) return null

      const selection = doc.ActiveWindow?.Selection
      if (!selection) {
        console.warn('无法获取文档选区')
        return null
      }

      return selection.Text || null
    } catch (error) {
      console.error('获取选中文本失败:', error)
      return null
    }
  }

  // 获取文档文本
  getDocumentText() {
    try {
      const doc = this.getCurrentDocument()
      if (!doc) return null

      const content = doc.Content
      if (!content) {
        console.warn('无法获取文档内容')
        return null
      }

      return content.Text || null
    } catch (error) {
      console.error('获取文档文本失败:', error)
      return null
    }
  }

  // 在当前位置插入文本
  async insertText(text) {
    try {
      const doc = this.getCurrentDocument()
      if (!doc) {
        throw new Error('没有打开的文档')
      }

      const selection = doc.ActiveWindow?.Selection
      if (!selection) {
        throw new Error('无法获取光标位置')
      }

      // 如果当前有选中文本，先删除它
      if (selection.Text) {
        selection.Delete()
      }

      // 确保焦点在文档上
      doc.Activate()

      // 在当前位置插入文本
      selection.InsertAfter(text)
      
      // 移动光标到插入文本之后
      selection.Collapse(0) // 0 表示折叠到末尾

      // 刷新文档显示
      if (doc.ActiveWindow) {
        doc.ActiveWindow.ScrollIntoView(selection)
      }

      return true
    } catch (error) {
      console.error('插入文本失败:', error)
      throw error
    }
  }

  // 显示提示信息
  showAlert(message, title = 'AI助手') {
    try {
      if (this.app?.Alert) {
        this.app.Alert(message, title)
      } else {
        console.log('[WPS Alert]', title + ':', message)
      }
    } catch (error) {
      console.error('显示提示失败:', error)
      console.log('[WPS Alert]', title + ':', message)
    }
  }

  // 获取环境信息
  getEnvironmentInfo() {
    return {
      hasApplication: !!window.Application,
      hasDocument: !!this.getCurrentDocument(),
      isDev: import.meta.env.DEV,
      wpsReady: window.__WPS_READY__
    }
  }

  // 测试文档操作
  async testDocumentOperations() {
    try {
      const doc = this.getCurrentDocument()
      if (!doc) {
        console.log('No active document')
        return false
      }

      // 获取当前选区
      console.log('当前选区:', {
        hasSelection: !!doc.ActiveWindow?.Selection,
        selectedText: this.getSelectedText()
      })

      // 测试插入文本
      await this.insertText('测试文本')
      console.log('插入文本成功')

      return true
    } catch (error) {
      console.error('文档操作测试失败:', error)
      return false
    }
  }
}

// 导出单例实例
export const wpsApi = new WPSApi()

// 开发环境下的调试功能
if (import.meta.env.DEV) {
  window._wpsApi = wpsApi
  window._wpsDebug = {
    getEnv: () => wpsApi.getEnvironmentInfo(),
    testInsert: (text = 'Test text') => wpsApi.insertText(text),
    testAlert: (msg = 'Test alert') => wpsApi.showAlert(msg),
    testDoc: () => wpsApi.testDocumentOperations()
  }
}
