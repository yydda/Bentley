<template>
  <div class="time-spend-module">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">时间花销</h2>
    
    <div class="space-y-4">
      <el-form-item label="副业（小时）">
        <el-input-number
          v-model="localData.副业"
          :min="0"
          :max="24"
          :precision="1"
          :step="0.5"
          controls-position="right"
          class="w-full"
          :controls="true"
          placeholder="0"
        />
      </el-form-item>

      <el-form-item label="对象（小时）">
        <el-input-number
          v-model="localData.对象"
          :min="0"
          :max="24"
          :precision="1"
          :step="0.5"
          controls-position="right"
          class="w-full"
          :controls="true"
          placeholder="0"
        />
      </el-form-item>

      <el-form-item label="主职（小时）">
        <el-input-number
          v-model="localData.主职"
          :min="0"
          :max="24"
          :precision="1"
          :step="0.5"
          controls-position="right"
          class="w-full"
          :controls="true"
          placeholder="0"
        />
      </el-form-item>

      <el-form-item label="娱乐+内耗（小时）">
        <el-input-number
          v-model="localData.娱乐内耗"
          :min="0"
          :max="24"
          :precision="1"
          :step="0.5"
          controls-position="right"
          class="w-full"
          :controls="true"
          placeholder="0"
        />
      </el-form-item>

      <el-form-item label="通勤（小时）">
        <el-input-number
          v-model="localData.通勤"
          :min="0"
          :max="24"
          :precision="1"
          :step="0.5"
          controls-position="right"
          class="w-full"
          :controls="true"
          placeholder="0"
        />
      </el-form-item>

      <el-form-item label="睡眠（小时）">
        <el-input-number
          v-model="localData.睡眠"
          :min="0"
          :max="24"
          :precision="1"
          :step="0.5"
          controls-position="right"
          class="w-full"
          :controls="true"
          placeholder="0"
        />
      </el-form-item>
    </div>

    <!-- 时间总和提示 -->
    <el-alert
      :title="`时间总和: ${totalHours} 小时`"
      :type="totalHours >= 22 && totalHours <= 26 ? 'success' : 'warning'"
      :closable="false"
      class="my-4"
    >
      <template #default>
        <span v-if="totalHours < 22">时间总和偏少，请检查是否遗漏</span>
        <span v-else-if="totalHours > 26">时间总和偏多，请检查输入是否正确</span>
        <span v-else>时间分配合理</span>
      </template>
    </el-alert>

    <!-- 评分系统 -->
    <div class="mt-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        今日评分（点击切换）
      </label>
      <div class="flex gap-2">
        <span
          v-for="(emoji, index) in localData.评分"
          :key="index"
          class="text-3xl cursor-pointer hover:scale-110 transition-transform"
          @click="toggleRating(index)"
        >
          {{ emoji }}
        </span>
      </div>
    </div>

    <!-- 一句话评价 -->
    <div class="mt-6">
      <el-form-item label="一句话评价">
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
  // 深度比较，避免不必要的更新
  if (JSON.stringify(newVal) !== JSON.stringify(localData.value)) {
    const merged = initLocalData()
    localData.value = merged
  }
}, { deep: true, immediate: false })
</script>

<style scoped>
:deep(.el-form-item) {
  margin-bottom: 1rem;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}
</style>

