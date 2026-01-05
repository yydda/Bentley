<template>
  <div class="tomorrow-plan-module">
    <!-- 引导问题 -->
    <div class="guide-question">
      <div class="guide-icon">💡</div>
      <div class="guide-text">引导问题：明天最重要的事是什么？如何安排时间？</div>
    </div>

    <!-- 明日计划列表 -->
    <div class="form-section">
      <div class="section-header">
        <span class="section-icon">📅</span>
        <span class="section-title">明日计划</span>
      </div>
      <div class="form-content">
        <div v-if="localData.计划列表.length === 0" class="empty-state">
          <el-empty description="还没有添加计划" :image-size="100">
            <el-button type="primary" :icon="Plus" @click="addPlan">
              添加新计划
            </el-button>
          </el-empty>
        </div>

        <div v-else class="plans-list space-y-4">
          <div
            v-for="(plan, index) in localData.计划列表"
            :key="plan.计划ID"
            class="plan-item"
          >
            <div class="plan-header">
              <span class="plan-number">计划 #{{ index + 1 }}</span>
              <el-button
                type="danger"
                :icon="Delete"
                circle
                size="small"
                @click="removePlan(index)"
              />
            </div>
            <div class="plan-content">
              <el-form-item label="任务内容" label-width="120px" required>
                <el-input
                  v-model="plan.任务内容"
                  placeholder="明天要做什么？"
                  :maxlength="100"
                  show-word-limit
                />
              </el-form-item>
              
              <el-form-item label="时间安排" label-width="120px">
                <div class="time-range-picker">
                  <el-time-picker
                    v-model="plan.开始时间"
                    placeholder="开始时间"
                    format="HH:mm"
                    value-format="HH:mm"
                    class="time-picker-start"
                    :clearable="true"
                  />
                  <span class="time-separator">至</span>
                  <el-time-picker
                    v-model="plan.结束时间"
                    placeholder="结束时间"
                    format="HH:mm"
                    value-format="HH:mm"
                    class="time-picker-end"
                    :clearable="true"
                  />
                </div>
                <div class="time-hint">
                  <el-button 
                    text 
                    size="small" 
                    @click="setQuickTime(plan, 'morning')"
                    class="quick-time-btn"
                  >
                    早上
                  </el-button>
                  <el-button 
                    text 
                    size="small" 
                    @click="setQuickTime(plan, 'afternoon')"
                    class="quick-time-btn"
                  >
                    下午
                  </el-button>
                  <el-button 
                    text 
                    size="small" 
                    @click="setQuickTime(plan, 'evening')"
                    class="quick-time-btn"
                  >
                    晚上
                  </el-button>
                </div>
              </el-form-item>

              <el-form-item label="关联主线" label-width="120px">
                <el-select
                  v-model="plan.关联主线"
                  placeholder="选择这个计划是为了推进哪条主线"
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

              <el-form-item label="计划状态" label-width="120px">
                <el-select
                  v-model="plan.计划状态"
                  placeholder="选择计划状态"
                  class="w-full"
                >
                  <el-option label="新计划" value="新计划" />
                  <el-option label="延续昨日" value="延续昨日" />
                  <el-option label="调整优化" value="调整优化" />
                  <el-option label="紧急重要" value="紧急重要" />
                </el-select>
              </el-form-item>

              <el-form-item label="预计时间" label-width="120px">
                <div class="flex items-center gap-2">
                  <el-input-number
                    v-model="plan.预计时间"
                    :min="0"
                    :max="24"
                    :precision="1"
                    :step="0.5"
                    controls-position="right"
                    class="flex-1"
                    placeholder="0"
                  />
                  <span class="unit-text">小时</span>
                </div>
              </el-form-item>

              <el-form-item label="备注" label-width="120px">
                <el-input
                  v-model="plan.备注"
                  type="textarea"
                  :rows="2"
                  placeholder="其他说明..."
                  :maxlength="200"
                  show-word-limit
                />
              </el-form-item>
            </div>
          </div>

          <el-button
            type="primary"
            :icon="Plus"
            @click="addPlan"
            class="w-full"
            plain
          >
            添加新计划
          </el-button>
        </div>
      </div>
    </div>

    <!-- 明日承诺（必填） -->
    <div class="summary-section">
      <div class="summary-label">
        <span class="required-mark">*</span>
        <span>明日承诺：如果明天重来，我会怎么过？</span>
      </div>
      <el-input
        v-model="localData.承诺"
        type="textarea"
        :rows="4"
        placeholder="请用200字以内描述理想的一天安排（时间+重点+心态）..."
        :maxlength="200"
        show-word-limit
        class="summary-input"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { debounce } from 'lodash'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      计划列表: [],
      承诺: ''
    })
  },
  lifeThreads: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'next'])

// 可用的主线（只显示激活的）
const availableThreads = computed(() => {
  return props.lifeThreads.filter(thread => thread.是否激活)
})

