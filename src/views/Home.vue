<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm px-4 md:px-8 flex items-center justify-between h-16 fixed top-0 left-0 right-0 z-50">
      <h1 class="text-xl font-bold text-gray-800">日记填写系统</h1>
      <div class="flex items-center gap-4">
        <el-date-picker
          v-model="currentDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
          class="w-40"
        />
        <el-button type="primary" @click="handleExport" :icon="Download">
          导出Markdown
        </el-button>
      </div>
    </header>

    <div class="container mx-auto px-4 py-6 max-w-6xl pt-24">
      <!-- 步骤条 -->
      <el-steps :active="activeStep" finish-status="success" class="mb-8">
        <el-step title="时间花销" />
        <el-step title="LIFE" />
        <el-step title="AM" />
        <el-step title="LOVE" />
      </el-steps>

      <!-- 进度提示 -->
      <div class="mb-6">
        <el-progress
          :percentage="Math.round((activeStep + 1) / 4 * 100)"
          :status="activeStep === 3 ? 'success' : undefined"
          :stroke-width="8"
        />
        <div class="text-sm text-gray-600 mt-2 text-center">
          当前进度: {{ Math.round((activeStep + 1) / 4 * 100) }}% - {{ ['时间花销', 'LIFE', 'AM', 'LOVE'][activeStep] }}
        </div>
      </div>

      <!-- 模块内容 -->
      <el-card class="mb-6">
        <TimeSpend
          v-if="activeStep === 0"
          v-model="formData.时间花销"
          @next="handleNext"
        />
        <LifeModule
          v-if="activeStep === 1"
          v-model="formData.LIFE"
          @next="handleNext"
          @prev="handlePrev"
        />
        <AmModule
          v-if="activeStep === 2"
          v-model="formData.AM"
          @next="handleNext"
          @prev="handlePrev"
        />
        <LoveModule
          v-if="activeStep === 3"
          v-model="formData.LOVE"
          @prev="handlePrev"
          @complete="handleComplete"
        />
      </el-card>

      <!-- 底部导航按钮 -->
      <div class="flex justify-between mt-6">
        <el-button v-if="activeStep > 0" @click="handlePrev" :icon="ArrowLeft">
          上一步
        </el-button>
        <div v-else></div>
        <el-button
          v-if="activeStep < 3"
          type="primary"
          @click="handleNext"
          :icon="ArrowRight"
        >
          下一步
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { getTodayDate, getDiaryData, saveDiaryData } from '../utils/storage'
import { exportToMarkdown, downloadFile } from '../utils/export'
import TimeSpend from '../components/TimeSpend.vue'
import LifeModule from '../components/LifeModule.vue'
import AmModule from '../components/AmModule.vue'
import LoveModule from '../components/LoveModule.vue'

const currentDate = ref(getTodayDate())
const activeStep = ref(0)
const formData = ref({
  时间花销: {},
  LIFE: {},
  AM: {},
  LOVE: {}
})

// 加载数据
function loadData() {
  formData.value = getDiaryData(currentDate.value)
}

// 防抖保存函数
let saveTimer = null
function saveData(showMessage = false) {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  saveTimer = setTimeout(() => {
    saveDiaryData(currentDate.value, formData.value)
    if (showMessage) {
      ElMessage.success('数据已保存')
    }
  }, 1000) // 1秒防抖
}

// 立即保存（用于切换步骤时）
function saveDataImmediately() {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  saveDiaryData(currentDate.value, formData.value)
}

// 日期变化
function handleDateChange() {
  saveDataImmediately() // 先保存当前数据
  loadData()
  activeStep.value = 0
}

// 下一步
function handleNext() {
  if (activeStep.value < 3) {
    saveDataImmediately()
    activeStep.value++
  }
}

// 上一步
function handlePrev() {
  if (activeStep.value > 0) {
    saveDataImmediately()
    activeStep.value--
  }
}

// 完成
function handleComplete() {
  saveDataImmediately()
  ElMessage.success('日记填写完成！')
}

// 导出
function handleExport() {
  saveDataImmediately() // 导出前先保存
  const markdown = exportToMarkdown(currentDate.value, formData.value)
  const filename = `日记_${currentDate.value}.md`
  downloadFile(markdown, filename, 'text/markdown')
  ElMessage.success('导出成功！')
}

// 自动保存（防抖，不显示消息）
watch(formData, () => {
  saveData(false)
}, { deep: true })

onMounted(() => {
  loadData()
})
</script>

<style scoped>
:deep(.el-steps) {
  background: transparent;
}

:deep(.el-card) {
  border-radius: 8px;
}
</style>

