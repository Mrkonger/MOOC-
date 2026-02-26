<template>
  <div>
    <div class="page-header">
      <div class="page-title">课程数据看板</div>
      <div class="page-subtitle">一眼总览课程运行情况与关键指标</div>
    </div>

    <!-- FilterPanel -->
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
          <label>开始日期</label>
          <input type="date" v-model="filters.startDate" />
        </div>
        <div class="filter-item">
          <label>结束日期</label>
          <input type="date" v-model="filters.endDate" />
        </div>
        <div class="filter-item">
          <label>人群（可选）</label>
          <select v-model="filters.group">
            <option value="">全部</option>
            <option value="class_a">班级 A</option>
            <option value="class_b">班级 B</option>
          </select>
        </div>
        <div class="filter-item" style="align-self: flex-end">
          <button class="btn-primary" @click="loadAll" :disabled="loading">
            {{ loading ? '加载中...' : '应用筛选' }}
          </button>
        </div>
      </div>
    </section>

    <!-- KPI Cards -->
    <section class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">DAU（日活人数）</div>
        <div class="kpi-value">{{ kpiSummary.dau ?? '-' }}</div>
        <div class="kpi-extra">较昨日 {{ kpiSummary.dauDelta ?? 0 }}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">总观看时长（小时）</div>
        <div class="kpi-value">{{ kpiSummary.watchHours ?? '-' }}</div>
        <div class="kpi-extra">含所有视频播放与回看</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">测验提交次数</div>
        <div class="kpi-value">{{ kpiSummary.quizSubmits ?? '-' }}</div>
        <div class="kpi-extra">自动题 & 主观题提交总数</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">平均分 / 通过率</div>
        <div class="kpi-value">
          {{ kpiSummary.avgScore ?? '-' }} / {{ kpiSummary.passRate ?? '-' }}%
        </div>
        <div class="kpi-extra">统计期内所有测验</div>
      </div>
    </section>

    <!-- Charts -->
    <section class="chart-grid">
      <div class="panel">
        <div class="section-title">DAU 趋势（折线图）</div>
        <div class="chart-placeholder" @click="mockSelectDay">
          点击某个「点」将联动右侧热门视频 / 成绩分布
        </div>
      </div>
      <div class="panel">
        <div class="section-title">成绩分布（饼图）</div>
        <div class="chart-placeholder">
          0-59 / 60-79 / 80-100 区间占比（示意）
        </div>
      </div>
    </section>

    <section class="chart-grid">
      <div class="panel">
        <div class="section-title">观看次数 / 时长（柱状图）</div>
        <div class="chart-placeholder">按日维度展示播放次数与观看时长（示意）</div>
      </div>
      <div class="panel">
        <div class="section-title">热门视频 TOP10（条形图）</div>
        <div class="chart-placeholder">
          <ul style="list-style: none; padding: 0; margin: 0; width: 100%">
            <li
              v-for="(v, idx) in topVideos"
              :key="v.video_id"
              style="display: flex; justify-content: space-between; margin-bottom: 4px; cursor: pointer"
              @click="goToCourse(v)"
            >
              <span>{{ idx + 1 }}. {{ v.title || v.video_id }}</span>
              <span>{{ v.play_cnt }} 次播放</span>
            </li>
            <li v-if="!topVideos.length" style="color: #999">暂无数据</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- TablePanel -->
    <section class="table-wrapper">
      <div class="table-header">
        <div class="section-title">KPI 汇总表（示意）</div>
        <button class="btn-primary">导出 CSV</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>日期</th>
            <th>DAU</th>
            <th>总观看时长</th>
            <th>测验提交</th>
            <th>平均分</th>
            <th>通过率</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in kpiTable" :key="row.date">
            <td>{{ row.date }}</td>
            <td>{{ row.dau }}</td>
            <td>{{ row.watchHours }}</td>
            <td>{{ row.quizSubmits }}</td>
            <td>{{ row.avgScore }}</td>
            <td>{{ row.passRate }}%</td>
          </tr>
          <tr v-if="!kpiTable.length">
            <td colspan="6" style="text-align: center; color: #999">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchCourseDailyKpi, fetchVideoRank, fetchScoreDist } from '../api';

const router = useRouter();

const filters = reactive({
  courseId: localStorage.getItem('currentCourseId') || '',
  startDate: '',
  endDate: '',
  group: ''
});

const mockCourses = [
  { id: 'course_1', name: '示例课程 A' },
  { id: 'course_2', name: '示例课程 B' }
];

const loading = ref(false);

const kpiSummary = reactive({
  dau: null,
  dauDelta: null,
  watchHours: null,
  quizSubmits: null,
  avgScore: null,
  passRate: null
});

const kpiTable = ref([]);
const topVideos = ref([]);
const scoreDist = ref(null);

const loadAll = async () => {
  loading.value = true;
  try {
    const params = {
      course_id: filters.courseId || undefined,
      start_date: filters.startDate || undefined,
      end_date: filters.endDate || undefined,
      group: filters.group || undefined
    };

    const [kpiRes, topVideoRes, scoreRes] = await Promise.all([
      fetchCourseDailyKpi(params).catch(() => null),
      fetchVideoRank(params).catch(() => null),
      fetchScoreDist(params).catch(() => null)
    ]);

    if (kpiRes?.data) {
      const list = kpiRes.data.list || [];
      kpiTable.value = list;
      if (list.length) {
        const last = list[list.length - 1];
        kpiSummary.dau = last.dau;
        kpiSummary.watchHours = last.watchHours;
        kpiSummary.quizSubmits = last.quizSubmits;
        kpiSummary.avgScore = last.avgScore;
        kpiSummary.passRate = last.passRate;
      }
    }

    if (topVideoRes?.data) {
      topVideos.value = topVideoRes.data.list || [];
    }

    if (scoreRes?.data) {
      scoreDist.value = scoreRes.data;
    }
  } finally {
    loading.value = false;
  }
};

const mockSelectDay = () => {
  // 示例交互：点击折线图某天，实际上可以传入 date 参数重新请求 rank / score
  loadAll();
};

const goToCourse = (video) => {
  router.push({ path: '/course', query: { video_id: video.video_id } });
};

onMounted(() => {
  loadAll();
});
</script>

