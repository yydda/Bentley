<template>
  <div class="love-module">
    <!-- 数据统计 -->
    <div class="form-section">
      <h3 class="section-title">数据统计</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <el-form-item label="新连接数" label-width="100px">
          <el-input-number
            v-model="localData.新连接数"
            :min="0"
            controls-position="right"
            class="w-full"
          />
        </el-form-item>

        <el-form-item label="有效互动量" label-width="100px">
          <el-input-number
            v-model="localData.有效互动量"
            :min="0"
            controls-position="right"
            class="w-full"
          />
        </el-form-item>

        <el-form-item label="主动邀约次数" label-width="100px">
          <el-input-number
            v-model="localData.主动邀约次数"
            :min="0"
            controls-position="right"
            class="w-full"
          />
        </el-form-item>
      </div>
    </div>

    <!-- 情感记录 -->
    <div class="form-section">
      <h3 class="section-title">情感记录</h3>
      <el-form-item label="今日记录" label-width="100px">
        <el-input
          v-model="localData.记录"
          type="textarea"
          :rows="4"
          placeholder="记录今天的情感体验和互动过程..."
          :maxlength="2000"
          show-word-limit
        />
        <div class="hint-text">
          提示：此维度重在过程体验和自我成长，而非结果
        </div>
      </el-form-item>
    </div>

    <!-- 反思与总结 -->
    <div class="form-section">
      <h3 class="section-title">反思与总结</h3>
      <el-form-item label="反思与感悟" label-width="100px">
        <el-input
          v-model="localData.反思与感悟"
          type="textarea"
          :rows="4"
          placeholder="记录情感方面的反思与感悟..."
          :maxlength="2000"
          show-word-limit
        />
      </el-form-item>
    </div>

    <!-- 明日计划 -->
    <div class="form-section">
      <h3 class="section-title">明日计划</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            首要任务（最多3项）
          </label>
          <el-input
            v-for="(task, index) in localData.明日计划.首要任务"
            :key="index"
            v-model="localData.明日计划.首要任务[index]"
            :placeholder="`任务 ${index + 1}`"
            class="w-full mb-2"
          />
        </div>
        <el-form-item label="待解决问题" label-width="100px">
          <el-input
            v-model="localData.明日计划.待解决问题"
            type="textarea"
            :rows="3"
            placeholder="记录待解决的问题或新需求..."
            :maxlength="1000"
            show-word-limit
          />
        </el-form-item>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'prev', 'complete'])

// 初始化本地数据
function initLocalData() {
  const defaultValue = {
    新连接数: 0,
    有效互动量: 0,
    主动邀约次数: 0,
    记录: '',
    反思与感悟: '',
    明日计划: {
      首要任务: ['', '', ''],
      待解决问题: ''
    }
  }
  
  const merged = { ...defaultValue, ...props.modelValue }
  
  // 确保明日计划结构正确
  if (!merged.明日计划) {
    merged.明日计划 = {
      首要任务: ['', '', ''],
      待解决问题: ''
    }
  } else if (!Array.isArray(merged.明日计划.首要任务)) {
    merged.明日计划.首要任务 = ['', '', '']
  }
  
  return merged
}

const localData = ref(initLocalData())

// 更新父组件数据
function updateParent() {
  emit('update:modelValue', { ...localData.value })
}

// 监听本地数据变化，更新父组件（使用防抖）
let updateTimer = null
watch(localData, () => {
  if (updateTimer) {
    clearTimeout(updateTimer)
  }
  updateTimer = setTimeout(() => {
    updateParent()
  }, 300)
}, { deep: true })

// 监听父组件数据变化，更新本地数据
watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(localData.value)) {
    const merged = initLocalData()
    localData.value = merged
  }
}, { deep: true, immediate: false })
</script>

<style scoped>
.love-module {
  @apply space-y-6;
}

.form-section {
  @apply bg-gray-50 rounded-lg p-4 md:p-6;
}

.section-title {
  @apply text-base font-semibold text-gray-700 mb-4;
}

.hint-text {
  @apply text-xs text-gray-500 mt-2;
}

:deep(.el-form-item) {
  margin-bottom: 1rem;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

:deep(.el-textarea__inner) {
  width: 100%;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .love-module {
    @apply space-y-4;
  }

  .form-section {
    @apply p-3 rounded-md;
  }

  .section-title {
    @apply text-sm mb-3;
    font-size: 14px;
  }

  .hint-text {
    @apply text-xs mt-1.5;
    font-size: 11px;
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

  :deep(.el-textarea__inner) {
    font-size: 14px;
    padding: 8px;
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

  .hint-text {
    @apply text-xs;
    font-size: 10px;
  }

  :deep(.el-form-item__label) {
    font-size: 12px;
    margin-bottom: 4px;
  }

  :deep(.el-textarea__inner) {
    font-size: 13px;
    padding: 6px;
  }

  :deep(.el-input-number__decrease),
  :deep(.el-input-number__increase) {
    width: 26px;
    height: 26px;
  }
}
</style>
