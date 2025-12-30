<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm px-2 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between min-h-16 md:h-16 fixed top-0 left-0 right-0 z-50">
      <h1 class="text-lg md:text-xl font-bold text-gray-800 px-2 md:px-0 py-2 md:py-0">日记填写系统</h1>
      <div class="flex items-center gap-1 md:gap-4 w-full md:w-auto px-2 md:px-0 pb-2 md:pb-0">
        <!-- 日期导航 -->
        <el-button
          :icon="ArrowLeft"
          circle
          size="small"
          @click="navigateDate(-1)"
          :disabled="!canNavigatePrev"
        />
        <el-date-picker
          v-model="currentDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
          class="flex-1 md:w-32"
          size="small"
        />
        <el-button
          :icon="ArrowRight"
          circle
          size="small"
          @click="navigateDate(1)"
          :disabled="!canNavigateNext"
        />
        <el-button
          text
          @click="showHistoryDialog = true"
          :icon="Calendar"
          size="small"
        >
          <span class="hidden sm:inline">历史</span>
        </el-button>
        <el-button type="primary" @click="handleExport" :icon="Download" size="small">
          <span class="hidden md:inline">导出</span>
        </el-button>
      </div>
    </header>

    <!-- 历史记录对话框 -->
    <el-dialog
      v-model="showHistoryDialog"
      title="历史记录"
      width="90%"
      :max-width="600"
    >
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <div
          v-for="date in historyDates"
          :key="date"
          class="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
          @click="selectHistoryDate(date)"
        >
          <div>
            <div class="font-medium">{{ formatDate(date) }}</div>
            <div class="text-sm text-gray-500">{{ getDateSummary(date) }}</div>
          </div>
          <el-button
            text
            type="primary"
            @click.stop="selectHistoryDate(date)"
          >
            查看
          </el-button>
        </div>
        <div v-if="historyDates.length === 0" class="text-center text-gray-500 py-8">
          暂无历史记录
        </div>
      </div>
    </el-dialog>

    <div class="container mx-auto px-2 md:px-4 py-4 md:py-6 max-w-6xl pt-20 md:pt-24">
      <!-- 步骤条 -->
      <div class="mb-8">
        <el-steps 
          :active="activeStep" 
          finish-status="success"
        >
          <el-step title="时间花销" />
          <el-step title="LIFE" />
          <el-step title="AM" />
          <el-step title="LOVE" />
        </el-steps>
        <!-- 模块快速跳转按钮 -->
        <div class="mt-3 md:mt-4 flex justify-center gap-1 md:gap-2 flex-wrap">
          <el-button
            v-for="(title, index) in ['时间花销', 'LIFE', 'AM', 'LOVE']"
            :key="index"
            :type="activeStep === index ? 'primary' : 'default'"
            size="small"
            @click="handleStepClick(index)"
            :class="activeStep === index ? '' : 'opacity-70'"
            class="text-xs md:text-sm"
          >
            {{ title }}
          </el-button>
        </div>
      </div>

      <!-- 进度提示 -->
      <div class="mb-6 space-y-2">
        <el-progress
          :percentage="Math.round((activeStep + 1) / 4 * 100)"
          :status="activeStep === 3 ? 'success' : undefined"
          :stroke-width="8"
        />
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between text-xs md:text-sm gap-1 md:gap-0">
          <span class="text-gray-600">
            当前进度: {{ Math.round((activeStep + 1) / 4 * 100) }}% - {{ ['时间花销', 'LIFE', 'AM', 'LOVE'][activeStep] }}
          </span>
          <span 
            v-if="completionInfo.totalMissing > 0"
            class="text-orange-500 text-xs"
          >
            ⚠️ 还有 {{ completionInfo.totalMissing }} 项待完善
          </span>
          <span 
            v-else-if="completionInfo.allComplete"
            class="text-green-500 text-xs"
          >
            ✅ 填写完整
          </span>
        </div>
      </div>

      <!-- 模块内容 -->
      <el-card class="mb-6">
        <template #header>
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-1 md:gap-0">
            <span class="text-base md:text-lg font-semibold">
              {{ ['时间花销', 'LIFE（生活）', 'AM（工作）', 'LOVE（情感）'][activeStep] }}
            </span>
            <div class="text-xs md:text-sm text-gray-500">
              {{ formatDate(currentDate) }}
            </div>
          </div>
        </template>
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
      <div class="flex flex-col gap-3 mt-4 md:mt-6">
        <!-- 上一步/下一步按钮 -->
        <div class="flex justify-between gap-2">
          <el-button 
            v-if="activeStep > 0" 
            @click="handlePrev" 
            :icon="ArrowLeft"
            size="default"
            class="flex-1 md:flex-initial"
          >
            上一步
          </el-button>
          <div v-else class="flex-1 md:flex-initial"></div>
          <el-button
            v-if="activeStep < 3"
            type="primary"
            @click="handleNext"
            :icon="ArrowRight"
            size="default"
            class="flex-1 md:flex-initial"
          >
            下一步
          </el-button>
        </div>
        
        <!-- 提交按钮 -->
        <el-button
          type="success"
          size="large"
          @click="handleSubmit"
          class="submit-btn w-full"
          :icon="Check"
        >
          <span class="text-lg font-semibold">✨ 提交日记</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, ArrowLeft, ArrowRight, Calendar, Check } from '@element-plus/icons-vue'
