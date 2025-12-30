<template>
  <div class="am-module">
    <!-- 工作数据 -->
    <div class="form-section">
      <h3 class="section-title">工作数据</h3>
      <div class="space-y-4">
        <el-form-item label="项目进度" label-width="100px">
          <div class="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 w-full">
            <el-slider
              v-model="localData.项目进度"
              :min="0"
              :max="100"
              :step="1"
              show-stops
              show-input
              class="flex-1 w-full"
            />
            <span class="text-lg font-semibold w-full md:w-16 text-left md:text-right">
              {{ localData.项目进度 }}%
            </span>
          </div>
        </el-form-item>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <el-form-item label="时间追踪" label-width="100px">
            <div class="flex items-center gap-2">
              <el-input-number
                v-model="localData.时间追踪"
                :min="0"
                :max="24"
                :precision="1"
                :step="0.5"
                controls-position="right"
                class="flex-1"
              />
              <span class="unit-text">小时</span>
            </div>
          </el-form-item>

          <el-form-item label="效率管理" label-width="100px">
            <div class="flex items-center gap-2">
              <el-input-number
                v-model="localData.效率管理"
                :min="0"
                :max="24"
                :precision="1"
                :step="0.5"
                controls-position="right"
                class="flex-1"
              />
              <span class="unit-text">小时</span>
            </div>
          </el-form-item>
        </div>
      </div>
    </div>

    <!-- 工作产出 -->
    <div class="form-section">
      <h3 class="section-title">工作产出</h3>
      <el-form-item label="今日产出" label-width="100px">
        <el-input
          v-model="localData.产出"
          type="textarea"
          :rows="4"
          placeholder="记录完成的功能模块、解决的bug数量等..."
          :maxlength="2000"
          show-word-limit
        />
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
          placeholder="记录工作反思和知识整理..."
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

const emit = defineEmits(['update:modelValue', 'next', 'prev'])

// 初始化本地数据
function initLocalData() {
  const defaultValue = {
    项目进度: 0,
    时间追踪: 0,
    效率管理: 0,
    产出: '',
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
.am-module {
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

:deep(.el-slider) {
  width: 100%;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .am-module {
    @apply space-y-4;
  }

  .form-section {
    @apply p-3 rounded-md;
  }

  .section-title {
    @apply text-sm mb-3;
    font-size: 14px;
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

  :deep(.el-textarea__inner) {
    font-size: 14px;
    padding: 8px;
  }

  :deep(.el-slider) {
    width: 100% !important;
  }

  :deep(.el-slider__runway) {
    width: 100% !important;
    height: 4px;
  }

  :deep(.el-slider__button) {
    width: 16px;
    height: 16px;
  }

  :deep(.el-slider__input) {
    width: 60px;
  }

  :deep(.el-slider__input .el-input__inner) {
    font-size: 13px;
    padding: 4px 8px;
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

  .unit-text {
    min-width: 24px;
    font-size: 11px;
  }

  :deep(.el-form-item__label) {
    font-size: 12px;
    margin-bottom: 4px;
  }

  :deep(.el-textarea__inner) {
    font-size: 13px;
    padding: 6px;
  }

  :deep(.el-slider__runway) {
    height: 3px;
  }

  :deep(.el-slider__button) {
    width: 14px;
    height: 14px;
  }

  :deep(.el-slider__input) {
    width: 50px;
  }

  :deep(.el-slider__input .el-input__inner) {
    font-size: 12px;
    padding: 3px 6px;
  }
}
</style>
