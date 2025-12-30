<template>
  <div class="three-reflections-module">
    <!-- 引导说明 -->
    <div class="guide-question">
      <div class="guide-icon">💡</div>
      <div class="guide-text">结合三大课题，做最后的深度反省</div>
    </div>

    <!-- 第一问：动机偏差 -->
    <div class="reflection-card">
      <div class="card-header">
        <span class="card-icon">🤔</span>
        <span class="card-title">第一问：动机偏差</span>
      </div>
      <div class="card-question">
        "今天在动机上，有没有为了逃避或迎合而做的选择？"
      </div>
      <div class="card-hint">
        围绕生活/财富/情感三大课题，有没有哪件事其实只是为了迎合别人/逃避不适，而不是出于真正的愿望？
      </div>
      <el-input
        v-model="localData.动机偏差"
        type="textarea"
        :rows="5"
        placeholder="请用200字以内回答..."
        :maxlength="200"
        show-word-limit
        class="card-input"
      />
    </div>

    <!-- 第二问：理想不一致 -->
    <div class="reflection-card">
      <div class="card-header">
        <span class="card-icon">🎯</span>
        <span class="card-title">第二问：理想不一致</span>
      </div>
      <div class="card-question">
        "今天有哪个瞬间，和我理想中的'生活/财富/情感'状态最不一致？"
      </div>
      <div class="card-hint">
        那一刻，你理想中的自己会怎么做？
      </div>
      <el-input
        v-model="localData.理想不一致"
        type="textarea"
        :rows="5"
        placeholder="请用200字以内回答..."
        :maxlength="200"
        show-word-limit
        class="card-input"
      />
    </div>

    <!-- 第三问：理想的一天 -->
    <div class="reflection-card">
      <div class="card-header">
        <span class="card-icon">🌟</span>
        <span class="card-title">第三问：理想的一天</span>
      </div>
      <div class="card-question">
        "如果明天只允许我围绕三大课题各做'一件小事'，会选什么？"
      </div>
      <div class="card-hint">
        生活：___ / 财富：___ / 情感：___
      </div>
      <el-input
        v-model="localData.理想的一天"
        type="textarea"
        :rows="5"
        placeholder="请用200字以内回答..."
        :maxlength="200"
        show-word-limit
        class="card-input"
      />
    </div>

    <!-- 完成按钮 -->
    <div class="complete-section">
      <el-button
        type="success"
        size="large"
        @click="handleComplete"
        class="complete-btn"
      >
        <span class="complete-icon">✓</span>
        <span>完成日记</span>
      </el-button>
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
      动机偏差: '',
      理想不一致: '',
      理想的一天: ''
    })
  }
})

const emit = defineEmits(['update:modelValue', 'complete'])

// 初始化数据结构，确保所有字段都存在
function initLocalData() {
  const defaultData = {
    动机偏差: '',
    理想不一致: '',
    理想的一天: ''
  }
  
  // 深度合并默认数据和传入的数据
  const merged = JSON.parse(JSON.stringify(defaultData))
  if (props.modelValue) {
    if (props.modelValue.动机偏差 !== undefined) {
      merged.动机偏差 = props.modelValue.动机偏差
    }
    if (props.modelValue.理想不一致 !== undefined) {
      merged.理想不一致 = props.modelValue.理想不一致
    }
    if (props.modelValue.理想的一天 !== undefined) {
      merged.理想的一天 = props.modelValue.理想的一天
    }
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
    // 确保数据结构完整
    if (newVal.动机偏差 !== undefined) {
      localData.value.动机偏差 = newVal.动机偏差
    }
    if (newVal.理想不一致 !== undefined) {
      localData.value.理想不一致 = newVal.理想不一致
    }
    if (newVal.理想的一天 !== undefined) {
      localData.value.理想的一天 = newVal.理想的一天
    }
  }
}, { deep: true })

import { ElMessage } from 'element-plus'

// 完成日记
function handleComplete() {
  // 检查必填字段
  if (!localData.value.动机偏差 || !localData.value.理想不一致 || !localData.value.理想的一天) {
    ElMessage.warning('请完成所有三个反思问题')
    return
  }
  emit('complete')
}

// 初始化时确保数据结构完整
onMounted(() => {
  if (!localData.value.动机偏差) {
    localData.value.动机偏差 = ''
  }
  if (!localData.value.理想不一致) {
    localData.value.理想不一致 = ''
  }
  if (!localData.value.理想的一天) {
    localData.value.理想的一天 = ''
  }
})
</script>

<style scoped>
.three-reflections-module {
  @apply space-y-6;
}

.guide-question {
  @apply flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100 mb-4;
}

.guide-icon {
  @apply text-2xl;
}

.guide-text {
  @apply text-base font-semibold text-gray-700;
}

.reflection-card {
  @apply bg-white rounded-xl shadow-md border border-gray-200 p-6;
  @apply transition-all duration-300 hover:shadow-lg;
}

.card-header {
  @apply flex items-center gap-3 mb-4;
}

.card-icon {
  @apply text-3xl;
}

.card-title {
  @apply text-lg font-bold text-gray-800;
}

.card-question {
  @apply text-base font-semibold text-gray-700 mb-2;
}

.card-hint {
  @apply text-sm text-gray-500 mb-4;
}

.card-input {
  @apply w-full;
}

.complete-section {
  @apply flex justify-center pt-4;
}

.complete-btn {
  @apply px-8 py-3 text-lg font-semibold;
  @apply shadow-lg hover:shadow-xl transition-all duration-300;
}

.complete-icon {
  @apply mr-2 text-xl;
}

:deep(.el-textarea__inner) {
  font-size: 14px;
  line-height: 1.6;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .guide-question {
    @apply p-3;
  }

  .guide-text {
    @apply text-sm;
  }

  .reflection-card {
    @apply p-4;
  }

  .card-title {
    @apply text-base;
  }

  .card-question {
    @apply text-sm;
  }

  .card-hint {
    @apply text-xs;
  }

  :deep(.el-textarea__inner) {
    font-size: 16px;
    min-height: 120px;
    padding: 12px;
  }

  .complete-btn {
    @apply w-full px-6 py-3 text-base;
  }
}
</style>