import { getTodayDate, getDiaryData, saveDiaryData, getAllDates } from '../utils/storage'
import { exportToMarkdown, downloadFile } from '../utils/export'
import { checkOverallComplete } from '../utils/validation'
import { useRouter } from 'vue-router'
import TimeSpend from '../components/TimeSpend.vue'
import LifeModule from '../components/LifeModule.vue'
import AmModule from '../components/AmModule.vue'
import LoveModule from '../components/LoveModule.vue'

const router = useRouter()
const currentDate = ref(getTodayDate())
const activeStep = ref(0)
const showHistoryDialog = ref(false)
const formData = ref({
  时间花销: {},
  LIFE: {},
  AM: {},
  LOVE: {}
})

// 历史记录日期列表
const historyDates = computed(() => getAllDates())

// 日期导航
const canNavigatePrev = computed(() => {
  const dates = getAllDates()
  const currentIndex = dates.indexOf(currentDate.value)
  return currentIndex < dates.length - 1
})

const canNavigateNext = computed(() => {
  const today = getTodayDate()
  return currentDate.value < today
})

// 格式化日期显示
function formatDate(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (dateStr === getTodayDate()) {
    return `今天 (${dateStr})`
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 (${dateStr})`
  } else {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${dateStr} ${weekdays[date.getDay()]}`
  }
}

// 获取日期摘要
function getDateSummary(dateStr) {
  const data = getDiaryData(dateStr)
  const totalHours = (data.时间花销?.副业 || 0) + 
                     (data.时间花销?.对象 || 0) + 
                     (data.时间花销?.主职 || 0) + 
                     (data.时间花销?.娱乐内耗 || 0) + 
                     (data.时间花销?.通勤 || 0) + 
                     (data.时间花销?.睡眠 || 0)
  const hasContent = totalHours > 0 || 
                     (data.LIFE?.习惯?.length > 0) ||
                     (data.AM?.项目进度 > 0) ||
                     (data.LOVE?.新连接数 > 0)
  return hasContent ? `已填写 (${totalHours.toFixed(1)}h)` : '未填写'
}

// 选择历史日期
function selectHistoryDate(date) {
  currentDate.value = date
  showHistoryDialog.value = false
}

// 日期导航
function navigateDate(direction) {
  const dates = getAllDates()
  const currentIndex = dates.indexOf(currentDate.value)
  
  if (direction === -1 && currentIndex < dates.length - 1) {
    // 向前（更早的日期）
    currentDate.value = dates[currentIndex + 1]
  } else if (direction === 1) {
    // 向后（更晚的日期）
    const today = getTodayDate()
    if (currentDate.value < today) {
      const nextDate = new Date(currentDate.value)
      nextDate.setDate(nextDate.getDate() + 1)
      const nextDateStr = nextDate.toISOString().split('T')[0]
      currentDate.value = nextDateStr
    }
  }
}

// 当前正在编辑的日期（用于保存时使用）
const editingDate = ref(getTodayDate())

// 加载数据
function loadData(date = null) {
  const targetDate = date || currentDate.value
  editingDate.value = targetDate
  const data = getDiaryData(targetDate)
  // 深拷贝避免引用问题
  formData.value = JSON.parse(JSON.stringify(data))
}

