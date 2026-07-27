<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Download,UploadFilled } from '@element-plus/icons-vue'
import DataPreview from './components/DataPreview.vue'
import { parseExcelFile } from './utils/excel'

const selectedFile = ref(null)
const importedRows = ref([])
const parsing = ref(false)
const templateUrl = `${import.meta.env.BASE_URL}经营数据模板.xlsx`

async function handleFileChange(file) {
  selectedFile.value = file.raw
  parsing.value = true

  try{
    importedRows.value = await parseExcelFile(file.raw)
    ElMessage.success(`成功解析 ${importedRows.value.length} 条数据`)
  } catch(error){
    importedRows.value = []
    ElMessage.error(error.message)
  } finally{
    parsing.value = false
  }
}

function handleFileRemove() {
  selectedFile.value = null
  importedRows.value = []
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

      <el-steps :active="importedRows.length ? 1:0" align-center>
        <el-step title="导入数据" />
        <el-step title="数据校验" />
        <el-step title="分析报表" />
      </el-steps>

      <section class="panel">
        <h3>上传经营数据</h3>

        <el-upload
        drag
        action="#"
        accept=".xlsx"
        :auto-upload="false"
        :limit="1"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        >
        <el-icon class="upload-icon"><UploadFilled /></el-icon>
        <div>将Excel文件拖到这里，或点击选择文件</div>
        <template #tip>
          <div class="upload-tip">仅支持 .xlsx 格式</div>
        </template>
      </el-upload>
      
      <p v-if="selectedFile" class="file-info">
        已选择: {{ selectedFile.name }}
        <el-tag :type="importedRows.length ? 'success' : 'warning'">{{ parsing ? '解析中' : importedRows.length ? '已解析' : '待解析'}}</el-tag>
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
    </main>
  </div>
</template>
