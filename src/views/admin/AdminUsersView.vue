<template>
  <div>
    <div class="page-header">
      <div class="page-title">用户管理</div>
      <div class="page-subtitle">仅管理员可见：新建账号、重置密码、角色分配</div>
    </div>

    <section class="filter-panel">
      <div class="section-title">新建账号（示意）</div>
      <div class="filter-row">
        <div class="filter-item">
          <label>用户名</label>
          <input v-model="form.username" />
        </div>
        <div class="filter-item">
          <label>初始密码</label>
          <input v-model="form.password" type="password" />
        </div>
        <div class="filter-item">
          <label>角色</label>
          <select v-model="form.role">
            <option value="teacher">教师</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div class="filter-item" style="align-self: flex-end">
          <button class="btn-primary">创建账号（占位）</button>
        </div>
      </div>
      <div style="margin-top: 8px; font-size: 12px; color: #999">
        实际项目中可对接 /admin/users 相关 API 完成账号创建和权限管理。
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const form = reactive({
  username: '',
  password: '',
  role: 'teacher'
});
</script>

