<template>
  <div class="love-module">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">LOVE（情感）</h2>

    <div class="space-y-6">
      <!-- 新连接数 -->
      <el-form-item label="新连接数">
        <el-input-number
          v-model="localData.新连接数"
          :min="0"
          controls-position="right"
          class="w-32"
        />
      </el-form-item>

      <!-- 有效互动量 -->
      <el-form-item label="有效互动量">
        <el-input-number
          v-model="localData.有效互动量"
          :min="0"
          controls-position="right"
          class="w-32"
        />
      </el-form-item>

      <!-- 主动邀约/接受邀约次数 -->
      <el-form-item label="主动邀约/接受邀约次数">
        <el-input-number
          v-model="localData.主动邀约次数"
          :min="0"
          controls-position="right"
          class="w-32"
        />
      </el-form-item>

      <!-- 记录 -->
      <el-form-item label="记录">
        <el-input
          v-model="localData.记录"
          type="textarea"
          :rows="4"
          placeholder="此维度重在过程体验和自我成长，而非结果。记录是为了鼓励自己保持开放心态，避免变成功利性的数字游戏..."
          :maxlength="2000"
          show-word-limit
        />
        <div class="text-xs text-gray-500 mt-1">
          提示：此维度重在过程体验和自我成长，而非结果
        </div>
      </el-form-item>

      <!-- 反思与感悟 -->
      <el-form-item label="反思与感悟">
        <el-input
          v-model="localData.反思与感悟"
          type="textarea"
          :rows="4"
          placeholder="记录情感方面的反思与感悟..."
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
:deep(.el-form-item) {
  margin-bottom: 1rem;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}
</style>

