<template>
  <div class="root-container">
    <div class="content">
      <h1 class="title">WPS AI助手</h1>
      <div class="features">
        <div class="feature">
          <i class="icon-chat"></i>
          <h3>智能对话</h3>
          <p>使用先进的AI模型，为您提供智能写作和内容生成服务</p>
        </div>
        <div class="feature">
          <i class="icon-edit"></i>
          <h3>文本分析</h3>
          <p>基于上下文理解，提供专业的文本分析和修改建议</p>
        </div>
        <div class="feature">
          <i class="icon-context"></i>
          <h3>上下文感知</h3>
          <p>自动识别文档内容，提供相关的建议和帮助</p>
        </div>
      </div>
      <div class="instructions">
        <p>点击功能区的<span class="text-primary">"AI助手"</span>按钮开始使用</p>
        <button @click="startUse" class="start-button transition-fast">开始使用</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { wpsApi } from '../utils/wpsApi'
import { debug } from '../utils/debug'

const startUse = async () => {
  try {
    debug.log('Starting AI Assistant...')

    // 使用调试工具显示任务窗格
    if (window._ribbonDebug) {
      window._ribbonDebug.show()
      debug.log('TaskPane shown via debug tools')
    } else {
      // 备用方案：如果调试工具不可用
      const taskPane = window._ribbonState?.taskPane
      if (taskPane) {
        if (taskPane.DockPosition !== 2) {
          taskPane.DockPosition = 2
        }
        taskPane.Visible = true
        window._aiPaneVisible = true
        debug.log('TaskPane shown via direct access')
      } else {
        throw new Error('任务窗格未初始化')
      }
    }

  } catch (error) {
    debug.error('启动AI助手失败:', error)
    wpsApi.showAlert('启动AI助手失败: ' + error.message)
  }
}
</script>

<style scoped>
.root-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--background-color-light);
  padding: var(--spacing-xl);
}

.content {
  max-width: 800px;
  text-align: center;
  background-color: var(--background-color);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
}

.title {
  color: var(--primary-color);
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-xl);
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  margin: var(--spacing-xl) 0;
}

.feature {
  padding: var(--spacing-md);
  background-color: var(--background-color-light);
  border-radius: var(--border-radius-md);
  transition: transform var(--transition-normal);
}

.feature:hover {
  transform: translateY(-5px);
}

.feature i {
  font-size: 32px;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.feature h3 {
  color: var(--text-color);
  font-size: var(--font-size-md);
  margin: var(--spacing-sm) 0;
}

.feature p {
  color: var(--text-color-light);
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.instructions {
  margin-top: var(--spacing-xl);
}

.instructions p {
  color: var(--text-color);
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-md);
}

.start-button {
  padding: var(--spacing-sm) var(--spacing-xl);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  cursor: pointer;
}

.start-button:hover {
  background-color: var(--primary-color-dark);
}

@media (max-width: 768px) {
  .features {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .content {
    padding: var(--spacing-lg);
  }
}
</style>
