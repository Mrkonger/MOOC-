<template>
  <div>
    <div class="page-header">
      <div class="page-title">数据同步状态</div>
      <div class="page-subtitle">仅管理员可见：最近一次 ingest / Spark 计算状态</div>
    </div>

    <section class="table-wrapper">
      <div class="table-header">
        <div class="section-title">最近一次数据同步（示意）</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>类型</th>
            <th>时间</th>
            <th>耗时</th>
            <th>结果</th>
            <th>日志文件</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ingest</td>
            <td>2025-01-01 10:00:00</td>
            <td>12min</td>
            <td><span class="tag">成功</span></td>
            <td>ingest_20250101.log</td>
          </tr>
          <tr>
            <td>Spark 计算</td>
            <td>2025-01-01 10:20:00</td>
            <td>8min</td>
            <td><span class="tag tag-danger">失败</span></td>
            <td>spark_job_20250101.log</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 8px; font-size: 12px; color: #999">
        实际实现中可从 /admin/datasync 接口返回最近一次 job 的状态与日志文件名。
      </div>
    </section>
  </div>
</template>

<script setup></script>

