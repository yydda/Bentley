<template>
  <div class="habit-tracking-module">
    <!-- 引导问题 -->
    <div class="guide-question">
      <div class="guide-icon">💡</div>
      <div class="guide-text">引导问题：今天的习惯执行情况？哪些习惯真正对主线推进有帮助？</div>
    </div>

    <div class="form-content space-y-6">
      <!-- 习惯列表 -->
      <div v-if="localData.length === 0" class="empty-state">
        <el-empty description="还没有添加习惯" :image-size="100">
          <el-button type="primary" :icon="Plus" @click="addHabit">
            添加新习惯
          </el-button>
        </el-empty>
      </div>

      <div v-else class="habits-list space-y-4">
        <div
          v-for="(habit, index) in localData"
          :key="habit.习惯ID"
          class="habit-card"
          :class="{ 'habit-executed': habit.是否执行 }"
        >
          <div class="habit-header">
            <div class="habit-info">
              <el-checkbox
                v-model="habit.是否执行"
                class="habit-checkbox"
              />
              <el-input
                v-model="habit.习惯名称"
                placeholder="输入习惯名称"
                class="habit-name-input"
                :maxlength="50"
                show-word-limit
              />
              <span v-if="habit.连续天数 > 0" class="streak-badge" :class="getStreakClass(habit.连续天数)">
                {{ habit.连续天数 }}天 🔥
              </span>
            </div>
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              circle
              @click="removeHabit(index)"
            />
          </div>

          <div v-if="habit.是否执行" class="habit-details">
            <el-form-item label="关联主线" label-width="120px">
              <el-select
                v-model="habit.关联主线"
                placeholder="选择这个习惯是为了推进哪条主线"
                class="w-full"
                clearable
              >
                <el-option
                  v-for="thread in availableThreads"
                  :key="thread.主线ID"
                  :label="thread.主线名称"
                  :value="thread.主线ID"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="执行感受" label-width="120px">
              <el-input
                v-model="habit.执行感受"
                type="textarea"
                :rows="2"
                placeholder="今天执行这个习惯的感受如何？"
                :maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </div>
        </div>
      </div>

      <el-button
        type="primary"
        :icon="Plus"
        @click="addHabit"
        class="w-full"
      >
        添加新习惯
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { debounce } from 'lodash'
import { Plus, Delete } from '@element-plus/icons-vue'
import { getDefaultHabit } from '../utils/storage'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  lifeThreads: {
    type: Array,
    default: () => []
  },
  allHabitsHistory: {
    type: Object,
    default: () => ({}) // { habitId: { 连续天数, 最后执行日期 } }
  }
})

const emit = defineEmits(['update:modelValue'])

// 可用的主线（只显示激活的）
const availableThreads = computed(() => {
  return props.lifeThreads.filter(thread => thread.是否激活)
})

// 初始化数据结构
function initLocalData() {
  if (props.modelValue && Array.isArray(props.modelValue) && props.modelValue.length > 0) {
    const data = JSON.parse(JSON.stringify(props.modelValue))
    // 更新连续天数
    data.forEach(habit => {
      if (props.allHabitsHistory[habit.习惯ID]) {
        habit.连续天数 = props.allHabitsHistory[habit.习惯ID].连续天数 || 0
      }
    })
    return data
  }
  return []
}

const localData = ref(initLocalData())
// 标记是否正在更新，避免循环更新
const isUpdating = ref(false)

// 添加习惯
function addHabit() {
  const newHabit = getDefaultHabit()
  localData.value.push(newHabit)
  debouncedUpdateParent()
}

// 删除习惯
function removeHabit(index) {
  localData.value.splice(index, 1)
  debouncedUpdateParent()
}

// 获取连续天数样式
function getStreakClass(days) {
  if (days >= 30) return 'streak-excellent'
  if (days >= 14) return 'streak-good'
  if (days >= 7) return 'streak-normal'
  return 'streak-low'
}

