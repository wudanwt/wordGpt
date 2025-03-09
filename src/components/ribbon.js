// 全局状态
const state = {
    isFirstLoad: true,
    initialized: false,
    taskPane: null,
    ribbonUI: null
}

// 平台检测
const platform = {
    isWindows: /windows/i.test(navigator.platform),
    isMacOS: /mac/i.test(navigator.platform),
    isDev: import.meta.env.DEV,
    get isLocal() {
        return window.location.protocol === 'file:'
    }
}

// 获取基础URL
function GetUrlPath() {
    try {
        if (platform.isDev) {
            // 开发环境使用localhost
            const url = new URL(window.location.href)
            return url.origin
        } else if (platform.isLocal) {
            // Windows本地文件
            const fullPath = decodeURI(window.location.href)
            return fullPath.substring(0, fullPath.lastIndexOf('/') + 1)
        } else {
            // Web环境或macOS
            const url = new URL(window.location.href)
            return url.origin + url.pathname.replace(/index\.html$/, '')
        }
    } catch (e) {
        console.warn('URL解析失败，使用降级处理:', e)
        return window.location.href.split('index.html')[0]
    }
}

// 获取AI助手URL
function getAIAssistantUrl() {
    const baseUrl = GetUrlPath()
    return baseUrl + (platform.isLocal ? 'index.html' : '') + '#/ai-assistant'
}

// WPS环境检查
function checkWPSEnvironment() {
    const isDev = import.meta.env.DEV
    const isReady = window.__WPS_READY__
    
    if (isDev) {
        console.log('开发环境检查:', {
            isReady,
            hasApplication: !!window.Application,
            hasDocument: !!window.Application?.ActiveDocument,
            platform: {
                isWindows: platform.isWindows,
                isMacOS: platform.isMacOS,
                isLocal: platform.isLocal
            }
        })
    }
    
    return isReady
}

// 创建并初始化任务窗格
function createTaskPane(url) {
    try {
        // 确保应用程序就绪
        if (!window.Application) {
            throw new Error('WPS Application not available')
        }

        // 激活当前文档窗口
        if (window.Application.ActiveDocument) {
            window.Application.ActiveDocument.Activate()
        }

        // 创建任务窗格并进行初始化设置
        const taskPane = window.Application.CreateTaskPane(url)
        if (!taskPane) {
            throw new Error('Failed to create TaskPane')
        }

        // 设置任务窗格属性
        taskPane.Visible = false
        taskPane.DockPosition = 2  // 使用JSKsoEnum_msoCTPDockPositionRight (2)
        taskPane.Width = 480  // 增加默认宽度，确保内容显示完整

        // 平台特定处理
        if (platform.isWindows && platform.isLocal) {
            // Windows本地环境下的特殊处理
            taskPane.DockPosition = 2
            taskPane.Width = 480
        }

        // 开发环境下打印状态
        if (import.meta.env.DEV) {
            console.log('TaskPane created:', {
                url: url,
                position: taskPane.DockPosition,
                width: taskPane.Width,
                visible: taskPane.Visible,
                platform: {
                    isWindows: platform.isWindows,
                    isMacOS: platform.isMacOS,
                    isLocal: platform.isLocal
                }
            })
        }

        return taskPane
    } catch (error) {
        console.error('创建任务窗格失败:', error)
        throw error
    }
}

