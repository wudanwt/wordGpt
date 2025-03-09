# WPS AI助手

WPS文字处理智能助手插件，基于OpenAI/Azure API实现智能写作、文本分析等功能。

## 功能特点

- 智能对话：使用AI模型辅助写作
- 上下文感知：基于选中文本提供建议
- 实时响应：流式响应，即时显示AI回复
- 灵活配置：支持多种API设置选项

## 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 构建部署

### 构建插件

```bash
# 安装依赖
npm install

# 构建插件包
npm run build:plugin
```

构建完成后会在项目根目录生成 `word-gpt.wpsplugin` 文件。

### 安装插件

1. 打开WPS文字
2. 点击【开发工具】-【WPS加载项】
3. 点击【添加加载项】
4. 选择生成的 `word-gpt.wpsplugin` 文件
5. 重启WPS文字

## 配置说明

### API设置
首次使用需要配置API相关信息：

1. 点击插件窗口右上角的设置按钮
2. 选择API类型（OpenAI/Azure/自定义）
3. 填写API密钥和其他必要信息
4. 点击保存完成配置

### 环境变量
开发环境可以通过 `.env.development` 文件配置：

```
VITE_PORT=3889                      # 开发服务器端口
VITE_API_ENDPOINT=your-api-endpoint # API端点（可选）
```

## 目录结构

```
├── public/          # 静态资源
│   ├── images/      # 图标等图片资源
│   ├── manifest.xml # 插件清单文件
│   └── ribbon.xml   # 功能区配置
├── scripts/         # 构建脚本
├── src/             # 源代码
│   ├── components/  # Vue组件
│   ├── services/    # 业务服务
│   └── utils/       # 工具函数
└── package.json     # 项目配置
```

## 调试方法

1. 开发者工具
```javascript
// 检查状态
window._ribbonDebug.getState()

// 测试API配置
window._aiDebug.validateConfig()

// 重置任务窗格
window._ribbonDebug.resetTaskPane()
```

2. 控制台日志
开发环境下会输出详细的调试信息。

## 注意事项

1. 插件权限
   - 需要读写文档权限
   - 需要网络访问权限
   - 需要剪贴板访问权限

2. WPS版本要求
   - WPS版本 >= 11.8.2.11378
   - Windows 10 及以上系统

## 常见问题

### 构建相关

1. 如果构建时报错 "terser not found"，运行：
```bash
npm install terser --save-dev
```

2. 如果遇到权限问题：
```bash
# Windows
以管理员身份运行命令提示符

# macOS/Linux
sudo npm run build:plugin
```

3. 清理构建缓存：
```bash
npm run clean
npm install
npm run build:plugin
```

## 开源协议
MIT License
