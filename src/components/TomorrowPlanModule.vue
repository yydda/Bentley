<template>
  <div class="tomorrow-plan-module">
    <!-- 引导问题 -->
    <div class="guide-question">
      <div class="guide-icon">💡</div>
      <div class="guide-text">引导问题：明天最重要的事是什么？</div>
    </div>

    <!-- 明日MIT -->
    <div class="form-section">
      <div class="section-header">
        <span class="section-icon">🎯</span>
        <span class="section-title">明日MIT（最多3项）</span>
      </div>
      <div class="form-content">
        <div class="space-y-4">
          <div
            v-for="(mit, index) in localData.MIT"
            :key="index"
            class="mit-item"
          >
            <div class="mit-header">
              <span class="mit-number">MIT #{{ index + 1 }}</span>
              <el-button
                type="danger"
                :icon="Delete"
                circle
                size="small"
                @click="removeMIT(index)"
              />
            </div>
            <div class="mit-content">
              <el-form-item label="任务" label-width="100px">
                <el-input
                  v-model="mit.任务"
                  placeholder="明天最重要的一件事是什么？"
                  :maxlength="100"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="重要性原因" label-width="100px">
                <el-select
                  v-model="mit.重要性原因"
                  placeholder="选择重要性原因"
                  class="w-full"
                >
                  <el-option label="收入" value="收入" />
                  <el-option label="健康" value="健康" />
                  <el-option label="关系" value="关系" />
                  <el-option label="成长" value="成长" />
                  <el-option label="心理" value="心理" />
                </el-select>
              </el-form-item>
              <el-form-item label="预计时间" label-width="100px">
                <div class="flex items-center gap-2">
                  <el-input-number
                    v-model="mit.预计时间"
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
            </div>
          </div>

          <el-button
            v-if="localData.MIT.length < 3"
            type="primary"
            :icon="Plus"
            @click="addMIT"
            class="w-full"
            plain
          >
            添加MIT
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
import { ref, watch, onMounted } from 'vue'
import { debounce } from 'lodash'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      MIT: [],
      承诺: ''
    })
  }
})

const emit = defineEmits(['update:modelValue', 'next'])

// 初始化数据结构，确保所有嵌套对象都存在
function initLocalData() {
  const defaultData = {
    MIT: [],
    承诺: ''
  }
  
  // 深度合并默认数据和传入的数据
  const merged = JSON.parse(JSON.stringify(defaultData))
  if (props.modelValue) {
    if (props.modelValue.MIT) {
      merged.MIT = Array.isArray(props.modelValue.MIT) 
        ? [...props.modelValue.MIT] 
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

// 添加MIT
function addMIT() {
  if (!localData.value.MIT) {
    localData.value.MIT = []
  }
  if (localData.value.MIT.length < 3) {
    localData.value.MIT.push({
      任务: '',
      重要性原因: '',
      预计时间: 0
    })
  }
}

// 删除MIT
function removeMIT(index) {
  localData.value.MIT.splice(index, 1)
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
  const newStr = JSON.stringify(newVal || { MIT: [], 承诺: '' })
  
  if (currentStr !== newStr) {
    isUpdating.value = true
    try {
      if (newVal) {
        // 确保数据结构完整
        if (newVal.MIT) {
          localData.value.MIT = Array.isArray(newVal.MIT) 
            ? [...newVal.MIT] 
            : []
        } else {
          localData.value.MIT = []
        }
        if (newVal.承诺 !== undefined) {
          localData.value.承诺 = newVal.承诺
        } else {
          localData.value.承诺 = ''
        }
      } else {
        localData.value = {
          MIT: [],
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
  if (!localData.value.MIT) {
    localData.value.MIT = []
  }
  if (localData.value.承诺 === undefined || localData.value.承诺 === null) {
    localData.value.承诺 = ''
  }
  // 确保初始数据同步
  if (props.modelValue) {
    const currentStr = JSON.stringify(localData.value)
    const propStr = JSON.stringify(props.modelValue)
    if (currentStr !== propStr) {
      if (props.modelValue.MIT) {
        localData.value.MIT = Array.isArray(props.modelValue.MIT) 
          ? [...props.modelValue.MIT] 
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

.mit-item {
  @apply bg-gray-50 rounded-lg p-4 border border-gray-200;
}

.mit-header {
  @apply flex items-center justify-between mb-3;
}

.mit-number {
  @apply font-semibold text-gray-700;
}

.mit-content {
  @apply space-y-3;
}

.unit-text {
  @apply text-sm text-gray-500 whitespace-nowrap;
  min-width: 32px;
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