// 重试机制
async function retry(fn, times = 3, delay = 1000) {
    for (let i = 0; i < times; i++) {
        try {
            return await fn()
        } catch (e) {
            if (i === times - 1) throw e
            console.warn(`重试第${i + 1}次:`, e)
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }
}

// 初始化任务窗格
async function initializeTaskPane() {
    if (!state.taskPane) {
        try {
            const url = getAIAssistantUrl()
            
            // 使用重试机制创建任务窗格
            state.taskPane = await retry(() => createTaskPane(url))
            window._aiPaneVisible = false

            if (import.meta.env.DEV) {
                console.log('TaskPane initialized:', {
                    url: url,
                    visible: false,
                    position: state.taskPane.DockPosition,
                    width: state.taskPane.Width,
                    platform: {
                        isWindows: platform.isWindows,
                        isMacOS: platform.isMacOS,
                        isLocal: platform.isLocal
                    }
                })
            }
        } catch (error) {
            console.error('初始化任务窗格失败:', error)
            state.taskPane = null
        }
    }
}

// WPS加载项入口函数
async function OnAddinLoad(ribbonUI) {
    console.log('正在加载插件...')
    
    try {
        // 保存ribbonUI引用
        state.ribbonUI = ribbonUI

        // 确保WPS环境就绪，使用重试机制
        await retry(async () => {
            if (!checkWPSEnvironment()) {
                throw new Error('WPS环境未就绪')
            }
        })

        // 确保初始化状态
        window._aiPaneVisible = false
        
        // 确保调用全局初始化
        if (typeof window.initState === 'function') {
            window.initState()
        }

        // 初始化任务窗格（但不显示）
        await initializeTaskPane()

        // 标记初始化完成
        state.initialized = true
        console.log('插件初始化完成')
        
        // 开发环境下打印状态
        if (import.meta.env.DEV) {
            console.log('AI助手URL:', getAIAssistantUrl())
            console.log('TaskPane Position Enums:', {
                top: window.JSKsoEnum_msoCTPDockPositionTop,
                bottom: window.JSKsoEnum_msoCTPDockPositionBottom,
                right: window.JSKsoEnum_msoCTPDockPositionRight,
                left: window.JSKsoEnum_msoCTPDockPositionLeft
            })
            console.log('TaskPane Width:', state.taskPane?.Width)
            console.log('Platform:', {
                isWindows: platform.isWindows,
                isMacOS: platform.isMacOS,
                isLocal: platform.isLocal,
                isDev: platform.isDev
            })
        }

        return true
    } catch (error) {
        console.error('插件初始化失败:', error)
        state.initialized = false
        return true // 即使失败也返回true，避免WPS报错
    }
}

// 显示任务窗格
function showTaskPane() {
    if (!state.taskPane) {
        initializeTaskPane()
    }

    if (state.taskPane) {
        // 确保位置和宽度正确
        if (state.taskPane.DockPosition !== 2) {
            state.taskPane.DockPosition = 2
        }
        if (state.taskPane.Width < 480) {
            state.taskPane.Width = 480
        }
        state.taskPane.Visible = true
        window._aiPaneVisible = true

        if (import.meta.env.DEV) {
            console.log('TaskPane shown:', {
                position: state.taskPane.DockPosition,
                visible: state.taskPane.Visible,
                width: state.taskPane.Width
            })
        }
    }
}

// 隐藏任务窗格
function hideTaskPane() {
    if (state.taskPane) {
        state.taskPane.Visible = false
        window._aiPaneVisible = false

        if (import.meta.env.DEV) {
            console.log('TaskPane hidden')
        }
    }
}

// 功能区按钮事件处理
function OnAction(control) {
    console.log('收到按钮事件:', control.Id)
    
    try {
        if (control.Id === 'btnAIAssistant') {
            if (!state.taskPane || !state.taskPane.Visible) {
                showTaskPane()
            } else {
                hideTaskPane()
            }

            // 刷新按钮状态
            if (state.ribbonUI) {
                state.ribbonUI.InvalidateControl('btnAIAssistant')
            }

            // 开发环境下打印状态
            if (import.meta.env.DEV) {
                console.log('TaskPane status:', {
                    exists: !!state.taskPane,
                    visible: state.taskPane?.Visible,
                    position: state.taskPane?.DockPosition,
                    width: state.taskPane?.Width,
                    platform: {
                        isWindows: platform.isWindows,
                        isMacOS: platform.isMacOS,
                        isLocal: platform.isLocal
                    }
                })
            }
        }
        return true
    } catch (error) {
        console.error('按钮事件处理出错:', error)
        state.taskPane = null
        window._aiPaneVisible = false
        if (window.Application?.Alert) {
            window.Application.Alert('操作失败：' + error.message)
        }
        return true
    }
}

// 按钮图标
function GetImage(control) {
    if (control.Id === 'btnAIAssistant') {
        return 'images/ai-assistant.svg'
    }
    return 'images/newFromTemp.svg'
}

// 按钮状态
function OnGetEnabled(control) {
    // 只在WPS环境就绪时启用按钮
    if (control.Id === 'btnAIAssistant') {
        return checkWPSEnvironment()
    }
    return true
}

// 按钮可见性
function OnGetVisible(control) {
    return true
}

// 按钮标签
function OnGetLabel(control) {
    if (control.Id === 'btnAIAssistant') {
        return window._aiPaneVisible ? '关闭AI助手' : '打开AI助手'
    }
    return ''
}

// 导出getAIAssistantUrl函数供其他组件使用
export const helpers = {
    getAIAssistantUrl
}

// 先创建ribbon对象
const ribbon = {
    OnAddinLoad,
    OnAction,
    GetImage,
    OnGetEnabled,
    OnGetVisible,
    OnGetLabel
}

// 注册到全局
window.ribbon = ribbon

// 开发环境下导出，方便调试
if (import.meta.env.DEV) {
    window._ribbonState = state
    window._ribbonDebug = {
        createTaskPane: (url = getAIAssistantUrl()) => createTaskPane(url),
        getState: () => ({
            taskPane: state.taskPane ? {
                visible: state.taskPane.Visible,
                position: state.taskPane.DockPosition,
                width: state.taskPane.Width
            } : null,
            initialized: state.initialized,
            aiPaneVisible: window._aiPaneVisible,
            platform: {
                isWindows: platform.isWindows,
                isMacOS: platform.isMacOS,
                isLocal: platform.isLocal,
                isDev: platform.isDev
            }
        }),
        testUrl: () => ({
            baseUrl: GetUrlPath(),
            fullUrl: getAIAssistantUrl()
        }),
        resetTaskPane: () => {
            hideTaskPane()
            state.taskPane = null
            initializeTaskPane()
            return 'TaskPane reset complete'
        },
        validatePosition: () => {
            if (state.taskPane) {
                const isWidthOk = state.taskPane.Width >= 480
                if (!isWidthOk) {
                    state.taskPane.Width = 480
                }
                return {
                    currentPosition: state.taskPane.DockPosition,
                    currentWidth: state.taskPane.Width,
                    isCorrect: state.taskPane.DockPosition === 2 && isWidthOk,
                    expectedPosition: 2,
                    expectedWidth: 480,
                    platform: {
                        isWindows: platform.isWindows,
                        isMacOS: platform.isMacOS,
                        isLocal: platform.isLocal
                    }
                }
            }
            return 'No TaskPane exists'
        },
        show: showTaskPane,
        hide: hideTaskPane,
        adjustWidth: () => {
            if (state.taskPane && state.taskPane.Width < 480) {
                state.taskPane.Width = 480
                return `Width adjusted to ${state.taskPane.Width}`
            }
            return `Current width is ${state.taskPane?.Width || 'N/A'}`
        }
    }
}

// 兼容ESM导出
export default ribbon
