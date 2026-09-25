import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuth } from '../composables/useAuth'

// Pages
import LoginPage from '../components/LoginPage.vue'
import DashboardView from '../views/DashboardView.vue'
import TransactionsView from '../views/TransactionsView.vue'
import AnalyticsView from '../views/AnalyticsView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'home',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: TransactionsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: AnalyticsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'categories',
    component: CategoriesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard
router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth()
  const requiresAuth = to.meta.requiresAuth as boolean

  // Debug: log current auth state
  console.log('Route guard check:', { to: to.path, isAuth: isAuthenticated.value, requires: requiresAuth })

  if (requiresAuth && !isAuthenticated.value) {
    // Protected route tapi not authenticated → redirect to login
    console.log('Redirecting to login (not authenticated)')
    next('/')
  } else if ((to.path === '/' || to.path === '') && isAuthenticated.value) {
    // On login page tapi authenticated → redirect to home
    console.log('Redirecting to home (already authenticated)')
    next('/home')
  } else {
    next()
  }
})

export default router
