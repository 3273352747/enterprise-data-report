<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import echarts from '../../utils/echarts.js'

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
})

const chartRef = ref(null)
let chartInstance = null

function createChartData() {
  const profitMap = new Map()

  props.rows.forEach((row) => {
    const department = row.department || '未分类'
    const profit = (Number(row.revenue) || 0) - (Number(row.cost) || 0)
    const currentProfit = profitMap.get(department) || 0

    profitMap.set(department, currentProfit + profit)
})

return Array.from(profitMap.entries())
  .map(([department, profit]) => ({ department, profit }))
  .sort((a, b) => b.profit - a.profit)
}

function renderChart() {
  if (!chartInstance) return

  const chartData = createChartData()

  chartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value) => `${Number(value).toLocaleString()} 元`,
    },
    grid: { left: 70, right: 24, top: 24, bottom: 45 },
    xAxis: {
      type: 'category',
      data: chartData.map((item) => item.department),
    },
    yAxis: {
      type: 'value',
      name: '利润（元）',
    },
    series: [{
      name: '利润',
      type: 'bar',
      barMaxWidth: 45,
      data: chartData.map((item) => ({
        value: item.profit,
        itemStyle: {
          color: item.profit >= 0 ? '#16a34a' : '#dc2626',
        },
      })),
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
        <h3>部门利润对比</h3>
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