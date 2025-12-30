<template>
  <div class="life-module">
    <!-- 基础信息 -->
    <div class="form-section">
      <h3 class="section-title">基础信息</h3>
      <el-form-item label="坚持天数" label-width="100px">
        <div class="flex items-center gap-2">
          <el-input-number
            v-model="localData.坚持天数"
            :min="0"
            controls-position="right"
            class="flex-1 md:flex-initial md:w-32"
          />
          <span class="unit-text">天</span>
        </div>
      </el-form-item>
    </div>

    <!-- 习惯列表 -->
    <div class="form-section">
      <h3 class="section-title">习惯列表</h3>
      <div class="space-y-2">
        <div
          v-for="(habit, index) in localData.习惯"
          :key="index"
          class="flex gap-2 items-center"
        >
          <el-input
            v-model="localData.习惯[index]"
            placeholder="输入习惯内容"
            class="flex-1"
          />
          <el-button
            type="danger"
            :icon="Delete"
            circle
            size="small"
            @click="removeHabit(index)"
          />
        </div>
        <el-button
          type="primary"
          :icon="Plus"
          @click="addHabit"
          class="w-full"
          plain
        >
          添加习惯
        </el-button>
      </div>
    </div>

    <!-- 内耗记录 -->
    <div class="form-section">
      <h3 class="section-title">内耗记录</h3>
      <el-collapse v-model="activeCollapse" class="mb-4">
        <el-collapse-item
          v-for="(neihao, index) in localData.内耗"
          :key="index"
          :name="index"
          :title="neihao.标题 || `内耗 ${index + 1}`"
        >
          <div class="space-y-4 p-2">
            <el-input
              v-model="neihao.标题"
              placeholder="内耗主题"
              class="w-full"
            />
            <el-form-item label="原因" label-width="100px">
              <el-input
                v-model="neihao.原因"
                type="textarea"
                :rows="2"
                placeholder="描述内耗的原因..."
              />
            </el-form-item>
            <el-form-item label="想开了吗" label-width="100px">
              <el-input
                v-model="neihao.想开了吗"
                type="textarea"
                :rows="2"
                placeholder="描述是否想开了..."
              />
            </el-form-item>
            <el-form-item label="解决方案" label-width="100px">
              <el-input
                v-model="neihao.是否能解决"
                type="textarea"
                :rows="2"
                placeholder="描述解决方案..."
              />
            </el-form-item>
            <el-form-item label="权衡（可选）" label-width="100px">
              <el-input
                v-model="neihao.权衡"
                type="textarea"
                :rows="2"
                placeholder="描述权衡..."
              />
            </el-form-item>
            <el-form-item label="结论（可选）" label-width="100px">
              <el-input
                v-model="neihao.结论"
                type="textarea"
                :rows="2"
                placeholder="描述结论..."
              />
            </el-form-item>
            <el-button
              type="danger"
              :icon="Delete"
              @click="removeNeihao(index)"
              size="small"
            >
              删除
            </el-button>
          </div>
        </el-collapse-item>
      </el-collapse>
      <el-button
        type="primary"
        :icon="Plus"
        @click="addNeihao"
        class="w-full"
        plain
      >
        添加内耗记录
      </el-button>
    </div>

    <!-- 反思与总结 -->
    <div class="form-section">
      <h3 class="section-title">反思与总结</h3>
      <el-form-item label="浪费时间点" label-width="100px">
        <el-input
          v-model="localData.浪费时间点"
          type="textarea"
          :rows="3"
          placeholder="记录今天浪费时间的点..."
          :maxlength="1000"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="反思与感悟" label-width="100px">
        <el-input
          v-model="localData.反思与感悟"
          type="textarea"
          :rows="4"
          placeholder="记录今天的反思与感悟..."
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
import { Plus, Delete } from '@element-plus/icons-vue'

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
    坚持天数: 0,
    习惯: [],
    内耗: [],
    浪费时间点: '',
    反思与感悟: '',
    明日计划: {
      首要任务: ['', '', ''],
      待解决问题: ''
    }
  }
  
  const merged = { ...defaultValue, ...props.modelValue }
  
  // 确保习惯是数组
  if (!Array.isArray(merged.习惯)) {
    merged.习惯 = []
  }
  
  // 确保内耗是数组
  if (!Array.isArray(merged.内耗)) {
    merged.内耗 = []
  }
  
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
const activeCollapse = ref([])

// 更新父组件数据
function updateParent() {
  emit('update:modelValue', { ...localData.value })
}

// 添加习惯
function addHabit() {
  if (!localData.value.习惯) {
    localData.value.习惯 = []
  }
  localData.value.习惯.push('')
  updateParent()
}

// 删除习惯
function removeHabit(index) {
  localData.value.习惯.splice(index, 1)
  updateParent()
}

// 添加内耗
function addNeihao() {
  if (!localData.value.内耗) {
    localData.value.内耗 = []
  }
  localData.value.内耗.push({
    标题: '',
    原因: '',
    想开了吗: '',
    是否能解决: '',
    权衡: '',
    结论: ''
  })
  activeCollapse.value = [localData.value.内耗.length - 1]
  updateParent()
}

// 删除内耗
function removeNeihao(index) {
  localData.value.内耗.splice(index, 1)
  updateParent()
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
.life-module {
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

:deep(.el-input) {
  width: 100%;
}

:deep(.el-textarea__inner) {
  width: 100%;
}

:deep(.el-collapse-item__header) {
  font-weight: 500;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .life-module {
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

  :deep(.el-input) {
    font-size: 14px;
  }

  :deep(.el-textarea__inner) {
    font-size: 14px;
    padding: 8px;
  }

  :deep(.el-button) {
    font-size: 13px;
    padding: 8px 16px;
  }

  :deep(.el-button--small) {
    padding: 6px 12px;
    font-size: 12px;
  }

  :deep(.el-collapse-item__header) {
    font-size: 13px;
    padding: 10px 12px;
  }

  :deep(.el-collapse-item__content) {
    padding-bottom: 8px;
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

  :deep(.el-form-item__label) {
    font-size: 12px;
    margin-bottom: 4px;
  }

  :deep(.el-input) {
    font-size: 13px;
  }

  :deep(.el-textarea__inner) {
    font-size: 13px;
    padding: 6px;
  }

  :deep(.el-button) {
    font-size: 12px;
    padding: 6px 12px;
  }

  :deep(.el-collapse-item__header) {
    font-size: 12px;
    padding: 8px 10px;
  }
}
</style>
