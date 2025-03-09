import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 导入样式
import './assets/base.css'

// 导入服务和工具
import { debug } from './utils/debug'
import { aiService } from './services/aiService'
import { documentService } from './services/documentService'
import { wpsApi } from './utils/wpsApi'

// 初始化debug模式
debug.init('AI助手')

// 创建Vue应用
const app = createApp(App)

// 使用路由
app.use(router)

// 错误处理
app.config.errorHandler = (err, vm, info) => {
  debug.error('Vue错误:', {
    error: err,
    info,
    component: vm?.$options?.name || 'unknown'
  })

  // 在开发环境下显示错误
  if (import.meta.env.DEV) {
    console.error('Vue Error:', err)
  }
}

// 全局错误处理
window.addEventListener('unhandledrejection', (event) => {
  debug.error('未处理的Promise错误:', event.reason)
})

window.addEventListener('error', (event) => {
  debug.error('全局错误:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
})

// 开发环境工具
if (import.meta.env.DEV) {
  window._app = {
    debug,
    aiService,
    documentService,
    wpsApi,
    router,
    
    getState: () => ({
      wpsReady: window.__WPS_READY__,
      hasRibbon: !!window.ribbon,
      hasApplication: !!window.Application,
      taskPaneVisible: window._aiPaneVisible,
      currentRoute: router.currentRoute.value
    }),

    togglePane: () => {
      const taskPane = window._ribbonState?.taskPane
      if (taskPane) {
        taskPane.Visible = !taskPane.Visible
        return `TaskPane visibility: ${taskPane.Visible}`
      }
      return 'No TaskPane available'
    }
  }

  // 命令行帮助
  console.log(`
开发工具使用说明：

1. 调试信息：
   window._app.getState()     // 获取全局状态
   window._debugTools         // 调试工具集
   window._wpsDebug          // WPS API调试
   window._aiDebug           // AI服务调试
   window._docDebug          // 文档服务调试

2. TaskPane控制：
   window._app.togglePane()   // 切换侧边栏
   window._debugTools.taskPane.getState()  // 获取TaskPane状态

3. 快捷键：
   Ctrl+Shift+D              // 显示当前状态
`)
}

// 挂载应用
app.mount('#app')