// 初始化数据结构，确保所有嵌套对象都存在
function initLocalData() {
  const defaultData = {
    计划列表: [],
    承诺: ''
  }
  
  // 深度合并默认数据和传入的数据
  const merged = JSON.parse(JSON.stringify(defaultData))
  if (props.modelValue) {
    // 兼容旧数据结构（MIT）
    if (props.modelValue.MIT && Array.isArray(props.modelValue.MIT)) {
      // 迁移旧数据到新结构
      merged.计划列表 = props.modelValue.MIT.map(mit => ({
        计划ID: `plan_${Date.now()}_${Math.random()}`,
        任务内容: mit.任务 || '',
        开始时间: '',
        结束时间: '',
        关联主线: mit.关联主线 || '',
        计划状态: '新计划',
        预计时间: mit.预计时间 || 0,
        备注: mit.重要性原因 || ''
      }))
    } else if (props.modelValue.计划列表) {
      merged.计划列表 = Array.isArray(props.modelValue.计划列表) 
        ? [...props.modelValue.计划列表] 
        : []
    }
    if (props.modelValue.承诺 !== undefined) {
      merged.承诺 = props.modelValue.承诺
    }
  }
  
  return merged
}

const localData = ref(initLocalData())
// 标记是否正在更新，避免循环更新
const isUpdating = ref(false)

// 添加计划
function addPlan() {
  if (!localData.value.计划列表) {
    localData.value.计划列表 = []
  }
  localData.value.计划列表.push({
    计划ID: `plan_${Date.now()}_${Math.random()}`,
    任务内容: '',
    开始时间: '',
    结束时间: '',
    关联主线: '',
    计划状态: '新计划',
    预计时间: 0,
    备注: ''
  })
  debouncedUpdateParent()
}

// 删除计划
function removePlan(index) {
  localData.value.计划列表.splice(index, 1)
  debouncedUpdateParent()
}

// 快速设置时间段
function setQuickTime(plan, type) {
  const timeRanges = {
    morning: { start: '08:00', end: '12:00' },
    afternoon: { start: '14:00', end: '18:00' },
    evening: { start: '19:00', end: '22:00' }
  }
  
  const range = timeRanges[type]
  if (range) {
    plan.开始时间 = range.start
    plan.结束时间 = range.end
    // 计算预计时间
    const [startHour, startMin] = range.start.split(':').map(Number)
    const [endHour, endMin] = range.end.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    plan.预计时间 = Math.round(((endMinutes - startMinutes) / 60) * 10) / 10
    debouncedUpdateParent()
  }
}

// 监听本地数据变化，更新父组件（使用防抖）
const debouncedUpdateParent = debounce(() => {
  if (!isUpdating.value) {
    emit('update:modelValue', { ...localData.value })
  }
}, 300)

watch(localData, () => {
  debouncedUpdateParent()
}, { deep: true })