// 监听习惯执行状态变化，更新连续天数
watch(() => localData.value, (newVal) => {
  if (isUpdating.value) return
  
  newVal.forEach(habit => {
    if (habit.是否执行) {
      // 如果今天执行了，连续天数+1（实际应该从历史数据计算，这里简化处理）
      const history = props.allHabitsHistory[habit.习惯ID]
      if (history) {
        const lastDate = new Date(history.最后执行日期)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        lastDate.setHours(0, 0, 0, 0)
        
        const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))
        if (daysDiff === 1) {
          // 连续执行
          habit.连续天数 = (history.连续天数 || 0) + 1
        } else if (daysDiff === 0) {
          // 同一天，不增加
          habit.连续天数 = history.连续天数 || 0
        } else {
          // 中断了，重新开始
          habit.连续天数 = 1
        }
      } else {
        // 第一次执行
        habit.连续天数 = 1
      }
    }
  })
  debouncedUpdateParent()
}, { deep: true })

// 监听本地数据变化，更新父组件（使用防抖）
const debouncedUpdateParent = debounce(() => {
  if (!isUpdating.value) {
    emit('update:modelValue', [...localData.value])
  }
}, 300)

// 当父组件的modelValue变化时，更新localData
watch(() => props.modelValue, (newVal) => {
  // 避免循环更新
  if (isUpdating.value) return
  
  // 深度比较，避免不必要的更新
  const currentStr = JSON.stringify(localData.value)
  const newStr = JSON.stringify(newVal && Array.isArray(newVal) ? newVal : [])
  
  if (currentStr !== newStr) {
    isUpdating.value = true
    try {
      if (newVal && Array.isArray(newVal) && newVal.length > 0) {
        const data = JSON.parse(JSON.stringify(newVal))
        // 更新连续天数
        data.forEach(habit => {
          if (props.allHabitsHistory[habit.习惯ID]) {
            habit.连续天数 = props.allHabitsHistory[habit.习惯ID].连续天数 || 0
          }
        })
        localData.value = data
      } else {
        localData.value = []
      }
    } finally {
      // 使用nextTick确保更新完成后再重置标志
      setTimeout(() => {
        isUpdating.value = false
      }, 100)
    }
  }
}, { deep: true, immediate: true })

// 初始化时确保数据结构完整
onMounted(() => {
  if (!Array.isArray(localData.value)) {
    localData.value = []
  }
  // 确保初始数据同步
  if (props.modelValue && Array.isArray(props.modelValue)) {
    const currentStr = JSON.stringify(localData.value)
    const propStr = JSON.stringify(props.modelValue)
    if (currentStr !== propStr) {
      const data = JSON.parse(JSON.stringify(props.modelValue))
      data.forEach(habit => {
        if (props.allHabitsHistory[habit.习惯ID]) {
          habit.连续天数 = props.allHabitsHistory[habit.习惯ID].连续天数 || 0
        }
      })
      localData.value = data
    }
  }
})
</script>

<style scoped>
.habit-tracking-module {
  @apply space-y-6;
}

.guide-question {
  @apply flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100 mb-4;
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

.empty-state {
  @apply py-8;
}

.habits-list {
  @apply space-y-4;
}

.habit-card {
  @apply bg-white rounded-lg p-4 border-2 border-gray-200;
}

.habit-card.habit-executed {
  @apply border-green-300 bg-green-50;
}

.habit-header {
  @apply flex items-center justify-between mb-3;
}

.habit-info {
  @apply flex items-center gap-3 flex-1;
}

.habit-checkbox {
  @apply flex-shrink-0;
}

.habit-name-input {
  @apply flex-1;
}

.streak-badge {
  @apply px-2 py-1 rounded text-xs font-semibold;
}

.streak-excellent {
  @apply bg-purple-500 text-white;
}

.streak-good {
  @apply bg-blue-500 text-white;
}

.streak-normal {
  @apply bg-green-500 text-white;
}

.streak-low {
  @apply bg-gray-400 text-white;
}

.habit-details {
  @apply mt-3 pt-3 border-t border-gray-200;
}

:deep(.el-form-item) {
  margin-bottom: 1rem;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
  font-size: 15px;
}

:deep(.el-checkbox__label) {
  font-weight: 600;
  font-size: 16px;
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

  .habit-card {
    @apply p-3;
  }

  .habit-header {
    @apply flex-col items-start gap-2;
  }

  .habit-info {
    @apply w-full flex-col items-start gap-2;
  }
  
  .habit-name-input {
    @apply w-full;
  }

  :deep(.el-form-item) {
    flex-direction: column;
    align-items: flex-start;
  }

  :deep(.el-form-item__label) {
    width: 100% !important;
    margin-bottom: 8px;
    text-align: left;
  }

  :deep(.el-form-item__content) {
    width: 100%;
    margin-left: 0 !important;
  }
}
</style>

