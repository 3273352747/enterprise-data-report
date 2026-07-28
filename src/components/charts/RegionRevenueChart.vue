<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
})

const chartRef = ref(null)
let chartInstance = null

function createChartData() {
  const revenueMap = new Map()

  props.rows.forEach((row) => {
    const region = row.region || '未分类'
    const revenue = Number(row.revenue) || 0
    revenueMap.set(region, (revenueMap.get(region) || 0) + revenue)
  })

  return Array.from(revenueMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

function renderChart() {
  if (!chartInstance) return

  chartInstance.setOption({
    color: ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#0891b2'],
    tooltip: {
      trigger: 'item',
      formatter: ({ name, value, percent }) => {
        return `${name}<br>营收：${Number(value).toLocaleString()} 元<br>占比：${percent}%`
      },
    },
    legend: {
      type: 'scroll',
      bottom: 0,
    },
    series: [{
      name: '区域营收',
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['50%', '45%'],
      data: createChartData(),
      label: {
        formatter: '{b}\n{d}%',
      },
      emphasis: {
        scale: true,
        scaleSize: 8,
      },
    }],
  }, true)
}

function resizeChart() {
  chartInstance?.resize()
}

onMounted(async () => {
  await nextTick()
  chartInstance = echarts.init(chartRef.value)
  renderChart()
  window.addEventListener('resize', resizeChart)
})

watch(
    () => props.rows, 
    renderChart, 
    { 
        deep: true 
    })

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
})
</script>

<template>
  <section class="chart-section">
    <h3>区域营收占比</h3>
    <div ref="chartRef" class="chart"></div>
  </section>
</template>

<style scoped>
.chart-section {
  margin-top: 28px;
  padding-top: 22px;
  border-top: 1px solid #e4e7ec;
}

.chart-section h3 {
  margin: 0 0 16px;
  color: #0b2545;
}

.chart {
  width: 100%;
  height: 320px;
}
</style>