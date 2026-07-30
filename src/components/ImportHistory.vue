<script setup>
import { Delete } from '@element-plus/icons-vue'

defineProps({
  records: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['clear'])
</script>

<template>
<section class="panel history-panel">
    <div class="history-header">
      <div>
        <h3>导入历史</h3>
        <p>仅保存在当前浏览器，最多保留 8 条记录</p>
      </div>

      <el-button
        v-if="records.length > 0"
        type="danger"
        plain
        :icon="Delete"
        @click="emit('clear')"
      >
        清空历史
      </el-button>
    </div>

    <el-empty
      v-if="records.length === 0"
      description="暂无导入历史"
    />

    <el-table
      v-else
      :data="records"
      border
      max-height="320"
    >
      <el-table-column type="index" label="#" width="58" />
      <el-table-column
        prop="fileName"
        label="文件名"
        min-width="190"
        show-overflow-tooltip
      />
      <el-table-column prop="importedAt" label="导入时间" width="180" />
      <el-table-column prop="rowCount" label="总条数" width="86" />
      <el-table-column label="校验结果" min-width="160">
        <template #default="{ row }">
          <div class="result-tags">
            <el-tag type="success" effect="plain">
              有效 {{ row.validCount }}
            </el-tag>
            <el-tag type="danger" effect="plain">
              错误 {{ row.invalidCount }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<style scoped>
.history-panel {
  margin-top: 24px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.history-header h3 {
  margin: 0 0 6px;
}

.history-header p {
  margin: 0;
  color: #667085;
  font-size: 14px;
}

.result-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .history-header {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>