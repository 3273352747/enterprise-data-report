<script setup>
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { exportInvalidRows } from '../utils/exportExcel'

const props = defineProps({
    totalCount: Number,
    validCount: Number,
    invalidRows: {
        type: Array,
        required: true
    },
})

async function handleExportErrors() {
    try{
        const success = await exportInvalidRows(
            props.invalidRows,
        )
        
        if(success){
            ElMessage.success('错误数据清单导出成功')
        } else {
            ElMessage.warning('没有可以导出的错误数据')
        }
    } catch {
        ElMessage.error('错误数据清单导出失败')
    }
}
</script>

<template>
    <section class="panel">
        <div class="panel-header">
        <h3>数据校验结果</h3>

        <el-button
        v-if="invalidRows.length > 0"
        type="danger"
        plain
        :icon="Download"
        @click="handleExportErrors"
        >导出错误清单</el-button>
        </div>

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

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.panel-header h3 {
  margin: 0;
}

@media (max-width: 640px) {
  .panel-header {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 12px;
  }

  .validation-summary {
    flex-wrap: wrap;
    gap: 12px 20px;
  }
}
</style>