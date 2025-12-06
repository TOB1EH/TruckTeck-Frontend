import { createRouter, createWebHistory } from 'vue-router';
import MonitoringView from '@/views/MonitoringView.vue';
import CargoLogin from '@/views/CargoLogin.vue';
import AlarmsView from '@/views/AlarmsView.vue';
import ConciliatonView from '@/views/ConciliatonView.vue';
import { isAuthenticated } from '@/services/authService.js';
import CatalogView from '@/views/CatalogView.vue';

const routes = [
  { path: '/', redirect: '/monitoring' },
  { path: '/monitoring', component: MonitoringView, meta: { requiresAuth: true } },
  { path: '/login', component: CargoLogin },
  { path: '/alarms', component: AlarmsView, meta: { requiresAuth: true } },
  { path: '/conciliacion', component: ConciliatonView, meta: { requiresAuth: true } },
  { path: '/catalog', component: CatalogView, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() { return { top: 0 }; },
});


/* router.beforeEach((to, from, next) => {
  const isAuth = isAuthenticated();
  if (to.meta.requiresAuth && !isAuth) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else if (to.path === '/login' && isAuth) {
    next('/');
  } else {
    next();
  }
}); */

export default router;