<script setup>
import { ref,computed } from 'vue'
import { RefreshLeft } from '@element-plus/icons-vue'
import RevenueTrendChart from './charts/RevenueTrendChart.vue'
import DepartmentProfitChart from './charts/DepartmentProfitChart.vue'
import RegionRevenueChart from './charts/RegionRevenueChart.vue'

const props = defineProps({
    rows: {
        type: Array,
        required: true,
    },
})

const selectedMonth = ref('全部')
const selectedDepartment = ref('全部')
const selectedRegion = ref('全部')

function createOptions(field) {
    const values = props.rows.map((row) => row[field]).filter(Boolean)

    return ['全部', ...Array.from(new Set(values)).sort()]
}

const monthOptions = computed(() => createOptions('month'))
const departmentOptions = computed(() => createOptions('department'))
const regionOptions = computed(() => createOptions('region'))

const filteredRows = computed(() => {
    return props.rows.filter((row) => {
        const monthMatched = 
        selectedMonth.value === '全部' ||
        row.month === selectedMonth.value

        const departmentMatched = 
        selectedDepartment.value === '全部' ||
        row.department === selectedDepartment.value

        const regionMatched = 
        selectedRegion.value === '全部' ||
        row.region === selectedRegion.value

        return monthMatched && departmentMatched && regionMatched
    })
})

const metrics = computed(() => {
    const result = filteredRows.value.reduce(
        (total,row) => {
            total.revenue += row.revenue
            total.cost += row.cost
            total.budget += row.budget
            return total
        },
        { revenue: 0, cost: 0, budget: 0 },
    )

    return {
        ...result,
        profit: result.revenue - result.cost,
        completionRate:
        result.budget > 0
        ? (result.revenue / result.budget) * 100
        : 0
    }
})

function formatAmount(value) {
    return new Intl.NumberFormat('zh-CN').format(value)
}

function resetFilters() {
    selectedMonth.value = '全部'
    selectedDepartment.value = '全部'
    selectedRegion.value = '全部'
}
</script>

<template>
    <section class="panel">
        <div class="analysis-heading">
            <div>
                <h3>经营分析</h3>
                <span>当前共 {{ filteredRows.length }} 条有效数据</span>
            </div>

            <el-button :icon="RefreshLeft" @click="resetFilters">重置筛选</el-button>
        </div>

        <div class="filter-bar">
            <label>
                <span>月份</span>
                <el-select v-model="selectedMonth">
                    <el-option
                    v-for="month in monthOptions"
                    :key="month"
                    :label="month"
                    :value="month"
                    />
                </el-select>
            </label>

            <label>
                <span>部门</span>
                <el-select v-model="selectedDepartment">
                    <el-option
                    v-for="department in departmentOptions"
                    :key="department"
                    :label="department"
                    :value="department"
                    />
                </el-select>
            </label>

            <label>
                <span>区域</span>
                <el-select v-model="selectedRegion">
                    <el-option
                    v-for="region in regionOptions"
                    :key="region"
                    :label="region"
                    :value="region"
                    />
                </el-select>
            </label>
        </div>

        <div class="metrics-grid">
            <article class="metric-item revenue">
                <span>营业收入</span>
                <strong>￥ {{ formatAmount(metrics.revenue) }}</strong>
            </article>

            <article class="metric-item cost">
                <span>营业成本</span>
                <strong>￥ {{ formatAmount(metrics.cost) }}</strong>
            </article>

            <article class="metric-item profit">
                <span>利润</span>
                <strong :class="{ negative: metrics.profit < 0 }">￥ {{ formatAmount(metrics.profit) }}</strong>
            </article>

            <article class="metric-item completion">
                <span>预算完成率</span>
                <strong>{{ metrics.completionRate.toFixed(1) }}%</strong>
            </article>
        </div>

        <RevenueTrendChart
        v-if="filteredRows.length > 0"
        :rows="filteredRows"
        />

        <div v-if="filteredRows.length > 0" class="chart-grid">
        <DepartmentProfitChart :rows="filteredRows" />
        <RegionRevenueChart :rows="filteredRows" />
        </div>

        <el-empty
        v-if="filteredRows.length === 0"
        description="当前筛选条件下没有经营数据"
        />
    </section>
</template>

<style scoped>
.analysis-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.analysis-heading h3 {
    margin: 0 0 6px;
}

.analysis-heading span {
    color: #667085;
}

.filter-bar {
    display: flex;
    gap: 16px;
    margin: 24px 0;
}

.filter-bar label {
    width: 180px;
}

.filter-bar label > span {
    display: block;
    margin-bottom: 8px;
    color: #475467;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(4,1fr);
    gap: 14px;
}

.metric-item {
    min-height: 112px;
    padding: 18px;
    border: 1px solid #e4e7ec;
    border-radius: 6px;
}

.metric-item span {
    display: block;
    margin-bottom: 14px;
    color: #667085;
}

.metric-item strong {
    font-size: 23px;
    color: #101828;
}

.metric-item.revenue {
    border-top: 3px solid #2563eb;
}

.metric-item.cost {
    border-top: 3px solid #64748b;
}

.metric-item.profit {
    border-top: 3px solid #16a34a;
}

.metric-item.completion {
    border-top: 3px solid #d97706;
}

.metric-item strong.negative {
    color: #dc2626;
}

@media (max-width: 800px) {
    .filter-bar {
        flex-wrap: wrap;
    }

    .metrics-grid {
        grid-template-columns: repeat(2,1fr);
    }
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.chart-grid > * {
  min-width: 0;
}

@media (max-width: 900px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>