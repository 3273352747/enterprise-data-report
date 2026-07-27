<script setup>
defineProps({
    totalCount: {
        type: Number,
        required: true
    },
    validCount: {
        type: Number,
        required: true
    },
    invalidRows: {
        type: Array,
        required: true
    },
})
</script>

<template>
    <section class="panel">
        <h3>数据校验结果</h3>

        <div class="validation-summary">
            <span>总数据：<strong>{{ totalCount }}</strong></span>
            <span class="valid">有效：<strong>{{ validCount }}</strong></span>
            <span class="invalid">错误：<strong>{{ invalidRows.length }}</strong></span>
        </div>

        <el-alert
        v-if="invalidRows.length === 0"
        title="数据校验通过，可以进行经营分析"
        type="success"
        :closable="false"
        show-icon
        />

        <el-table
        v-else
        :data="invalidRows"
        border
        max-height="320"
        class="error-table"
        >
    <el-table-column prop="rowNumber" label="Excel行号" width="100" />
    <el-table-column prop="month" label="月份" width="100" />
    <el-table-column prop="department" label="部门" width="120" />
    <el-table-column prop="errorMessage" label="错误原因" min-width="320" />
    </el-table>
    </section>
</template>

<style scoped>
.validation-summary {
    display: flex;
    gap: 28px;
    margin-bottom: 20px;
    color: #475467;
}

.validation-summary strong {
    margin-left: 4px;
    font-size: 20px;
    color: #101828;
}

.validation-summary
.valid strong {
    color: #16a34a;
}

.validation-summary
.invalid strong {
    color: #dc2626;
}

.error-table {
    margin-top: 16px;
}
</style>