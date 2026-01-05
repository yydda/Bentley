<template>
  <div class="daily-thread-progress-module">
    <!-- 引导问题 -->
    <div class="guide-question">
      <div class="guide-icon">💡</div>
      <div class="guide-text">引导问题：今天推进了哪条主线？具体做了什么？</div>
    </div>

    <div class="form-content space-y-6">
      <!-- 选择主线（多选） -->
      <el-form-item label="选择主线" label-width="140px" required>
        <div v-if="availableThreads.length === 0" class="no-threads">
          <el-alert
            type="warning"
            :closable="false"
            show-icon
          >
            <template #title>
              <span>还没有设置人生主线，请先</span>
              <el-button type="text" @click="$emit('setup-threads')" class="p-0 ml-1">
                设置人生主线
              </el-button>
            </template>
          </el-alert>
        </div>
        <div v-else class="threads-selection">
          <el-checkbox-group v-model="selectedThreadIds" class="w-full" @change="handleThreadSelectionChange">
            <el-checkbox
              v-for="thread in availableThreads"
              :key="thread.主线ID"
              :label="thread.主线ID"
              class="thread-checkbox"
            >
              <div class="thread-option">
                <span class="thread-name">{{ thread.主线名称 }}</span>
                <span class="thread-stage">{{ thread.当前阶段 }}</span>
              </div>
            </el-checkbox>
          </el-checkbox-group>
          <div v-if="selectedThreadIds.length > 3" class="hint-text text-orange-500">
            建议每天聚焦1-3条主线，已选择{{ selectedThreadIds.length }}条
          </div>
          <div v-else class="hint-text">
            建议每天聚焦1-3条主线
          </div>
        </div>
      </el-form-item>

      <!-- 分主线填写 -->
      <div v-if="selectedThreadIds.length > 0" class="thread-progress-list space-y-6">
        <div
          v-for="(threadId, index) in selectedThreadIds"
          :key="threadId"
          class="thread-progress-card"
        >
          <div class="thread-progress-header">
            <div class="thread-title">
              <span class="thread-number">主线 {{ index + 1 }}</span>
              <span class="thread-name-large">{{ getThreadName(threadId) }}</span>
              <span class="thread-stage-badge">{{ getThreadStage(threadId) }}</span>
            </div>
          </div>

          <div class="thread-progress-content space-y-4">
            <!-- 主线状态（手动填写） -->
            <el-form-item label="主线状态" label-width="140px">
              <div class="thread-status-section">
                <el-select
                  v-model="getProgressData(threadId).主线状态"
                  placeholder="选择或输入主线状态"
                  class="w-full"
                  filterable
                  allow-create
                  default-first-option
                  clearable
                >
                  <el-option label="进行中" value="进行中" />
                  <el-option label="已完成" value="已完成" />
                  <el-option label="暂停" value="暂停" />
                  <el-option label="遇到阻碍" value="遇到阻碍" />
                  <el-option label="需要调整" value="需要调整" />
                  <el-option label="进展顺利" value="进展顺利" />
                  <el-option label="突破进展" value="突破进展" />
                </el-select>
                <div class="status-hint">
                  <span class="hint-text">💡 可以自定义状态，如实记录当前情况</span>
                </div>
              </div>
            </el-form-item>

            <!-- 今日关键行动 -->
            <el-form-item label="今日关键行动" label-width="140px" required>
              <el-input
                v-model="getProgressData(threadId).今日关键行动"
                :placeholder="`在这条主线上，今天最关键的一个行动是什么？`"
                :maxlength="100"
                show-word-limit
              />
            </el-form-item>

            <!-- 行动记录 -->
            <el-form-item label="行动记录" label-width="140px" required>
              <el-input
                v-model="getProgressData(threadId).行动记录"
                type="textarea"
                :rows="5"
                placeholder="具体做了什么？只写事实，不评价。建议200-300字。"
                :maxlength="500"
                show-word-limit
              />
              <div class="hint-text">只记录客观事实，不评价</div>
            </el-form-item>

            <!-- 推进效果 -->
            <el-form-item label="推进效果" label-width="140px" required>
              <div class="effect-rating">
                <div class="rating-label">这个行动对主线推进有帮助吗？</div>
                <div class="rating-container">
                  <el-rate
                    v-model="getProgressData(threadId).推进效果"
                    :max="5"
                    show-score
                    text-color="#ff9900"
                    score-template="{value} 分"
                  />
                </div>
                <div class="rating-hints">
                  <span class="hint-item">1分：几乎没帮助</span>
                  <span class="hint-item">3分：有一定帮助</span>
                  <span class="hint-item">5分：非常有帮助</span>
                </div>
              </div>
            </el-form-item>
          </div>
        </div>
      </div>

      <!-- 未选择主线提示 -->
      <div v-else class="no-selection-hint">
        <el-empty description="请先选择要推进的主线" :image-size="100" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { debounce } from 'lodash'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  lifeThreads: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'setup-threads'])

// 可用的主线（只显示激活的）
const availableThreads = computed(() => {
  return props.lifeThreads.filter(thread => thread.是否激活)
})

