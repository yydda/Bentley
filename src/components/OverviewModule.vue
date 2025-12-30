<template>
  <div class="overview-module">
    <!-- 引导说明 -->
    <div class="guide-question">
      <div class="guide-icon">💡</div>
      <div class="guide-text">用3分钟快速回顾今天</div>
    </div>

    <div class="form-content space-y-6">
      <!-- 一句话标题 -->
      <el-form-item label="今日一句话标题" label-width="140px" required>
        <el-input
          v-model="localData.一句话标题"
          placeholder="用一句话给今天命名，例如：在纠结里浪费了一天 / 终于开始动手了的一天"
          :maxlength="100"
          show-word-limit
          class="title-input"
        />
        <div class="hint-text">给今天起个名字，帮助自己快速回忆</div>
      </el-form-item>

      <!-- 能量值和压力值 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <el-form-item label="能量值" label-width="140px" required>
          <div class="rating-container">
            <div class="rating-emojis">
              <span
                v-for="n in 5"
                :key="n"
                class="rating-emoji"
                :class="{ 'rating-active': localData.能量值 === n }"
                @click="localData.能量值 = n"
              >
                {{ ['😩', '😐', '🙂', '😄', '😆'][n - 1] }}
              </span>
            </div>
            <div class="rating-label">{{ ['很低', '较低', '一般', '较高', '很高'][localData.能量值 - 1] }}</div>
          </div>
        </el-form-item>

        <el-form-item label="压力值" label-width="140px" required>
          <div class="rating-container">
            <div class="rating-emojis">
              <span
                v-for="n in 5"
                :key="n"
                class="rating-emoji"
                :class="{ 'rating-active': localData.压力值 === n }"
                @click="localData.压力值 = n"
              >
                {{ ['😌', '😐', '😟', '😰', '😱'][n - 1] }}
              </span>
            </div>
            <div class="rating-label">{{ ['很低', '较低', '一般', '较高', '很高'][localData.压力值 - 1] }}</div>
          </div>
        </el-form-item>
      </div>

      <!-- 今日最关键一件事 -->
      <el-form-item label="今日最关键一件事" label-width="140px" required>
        <el-input
          v-model="localData.今日最关键一件事"
          type="textarea"
          :rows="3"
          placeholder="今天最重要的一件事是什么？"
          :maxlength="100"
          show-word-limit
        />
      </el-form-item>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { debounce } from 'lodash'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      一句话标题: '',
      能量值: 3,
      压力值: 3,
      今日最关键一件事: ''
    })
  }
})

const emit = defineEmits(['update:modelValue', 'next'])

// 初始化数据结构
function initLocalData() {
  const defaultData = {
    一句话标题: '',
    能量值: 3,
    压力值: 3,
    今日最关键一件事: ''
  }
  
  const merged = JSON.parse(JSON.stringify(defaultData))
  if (props.modelValue) {
    merged.一句话标题 = props.modelValue.一句话标题 ?? ''
    merged.能量值 = props.modelValue.能量值 ?? 3
    merged.压力值 = props.modelValue.压力值 ?? 3
    merged.今日最关键一件事 = props.modelValue.今日最关键一件事 ?? ''
  }
  
  return merged
}

const localData = ref(initLocalData())

// 监听本地数据变化，更新父组件（使用防抖）
const debouncedUpdateParent = debounce(() => {
  emit('update:modelValue', { ...localData.value })
}, 300)

watch(localData, () => {
  debouncedUpdateParent()
}, { deep: true })

// 当父组件的modelValue变化时，更新localData
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (newVal.一句话标题 !== undefined) localData.value.一句话标题 = newVal.一句话标题
    if (newVal.能量值 !== undefined) localData.value.能量值 = newVal.能量值
    if (newVal.压力值 !== undefined) localData.value.压力值 = newVal.压力值
    if (newVal.今日最关键一件事 !== undefined) localData.value.今日最关键一件事 = newVal.今日最关键一件事
  }
}, { deep: true })

// 初始化时确保数据结构完整
onMounted(() => {
  if (localData.value.一句话标题 === undefined) localData.value.一句话标题 = ''
  if (localData.value.能量值 === undefined) localData.value.能量值 = 3
  if (localData.value.压力值 === undefined) localData.value.压力值 = 3
  if (localData.value.今日最关键一件事 === undefined) localData.value.今日最关键一件事 = ''
})
</script>

<style scoped>
.overview-module {
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

.title-input {
  @apply w-full;
}

.hint-text {
  @apply text-xs text-gray-500 mt-1;
}

.rating-container {
  @apply space-y-3;
}

.rating-emojis {
  @apply flex gap-3;
}

.rating-emoji {
  @apply text-4xl cursor-pointer transition-all duration-200;
  @apply hover:scale-125 active:scale-110;
}

.rating-active {
  @apply scale-125;
}

.rating-label {
  @apply text-sm text-gray-600 text-center;
}

:deep(.el-form-item) {
  margin-bottom: 1.5rem;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
  font-size: 15px;
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

  .rating-emoji {
    @apply text-3xl;
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

  :deep(.el-input__inner) {
    font-size: 16px;
    min-height: 48px;
    padding: 12px;
  }

  :deep(.el-textarea__inner) {
    font-size: 16px;
    min-height: 80px;
    padding: 12px;
  }
}
</style>

