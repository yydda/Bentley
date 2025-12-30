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

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

