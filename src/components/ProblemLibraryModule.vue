<template>
  <div class="problem-library-module">
    <!-- 引导问题 -->
    <div class="guide-question">
      <div class="guide-icon">💡</div>
      <div class="guide-text">引导问题：今天遇到的新问题/卡点？记录到问题库，不一定要立即解决</div>
    </div>

    <div class="form-content space-y-6">
      <!-- 新问题 -->
      <div class="section">
        <h3 class="section-title">今天的新问题</h3>
        <div v-if="todayProblems.length === 0" class="empty-state">
          <el-empty description="今天还没有新问题" :image-size="80" />
        </div>
        <div v-else class="problems-list space-y-3">
          <div
            v-for="(problem, index) in todayProblems"
            :key="problem.问题ID"
            class="problem-card"
            :class="getPriorityClass(problem.优先级)"
          >
            <div class="problem-header">
              <div class="problem-info">
                <span class="problem-priority" :class="getPriorityBadgeClass(problem.优先级)">
                  {{ problem.优先级 }}
                </span>
                <span class="problem-category">{{ problem.问题分类 }}</span>
              </div>
              <div class="problem-actions">
                <el-switch
                  v-model="problem.是否解决"
                  active-text="已解决"
                  inactive-text="未解决"
                  size="small"
                />
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  circle
                  @click="removeProblem(index)"
                />
              </div>
            </div>
            <div class="problem-content">
              <el-input
                v-model="problem.问题描述"
                type="textarea"
                :rows="2"
                placeholder="问题描述"
                :maxlength="300"
                show-word-limit
              />
            </div>
          </div>
        </div>
        <el-button
          type="primary"
          :icon="Plus"
          @click="addProblem"
          class="w-full mt-4"
        >
          添加新问题
        </el-button>
      </div>

      <!-- 历史未解决问题 -->
      <div v-if="unsolvedProblems.length > 0" class="section">
        <h3 class="section-title">历史未解决问题</h3>
        <div class="problems-list space-y-3">
          <div
            v-for="(problem, index) in unsolvedProblems"
            :key="problem.问题ID"
            class="problem-card historical"
            :class="getPriorityClass(problem.优先级)"
          >
            <div class="problem-header">
              <div class="problem-info">
                <span class="problem-priority" :class="getPriorityBadgeClass(problem.优先级)">
                  {{ problem.优先级 }}
                </span>
                <span class="problem-category">{{ problem.问题分类 }}</span>
                <span class="problem-date">{{ formatDate(problem.创建时间) }}</span>
              </div>
              <div class="problem-actions">
                <el-switch
                  v-model="problem.是否解决"
                  active-text="已解决"
                  inactive-text="未解决"
                  size="small"
                />
              </div>
            </div>
            <div class="problem-content">
              <el-input
                v-model="problem.问题描述"
                type="textarea"
                :rows="2"
                placeholder="问题描述"
                :maxlength="300"
                show-word-limit
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { debounce } from 'lodash'
import { Plus, Delete } from '@element-plus/icons-vue'
import { getDefaultProblem } from '../utils/storage'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  allProblems: {
    type: Array,
    default: () => [] // 所有历史问题（从其他日期加载）
  }
})

const emit = defineEmits(['update:modelValue'])

// 初始化数据结构
function initLocalData() {
  if (props.modelValue && Array.isArray(props.modelValue) && props.modelValue.length > 0) {
    return JSON.parse(JSON.stringify(props.modelValue))
  }
  return []
}

const localData = ref(initLocalData())

// 今天的问题
const todayProblems = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return localData.value.filter(p => p.创建时间.startsWith(today))
})

// 历史未解决的问题（从allProblems传入）
const unsolvedProblems = computed(() => {
  if (!props.allProblems || !Array.isArray(props.allProblems)) {
    return []
  }
  return props.allProblems.filter(p => !p.是否解决)
})

// 添加问题
function addProblem() {
  const newProblem = getDefaultProblem()
  localData.value.push(newProblem)
  debouncedUpdateParent()
}

// 删除问题
function removeProblem(index) {
  // 找到在localData中的实际索引
  const today = new Date().toISOString().split('T')[0]
  const todayProblemsList = localData.value.filter(p => p.创建时间.startsWith(today))
  const problemToRemove = todayProblemsList[index]
  const actualIndex = localData.value.findIndex(p => p.问题ID === problemToRemove.问题ID)
  if (actualIndex !== -1) {
    localData.value.splice(actualIndex, 1)
    debouncedUpdateParent()
  }
}

// 获取优先级样式类
function getPriorityClass(priority) {
  if (priority === 'P0') return 'priority-p0'
  if (priority === 'P1') return 'priority-p1'
  return 'priority-p2'
}

function getPriorityBadgeClass(priority) {
  if (priority === 'P0') return 'badge-p0'
  if (priority === 'P1') return 'badge-p1'
  return 'badge-p2'
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

// 监听本地数据变化，更新父组件（使用防抖）
const debouncedUpdateParent = debounce(() => {
  emit('update:modelValue', [...localData.value])
}, 300)

watch(localData, () => {
  debouncedUpdateParent()
}, { deep: true })

// 当父组件的modelValue变化时，更新localData
watch(() => props.modelValue, (newVal) => {
  if (newVal && Array.isArray(newVal)) {
    localData.value = JSON.parse(JSON.stringify(newVal))
  }
}, { deep: true })

// 初始化时确保数据结构完整
onMounted(() => {
  if (!Array.isArray(localData.value)) {
    localData.value = []
  }
})
</script>

<style scoped>
.problem-library-module {
  @apply space-y-6;
}

.guide-question {
  @apply flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100 mb-4;
}

.guide-icon {
  @apply text-2xl;
}

.guide-text {
  @apply text-base font-semibold text-gray-700;
}

.form-content {
  @apply bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200/50;
}

.section {
  @apply space-y-4;
}

.section-title {
  @apply text-lg font-semibold text-gray-800 mb-4;
}

.empty-state {
  @apply py-4;
}

.problems-list {
  @apply space-y-3;
}

.problem-card {
  @apply rounded-lg p-4 border-2;
}

.problem-card.historical {
  @apply bg-gray-50 opacity-75;
}

.priority-p0 {
  @apply border-red-300 bg-red-50;
}

.priority-p1 {
  @apply border-orange-300 bg-orange-50;
}

.priority-p2 {
  @apply border-gray-300 bg-gray-50;
}

.problem-header {
  @apply flex items-center justify-between mb-3;
}

.problem-info {
  @apply flex items-center gap-2 flex-wrap;
}

.problem-priority {
  @apply px-2 py-1 rounded text-xs font-semibold;
}

.badge-p0 {
  @apply bg-red-500 text-white;
}

.badge-p1 {
  @apply bg-orange-500 text-white;
}

.badge-p2 {
  @apply bg-gray-500 text-white;
}

.problem-category {
  @apply text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded;
}

.problem-date {
  @apply text-xs text-gray-500;
}

.problem-actions {
  @apply flex items-center gap-2;
}

.problem-content {
  @apply mt-2;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-textarea__inner) {
  @apply bg-white;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .guide-question {
    @apply p-3;
  }

  .guide-text {
    @apply text-sm;
  }

  .form-content {
    @apply p-4;
  }

  .problem-card {
    @apply p-3;
  }

  .problem-header {
    @apply flex-col items-start gap-2;
  }

  .problem-actions {
    @apply w-full justify-end;
  }
}
</style>

