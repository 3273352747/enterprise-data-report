<script setup>
import { ref,watch,nextTick,onMounted,onBeforeUnmount } from 'vue'
import echarts from '../../utils/echarts.js'

const props = defineProps({
  rows: {
    type: Array,
    required: true,
  },
})

const chartRef = ref(null)
let chartInstance = null

function createChartData() {
    const monthMap = new Map()

    props.rows.forEach((row) => {
        if(!monthMap.has(row.month)){
            monthMap.set(row.month, {
                revenue: 0,
                cost: 0,
            })
        }

        const monthData = monthMap.get(row.month)
        monthData.revenue += row.revenue
        monthData.cost += row.cost
    })

    const months = Array.from(monthMap.keys()).sort()

    return {
        months,
        revenueData: months.map(
            (month) => monthMap.get(month).revenue,
        ),
        costData: months.map(
            (month) => monthMap.get(month).cost,
        ),
    }
}

function renderChart() {
  if (!chartInstance) return

  const { months, revenueData, costData } = createChartData()

  chartInstance.setOption(
    {
      color: ['#2563eb', '#64748b'],
      tooltip: {
        trigger: 'axis',
        valueFormatter: (value) =>
          `¥ ${new Intl.NumberFormat('zh-CN').format(value)}`,
      },
      legend: {
        top: 4,
        data: ['营业收入', '营业成本'],
      },
      grid: {
        left: 70,
        right: 24,
        top: 52,
        bottom: 42,
      },
      xAxis: {
        type: 'category',
        data: months,
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value) => `${value / 10000}万`,
        },
      },
      series: [
        {
          name: '营业收入',
          type: 'line',
          smooth: true,
          symbolSize: 8,
          data: revenueData,
        },
        {
          name: '营业成本',
          type: 'line',
          smooth: true,
          symbolSize: 8,
          data: costData,
        },
      ],
    },
    true,
  )
}

function resizeChart() {
  chartInstance?.resize()
}

onMounted(async() => {
    await nextTick()
    chartInstance = echarts.init(chartRef.value)
    renderChart()
    window.addEventListener('resize',resizeChart)
})

watch(
  () => props.rows,
  () => renderChart(),
  { deep: true },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<template>
    <section class="chart-block">
        <h4>月度营业收入与成本趋势</h4>
        <div ref="chartRef" class="chart-container"></div>
    </section>
</template>

<style scoped>
.chart-block {
    margin-top: 28px;
    padding-top: 22px;
    border-top: 1px solid #e4e7ec;
}

.chart-block h4 {
    margin: 0 0 14px;
    color: #344054;
    font-size: 18px;
}

.chart-container {
    width: 100%;
    height: 340px;
}
</style>