// 当父组件的modelValue变化时，更新localData
watch(() => props.modelValue, (newVal) => {
  // 避免循环更新
  if (isUpdating.value) return
  
  // 深度比较，避免不必要的更新
  const currentStr = JSON.stringify(localData.value)
  const newStr = JSON.stringify(newVal || { 计划列表: [], 承诺: '' })
  
  if (currentStr !== newStr) {
    isUpdating.value = true
    try {
      if (newVal) {
        // 兼容旧数据结构（MIT）
        if (newVal.MIT && Array.isArray(newVal.MIT)) {
          localData.value.计划列表 = newVal.MIT.map(mit => ({
            计划ID: `plan_${Date.now()}_${Math.random()}`,
            任务内容: mit.任务 || '',
            开始时间: '',
            结束时间: '',
            关联主线: mit.关联主线 || '',
            计划状态: '新计划',
            预计时间: mit.预计时间 || 0,
            备注: mit.重要性原因 || ''
          }))
        } else if (newVal.计划列表) {
          // 迁移旧数据格式（时间段 -> 开始时间/结束时间）
          localData.value.计划列表 = Array.isArray(newVal.计划列表) 
            ? newVal.计划列表.map(plan => {
                // 如果存在旧的时间段字段，迁移到新的开始时间/结束时间
                if (plan.时间段 && !plan.开始时间 && !plan.结束时间) {
                  const timeMap = {
                    '早上': { start: '06:00', end: '09:00' },
                    '上午': { start: '09:00', end: '12:00' },
                    '中午': { start: '12:00', end: '14:00' },
                    '下午': { start: '14:00', end: '18:00' },
                    '晚上': { start: '18:00', end: '22:00' },
                    '深夜': { start: '22:00', end: '24:00' }
                  }
                  const timeRange = timeMap[plan.时间段]
                  if (timeRange) {
                    plan.开始时间 = timeRange.start
                    plan.结束时间 = timeRange.end
                  }
                  delete plan.时间段
                }
                // 确保新字段存在
                if (!plan.开始时间) plan.开始时间 = ''
                if (!plan.结束时间) plan.结束时间 = ''
                return plan
              })
            : []
        } else {
          localData.value.计划列表 = []
        }
        if (newVal.承诺 !== undefined) {
          localData.value.承诺 = newVal.承诺
        } else {
          localData.value.承诺 = ''
        }
      } else {
        localData.value = {
          计划列表: [],
          承诺: ''
        }
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
  if (!localData.value.计划列表) {
    localData.value.计划列表 = []
  }
  if (localData.value.承诺 === undefined || localData.value.承诺 === null) {
    localData.value.承诺 = ''
  }
  // 确保初始数据同步
  if (props.modelValue) {
    const currentStr = JSON.stringify(localData.value)
    const propStr = JSON.stringify(props.modelValue)
    if (currentStr !== propStr) {
      // 兼容旧数据结构
      if (props.modelValue.MIT && Array.isArray(props.modelValue.MIT)) {
        localData.value.计划列表 = props.modelValue.MIT.map(mit => ({
          计划ID: `plan_${Date.now()}_${Math.random()}`,
          任务内容: mit.任务 || '',
          开始时间: '',
          结束时间: '',
          关联主线: mit.关联主线 || '',
          计划状态: '新计划',
          预计时间: mit.预计时间 || 0,
          备注: mit.重要性原因 || ''
        }))
      } else if (props.modelValue.计划列表) {
        // 迁移旧数据格式（时间段 -> 开始时间/结束时间）
        localData.value.计划列表 = Array.isArray(props.modelValue.计划列表) 
          ? props.modelValue.计划列表.map(plan => {
              // 如果存在旧的时间段字段，迁移到新的开始时间/结束时间
              if (plan.时间段 && !plan.开始时间 && !plan.结束时间) {
                const timeMap = {
                  '早上': { start: '06:00', end: '09:00' },
                  '上午': { start: '09:00', end: '12:00' },
                  '中午': { start: '12:00', end: '14:00' },
                  '下午': { start: '14:00', end: '18:00' },
                  '晚上': { start: '18:00', end: '22:00' },
                  '深夜': { start: '22:00', end: '24:00' }
                }
                const timeRange = timeMap[plan.时间段]
                if (timeRange) {
                  plan.开始时间 = timeRange.start
                  plan.结束时间 = timeRange.end
                }
                delete plan.时间段
              }
              // 确保新字段存在
              if (!plan.开始时间) plan.开始时间 = ''
              if (!plan.结束时间) plan.结束时间 = ''
              return plan
            })
          : []
      }
      if (props.modelValue.承诺 !== undefined) {
        localData.value.承诺 = props.modelValue.承诺
      }
    }
  }
})
</script>

<style scoped>
.tomorrow-plan-module {
  @apply space-y-6;
}

.guide-question {
  @apply flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4;
}

.guide-icon {
  @apply text-2xl;
}

.guide-text {
  @apply text-base font-semibold text-gray-700;
}

.form-section {
  @apply bg-white rounded-xl shadow-sm border border-gray-200/50;
}

.section-header {
  @apply flex items-center gap-2 p-4 border-b border-gray-200;
}

.section-icon {
  @apply text-xl;
}

.section-title {
  @apply font-semibold text-gray-700;
}

.form-content {
  @apply p-4 space-y-4;
}

.empty-state {
  @apply py-8;
}

.plans-list {
  @apply space-y-4;
}

.plan-item {
  @apply bg-gray-50 rounded-lg p-4 border border-gray-200;
}

.plan-header {
  @apply flex items-center justify-between mb-3;
}

.plan-number {
  @apply font-semibold text-gray-700;
}

.plan-content {
  @apply space-y-3;
}

.unit-text {
  @apply text-sm text-gray-500 whitespace-nowrap;
  min-width: 32px;
}

.time-range-picker {
  @apply flex items-center gap-2 w-full;
}

.time-picker-start,
.time-picker-end {
  @apply flex-1;
}

.time-separator {
  @apply text-gray-500 text-sm font-medium px-2;
  flex-shrink: 0;
}

.time-hint {
  @apply flex items-center gap-2 mt-2;
}

.quick-time-btn {
  @apply text-xs text-gray-500 hover:text-blue-500;
  padding: 2px 8px;
}

.summary-section {
  @apply bg-yellow-50 rounded-xl p-4 border border-yellow-200;
}

.summary-label {
  @apply text-base font-semibold text-gray-700 mb-3;
}

.required-mark {
  @apply text-red-500 mr-1;
}

.summary-input {
  @apply w-full;
}

:deep(.el-form-item) {
  margin-bottom: 1rem;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
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
    @apply p-3;
  }

  .mit-item {
    @apply p-3;
  }

  :deep(.el-form-item) {
    flex-direction: column;
    align-items: flex-start;
  }

  :deep(.el-form-item__label) {
    width: 100% !important;
    margin-bottom: 6px;
    text-align: left;
  }

  :deep(.el-form-item__content) {
    width: 100%;
    margin-left: 0 !important;
  }

  :deep(.el-input-number) {
    width: 100% !important;
  }

  :deep(.el-input-number__decrease),
  :deep(.el-input-number__increase) {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }

  :deep(.el-input__inner) {
    font-size: 16px;
    min-height: 48px;
    padding: 12px;
  }

  :deep(.el-textarea__inner) {
    font-size: 16px;
    min-height: 48px;
    padding: 12px;
  }
}
</style>

