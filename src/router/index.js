import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Overview from '../views/Overview.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/overview',
    name: 'Overview',
    component: Overview
  }
]

// 如果部署到GitHub Pages的子路径，需要设置base路径
// 例如：如果仓库名是 'bentley'，则设置为 '/bentley'
// 如果使用根域名或Firebase Hosting，设置为 '/'
const base = import.meta.env.BASE_URL || '/'

const router = createRouter({
  history: createWebHistory(base),
  routes
})

export default router

