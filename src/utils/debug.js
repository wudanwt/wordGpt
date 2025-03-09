class Debug {
  constructor() {
    this.enabled = false
    this.prefix = '[DEBUG]'
  }

  init(module = 'App') {
    this.enabled = import.meta.env.DEV
    this.prefix = `[${module}]`

    if (this.enabled) {
      console.log(`${this.prefix} Debug mode enabled`)
      this._setupDevTools()
    }
  }

  log(...args) {
    if (this.enabled) {
      console.log(this.prefix, ...args)
    }
  }

  error(...args) {
    if (this.enabled) {
      console.error(this.prefix, ...args)
    }
  }

  warn(...args) {
    if (this.enabled) {
      console.warn(this.prefix, ...args)
    }
  }

  event(name, data) {
    if (this.enabled) {
      console.log(`${this.prefix} Event:`, name, data)
    }
  }

  _setupDevTools() {
    if (!window._debugTools) {
      window._debugTools = {
        // URL相关
        url: {
          getCurrent: () => window.location.href,
          getBase: () => {
            const url = new URL(window.location.href)
            return url.origin + url.pathname.replace(/index\.html$/, '')
          },
          getTaskPaneUrl: () => {
            if (!window.ribbon?.helpers?.getAIAssistantUrl) {
              return 'getAIAssistantUrl not available'
            }
            return window.ribbon.helpers.getAIAssistantUrl()
          },
          testUrls: () => ({
            current: window.location.href,
            origin: window.location.origin,
            pathname: window.location.pathname,
            baseUrl: this.url.getBase(),
            taskPaneUrl: this.url.getTaskPaneUrl()
          })
        },

        // TaskPane相关
        taskPane: {
          getUrl: () => {
            const taskPane = window._ribbonState?.taskPane
            return taskPane ? `Current TaskPane URL: ${taskPane.URL}` : 'No TaskPane'
          },
          getState: () => {
            const taskPane = window._ribbonState?.taskPane
            if (!taskPane) return 'No TaskPane'
            return {
              visible: taskPane.Visible,
              dockPosition: taskPane.DockPosition,
              width: taskPane.Width,
              height: taskPane.Height,
              url: taskPane.URL
            }
          },
          create: (url) => {
            if (!window.Application?.CreateTaskPane) {
              return 'CreateTaskPane not available'
            }
            try {
              const taskPane = window.Application.CreateTaskPane(url)
              taskPane.Visible = true
              return 'TaskPane created: ' + url
            } catch (e) {
              return 'Error creating TaskPane: ' + e.message
            }
          }
        },

        // 路由相关
        router: {
          getCurrentRoute: () => window.location.hash.slice(1),
          testRoute: (route) => {
            const baseUrl = this.url.getBase()
            return {
              full: baseUrl + '#' + route,
              base: baseUrl,
              route: route
            }
          }
        },

        // 全局状态
        state: {
          getAll: () => ({
            wpsReady: window.__WPS_READY__,
            hasRibbon: !!window.ribbon,
            hasApplication: !!window.Application,
            hasDocument: !!window.Application?.ActiveDocument,
            currentUrl: window.location.href,
            aiPaneVisible: window._aiPaneVisible,
            routeHash: window.location.hash,
            taskPaneState: this.taskPane.getState()
          }),
          clear: () => {
            window._ribbonState.taskPane = null
            window._aiPaneVisible = false
            return 'State cleared'
          }
        },

        // 测试功能
        test: {
          createTaskPane: () => {
            const url = this.url.getTaskPaneUrl()
            return this.taskPane.create(url)
          },
          validateUrl: (url) => {
            try {
              new URL(url)
              return true
            } catch {
              return false
            }
          }
        },

        // 帮助信息
        help: () => {
          console.group('Debug Tools Help')
          console.log('URL Tools:', Object.keys(this.url))
          console.log('TaskPane Tools:', Object.keys(this.taskPane))
          console.log('Router Tools:', Object.keys(this.router))
          console.log('State Tools:', Object.keys(this.state))
          console.log('Test Tools:', Object.keys(this.test))
          console.groupEnd()
        }
      }

      // 添加快捷键
      document.addEventListener('keydown', e => {
        // Ctrl+Shift+D: 显示当前状态
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
          console.group('Current Debug State')
          console.log('State:', window._debugTools.state.getAll())
          console.log('URLs:', window._debugTools.url.testUrls())
          console.groupEnd()
        }
      })

      this.log('Debug tools initialized, use window._debugTools to access')
      this.log('Press Ctrl+Shift+D to show current state')
    }
  }
}

// 导出单例
export const debug = new Debug()