// 防抖保存函数
let saveTimer = null
function saveData(showMessage = false) {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  saveTimer = setTimeout(() => {
    // 使用editingDate确保保存到正确的日期
    saveDiaryData(editingDate.value, JSON.parse(JSON.stringify(formData.value)))
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
  // 使用editingDate确保保存到正确的日期
  saveDiaryData(editingDate.value, JSON.parse(JSON.stringify(formData.value)))
}

// 日期变化
function handleDateChange(newDate) {
  if (newDate && newDate !== editingDate.value) {
    // 先保存当前日期的数据
    saveDataImmediately()
    // 加载新日期的数据
    loadData(newDate)
    activeStep.value = 0
    ElMessage.info(`已切换到 ${formatDate(newDate)}`)
  }
}

// 步骤点击（支持直接跳转）
function handleStepClick(index) {
  if (index !== activeStep) {
    saveDataImmediately()
    activeStep.value = index
  }
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

// 提交日记（跳转到总览页面）
function handleSubmit() {
  saveDataImmediately()
  // 跳转到总览页面，传递日期和数据
  router.push({
    path: '/overview',
    query: {
      date: currentDate.value,
      data: encodeURIComponent(JSON.stringify(formData.value))
    }
  })
}

// 导出
function handleExport() {
  saveDataImmediately() // 导出前先保存
  const markdown = exportToMarkdown(currentDate.value, formData.value)
  const filename = `日记_${currentDate.value}.md`
  downloadFile(markdown, filename, 'text/markdown')
  ElMessage.success('导出成功！')
}

// 监听日期变化
watch(currentDate, (newDate) => {
  handleDateChange(newDate)
})

// 完成度检查
const completionInfo = computed(() => {
  return checkOverallComplete(formData.value)
})

// 自动保存（防抖，不显示消息）
watch(formData, () => {
  // 确保使用正确的日期保存
  if (editingDate.value) {
    saveData(false)
  }
}, { deep: true })

onMounted(() => {
  loadData()
})
</script>

<style scoped>
:deep(.el-steps) {
  background: transparent;
}

:deep(.el-step__head) {
  cursor: pointer;
}

:deep(.el-step__head:hover) {
  opacity: 0.8;
}

:deep(.el-card) {
  border-radius: 8px;
}

:deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-card__body) {
  padding: 16px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  :deep(.el-steps) {
    padding: 8px 0;
  }
  
  :deep(.el-step__title) {
    font-size: 12px;
    line-height: 1.4;
  }

  :deep(.el-step__head) {
    width: 24px;
    height: 24px;
  }

  :deep(.el-step__icon) {
    font-size: 12px;
  }
  
  :deep(.el-card__header) {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  :deep(.el-card__body) {
    padding: 12px;
  }
  
  :deep(.el-progress-bar__outer) {
    height: 6px !important;
  }

  :deep(.el-progress__text) {
    font-size: 12px;
  }
  
  :deep(.el-dialog) {
    margin: 5vh auto;
    width: 95% !important;
    max-height: 90vh;
  }

  :deep(.el-dialog__header) {
    padding: 12px 16px;
  }

  :deep(.el-dialog__title) {
    font-size: 16px;
  }

  :deep(.el-dialog__body) {
    padding: 12px 16px;
    max-height: calc(90vh - 120px);
    overflow-y: auto;
  }

  :deep(.el-button) {
    font-size: 13px;
    padding: 8px 16px;
  }

  :deep(.el-button--small) {
    padding: 6px 12px;
    font-size: 12px;
  }

  :deep(.el-date-picker) {
    width: 100%;
  }

  :deep(.el-date-editor) {
    width: 100%;
  }

  :deep(.el-alert) {
    padding: 10px 12px;
  }

  :deep(.el-alert__title) {
    font-size: 13px;
    line-height: 1.5;
  }
}

/* 小屏幕手机优化 */
@media (max-width: 480px) {
  :deep(.el-steps) {
    padding: 6px 0;
  }

  :deep(.el-step__title) {
    font-size: 11px;
    padding: 0 4px;
  }

  :deep(.el-step__head) {
    width: 20px;
    height: 20px;
  }

  :deep(.el-step__icon) {
    font-size: 11px;
  }
  
  :deep(.el-card__header) {
    padding: 8px 10px;
    font-size: 13px;
  }
  
  :deep(.el-card__body) {
    padding: 10px;
  }

  :deep(.el-progress-bar__outer) {
    height: 5px !important;
  }

  :deep(.el-progress__text) {
    font-size: 11px;
  }

  :deep(.el-dialog) {
    width: 98% !important;
    margin: 2vh auto;
  }

  :deep(.el-dialog__header) {
    padding: 10px 12px;
  }

  :deep(.el-dialog__title) {
    font-size: 15px;
  }

  :deep(.el-dialog__body) {
    padding: 10px 12px;
  }

  :deep(.el-button) {
    font-size: 12px;
    padding: 6px 12px;
  }

  :deep(.el-button--small) {
    padding: 5px 10px;
    font-size: 11px;
  }

  :deep(.el-alert) {
    padding: 8px 10px;
  }

  :deep(.el-alert__title) {
    font-size: 12px;
  }
}

.submit-btn {
  padding: 14px 32px;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
  transition: all 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(103, 194, 58, 0.4);
}

@media (max-width: 768px) {
  .submit-btn {
    padding: 12px 24px;
    font-size: 16px;
  }
}
</style>

