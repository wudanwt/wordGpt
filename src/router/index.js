import { createRouter, createWebHashHistory } from 'vue-router'
import Root from '../components/Root.vue'
import AIChatPane from '../components/AIChatPane.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'root',
      component: Root
    },
    {
      path: '/ai-assistant',
      name: 'ai-assistant',
      component: AIChatPane
    }
  ]
})

export default router
