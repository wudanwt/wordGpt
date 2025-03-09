<template>
  <div class="chat-input">
    <div
      class="input-container"
      :class="{ 'has-context': hasSelectedText }"
    >
      <div class="context-indicator" v-if="hasSelectedText">
        <span class="context-icon">📎</span>
        <span class="context-text">使用选中文本作为上下文</span>
        <button class="clear-context" @click="clearContext">
          <span class="clear-icon">×</span>
        </button>
      </div>

      <div class="input-area">
        <textarea
          ref="textarea"
          v-model="message"
          placeholder="输入您的问题..."
          @keydown.enter.prevent="handleEnter"
          @input="adjustHeight"
          :disabled="loading"
          rows="1"
        ></textarea>

        <button 
          class="send-button"
          @click="sendMessage"
          :disabled="!canSend || loading"
        >
          <template v-if="loading">
            <span class="loading-icon">⟳</span>
          </template>
          <template v-else>
            <span class="send-icon">↑</span>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  hasSelectedText: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send', 'clear-context'])

const message = ref('')
const textarea = ref(null)

const canSend = computed(() => message.value.trim().length > 0)

// 处理Enter键发送消息
const handleEnter = (e) => {
  if (e.shiftKey) return
  e.preventDefault()
  sendMessage()
}

// 发送消息
const sendMessage = async () => {
  if (!canSend.value || props.loading) return

  const content = message.value.trim()
  message.value = ''
  
  // 重置文本框高度
  if (textarea.value) {
    textarea.value.style.height = 'auto'
  }
  
  emit('send', content)
  
  // 等待DOM更新后聚焦
  await nextTick()
  textarea.value?.focus()
}

// 清除上下文
const clearContext = () => {
  emit('clear-context')
}

// 自动调整文本框高度
const adjustHeight = () => {
  const element = textarea.value
  if (!element) return

  element.style.height = 'auto'
  element.style.height = (element.scrollHeight) + 'px'
}

// 初始聚焦
nextTick(() => {
  textarea.value?.focus()
})
</script>

<style scoped>
.chat-input {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background-color: var(--background-color);
}

.input-container {
  background-color: var(--background-color-light);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.input-container.has-context {
  border: 1px solid var(--primary-color-light);
}

.context-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--primary-color-light);
  color: var(--text-color);
  font-size: var(--font-size-sm);
}

.context-icon {
  font-size: 14px;
}

.context-text {
  flex: 1;
}

.clear-context {
  border: none;
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
}

.clear-context:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.clear-icon {
  font-size: 16px;
  line-height: 1;
}

.input-area {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
}

textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  padding: var(--spacing-xs);
  font-size: var(--font-size-md);
  line-height: 1.5;
  max-height: 200px;
  color: var(--text-color);
}

textarea:focus {
  outline: none;
}

textarea:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.send-button {
  border: none;
  background-color: var(--primary-color);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.send-button:hover:not(:disabled) {
  background-color: var(--primary-color-dark);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-icon, .loading-icon {
  font-size: 18px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
