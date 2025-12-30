<template>
  <div class="am-module">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">AM（工作）</h2>

    <div class="space-y-6">
      <!-- 项目进度 -->
      <el-form-item label="项目进度">
        <div class="flex items-center gap-4 w-full">
          <el-slider
            v-model="localData.项目进度"
            :min="0"
            :max="100"
            :step="1"
            show-stops
            show-input
            class="flex-1"
          />
          <span class="text-lg font-semibold w-16 text-right">
            {{ localData.项目进度 }}%
          </span>
        </div>
      </el-form-item>

      <!-- 时间追踪 -->
      <el-form-item label="时间追踪（小时）">
        <el-input-number
          v-model="localData.时间追踪"
          :min="0"
          :max="24"
          :precision="1"
          :step="0.5"
          controls-position="right"
          class="w-full"
        />
      </el-form-item>

      <!-- 效率管理 -->
      <el-form-item label="效率管理（小时）">
        <el-input-number
          v-model="localData.效率管理"
          :min="0"
          :max="24"
          :precision="1"
          :step="0.5"
          controls-position="right"
          class="w-full"
        />
      </el-form-item>

      <!-- 产出 -->
      <el-form-item label="产出（记录每日完成的具体功能模块、解决的bug数量）">
        <el-input
          v-model="localData.产出"
          type="textarea"
          :rows="4"
          placeholder="记录今天完成的工作产出..."
          :maxlength="2000"
          show-word-limit
        />
      </el-form-item>

      <!-- 反思与感悟 知识库整理 -->
      <el-form-item label="反思与感悟 知识库整理">
        <el-input
          v-model="localData.反思与感悟"
          type="textarea"
          :rows="4"
          placeholder="记录工作反思和知识整理..."
          :maxlength="2000"
          show-word-limit
        />
      </el-form-item>

      <!-- 明日计划 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          明日计划
        </label>
        <div class="space-y-3">
          <div>
            <label class="block text-sm text-gray-600 mb-1">
              首要任务（MIT-1，最多3项）
            </label>
            <el-input
              v-for="(task, index) in localData.明日计划.首要任务"
              :key="index"
              v-model="localData.明日计划.首要任务[index]"
              :placeholder="`任务 ${index + 1}`"
              class="mb-2"
            />
          </div>
          <el-form-item label="待解决问题/新需求">
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
:deep(.el-form-item) {
  margin-bottom: 1rem;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}
</style>