// 选中的主线ID列表
const selectedThreadIds = ref([])

// 主线推进数据（数组）
const progressData = ref([])

// 获取主线名称
function getThreadName(threadId) {
  const thread = availableThreads.value.find(t => t.主线ID === threadId)
  return thread ? thread.主线名称 : '未知主线'
}

// 获取主线阶段
function getThreadStage(threadId) {
  const thread = availableThreads.value.find(t => t.主线ID === threadId)
  return thread ? thread.当前阶段 : ''
}

// 获取或创建某条主线的推进数据
function getProgressData(threadId) {
  let data = progressData.value.find(p => p.主线ID === threadId)
  if (!data) {
    data = {
      主线ID: threadId,
      主线状态: '',
      今日关键行动: '',
      行动记录: '',
      推进效果: 3
    }
    progressData.value.push(data)
  }
  return data
}

// 处理主线选择变化
function handleThreadSelectionChange() {
  // 移除未选中主线的数据
  progressData.value = progressData.value.filter(p => selectedThreadIds.value.includes(p.主线ID))
  
  // 为新增的主线创建默认数据
  selectedThreadIds.value.forEach(threadId => {
    if (!progressData.value.find(p => p.主线ID === threadId)) {
      progressData.value.push({
        主线ID: threadId,
        主线状态: '',
        今日关键行动: '',
        行动记录: '',
        推进效果: 3
      })
    }
  })
  
  updateParent()
}

// 监听本地数据变化，更新父组件（使用防抖）
const debouncedUpdateParent = debounce(() => {
  updateParent()
}, 300)

function updateParent() {
  emit('update:modelValue', [...progressData.value])
}

watch(progressData, () => {
  debouncedUpdateParent()
}, { deep: true })

// 当父组件的modelValue变化时，更新localData
watch(() => props.modelValue, (newVal) => {
  if (newVal && Array.isArray(newVal)) {
    progressData.value = JSON.parse(JSON.stringify(newVal))
    // 更新选中的主线ID列表
    selectedThreadIds.value = newVal.map(p => p.主线ID)
  } else {
    progressData.value = []
    selectedThreadIds.value = []
  }
}, { deep: true })

// 初始化时确保数据结构完整
onMounted(() => {
  // 从props.modelValue初始化
  if (props.modelValue && Array.isArray(props.modelValue) && props.modelValue.length > 0) {
    progressData.value = JSON.parse(JSON.stringify(props.modelValue))
    selectedThreadIds.value = props.modelValue.map(p => p.主线ID)
  } else {
    progressData.value = []
    selectedThreadIds.value = []
    
    // 如果只有1条激活的主线，自动选中
    if (availableThreads.value.length === 1) {
      selectedThreadIds.value = [availableThreads.value[0].主线ID]
      handleThreadSelectionChange()
    }
  }
})
</script>

<style scoped>
.daily-thread-progress-module {
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

.form-content {
  @apply bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200/50;
}

.no-threads {
  @apply w-full;
}

.threads-selection {
  @apply w-full space-y-2;
}

.thread-checkbox {
  @apply w-full mb-2;
}

.thread-option {
  @apply flex items-center justify-between w-full;
}

.thread-name {
  @apply font-semibold text-gray-800;
}

.thread-stage {
  @apply text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded;
}

.hint-text {
  @apply text-xs text-gray-500 mt-1;
}

.thread-progress-list {
  @apply space-y-6;
}

.thread-progress-card {
  @apply bg-gray-50 rounded-lg p-4 md:p-6 border-2 border-gray-200;
}

.thread-progress-header {
  @apply mb-4 pb-4 border-b border-gray-300;
}

.thread-status-section {
  @apply space-y-2;
}

.status-hint {
  @apply mt-1;
}

.thread-title {
  @apply flex items-center gap-3 flex-wrap;
}

.thread-number {
  @apply text-sm font-semibold text-gray-600;
}

.thread-name-large {
  @apply text-lg font-bold text-gray-800;
}

.thread-stage-badge {
  @apply text-xs text-gray-600 bg-blue-100 px-2 py-1 rounded;
}

.thread-progress-content {
  @apply mt-4;
}

.no-selection-hint {
  @apply py-8;
}

.effect-rating {
  @apply space-y-3;
}

.rating-label {
  @apply text-sm font-semibold text-gray-700;
}

.rating-container {
  @apply flex items-center;
}

.rating-hints {
  @apply flex gap-4 text-xs text-gray-500;
}

.hint-item {
  @apply flex-1;
}

:deep(.el-form-item) {
  margin-bottom: 1.5rem;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
  font-size: 15px;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.el-checkbox) {
  width: 100%;
  margin-right: 0;
}

:deep(.el-checkbox__label) {
  width: 100%;
  padding-left: 8px;
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

  .thread-progress-card {
    @apply p-4;
  }

  .thread-title {
    @apply flex-col items-start gap-2;
  }

  :deep(.el-form-item) {
    flex-direction: column;
    align-items: flex-start;
  }

  .rating-hints {
    @apply flex-col gap-2;
  }
}
</style>
