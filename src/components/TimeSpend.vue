<template>
  <div class="time-spend-module">
    <!-- 时间分配 -->
    <div class="form-section">
      <h3 class="section-title">时间分配</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <el-form-item label="副业" label-width="100px">
          <div class="flex items-center gap-2">
            <el-input-number
              v-model="localData.副业"
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

        <el-form-item label="对象" label-width="100px">
          <div class="flex items-center gap-2">
            <el-input-number
              v-model="localData.对象"
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

        <el-form-item label="主职" label-width="100px">
          <div class="flex items-center gap-2">
            <el-input-number
              v-model="localData.主职"
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

        <el-form-item label="娱乐+内耗" label-width="100px">
          <div class="flex items-center gap-2">
            <el-input-number
              v-model="localData.娱乐内耗"
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

        <el-form-item label="通勤" label-width="100px">
          <div class="flex items-center gap-2">
            <el-input-number
              v-model="localData.通勤"
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

        <el-form-item label="睡眠" label-width="100px">
          <div class="flex items-center gap-2">
            <el-input-number
              v-model="localData.睡眠"
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

      <!-- 时间总和提示 -->
      <el-alert
        :title="`时间总和: ${totalHours.toFixed(1)} 小时`"
        :type="totalHours >= 22 && totalHours <= 26 ? 'success' : 'warning'"
        :closable="false"
        class="mt-4"
      >
        <template #default>
          <span v-if="totalHours < 22">时间总和偏少，请检查是否遗漏</span>
          <span v-else-if="totalHours > 26">时间总和偏多，请检查输入是否正确</span>
          <span v-else>时间分配合理</span>
        </template>
      </el-alert>
    </div>

    <!-- 今日评分 -->
    <div class="form-section">
      <h3 class="section-title">今日评分</h3>
      <div class="rating-container">
        <div class="rating-hint">点击表情切换评分</div>
        <div class="rating-emojis">
          <span
            v-for="(emoji, index) in localData.评分"
            :key="index"
            class="rating-emoji"
            :class="{ 'rating-active': emoji === '💓' }"
            @click="toggleRating(index)"
          >
            {{ emoji }}
          </span>
        </div>
      </div>
    </div>

    <!-- 评价 -->
    <div class="form-section">
      <h3 class="section-title">一句话评价</h3>
      <el-form-item label="评价" label-width="100px">
        <el-input
          v-model="localData.评价"
          type="textarea"
          :rows="3"
          placeholder="请用一句话评价今天的时间分配..."
          :maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'next'])

// 初始化本地数据
function initLocalData() {
  const defaultValue = {
    副业: 0,
    对象: 0,
    主职: 0,
    娱乐内耗: 0,
    通勤: 0,
    睡眠: 0,
    评分: ['💔', '💔', '💔', '💔', '💔'],
    评价: ''
  }
  
  const merged = { ...defaultValue, ...props.modelValue }
  
  // 确保评分数组有5个元素
  if (!merged.评分 || !Array.isArray(merged.评分) || merged.评分.length !== 5) {
    merged.评分 = ['💔', '💔', '💔', '💔', '💔']
  }
  
  return merged
}

const localData = ref(initLocalData())

// 计算时间总和
const totalHours = computed(() => {
  return (
    (Number(localData.value.副业) || 0) +
    (Number(localData.value.对象) || 0) +
    (Number(localData.value.主职) || 0) +
    (Number(localData.value.娱乐内耗) || 0) +
    (Number(localData.value.通勤) || 0) +
    (Number(localData.value.睡眠) || 0)
  )
})

// 切换评分
function toggleRating(index) {
  const emojis = ['💓', '💔']
  const currentIndex = emojis.indexOf(localData.value.评分[index])
  localData.value.评分[index] = emojis[(currentIndex + 1) % emojis.length]
  updateParent()
}

// 更新父组件数据
function updateParent() {
  emit('update:modelValue', { ...localData.value })
}

// 监听本地数据变化，更新父组件（使用防抖避免频繁更新）
let updateTimer = null
watch(localData, () => {
  if (updateTimer) {
    clearTimeout(updateTimer)
  }
  updateTimer = setTimeout(() => {
    updateParent()
  }, 300)
}, { deep: true })

// 监听父组件数据变化，更新本地数据（仅在外部数据真正变化时）
watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(localData.value)) {
    const merged = initLocalData()
    localData.value = merged
  }
}, { deep: true, immediate: false })
</script>

<style scoped>
.time-spend-module {
  @apply space-y-6;
}

.form-section {
  @apply bg-gray-50 rounded-lg p-4 md:p-6;
}

.section-title {
  @apply text-base font-semibold text-gray-700 mb-4;
}

.unit-text {
  @apply text-sm text-gray-500 whitespace-nowrap;
  min-width: 32px;
}

.rating-container {
  @apply space-y-3;
}

.rating-hint {
  @apply text-sm text-gray-500;
}

.rating-emojis {
  @apply flex gap-3 justify-center md:justify-start;
}

.rating-emoji {
  @apply text-3xl cursor-pointer transition-all duration-200;
  @apply hover:scale-125 active:scale-110;
}

.rating-active {
  @apply scale-125;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-textarea__inner) {
  width: 100%;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .time-spend-module {
    @apply space-y-4;
  }

  .form-section {
    @apply p-3 rounded-md;
  }

  .section-title {
    @apply text-sm mb-3;
    font-size: 14px;
  }

  .rating-hint {
    @apply text-xs;
  }

  .rating-emojis {
    @apply gap-2;
  }

  .rating-emoji {
    @apply text-2xl;
  }

  .rating-active {
    @apply scale-110;
  }

  .unit-text {
    min-width: 28px;
    font-size: 12px;
  }

  :deep(.el-form-item) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  :deep(.el-form-item__label) {
    font-size: 13px;
    margin-bottom: 6px;
    width: 100% !important;
    text-align: left;
    padding-bottom: 0;
  }

  :deep(.el-form-item__content) {
    width: 100%;
    margin-left: 0 !important;
    line-height: 1.5;
  }

  :deep(.el-input-number) {
    width: 100% !important;
  }

  :deep(.el-input-number__decrease),
  :deep(.el-input-number__increase) {
    width: 28px;
    height: 28px;
  }

  :deep(.el-input__inner) {
    font-size: 14px;
    padding: 8px 32px 8px 8px;
  }

  :deep(.el-textarea__inner) {
    font-size: 14px;
    padding: 8px;
  }

  :deep(.el-alert) {
    padding: 10px 12px;
  }

  :deep(.el-alert__title) {
    font-size: 13px;
  }
}

/* 小屏幕手机优化 */
@media (max-width: 480px) {
  .form-section {
    @apply p-2.5;
  }

  .section-title {
    @apply text-xs mb-2;
    font-size: 13px;
  }

  .rating-emojis {
    @apply gap-1.5;
  }

  .rating-emoji {
    @apply text-xl;
  }

  :deep(.el-form-item__label) {
    font-size: 12px;
    margin-bottom: 4px;
  }

  :deep(.el-input__inner) {
    font-size: 13px;
    padding: 6px 28px 6px 6px;
  }

  :deep(.el-textarea__inner) {
    font-size: 13px;
    padding: 6px;
  }
}
</style>
