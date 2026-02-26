<template>
  <div class="login-page">
    <div class="login-left">
      <div class="login-left-title">MOOC 学习数据分析平台</div>
      <div class="login-left-desc">
        聚焦学习行为数据，一站式查看课程运行情况、难点视频与学习者画像，辅助教学决策与教学质量提升。
      </div>
      <div class="chips" style="margin-top: 24px">
        <span class="chip">课程数据看板</span>
        <span class="chip">难点内容诊断</span>
        <span class="chip">学习者画像</span>
        <span class="chip">报告留存</span>
      </div>
    </div>
    <div class="login-right">
      <div class="login-card">
        <div class="login-card-title">登录</div>
        <div class="login-card-subtitle">使用教学管理账号登录系统</div>
        <form @submit.prevent="handleSubmit">
          <div class="form-item">
            <label for="username">用户名</label>
            <input
              id="username"
              v-model="form.username"
              autocomplete="username"
              placeholder="请输入用户名"
            />
          </div>
          <div class="form-item">
            <label for="password">密码</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              placeholder="请输入密码"
            />
          </div>
          <div class="form-item">
            <label for="role">角色</label>
            <select id="role" v-model="form.role">
              <option value="teacher">教师</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="form-actions">
            <button class="btn-primary" type="submit" :disabled="loading">
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </div>
          <div v-if="error" class="login-error">{{ error }}</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { login } from '../api';

const router = useRouter();
const route = useRoute();

const form = reactive({
  username: '',
  password: '',
  role: 'teacher'
});

const loading = ref(false);
const error = ref('');

const DEMO_USERNAME = 'demo';
const DEMO_PASSWORD = 'demo123';

const handleSubmit = async () => {
  error.value = '';
  if (!form.username || !form.password) {
    error.value = '请输入用户名和密码';
    return;
  }

  if (form.username === DEMO_USERNAME && form.password === DEMO_PASSWORD) {
    const demoUser = {
      username: form.username,
      role: form.role
    };
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('userInfo', JSON.stringify(demoUser));
    const redirect = route.query.redirect || '/dashboard';
    router.replace(redirect);
    return;
  }

  error.value = '璇峰厛浣跨敤 demo / demo123 鐧诲綍';
  return;

  loading.value = true;
  try {
    const res = await login({
      username: form.username,
      password: form.password
    });

    const { token, user } = res.data || {};
    if (!token) {
      throw new Error('登录失败，未返回 token');
    }

    const finalUser = user || {
      username: form.username,
      role: form.role
    };

    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(finalUser));

    const redirect = route.query.redirect || '/dashboard';
    router.replace(redirect);
  } catch (e) {
    console.error(e);
    error.value = '账号或密码错误，请重试';
  } finally {
    loading.value = false;
  }
};
</script>

