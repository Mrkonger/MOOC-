<template>
  <div>
    <div class="page-header">
      <div class="page-title">课程分析</div>
      <div class="page-subtitle">定位难点内容与问题视频，辅助教学调整</div>
    </div>

    <!-- 筛选区 -->
    <section class="filter-panel">
      <div class="section-title">筛选条件</div>
      <div class="filter-row">
        <div class="filter-item">
          <label>课程</label>
          <select v-model="filters.courseId">
            <option value="">全部课程</option>
            <option v-for="c in mockCourses" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label>日期</label>
          <input type="date" v-model="filters.date" />
        </div>
        <div class="filter-item">
          <label>章节（可选）</label>
          <select v-model="filters.chapterId">
            <option value="">全部章节</option>
            <option value="chapter_1">第 1 章</option>
            <option value="chapter_2">第 2 章</option>
          </select>
        </div>
        <div class="filter-item">
          <label>视频（可选）</label>
          <input v-model="filters.videoId" placeholder="video_id 或标题关键字" />
        </div>
        <div class="filter-item" style="align-self: flex-end">
          <button class="btn-primary" @click="loadData" :disabled="loading">
            {{ loading ? '加载中...' : '应用筛选' }}
          </button>
        </div>
      </div>
    </section>

    <!-- 核心图表（示意） -->
    <section class="two-column" style="margin-bottom: 16px">
      <div class="panel">
        <div class="section-title">视频热度排行（播放/观看时长）</div>
        <div class="chart-placeholder">
          按播放次数、观看时长 Top N，可替换为 ECharts 柱状图
        </div>
      </div>
      <div class="panel">
        <div class="section-title">行为诊断：暂停 / 拖动 / 倍速</div>
        <div class="chart-placeholder">
          展示 pause / seek / rate_change 统计，可替换为柱状/雷达图
        </div>
      </div>
    </section>

    <!-- 诊断表格 -->
    <section class="table-wrapper">
      <div class="table-header">
        <div class="section-title">视频行为诊断表</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>video_id</th>
            <th>标题</th>
            <th>播放次数</th>
            <th>暂停次数</th>
            <th>拖动次数</th>
            <th>倍速切换</th>
            <th>难度评分</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in videoStats" :key="row.video_id" @click="openDetail(row)">
            <td>{{ row.video_id }}</td>
            <td>{{ row.title || '-' }}</td>
            <td>{{ row.play_cnt }}</td>
            <td>{{ row.pause_cnt }}</td>
            <td>{{ row.seek_cnt }}</td>
            <td>{{ row.speed_change_cnt }}</td>
            <td>
              <span class="tag" :class="{ 'tag-danger': row.difficultyScore >= 80 }">
                {{ row.difficultyScore }}
              </span>
            </td>
          </tr>
          <tr v-if="!videoStats.length">
            <td colspan="7" style="text-align: center; color: #999">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 简单详情弹窗（原生实现） -->
    <div
      v-if="detailVisible"
      style="
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <div
        style="
          width: 480px;
          max-width: 90%;
          background: #fff;
          border-radius: 8px;
          padding: 16px 18px 14px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.35);
        "
      >
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
          <div class="section-title">视频详情</div>
          <button class="btn-primary" style="background: #999" @click="detailVisible = false">
            关闭
          </button>
        </div>
        <p style="font-size: 13px; margin: 4px 0">
          <strong>video_id：</strong>{{ currentVideo?.video_id }}
        </p>
        <p style="font-size: 13px; margin: 4px 0">
          <strong>标题：</strong>{{ currentVideo?.title || '-' }}
        </p>
        <p style="font-size: 13px; margin: 4px 0">
          <strong>播放 / 暂停 / 拖动：</strong>
          {{ currentVideo?.play_cnt }} / {{ currentVideo?.pause_cnt }} / {{ currentVideo?.seek_cnt }}
        </p>
        <p style="font-size: 13px; margin: 4px 0">
          <strong>难度评分：</strong>{{ currentVideo?.difficultyScore }}
        </p>
        <p style="font-size: 12px; color: #666; margin-top: 10px">
          难度评分示例计算方式：pause_cnt × 2 + seek_cnt × 1；后续可以根据专业需求调整权重。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { fetchVideoRank } from '../api';

const route = useRoute();

const filters = reactive({
  courseId: localStorage.getItem('currentCourseId') || '',
  date: '',
  chapterId: '',
  videoId: route.query.video_id || ''
});

const mockCourses = [
  { id: 'course_1', name: '示例课程 A' },
  { id: 'course_2', name: '示例课程 B' }
];

const loading = ref(false);
const videoStats = ref([]);

const detailVisible = ref(false);
const currentVideo = ref(null);

const calcDifficulty = (row) => {
  const pause = row.pause_cnt || 0;
  const seek = row.seek_cnt || 0;
  const raw = pause * 2 + seek * 1;
  return Math.min(100, Math.round(raw));
};

const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      course_id: filters.courseId || undefined,
      date: filters.date || undefined,
      chapter_id: filters.chapterId || undefined,
      video_id: filters.videoId || undefined
    };
    const res = await fetchVideoRank(params).catch(() => null);
    if (res?.data) {
      const list = (res.data.list || []).map((row) => ({
        ...row,
        difficultyScore: calcDifficulty(row)
      }));
      videoStats.value = list;
    }
  } finally {
    loading.value = false;
  }
};

const openDetail = (row) => {
  currentVideo.value = row;
  detailVisible.value = true;
};

onMounted(() => {
  loadData();
});
</script>

