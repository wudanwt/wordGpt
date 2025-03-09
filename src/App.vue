<template>
  <RouterView v-slot="{ Component }">
    <Suspense>
      <component :is="Component" />
      <template #fallback>
        <div class="loading">
          <div class="loading-spinner"></div>
          <div class="loading-text">加载中...</div>
        </div>
      </template>
    </Suspense>
  </RouterView>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import ribbon from './components/ribbon.js'
import { debug } from './utils/debug'

onMounted(() => {
  // 开发环境下初始化
  if (import.meta.env.DEV) {
    if (!window.ribbon) {
      window.ribbon = ribbon
    }

    debug.log('App mounted:', {
      hasRibbon: !!window.ribbon,
      hasApplication: !!window.Application,
      wpsReady: window.__WPS_READY__,
      url: window.location.href,
      route: window.location.hash
    })
  }
})
</script>

<style>
html {
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: inherit;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--background-color);
  color: var(--text-color);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

#app {
  width: 100%;
  height: 100vh;
}

.loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--background-color);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--background-color-light);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: var(--spacing-md);
  color: var(--text-color-light);
  font-size: var(--font-size-md);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 全局过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 工具类 */
.transition-fast {
  transition: all var(--transition-fast);
}
</style>
