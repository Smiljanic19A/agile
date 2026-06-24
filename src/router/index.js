import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AdminLogin from '@/views/admin/AdminLogin.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import AdminBanner from '@/views/admin/AdminBanner.vue'
import AdminArticles from '@/views/admin/AdminArticles.vue'
import AdminProducts from '@/views/admin/AdminProducts.vue'
import AdminImports from '@/views/admin/AdminImports.vue'
import { isAuthed } from '@/lib/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/admin/login', name: 'admin-login', component: AdminLogin, meta: { admin: true } },
    { path: '/admin',          name: 'admin',          component: AdminDashboard, meta: { admin: true, requiresAuth: true } },
    { path: '/admin/featured', name: 'admin-featured', component: AdminBanner,    meta: { admin: true, requiresAuth: true } },
    { path: '/admin/articles', name: 'admin-articles', component: AdminArticles,  meta: { admin: true, requiresAuth: true } },
    { path: '/admin/products', name: 'admin-products', component: AdminProducts,  meta: { admin: true, requiresAuth: true } },
    { path: '/admin/imports',  name: 'admin-imports',  component: AdminImports,   meta: { admin: true, requiresAuth: true } },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 80, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthed()) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'admin-login' && isAuthed()) {
    return { name: 'admin' }
  }
  return true
})

export default router
