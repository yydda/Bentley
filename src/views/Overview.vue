<template>
  <div class="overview-page min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
    <!-- 顶部装饰 -->
    <div class="celebration-header">
      <div class="celebration-animation">
        <span class="celebration-emoji">🎉</span>
        <span class="celebration-emoji">✨</span>
        <span class="celebration-emoji">🌟</span>
      </div>
      <h1 class="celebration-title">日记提交成功！</h1>
      <p class="celebration-subtitle">{{ formatDateUtil(date) }} 的记录已保存</p>
    </div>

    <div class="container mx-auto px-4 py-6 max-w-4xl">
      <!-- 鼓励文案 -->
      <el-card class="encouragement-card mb-6" shadow="hover">
        <div class="text-center py-4">
          <div class="text-4xl mb-2">{{ mainEncouragement.emoji }}</div>
          <div class="text-lg font-semibold text-gray-800">{{ mainEncouragement.message }}</div>
        </div>
      </el-card>

      <!-- 成就展示 -->
      <el-card v-if="achievements.length > 0" class="mb-6" shadow="hover">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🏆</span>
            <span class="text-lg font-semibold">今日成就</span>
            <el-tag type="success" size="small">{{ achievements.length }} 项</el-tag>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(achievement, index) in achievements"
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
      <el-card class="mb-6" shadow="hover">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="text-2xl">📊</span>
            <span class="text-lg font-semibold">今日数据</span>
          </div>
        </template>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">时间总和</div>
            <div class="stat-value">{{ stats.时间总和 }}<span class="stat-unit">小时</span></div>
          </div>
          <div class="stat-item">
            <div class="stat-label">满意度</div>
            <div class="stat-value">{{ stats.满意度 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">习惯数</div>
            <div class="stat-value">{{ stats.习惯数 }}<span class="stat-unit">个</span></div>
          </div>
          <div class="stat-item">
            <div class="stat-label">项目进度</div>
            <div class="stat-value">{{ stats.项目进度 }}<span class="stat-unit">%</span></div>
          </div>
          <div class="stat-item">
            <div class="stat-label">工作小时</div>
            <div class="stat-value">{{ stats.工作小时 }}<span class="stat-unit">h</span></div>
          </div>
          <div class="stat-item">
            <div class="stat-label">新连接</div>
            <div class="stat-value">{{ stats.新连接 }}<span class="stat-unit">个</span></div>
          </div>
        </div>
      </el-card>

      <!-- 连续天数 -->
      <el-card v-if="streak > 0" class="mb-6 streak-card" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-600 mb-1">连续记录</div>
            <div class="text-3xl font-bold text-orange-500">{{ streak }} 天</div>
          </div>
          <div class="text-5xl">🔥</div>
        </div>
        <div class="mt-3 text-sm text-gray-500">
          <span v-if="streak >= 30">坚持一个月了，太厉害了！</span>
          <span v-else-if="streak >= 7">坚持一周了，继续保持！</span>
          <span v-else>继续坚持，形成习惯！</span>
        </div>
      </el-card>

      <!-- 快速操作 -->
      <el-card class="mb-6" shadow="hover">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="text-2xl">⚡</span>
            <span class="text-lg font-semibold">快速操作</span>
          </div>
        </template>
        <div class="flex flex-col md:flex-row gap-3">
          <el-button
            type="primary"
            size="large"
            @click="handleExport"
            :icon="Download"
            class="flex-1"
          >
            导出Markdown
          </el-button>
          <el-button
            type="default"
            size="large"
            @click="handleBack"
            :icon="ArrowLeft"
            class="flex-1"
          >
            返回编辑
          </el-button>
          <el-button
            type="success"
            size="large"
            @click="handleNewDay"
            :icon="Calendar"
            class="flex-1"
          >
            新的一天
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Download, ArrowLeft, Calendar } from '@element-plus/icons-vue'
import { formatDate as formatDateUtil } from '../utils/date'
import { calculateAchievements, calculateStats, generateEncouragement, calculateStreak } from '../utils/gamification'
import { getAllDates, getDiaryData } from '../utils/storage'
import { exportToMarkdown, downloadFile } from '../utils/export'

const router = useRouter()
const route = useRoute()

const date = ref(route.query.date || new Date().toISOString().split('T')[0])
const formData = ref({})

const achievements = computed(() => {
  return calculateAchievements(formData.value, date.value)
})

const stats = computed(() => {
  return calculateStats(formData.value)
})

const encouragements = computed(() => {
  return generateEncouragement(achievements.value, stats.value)
})

const mainEncouragement = computed(() => {
  return encouragements.value[0] || {
    type: 'normal',
    message: '记录本身就是一种成长，继续加油！',
    emoji: '💪'
  }
})

const streak = computed(() => {
  const dates = getAllDates()
  return calculateStreak(dates)
})

// 导出
function handleExport() {
  const markdown = exportToMarkdown(date.value, formData.value)
  const filename = `日记_${date.value}.md`
  downloadFile(markdown, filename, 'text/markdown')
  ElMessage.success('导出成功！')
}

// 返回编辑
function handleBack() {
  router.push({
    path: '/',
    query: { date: date.value }
  })
}

// 新的一天
function handleNewDay() {
  router.push('/')
}

onMounted(() => {
  // 加载数据
  try {
    if (route.query.data) {
      formData.value = JSON.parse(decodeURIComponent(route.query.data))
    } else {
      // 如果没有传递数据，从存储中加载
      formData.value = getDiaryData(date.value)
    }
  } catch (e) {
    console.error('加载数据失败:', e)
    ElMessage.error('加载数据失败')
    // 如果加载失败，尝试从存储加载
    try {
      formData.value = getDiaryData(date.value)
    } catch (e2) {
      console.error('从存储加载也失败:', e2)
    }
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
})
</script>

<style scoped>
.overview-page {
  padding-top: 2rem;
}

.celebration-header {
  text-align: center;
  padding: 2rem 1rem;
  position: relative;
}

.celebration-animation {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.celebration-emoji {
  font-size: 3rem;
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
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.celebration-subtitle {
  font-size: 1rem;
  color: #6b7280;
}

.encouragement-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.encouragement-card :deep(.el-card__body) {
  color: white;
}

.encouragement-card :deep(.el-card__body) .encouragement-text {
  color: white !important;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.3s;
}

.achievement-item:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.achievement-icon {
  font-size: 2.5rem;
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
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
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.tip-icon {
  font-size: 1.25rem;
}

.tip-text {
  flex: 1;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.2);
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .celebration-title {
    font-size: 1.5rem;
  }

  .celebration-emoji {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .achievement-item {
    padding: 0.75rem;
  }

  .achievement-icon {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .celebration-title {
    font-size: 1.25rem;
  }

  .celebration-emoji {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-value {
    font-size: 1.125rem;
  }
}
</style>

