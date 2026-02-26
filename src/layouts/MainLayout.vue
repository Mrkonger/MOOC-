<template>
  <div class="app-shell">
    <aside class="side-menu">
      <div class="side-menu-header">导航菜单</div>
      <nav class="side-menu-nav">
        <div
          class="side-menu-item"
          :class="{ active: isActive('/dashboard') }"
          @click="go('/dashboard')"
        >
          数据看板
        </div>
        <div
          class="side-menu-item"
          :class="{ active: isActive('/course') }"
          @click="go('/course')"
        >
          课程分析
        </div>
        <div
          class="side-menu-item"
          :class="{ active: isActive('/user') }"
          @click="go('/user')"
        >
          学习者画像
        </div>
        <div
          class="side-menu-item"
          :class="{ active: isActive('/reports') }"
          @click="go('/reports')"
        >
          报告中心
        </div>
        <div
          v-if="userInfo?.role === 'admin'"
          class="side-menu-item"
          :class="{ active: isAdminActive }"
          @click="go('/admin/users')"
        >
          系统管理
        </div>
      </nav>
    </aside>
    <div class="main-area">
      <header class="top-bar">
        <div class="top-bar-left">
          <div class="top-bar-title">MOOC 学习数据分析平台</div>
          <div class="top-bar-course-select">
            <select v-model="currentCourseId">
              <option disabled value="">选择课程</option>
              <option v-for="c in mockCourses" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="top-bar-right">
          <span>当前用户：{{ userInfo?.username || '未登录' }}</span>
          <span class="tag" v-if="userInfo">角色：{{ userInfo.role }}</span>
          <button class="top-bar-logout-btn" @click="logout">退出登录</button>
        </div>
      </header>
      <main class="page-wrapper">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter, RouterView } from 'vue-router';

const router = useRouter();
const route = useRoute();

const userInfo = ref(null);
const currentCourseId = ref(localStorage.getItem('currentCourseId') || '');

const mockCourses = [
  { id: 'course_1', name: '示例课程 A' },
  { id: 'course_2', name: '示例课程 B' }
];

const loadUser = () => {
  const raw = localStorage.getItem('userInfo');
  userInfo.value = raw ? JSON.parse(raw) : null;
};

loadUser();

watch(currentCourseId, (val) => {
  localStorage.setItem('currentCourseId', val);
});

const isActive = (path) => route.path.startsWith(path);

const isAdminActive = computed(() => route.path.startsWith('/admin'));

const go = (path) => {
  router.push(path);
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  router.replace('/login');
};
</script>

