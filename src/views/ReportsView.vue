<template>
  <div>
    <div class="page-header">
      <div class="page-title">报告中心（轻量版）</div>
      <div class="page-subtitle">生成并保存课程数据分析快照</div>
    </div>

    <section class="filter-panel">
      <div class="section-title">新建报告</div>
      <div class="filter-row">
        <div class="filter-item">
          <label>课程</label>
          <select v-model="form.courseId">
            <option value="">选择课程</option>
            <option v-for="c in mockCourses" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label>开始日期</label>
          <input type="date" v-model="form.startDate" />
        </div>
        <div class="filter-item">
          <label>结束日期</label>
          <input type="date" v-model="form.endDate" />
        </div>
        <div class="filter-item" style="align-self: flex-end">
          <button class="btn-primary" @click="handleCreate" :disabled="creating">
            {{ creating ? '生成中...' : '一键生成快照' }}
          </button>
        </div>
      </div>
      <div v-if="message" style="margin-top: 8px; font-size: 12px; color: #52c41a">
        {{ message }}
      </div>
    </section>

    <section class="table-wrapper" style="margin-top: 16px">
      <div class="table-header">
        <div class="section-title">我的报告</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>报告名称</th>
            <th>课程</th>
            <th>日期范围</th>
            <th>生成时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reports" :key="r.id">
            <td>{{ r.name }}</td>
            <td>{{ r.courseName }}</td>
            <td>{{ r.dateRange }}</td>
            <td>{{ r.createdAt }}</td>
          </tr>
          <tr v-if="!reports.length">
            <td colspan="4" style="text-align: center; color: #999">暂无报告记录</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { createReport, fetchReportList } from '../api';

const form = reactive({
  courseId: '',
  startDate: '',
  endDate: ''
});

const mockCourses = [
  { id: 'course_1', name: '示例课程 A' },
  { id: 'course_2', name: '示例课程 B' }
];

const creating = ref(false);
const message = ref('');
const reports = ref([]);

const loadReports = async () => {
  const res = await fetchReportList().catch(() => null);
  if (res?.data) {
    reports.value = res.data.list || [];
  }
};

const handleCreate = async () => {
  message.value = '';
  if (!form.courseId || !form.startDate || !form.endDate) {
    message.value = '请完整选择课程和日期范围';
    return;
  }
  creating.value = true;
  try {
    await createReport({
      course_id: form.courseId,
      start_date: form.startDate,
      end_date: form.endDate
    });
    message.value = '已提交报告生成任务，快照将保存到后端 report_snapshot 表中。';
    await loadReports();
  } catch {
    message.value = '生成失败，请稍后重试。';
  } finally {
    creating.value = false;
  }
};

onMounted(() => {
  loadReports();
});
</script>

