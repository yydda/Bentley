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
          type="default"
          @click="showHistoryDialog = true"
          :icon="Calendar"
          size="small"
          plain
        >
          <span class="hidden sm:inline">历史</span>
        </el-button>
        <el-button 
          type="default" 
          @click="handleExport" 
          :icon="Download" 
          size="small"
          plain
        >
          <span class="hidden md:inline">导出</span>
        </el-button>
        <el-button 
          type="primary"  
          @click="saveManually" 
          size="small"
          title="保存 (Ctrl+S / Cmd+S)"
          v-if="user"
        >
          <span class="hidden sm:inline">保存</span>
        </el-button>
        <el-button 
          type="success"  
          @click="handlePreview" 
          size="small"
          :icon="Check"
          v-if="user"
        >
          <span class="hidden sm:inline">预览</span>
        </el-button>
        <el-button 
          text 
          @click="showLoginDialog = true" 
          :icon="User" 
          size="small"
          v-if="!user"
        >
          <span class="hidden sm:inline">登录</span>
        </el-button>
        <el-avatar 
          v-else
          :src="user.photoURL" 
          :size="32"
          @click="showLoginDialog = true"
          class="cursor-pointer"
        >
          {{ user.displayName?.[0] || user.email?.[0] }}
        </el-avatar>
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
            <div class="text-sm text-gray-500">{{ dateSummaryMap[date] || '加载中...' }}</div>
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
      </div>
    </div>
    
    <!-- 登录对话框 -->
    <el-dialog
      v-model="showLoginDialog"
      title="登录与同步设置"
      width="90%"
      :max-width="500"
      :close-on-click-modal="false"
    >
      <Login @login="handleUserLogin" @logout="handleUserLogout" />
    </el-dialog>

    <!-- 预览总览弹窗 -->
    <el-dialog
      v-model="showOverviewDialog"
      title="日记预览"
      width="95%"
      :max-width="900"
      :close-on-click-modal="true"
      class="overview-dialog"
      @opened="handleOverviewOpened"
    >
      <div class="overview-content">
        <!-- 顶部装饰 -->
        <div class="celebration-header">
          <div class="celebration-animation">
            <span class="celebration-emoji">📝</span>
            <span class="celebration-emoji">✨</span>
            <span class="celebration-emoji">📊</span>
          </div>
          <h1 class="celebration-title">日记预览</h1>
          <p class="celebration-subtitle">{{ formatDate(currentDate) }} 的记录</p>
        </div>

        <!-- 鼓励文案 -->
        <el-card class="encouragement-card mb-4" shadow="hover">
          <div class="text-center py-3">
            <div class="text-3xl mb-2">{{ mainEncouragement.emoji }}</div>
            <div class="text-base font-semibold text-white">{{ mainEncouragement.message }}</div>
          </div>
        </el-card>

        <!-- 成就展示 -->
        <el-card v-if="overviewAchievements.length > 0" class="mb-4" shadow="hover">
          <template #header>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🏆</span>
              <span class="text-lg font-semibold">今日成就</span>
              <el-tag type="success" size="small">{{ overviewAchievements.length }} 项</el-tag>
            </div>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(achievement, index) in overviewAchievements"
              :key="index"
              class="achievement-item"
            >
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <div class="achievement-content">
                <div class="achievement-title">{{ achievement.title }}</div>
                <div class="achievement-desc">{{ achievement.description }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 数据统计 -->
        <el-card class="mb-4" shadow="hover">
          <template #header>
            <div class="flex items-center gap-2">
              <span class="text-2xl">📊</span>
              <span class="text-lg font-semibold">今日数据</span>
            </div>
          </template>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">时间总和</div>
              <div class="stat-value">{{ overviewStats.时间总和 }}<span class="stat-unit">小时</span></div>
            </div>
            <div class="stat-item">
              <div class="stat-label">满意度</div>
              <div class="stat-value">{{ overviewStats.满意度 }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">习惯数</div>
              <div class="stat-value">{{ overviewStats.习惯数 }}<span class="stat-unit">个</span></div>
            </div>
            <div class="stat-item">
              <div class="stat-label">项目进度</div>
              <div class="stat-value">{{ overviewStats.项目进度 }}<span class="stat-unit">%</span></div>
            </div>
            <div class="stat-item">
              <div class="stat-label">工作小时</div>
              <div class="stat-value">{{ overviewStats.工作小时 }}<span class="stat-unit">h</span></div>
            </div>
            <div class="stat-item">
              <div class="stat-label">新连接</div>
              <div class="stat-value">{{ overviewStats.新连接 }}<span class="stat-unit">个</span></div>
            </div>
          </div>
        </el-card>

        <!-- 连续天数 -->
        <el-card v-if="overviewStreak > 0" class="mb-4 streak-card" shadow="hover">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-600 mb-1">连续记录</div>
              <div class="text-3xl font-bold text-orange-500">{{ overviewStreak }} 天</div>
            </div>
            <div class="text-5xl">🔥</div>
          </div>
          <div class="mt-3 text-sm text-gray-500">
            <span v-if="overviewStreak >= 30">坚持一个月了，太厉害了！</span>
            <span v-else-if="overviewStreak >= 7">坚持一周了，继续保持！</span>
            <span v-else>继续坚持，形成习惯！</span>
          </div>
        </el-card>

        <!-- 快速操作 -->
        <el-card class="mb-4" shadow="hover">
          <template #header>
            <div class="flex items-center gap-2">
              <span class="text-2xl">⚡</span>
              <span class="text-lg font-semibold">快速操作</span>
            </div>
          </template>
          <div class="flex flex-col md:flex-row gap-3">
            <el-button
              type="primary"
              size="default"
              @click="handleOverviewExport"
              :icon="Download"
              class="flex-1"
            >
              导出Markdown
            </el-button>
            <el-button
              type="success"
              size="default"
              @click="handleNewDay"
              :icon="Calendar"
              class="flex-1"
            >
              新的一天
            </el-button>
            <el-button
              type="default"
              size="default"
              @click="showOverviewDialog = false"
              class="flex-1"
            >
              关闭
            </el-button>
          </div>
        </el-card>

        <!-- 鼓励提示 -->
        <div class="encouragement-tips">
          <div class="tip-item">
            <span class="tip-icon">💡</span>
            <span class="tip-text">每天记录，见证自己的成长</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">📈</span>
            <span class="tip-text">坚持记录，数据会告诉你答案</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">🎯</span>
            <span class="tip-text">设定目标，一步步实现梦想</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, ArrowLeft, ArrowRight, Calendar, Check, User } from '@element-plus/icons-vue'
import { getTodayDate, getDiaryData, saveDiaryData, getAllDates, getDefaultData } from '../utils/storage'
import { exportToMarkdown, downloadFile } from '../utils/export'
import { checkOverallComplete } from '../utils/validation'
import { onAuthChange, getCurrentUser, waitForAuth } from '../utils/firebaseAuth'
import { subscribeDiaryData } from '../utils/firebaseStorage'
import TimeSpend from '../components/TimeSpend.vue'
import LifeModule from '../components/LifeModule.vue'
import AmModule from '../components/AmModule.vue'
import LoveModule from '../components/LoveModule.vue'
import Login from '../components/Login.vue'

const currentDate = ref(getTodayDate())
const activeStep = ref(0)
const showHistoryDialog = ref(false)
const showLoginDialog = ref(false)
const user = ref(null)
const formData = ref({
  时间花销: {},
  LIFE: {},
  AM: {},
  LOVE: {}
})

// 历史记录日期列表
const historyDates = ref([])
// 日期摘要映射（缓存）
const dateSummaryMap = ref({})

// 日期导航
const canNavigatePrev = computed(() => {
  if (!Array.isArray(historyDates.value) || historyDates.value.length === 0) {
    return false
  }
  const currentIndex = historyDates.value.indexOf(currentDate.value)
  return currentIndex < historyDates.value.length - 1
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

// 获取日期摘要（异步）
async function getDateSummary(dateStr) {
  try {
    const data = await getDiaryData(dateStr)
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
  } catch (e) {
    console.error('获取日期摘要失败:', e)
    return '加载中...'
  }
}

// 选择历史日期
function selectHistoryDate(date) {
  currentDate.value = date
  showHistoryDialog.value = false
}

// 日期导航
function navigateDate(direction) {
  const dates = historyDates.value
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
// 记录上次保存的数据，用于比较是否有变化
const lastSavedData = ref(null)

// 加载数据（支持异步）
async function loadData(date = null) {
  const targetDate = date || currentDate.value
  editingDate.value = targetDate
  
  try {
    const data = await getDiaryData(targetDate)
    // 深拷贝避免引用问题
    const cleanData = JSON.parse(JSON.stringify(data))
    formData.value = cleanData
    
    // 更新上次保存的数据（用于比较变化）
    lastSavedData.value = cleanData
    
    // 如果已登录，设置实时监听
    if (user.value) {
      // 取消之前的监听
      if (window.currentDataUnsubscribe) {
        window.currentDataUnsubscribe()
      }
      
      // 设置新的监听
      try {
        window.currentDataUnsubscribe = subscribeDiaryData(
          user.value.uid,
          targetDate,
          (data) => {
            if (data) {
              // 移除Firebase的元数据
              const { date, updatedAt, ...diaryData } = data
              const cleanData = JSON.parse(JSON.stringify(diaryData))
              formData.value = cleanData
              // 更新上次保存的数据（来自其他设备的更新）
              lastSavedData.value = cleanData
            }
          }
        )
      } catch (e) {
        console.warn('设置实时监听失败:', e)
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败：' + error.message)
    // 使用默认数据
    formData.value = JSON.parse(JSON.stringify(getDefaultData()))
  }
}

// 比较两个数据对象是否相同（忽略Firebase的元数据）
function isDataChanged(newData, oldData) {
  if (!oldData) return true
  
  // 移除Firebase的元数据进行比较
  const cleanNewData = { ...newData }
  delete cleanNewData.date
  delete cleanNewData.updatedAt
  
  const cleanOldData = { ...oldData }
  delete cleanOldData.date
  delete cleanOldData.updatedAt
  
  return JSON.stringify(cleanNewData) !== JSON.stringify(cleanOldData)
}

// 手动保存（强制保存，忽略变化检测）
async function saveManually() {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  try {
    const currentData = JSON.parse(JSON.stringify(formData.value))
    await saveDiaryData(editingDate.value, currentData)
    lastSavedData.value = currentData
    ElMessage.success('数据已保存')
  } catch (error) {
    console.error('保存数据失败:', error)
    ElMessage.error('保存数据失败：' + error.message)
  }
}

// 防抖保存函数（支持异步，只在数据变化时保存）
let saveTimer = null
async function saveData(showMessage = false) {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  saveTimer = setTimeout(async () => {
    try {
      const currentData = JSON.parse(JSON.stringify(formData.value))
      
      // 检查数据是否有变化
      if (!isDataChanged(currentData, lastSavedData.value)) {
        // 数据没有变化，跳过保存
        return
      }
      
      // 使用editingDate确保保存到正确的日期
      await saveDiaryData(editingDate.value, currentData)
      
      // 更新上次保存的数据
      lastSavedData.value = currentData
      
      if (showMessage) {
        ElMessage.success('数据已保存')
      }
    } catch (error) {
      console.error('保存数据失败:', error)
      ElMessage.error('保存数据失败：' + error.message)
    }
  }, 1000) // 1秒防抖
}

// 立即保存（用于切换步骤时，也会检查变化）
async function saveDataImmediately() {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  try {
    const currentData = JSON.parse(JSON.stringify(formData.value))
    
    // 检查数据是否有变化
    if (!isDataChanged(currentData, lastSavedData.value)) {
      // 数据没有变化，跳过保存
      return
    }
    
    // 使用editingDate确保保存到正确的日期
    await saveDiaryData(editingDate.value, currentData)
    
    // 更新上次保存的数据
    lastSavedData.value = currentData
  } catch (error) {
    console.error('保存数据失败:', error)
    ElMessage.error('保存数据失败：' + error.message)
  }
}

// 日期变化
async function handleDateChange(newDate) {
  if (newDate && newDate !== editingDate.value) {
    // 先保存当前日期的数据（如果数据有变化）
    await saveDataImmediately()
    // 重置上次保存的数据（切换日期后需要重新比较）
    lastSavedData.value = null
    // 加载新日期的数据
    await loadData(newDate)
    activeStep.value = 0
    ElMessage.info(`已切换到 ${formatDate(newDate)}`)
  }
}

// 步骤点击（支持直接跳转）
async function handleStepClick(index) {
  if (index !== activeStep.value) {
    await saveDataImmediately()
    activeStep.value = index
  }
}

// 下一步
async function handleNext() {
  if (activeStep.value < 3) {
    await saveDataImmediately()
    activeStep.value++
  }
}

// 上一步
async function handlePrev() {
  if (activeStep.value > 0) {
    await saveDataImmediately()
    activeStep.value--
  }
}

// 完成
async function handleComplete() {
  await saveDataImmediately()
  ElMessage.success('日记填写完成！')
}

// 提交日记相关状态
const showOverviewDialog = ref(false)
const overviewAchievements = ref([])
const overviewStats = ref({})
const overviewStreak = ref(0)
const overviewEncouragements = ref([])

const mainEncouragement = computed(() => {
  return overviewEncouragements.value[0] || {
    type: 'normal',
    message: '记录本身就是一种成长，继续加油！',
    emoji: '💪'
  }
})

// 预览日记（打开总览弹窗）
async function handlePreview() {
  await saveDataImmediately()
  showOverviewDialog.value = true
}

// 弹窗打开后计算数据
async function handleOverviewOpened() {
  // 计算成就
  overviewAchievements.value = calculateAchievements(formData.value, currentDate.value)
  
  // 计算统计数据
  overviewStats.value = calculateStats(formData.value)
  
  // 计算鼓励信息
  overviewEncouragements.value = generateEncouragement(overviewAchievements.value, overviewStats.value)
  
  // 计算连续天数
  try {
    const dates = await getAllDates()
    overviewStreak.value = calculateStreak(dates || [])
  } catch (e) {
    console.error('加载日期列表失败:', e)
    overviewStreak.value = 0
  }
  
  // 添加庆祝动画效果
  setTimeout(() => {
    const emojis = document.querySelectorAll('.celebration-emoji')
    emojis.forEach((emoji, index) => {
      setTimeout(() => {
        emoji.style.animation = 'bounce 0.6s ease-in-out'
      }, index * 100)
    })
  }, 100)
}

// 导出（在总览弹窗中）
function handleOverviewExport() {
  const markdown = exportToMarkdown(currentDate.value, formData.value)
  const filename = `日记_${currentDate.value}.md`
  downloadFile(markdown, filename, 'text/markdown')
  ElMessage.success('导出成功！')
}

// 新的一天
function handleNewDay() {
  showOverviewDialog.value = false
  // 切换到今天
  currentDate.value = getTodayDate()
}

// 导出
async function handleExport() {
  await saveDataImmediately() // 导出前先保存
  const markdown = exportToMarkdown(currentDate.value, formData.value)
  const filename = `日记_${currentDate.value}.md`
  downloadFile(markdown, filename, 'text/markdown')
  ElMessage.success('导出成功！')
}

// 用户登录
function handleUserLogin(userData) {
  user.value = userData
  showLoginDialog.value = false
  // 重新加载数据
  loadData()
}

// 用户登出
function handleUserLogout() {
  user.value = null
  showLoginDialog.value = false
  // 取消Firebase监听
  if (window.currentDataUnsubscribe) {
    window.currentDataUnsubscribe()
    window.currentDataUnsubscribe = null
  }
  // 取消日期列表监听
  if (window.datesUnsubscribe) {
    window.datesUnsubscribe()
    window.datesUnsubscribe = null
  }
  // 清空数据
  historyDates.value = []
  formData.value = JSON.parse(JSON.stringify(getDefaultData()))
  lastSavedData.value = null
}

// 监听日期变化
watch(currentDate, async (newDate) => {
  await handleDateChange(newDate)
})

// 更新历史记录列表
async function updateHistoryDates() {
  try {
    const dates = await getAllDates()
    historyDates.value = dates
    
    // 异步加载所有日期的摘要
    dates.forEach(async (date) => {
      if (!dateSummaryMap.value[date]) {
        dateSummaryMap.value[date] = await getDateSummary(date)
      }
    })
  } catch (e) {
    console.error('加载日期列表失败:', e)
    historyDates.value = []
  }
}

// 监听键盘快捷键（Ctrl+S / Cmd+S）
function handleKeydown(event) {
  // Ctrl+S (Windows/Linux) 或 Cmd+S (Mac)
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault() // 阻止浏览器默认保存行为
    if (user.value) {
      saveManually()
    }
  }
}

// 监听认证状态
onMounted(async () => {
  // 先等待认证状态初始化
  user.value = await waitForAuth()
  
  // 初始化加载数据
  await loadData()
  await updateHistoryDates()
  
  // 添加键盘快捷键监听
  window.addEventListener('keydown', handleKeydown)
  
  // 继续监听认证状态变化
  onAuthChange((currentUser) => {
    user.value = currentUser
    if (currentUser) {
      // 用户登录后重新加载数据
      loadData()
      updateHistoryDates()
      
      // 监听日期列表变化
      // 取消之前的监听
      if (window.datesUnsubscribe) {
        window.datesUnsubscribe()
      }
      import('../utils/firebaseStorage').then(({ subscribeAllDates }) => {
        window.datesUnsubscribe = subscribeAllDates(currentUser.uid, (dates) => {
          historyDates.value = dates
        })
      })
    } else {
      // 用户登出后清空列表
      historyDates.value = []
    }
  })
  
  // 如果已经登录，监听日期列表变化
  if (user.value) {
    const { subscribeAllDates } = await import('../utils/firebaseStorage')
    window.datesUnsubscribe = subscribeAllDates(user.value.uid, (dates) => {
      historyDates.value = dates
    })
  }
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (window.currentDataUnsubscribe) {
    window.currentDataUnsubscribe()
  }
  if (window.datesUnsubscribe) {
    window.datesUnsubscribe()
  }
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

/* 总览弹窗样式 */
.overview-dialog :deep(.el-dialog__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.overview-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.overview-content {
  max-height: 75vh;
  overflow-y: auto;
  padding: 0;
}

.celebration-header {
  text-align: center;
  padding: 1.5rem 0 1rem 0;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  margin: -20px -20px 1.5rem -20px;
  border-radius: 8px 8px 0 0;
}

.celebration-animation {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.celebration-emoji {
  font-size: 2rem;
  display: inline-block;
  animation: float 2s ease-in-out infinite;
}

.celebration-emoji:nth-child(2) {
  animation-delay: 0.2s;
}

.celebration-emoji:nth-child(3) {
  animation-delay: 0.4s;
}

.celebration-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.celebration-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

.encouragement-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.encouragement-card :deep(.el-card__body) {
  color: white;
  padding: 16px;
}

.encouragement-card :deep(.el-card__body) .text-gray-800 {
  color: white !important;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #e5e7eb;
}

.achievement-item:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.achievement-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.achievement-desc {
  font-size: 0.875rem;
  color: #6b7280;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.875rem;
}

.stat-item {
  text-align: center;
  padding: 0.875rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
}

.stat-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
}

.stat-unit {
  font-size: 0.875rem;
  font-weight: normal;
  color: #6b7280;
  margin-left: 0.25rem;
}

.streak-card {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
}

.streak-card :deep(.el-card__body) {
  color: white;
  padding: 16px;
}

.streak-card :deep(.el-card__body) .text-gray-600,
.streak-card :deep(.el-card__body) .text-gray-500 {
  color: rgba(255, 255, 255, 0.9) !important;
}

.streak-card :deep(.el-card__body) .text-orange-500 {
  color: white !important;
}

.encouragement-tips {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.tip-icon {
  font-size: 1.125rem;
}

.tip-text {
  flex: 1;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.1);
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .celebration-title {
    font-size: 1.25rem;
  }

  .celebration-emoji {
    font-size: 1.75rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-value {
    font-size: 1.125rem;
  }

  .achievement-item {
    padding: 0.75rem;
  }

  .achievement-icon {
    font-size: 1.5rem;
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

