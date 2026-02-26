import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import MainLayout from '../layouts/MainLayout.vue';
import DashboardView from '../views/DashboardView.vue';
import CourseView from '../views/CourseView.vue';
import UserProfileView from '../views/UserProfileView.vue';
import ReportsView from '../views/ReportsView.vue';
import AdminUsersView from '../views/admin/AdminUsersView.vue';
import AdminDataSyncView from '../views/admin/AdminDataSyncView.vue';
import AdminSettingsView from '../views/admin/AdminSettingsView.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: { requiresAuth: true, title: '数据看板' }
      },
      {
        path: 'course',
        name: 'course',
        component: CourseView,
        meta: { requiresAuth: true, title: '课程分析' }
      },
      {
        path: 'user',
        name: 'user',
        component: UserProfileView,
        meta: { requiresAuth: true, title: '学习者画像' }
      },
      {
        path: 'reports',
        name: 'reports',
        component: ReportsView,
        meta: { requiresAuth: true, title: '报告中心' }
      },
      {
        path: 'admin/users',
        name: 'admin-users',
        component: AdminUsersView,
        meta: { requiresAuth: true, requiresAdmin: true, title: '用户管理' }
      },
      {
        path: 'admin/datasync',
        name: 'admin-datasync',
        component: AdminDataSyncView,
        meta: { requiresAuth: true, requiresAdmin: true, title: '数据同步' }
      },
      {
        path: 'admin/settings',
        name: 'admin-settings',
        component: AdminSettingsView,
        meta: { requiresAuth: true, requiresAdmin: true, title: '系统配置' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const userInfoRaw = localStorage.getItem('userInfo');
  const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;
  const isLoggedIn = !!token;

  if (to.path === '/login' && isLoggedIn) {
    next('/dashboard');
    return;
  }

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } });
    return;
  }

  if (to.meta.requiresAdmin && (!userInfo || userInfo.role !== 'admin')) {
    next('/dashboard');
    return;
  }

  next();
});

export default router;

