<template>
  <div class="ai-pane">
    <header class="chat-header">
      <h2>AI助手</h2>
      <div class="header-actions">
        <button @click="startNewChat" class="icon-button transition-fast">
          <i class="icon-new-chat"></i>
          新对话
        </button>
        <button @click="openSettings" class="icon-button transition-fast">
          <i class="icon-settings"></i>
          设置
        </button>
      </div>
    </header>

    <div v-if="!initialized" class="init-state">
      <p>请先设置API配置</p>
      <button @click="openSettings" class="init-button">
        打开设置
      </button>
    </div>

    <template v-else>
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="!messages.length" class="empty-state">
          <p>开始一个新的对话</p>
        </div>
        <ChatMessage
          v-for="(message, index) in messages"
          :key="index"
          :content="message.content"
          :is-user="message.isUser"
          :timestamp="message.timestamp"
          @insert="handleInsert"
          :can-insert="!message.isUser && !loading && !streaming"
          class="animate-fade-in"
        />
        <div v-if="streaming" class="streaming-message">
          <ChatMessage
            :content="streamingContent"
            :is-user="false"
            :timestamp="Date.now()"
            class="animate-fade-in"
            :can-insert="false"
          />
          <button @click="cancelStreaming" class="cancel-button">
            <i class="icon-close"></i>
            取消生成
          </button>
        </div>
      </div>

      <ChatInput
        :has-selected-text="hasSelectedText"
        @send="handleSend"
        @clear-context="clearContext"
        :loading="loading || streaming"
      />
    </template>

    <SettingsModal
      v-model="showSettings"
      :settings="settings"
      @save="handleSettingsSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'
import SettingsModal from './SettingsModal.vue'
import { aiService } from '../services/aiService'
import { documentService } from '../services/documentService'
import { wpsApi } from '../utils/wpsApi'
import { debug } from '../utils/debug'

// 初始化响应式数据
const messages = ref([])
const messagesContainer = ref(null)
const showSettings = ref(false)
const loading = ref(false)
const hasSelectedText = ref(false)
const streaming = ref(false)
const streamingContent = ref('')
const initialized = ref(false)
const settings = ref({
  apiType: 'openai',
  apiKey: '',
  apiEndpoint: '',
  model: 'gpt-3.5-turbo',
  temperature: 0.7
})

