import { createRouter, createWebHistory } from 'vue-router'
import BrowsePage from '@/pages/BrowsePage.vue'
import CabinetPage from '@/pages/CabinetPage.vue'
import IngredientsPage from '@/pages/IngredientsPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'browse', component: BrowsePage },
    { path: '/cabinet', name: 'cabinet', component: CabinetPage },
    { path: '/ingredients', name: 'ingredients', component: IngredientsPage },
  ],
})

export default router
