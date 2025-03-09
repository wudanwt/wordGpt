import { reactive } from 'vue'
import { debug } from './debug'

// 全局状态
export const globalState = reactive({
  isReady: false,
  hasDocument: false,
  hasSelectedText: false,
  error: null
})

// UI状态管理
export const uiState = {
  updateDocumentStatus(hasDoc) {
    globalState.hasDocument = hasDoc
  },

  updateSelectionStatus(hasSelection) {
    globalState.hasSelectedText = hasSelection
  },

  setError(error) {
    debug.error('Error:', error)
    globalState.error = error
    setTimeout(() => {
      globalState.error = null
    }, 3000)
  }
}

// 开发环境下的调试功能
if (import.meta.env.DEV) {
  window._globalState = globalState
  window._debug = {
    getState: () => ({
      isReady: globalState.isReady,
      hasDocument: globalState.hasDocument,
      hasSelectedText: globalState.hasSelectedText,
      error: globalState.error
    })
  }
}
