<template>
  <div class="message" :class="{ user: isUser }">
    <div class="message-content">
      <div class="message-header">
        <span class="sender">{{ isUser ? '我' : 'AI助手' }}</span>
        <span class="time">{{ formatTime(timestamp) }}</span>
      </div>
      <div class="text">{{ content }}</div>
      <div v-if="!isUser" class="actions">
        <button 
          class="action-button" 
          @click="$emit('insert', content)"
          :disabled="!canInsert"
          :title="canInsert ? '插入到文档' : '正在处理中...'"
        >
          <span class="icon">＋</span>
          {{ canInsert ? '插入' : '处理中' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  content: {
    type: String,
    required: true
  },
  isUser: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Number,
    required: true
  },
  canInsert: {
    type: Boolean,
    default: true
  }
})

defineEmits(['insert'])

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
</script>

<style scoped>
.message {
  margin: var(--spacing-sm) 0;
  display: flex;
  justify-content: flex-start;
  width: 100%;
  min-width: 0;  /* 允许flex子项缩小 */
}

.message.user {
  justify-content: flex-end;
}

.message-content {
  max-width: 85%;
  min-width: 120px;
  width: fit-content;
  background-color: var(--background-color);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  position: relative;  /* 为actions提供定位上下文 */
}

.message.user .message-content {
  background-color: var(--primary-color-light);
  color: var(--text-color);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-color-light);
  padding-right: var(--spacing-sm);
}

.sender {
  font-weight: 500;
  flex-shrink: 0;  /* 防止文本被压缩 */
}

.time {
  opacity: 0.7;
  margin-left: var(--spacing-sm);
  flex-shrink: 0;  /* 防止文本被压缩 */
}

.text {
  margin: var(--spacing-xs) 0;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
  padding-right: var(--spacing-sm);
}

.actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
  justify-content: flex-end;
  position: relative;
  right: 0;
  padding-right: var(--spacing-xs);
}

.action-button {
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
  transition: all var(--transition-fast);
  white-space: nowrap;  /* 防止按钮文本换行 */
}

.action-button:not(:disabled):hover {
  background-color: var(--background-color-light);
  color: var(--primary-color);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button .icon {
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;  /* 防止图标被压缩 */
}

/* 确保最小宽度在小屏幕上也生效 */
@media (max-width: 400px) {
  .message-content {
    min-width: 100px;
    max-width: 90%;
  }
}
</style>