// 在消息列表更新后滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 发送消息处理
const handleSend = async (content) => {
  if (!initialized.value) {
    wpsApi.showAlert('请先完成API设置')
    openSettings()
    return
  }

  try {
    loading.value = true
    
    // 添加用户消息
    messages.value.push({
      content,
      isUser: true,
      timestamp: Date.now()
    })
    scrollToBottom()

    // 获取上下文
    let context = ''
    if (hasSelectedText.value) {
      context = documentService.getSelectedText()
      if (!context) {
        debug.warn('无法获取选中文本')
      }
    }

    // 开始流式接收回复
    streaming.value = true
    streamingContent.value = ''
    let fullResponse = ''

    try {
      for await (const chunk of aiService.streamMessage(content, context)) {
        streamingContent.value += chunk
        fullResponse += chunk
        scrollToBottom()
      }

      // 流式接收完成，添加完整消息
      messages.value.push({
        content: fullResponse,
        isUser: false,
        timestamp: Date.now()
      })

    } catch (error) {
      debug.error('流式接收错误:', error)
      throw error
    } finally {
      streaming.value = false
      streamingContent.value = ''
    }

    scrollToBottom()
  } catch (error) {
    debug.error('发送消息失败:', error)
    wpsApi.showAlert('发送消息失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 取消流式生成
const cancelStreaming = () => {
  if (streaming.value) {
    aiService.cancelRequest()
    streaming.value = false
    streamingContent.value = ''
    loading.value = false
  }
}

// 处理插入文本
const handleInsert = async (content) => {
  if (loading.value || streaming.value) return

  try {
    await documentService.insertText(content)
  } catch (error) {
    debug.error('插入文本失败:', error)
    wpsApi.showAlert('插入文本失败: ' + error.message)
  }
}

const startNewChat = () => {
  if (streaming.value) {
    cancelStreaming()
  }
  messages.value = []
  hasSelectedText.value = false
}

const openSettings = () => {
  showSettings.value = true
}

const handleSettingsSave = async (newSettings) => {
  settings.value = newSettings
  // 初始化AI服务
  aiService.initialize(newSettings)
  // 保存设置到本地存储
  localStorage.setItem('ai-settings', JSON.stringify(newSettings))
  // 关闭设置对话框
  showSettings.value = false

  try {
    // 验证设置
    const { valid, error } = await aiService.validateConfig()
    if (valid) {
      initialized.value = true
      debug.log('AI服务配置验证成功')
    } else {
      wpsApi.showAlert('API配置验证失败: ' + error)
      openSettings()
    }
  } catch (e) {
    debug.error('配置验证失败:', e)
    wpsApi.showAlert('API配置验证失败，请检查设置')
    openSettings()
  }
}

const clearContext = () => {
  hasSelectedText.value = false
}

// 检查选中文本状态的定时器
let checkInterval = null

// 组件挂载
onMounted(async () => {
  debug.log('AIChatPane mounted')

  // 加载保存的设置
  const savedSettings = localStorage.getItem('ai-settings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings)
      settings.value = parsed
      aiService.initialize(parsed)
      
      // 验证已保存的设置
      const { valid, error } = await aiService.validateConfig()
      if (valid) {
        initialized.value = true
        debug.log('已加载保存的API设置')
      } else {
        debug.warn('保存的API设置无效:', error)
        openSettings()
      }
    } catch (e) {
      debug.error('加载设置失败:', e)
      openSettings()
    }
  } else {
    debug.log('未找到保存的设置，请完成初始配置')
    // 延迟显示设置窗口，避免闪烁
    setTimeout(() => {
      openSettings()
    }, 500)
  }

  // 定期检查选中文本
  checkInterval = setInterval(() => {
    const hasText = !!documentService.getSelectedText()
    if (hasText !== hasSelectedText.value) {
      hasSelectedText.value = hasText
      debug.log('选中文本状态更新:', hasText)
    }
  }, 1000)
})

// 组件卸载
onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
  if (streaming.value) {
    aiService.cancelRequest()
  }
})
</script>

<style scoped>
.ai-pane {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  min-width: 320px;
  background-color: var(--background-color);
  overflow: hidden;
  position: relative;
}

.chat-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--background-color);
  min-height: 48px;
  flex-shrink: 0;
  z-index: 1;
}

.chat-header h2 {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--text-color);
  white-space: nowrap;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
  border-radius: var(--border-radius-sm);
  background-color: transparent;
  color: var(--text-color-light);
  font-size: var(--font-size-sm);
  cursor: pointer;
  white-space: nowrap;
}

.icon-button:hover {
  background-color: var(--background-color-light);
  color: var(--primary-color);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) * 2);
  background-color: var(--background-color-light);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
}

.init-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-lg);
  color: var(--text-color-light);
  text-align: center;
  padding: var(--spacing-xl);
}

.init-button {
  padding: var(--spacing-sm) var(--spacing-xl);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.init-button:hover {
  background-color: var(--primary-color-dark);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--text-color-light);
  font-size: var(--font-size-sm);
  text-align: center;
  padding: var(--spacing-xl);
}

.streaming-message {
  position: relative;
  width: 100%;
  animation: fadeIn 0.3s ease-in-out;
}

.cancel-button {
  position: absolute;
  right: var(--spacing-md);
  bottom: var(--spacing-md);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
  border-radius: var(--border-radius-sm);
  background-color: var(--background-color);
  color: var(--text-color-light);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  z-index: 2;
}

.cancel-button:hover {
  background-color: var(--background-color-dark);
  color: var(--text-color);
}

.cancel-button i {
  font-size: 14px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@media (max-width: 400px) {
  .chat-header h2 {
    font-size: var(--font-size-sm);
  }

  .icon-button {
    padding: var(--spacing-xs);
  }

  .chat-messages {
    padding: var(--spacing-sm);
  }
}
</style>
