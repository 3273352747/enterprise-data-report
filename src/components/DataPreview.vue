<script setup>
defineProps({
    rows: {
        type: Array,
        required: true,
    },
})

function formatMoney(value) {
    if(!Number.isFinite(value)){
        return '-'
    }

    return new Intl.NumberFormat('zh-CN').format(value)
}
</script>

<template>
    <el-table :data="rows" border stripe max-height="430">
        <el-table-column prop="rowNumber" label="Excel行号" width="100" />
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column prop="department" label="部门" min-width="110" />
        <el-table-column prop="region" label="区域" width="100" />
        <el-table-column prop="businessType" label="业务类型" min-width="120" />

        <el-table-column label="营业收入" min-width="120">
        <template #default="{row}">
            {{ formatMoney(row.revenue) }}
        </template>
        </el-table-column>

        <el-table-column label="营业成本" min-width="120">
            <template #default="{row}">
                {{ formatMoney(row.cost) }}
            </template>
        </el-table-column>

        <el-table-column label="预算收入" min-width="120">
            <template #default="{row}">
                {{ formatMoney(row.budget) }}
            </template>
        </el-table-column>
    </el-table>
</template>