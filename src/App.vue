<script setup>
import { ref,computed,onMounted,defineAsyncComponent } from 'vue'
import { ElMessage } from 'element-plus'
import { Download,UploadFilled } from '@element-plus/icons-vue'
import DataPreview from './components/DataPreview.vue'
import { parseExcelFile } from './utils/excel'
import ValidationPanel from './components/ValidationPanel.vue'
import { validateRows } from './utils/validator.js'
import { 
  saveCurrentImport,
  loadCurrentImport,
  clearCurrentImport,
  addImportHistory,
  loadImportHistory,
  clearImportHistory, 
} from './utils/storage.js'
import ImportHistory from './components/ImportHistory.vue'

const AnalysisPanel = defineAsyncComponent({
  loader: () => import(
    './components/AnalysisPanel.vue'
  ),
  delay: 100,
  timeout: 10000,
})

const selectedFile = ref(null)
const importedRows = ref([])
const parsing = ref(false)
const importHistory = ref(loadImportHistory())

const uploadRef = ref(null)
const restoredFileName = ref('')

const displayFileName = computed(() => {
  return selectedFile.value?.name || restoredFileName.value
})

const templateUrl = `${import.meta.env.BASE_URL}经营数据模板.xlsx`

const validatedRows = computed(() => {
  return validateRows(importedRows.value)
})

const validRows = computed(() => {
  return validatedRows.value.filter((row) => row.valid)
})

const invalidRows = computed(() => {
  return validatedRows.value.filter((row) => !row.valid)
})

const activeStep = computed(() => {
  if(importedRows.value.length === 0) return 0
  return invalidRows.value.length === 0 ? 2 : 1
})

async function handleFileChange(file) {
  parsing.value = true

  try{
    const rows = await parseExcelFile(file.raw)

    selectedFile.value = file.raw
    importedRows.value = rows
    restoredFileName.value = ''

    const currentImportSaved = saveCurrentImport({
      fileName: file.raw.name,
      savedAt: new Date().toISOString(),
      rows,
    })

    const checkedRows = validateRows(rows)

    const nextHistory = addImportHistory({
      id: Date.now(),
      fileName: file.raw.name,
      importedAt: new Date().toLocaleString('zh-CN',{
        hour12: false,
      }),
      rowCount: rows.length,
      validCount: checkedRows.filter((row) => row.valid).length,
      invalidCount: checkedRows.filter((row) => !row.valid).length,
    })

    if(nextHistory){
      importHistory.value = nextHistory
    }

    if(currentImportSaved && nextHistory){
      ElMessage.success(`成功解析 ${rows.length} 条数据`)
    } else if(!currentImportSaved && !nextHistory) {
      ElMessage.warning(`成功解析 ${rows.length} 条数据，但当前数据和导入历史都未保存到浏览器`)
    } else if(!currentImportSaved) {
      ElMessage.warning(`成功解析 ${rows.length} 条数据，但刷新后无法恢复当前数据`)
    } else {
      ElMessage.warning(`成功解析 ${rows.length} 条数据，但本次导入未记录到历史中`)
    }
  } catch(error){
    uploadRef.value?.clearFiles()
    ElMessage.error(error instanceof Error ? error.message : '文件解析失败，请重新选择')
  } finally{
    parsing.value = false
  }
}

function handleFileRemove() {
  clearImportedData()
}

onMounted(() => {
  const savedImport = loadCurrentImport()

  if(savedImport?.rows?.length){
    importedRows.value = savedImport.rows
    restoredFileName.value = savedImport.fileName
    ElMessage.info('已恢复上次导入的数据')
  }
})

function clearImportedData() {
  selectedFile.value = null
  restoredFileName.value = ''
  importedRows.value = []
  uploadRef.value?.clearFiles()

  if(clearCurrentImport()){
  ElMessage.success('当前导入数据已清除')
  } else {
    ElMessage.warning('当前数据已从页面清除，但浏览器缓存清除失败')
  }
}

function handleClearHistory() {
  if(clearImportHistory()){
    importHistory.value = []
    ElMessage.success('导入历史已清空')
  } else {
    ElMessage.warning('浏览器本地存储不可用，无法清空导入历史')
  }
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <h1>企业经营数据分析与报表平台</h1>

      <a :href="templateUrl" download="经营数据模板.xlsx">
        <el-button type="primary" :icon="Download">下载模板</el-button>
      </a>
    </header>

    <main class="workspace">
      <h2>经营数据导入</h2>

      <el-steps :active="activeStep" align-center>
        <el-step title="导入数据" />
        <el-step title="数据校验" />
        <el-step title="分析报表" />
      </el-steps>

      <section class="panel">
        <h3>上传经营数据</h3>

        <el-upload ref="uploadRef"
        drag
        action="#"
        accept=".xlsx"
        :auto-upload="false"
        :limit="1"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        >
        <el-icon class="el-icon--upload upload-icon"><UploadFilled /></el-icon>
        <div>将Excel文件拖到这里，或点击选择文件</div>
        <template #tip>
          <div class="upload-tip">仅支持 .xlsx 格式</div>
        </template>
      </el-upload>
      
      <p v-if="displayFileName" class="file-info">
        已导入: {{ displayFileName }}
        <el-tag :type="importedRows.length ? 'success' : 'warning'">{{ importedRows.length ? '已解析' : '待解析'}}</el-tag>

        <el-button type="danger" link @click="clearImportedData">清除当前数据</el-button>
      </p>
      </section>

      <section v-loading="parsing" class="panel preview-panel">
        <h3>数据预览（{{ importedRows.length }}条）</h3>

        <DataPreview
        v-if="importedRows.length > 0"
        :rows="importedRows"
        />
        <el-empty 
        v-else-if="!parsing"
        description="请先上传经营数据文件" 
        />
      </section>

      <ValidationPanel
      v-if="importedRows.length > 0"
      :total-count="importedRows.length"
      :valid-count="validRows.length"
      :invalid-rows="invalidRows"
      />

      <AnalysisPanel
      v-if="validRows.length > 0 && invalidRows.length === 0"
      :rows="validRows"
      />

      <ImportHistory
      :records="importHistory"
      @clear="handleClearHistory"
      />
    </main>
  </div>
</template>
