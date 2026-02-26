<template>
  <div>
    <div class="page-header">
      <div class="page-title">学习者画像</div>
      <div class="page-subtitle">查看单个学习者的学习进度与表现</div>
    </div>

    <!-- 查询区 -->
    <section class="filter-panel">
      <div class="section-title">查询条件</div>
      <div class="filter-row">
        <div class="filter-item">
          <label>user_id</label>
          <input v-model="query.userId" placeholder="输入 user_id" />
        </div>
        <div class="filter-item">
          <label>课程</label>
          <select v-model="query.courseId">
            <option value="">选择课程</option>
            <option v-for="c in mockCourses" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>
        <div class="filter-item" style="align-self: flex-end">
          <button class="btn-primary" @click="loadProfile" :disabled="loading">
            {{ loading ? '查询中...' : '查询画像' }}
          </button>
        </div>
      </div>
      <div v-if="error" style="margin-top: 8px; font-size: 12px; color: #ff4d4f">
        {{ error }}
      </div>
    </section>

    <!-- 画像卡片 -->
    <section v-if="profile" class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">学习总时长（小时）</div>
        <div class="kpi-value">{{ profile.totalStudyHours ?? '-' }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">视频观看次数</div>
        <div class="kpi-value">{{ profile.videoPlayCount ?? '-' }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">测验提交次数</div>
        <div class="kpi-value">{{ profile.quizSubmitCount ?? '-' }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">平均分 / 当前进度</div>
        <div class="kpi-value">
          {{ profile.avgScore ?? '-' }} / {{ profile.progressPercent ?? '-' }}%
        </div>
      </div>
    </section>

    <!-- 图表区（示意） -->
    <section v-if="profile" class="two-column" style="margin-top: 16px">
      <div class="panel">
        <div class="section-title">每日学习时长（时间序列）</div>
        <div class="chart-placeholder">
          展示该学习者每天的学习时长变化趋势，可用折线图实现
        </div>
      </div>
      <div class="panel">
        <div class="section-title">参与度 / 进度 / 效果（雷达/条形）</div>
        <div class="chart-placeholder">
          参与度：{{ profile.engagementScore ?? '-' }}，
          进度：{{ profile.progressScore ?? '-' }}，
          效果：{{ profile.performanceScore ?? '-' }}
        </div>
      </div>
    </section>

    <section v-if="profile" class="table-wrapper" style="margin-top: 16px">
      <div class="table-header">
        <div class="section-title">测验表现（示意）</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>测验名称</th>
            <th>得分</th>
            <th>提交时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in profile.quizRecords || []" :key="q.id">
            <td>{{ q.title }}</td>
            <td>{{ q.score }}</td>
            <td>{{ q.submittedAt }}</td>
          </tr>
          <tr v-if="!(profile.quizRecords || []).length">
            <td colspan="3" style="text-align: center; color: #999">暂无测验记录</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { fetchUserProfile } from '../api';

const query = reactive({
  userId: '',
  courseId: ''
});

const mockCourses = [
  { id: 'course_1', name: '示例课程 A' },
  { id: 'course_2', name: '示例课程 B' }
];

const loading = ref(false);
const error = ref('');
const profile = ref(null);

const loadProfile = async () => {
  error.value = '';
  profile.value = null;
  if (!query.userId) {
    error.value = '请输入 user_id';
    return;
  }
  loading.value = true;
  try {
    const res = await fetchUserProfile({
      user_id: query.userId,
      course_id: query.courseId || undefined
    }).catch((e) => {
      if (e.response?.status === 404) {
        throw new Error('NOT_FOUND');
      }
      throw e;
    });

    if (!res?.data) {
      throw new Error('NOT_FOUND');
    }

    profile.value = res.data;
  } catch (e) {
    if (e.message === 'NOT_FOUND') {
      error.value = '未找到该 user_id 对应的学习记录，请检查后重试。';
    } else {
      error.value = '查询失败，请稍后重试。';
    }
  } finally {
    loading.value = false;
  }
};
</script>

