# 调试指南

## 环境检查

### Windows环境

1. 检查文件加载：
```javascript
// 打开开发者工具 (F12)
window._ribbonDebug.testUrl()
// 应该显示正确的本地文件路径，例如：
// file:///C:/Users/xxx/AppData/Local/Kingsoft/WPS Office/jsaddons/word-gpt/
```

2. 验证任务窗格状态：
```javascript
window._ribbonDebug.getState()
// 检查 platform.isWindows 和 platform.isLocal 是否为 true
```

3. 重置任务窗格：
```javascript
window._ribbonDebug.resetTaskPane()
// 如果任务窗格不可见，尝试：
window._ribbonDebug.show()
```

### macOS环境

1. 检查文件加载：
```javascript
window._ribbonDebug.testUrl()
// 应该显示正确的应用路径，例如：
// file:///Applications/WPS Office.app/Contents/Resources/jsaddons/word-gpt/
```

2. 验证任务窗格状态：
```javascript
window._ribbonDebug.getState()
// 检查 platform.isMacOS 是否为 true
```

### 常见问题

1. Windows下任务窗格不显示
- 检查文件路径是否正确
- 验证manifest.xml中的os配置
- 确认index.html能正确加载
```javascript
// 检查URL和加载状态
window._ribbonDebug.testUrl()
window._ribbonDebug.getState()
```

2. macOS下任务窗格显示为空白
- 检查资源文件权限
- 验证assets路径是否正确
- 确认index.html中的base标签

3. 任务窗格位置不正确
```javascript
// 验证位置并修复
window._ribbonDebug.validatePosition()
window._ribbonDebug.adjustWidth()
```

4. 初始化失败
```javascript
// 查看详细错误信息
window._ribbonState.initialized
// 重新初始化
window._ribbonDebug.resetTaskPane()
```

## 日志输出

### 开发环境
开发环境下会自动打印详细日志，包括：
- 平台信息
- URL解析结果
- 任务窗格状态
- 错误信息

### 生产环境
生产环境可以通过以下方式开启调试：
```javascript
// 开启调试模式
localStorage.setItem('debug', 'true')
// 或在console中执行
window.__DEBUG__ = true
```

## 错误码速查

### 任务窗格相关
- `E001`: 创建任务窗格失败
- `E002`: 设置位置失败
- `E003`: URL解析错误
- `E004`: 资源加载失败

### WPS环境相关
- `E101`: WPS未就绪
- `E102`: ActiveDocument不可用
- `E103`: 权限不足

## 平台特定问题

### Windows特定
1. 路径问题
```javascript
// 检查本地文件路径解析
window._ribbonDebug.testUrl()
```

2. 加载项位置
```powershell
# 检查加载项安装位置
%appdata%\kingsoft\wps\jsaddons\
```

### macOS特定
1. 权限问题
```bash
# 检查文件权限
ls -l ~/Library/Application\ Support/Kingsoft/wps/jsaddons/
```

2. 缓存清理
```bash
# 清理WPS缓存
rm -rf ~/Library/Caches/com.kingsoft.wpsoffice.*
```

## 性能调试

### 加载性能
```javascript
// 检查初始化时间
window._ribbonDebug.getState().initTime

// 监控资源加载
window.performance.getEntries()
```

### 内存使用
```javascript
// 检查任务窗格内存使用
window.performance.memory
