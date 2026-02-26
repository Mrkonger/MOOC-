<template>
  <div>
    <div class="page-header">
      <div class="page-title">系统配置</div>
      <div class="page-subtitle">仅管理员可见：指标阈值与预警规则</div>
    </div>

    <section class="filter-panel">
      <div class="section-title">指标阈值（示例）</div>
      <div class="filter-row">
        <div class="filter-item">
          <label>连续 N 天 DAU 下降超过（%）</label>
          <input v-model.number="form.dauDropThreshold" type="number" />
        </div>
        <div class="filter-item">
          <label>平均分低于（分）触发预警</label>
          <input v-model.number="form.scoreThreshold" type="number" />
        </div>
        <div class="filter-item">
          <label>热门视频「难度评分」大于</label>
          <input v-model.number="form.difficultyThreshold" type="number" />
        </div>
        <div class="filter-item" style="align-self: flex-end">
          <button class="btn-primary">保存配置（占位）</button>
        </div>
      </div>
      <div style="margin-top: 8px; font-size: 12px; color: #999">
        后端可持久化到 /admin/settings，对应预警规则的实际计算逻辑。
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const form = reactive({
  dauDropThreshold: 20,
  scoreThreshold: 60,
  difficultyThreshold: 80
});
</script>

