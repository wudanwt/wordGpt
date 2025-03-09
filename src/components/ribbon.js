import Util from './js/util.js'

// 全局状态
const state = {
    ribbonUI: null
}

// WPS环境检查
function checkWPSEnvironment() {
    const isReady = window.__WPS_READY__
    return isReady
}

// WPS加载项入口函数
function OnAddinLoad(ribbonUI) {
    console.log('正在加载插件...')
    state.ribbonUI = ribbonUI
    window._aiPaneVisible = false
    return true
}

// 功能区按钮事件处理
function OnAction(control) {
    try {
        if (control.Id === 'btnAIAssistant') {
            const tsId = window.Application.PluginStorage.getItem('taskpane_id')
            if (!tsId) {
                const url = Util.GetUrlPath() + Util.GetRouterHash() + '/ai-assistant'
                const taskPane = window.Application.CreateTaskPane(url)
                taskPane.DockPosition = 2  // 右侧停靠
                taskPane.Width = 480
                window.Application.PluginStorage.setItem('taskpane_id', taskPane.ID)
                taskPane.Visible = true
                window._aiPaneVisible = true
            } else {
                const taskPane = window.Application.GetTaskPane(tsId)
                taskPane.Visible = !taskPane.Visible
                window._aiPaneVisible = taskPane.Visible
            }

            // 刷新按钮状态
            if (state.ribbonUI) {
                state.ribbonUI.InvalidateControl('btnAIAssistant')
            }
        }
        return true
    } catch (error) {
        console.error('按钮事件处理出错:', error)
        window._aiPaneVisible = false
        if (window.Application?.Alert) {
            window.Application.Alert('操作失败：' + error.message)
        }
        return true
    }
}

// 按钮标签
function OnGetLabel(control) {
    if (control.Id === 'btnAIAssistant') {
        return window._aiPaneVisible ? '关闭AI助手' : '打开AI助手'
    }
    return ''
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
    if (control.Id === 'btnAIAssistant') {
        return checkWPSEnvironment()
    }
    return true
}

// 按钮可见性
function OnGetVisible(control) {
    return true
}

// 创建ribbon对象
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

// 兼容ESM导出
export default ribbon
