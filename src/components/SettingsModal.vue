<template>
  <div class="modal" v-if="modelValue">
    <div class="modal-backdrop" @click="close"></div>
    <div class="modal-content">
      <header class="modal-header">
        <h3>设置</h3>
        <button class="close-button" @click="close">×</button>
      </header>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- API类型选择 -->
          <div class="form-group">
            <label>API类型</label>
            <select v-model="form.apiType">
              <option value="openai">OpenAI</option>
              <option value="azure">Azure</option>
              <option value="custom">自定义</option>
            </select>
          </div>

          <!-- API密钥 -->
          <div class="form-group">
            <label>API密钥</label>
            <input
              type="password"
              v-model="form.apiKey"
              placeholder="请输入API密钥"
              required
            />
          </div>

          <!-- 端点URL -->
          <div class="form-group">
            <label>API端点</label>
            <input
              type="url"
              v-model="form.apiEndpoint"
              :placeholder="getEndpointPlaceholder"
              :required="form.apiType === 'custom'"
            />
          </div>

          <!-- 模型选择 -->
          <div class="form-group">
            <label>模型</label>
            <select v-model="form.model">
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="custom">自定义</option>
            </select>
            <input
              v-if="form.model === 'custom'"
              type="text"
              v-model="form.customModel"
              placeholder="输入模型名称"
              class="mt-2"
            />
          </div>

          <!-- 温度参数 -->
          <div class="form-group">
            <label>Temperature (0-2)</label>
            <div class="range-group">
              <input
                type="range"
                v-model.number="form.temperature"
                min="0"
                max="2"
                step="0.1"
              />
              <span class="range-value">{{ form.temperature }}</span>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="secondary" @click="close">取消</button>
            <button type="submit" class="primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  settings: {
    type: Object,
    default: () => ({
      apiType: 'openai',
      apiKey: '',
      apiEndpoint: '',
      model: 'gpt-3.5-turbo',
      customModel: '',
      temperature: 0.7
    })
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const form = ref({ ...props.settings })

// 监听设置变化
watch(() => props.settings, (newSettings) => {
  form.value = { ...newSettings }
}, { deep: true })

// API端点占位符
const getEndpointPlaceholder = computed(() => {
  switch (form.value.apiType) {
    case 'openai':
      return 'https://api.openai.com/v1'
    case 'azure':
      return 'https://{resource}.openai.azure.com'
    default:
      return '请输入完整的API端点URL'
  }
})

// 关闭模态框
const close = () => {
  emit('update:modelValue', false)
}

// 提交表单
const handleSubmit = () => {
  const settings = {
    ...form.value,
    // 如果选择了自定义模型，使用customModel的值
    model: form.value.model === 'custom' ? form.value.customModel : form.value.model
  }
  emit('save', settings)
  close()
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  background-color: var(--background-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 1;
}

.modal-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-color);
}

.close-button {
  border: none;
  background: transparent;
  font-size: 24px;
  color: var(--text-color-light);
  cursor: pointer;
  padding: var(--spacing-xs);
  line-height: 1;
}

.modal-body {
  padding: var(--spacing-md);
  overflow-y: auto;
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
  font-weight: 500;
}

input[type="text"],
input[type="password"],
input[type="url"],
select {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background-color: var(--background-color-light);
  color: var(--text-color);
  font-size: var(--font-size-md);
}

input[type="text"]:focus,
input[type="password"]:focus,
input[type="url"]:focus,
select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.range-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

input[type="range"] {
  flex: 1;
}

.range-value {
  min-width: 3em;
  text-align: center;
  color: var(--text-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

button {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

button.primary {
  background-color: var(--primary-color);
  color: white;
}

button.primary:hover {
  background-color: var(--primary-color-dark);
}

button.secondary {
  background-color: var(--background-color-light);
  color: var(--text-color);
}

button.secondary:hover {
  background-color: var(--border-color);
}

.mt-2 {
  margin-top: var(--spacing-sm);
}
</style>
