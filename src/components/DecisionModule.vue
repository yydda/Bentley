<template>
  <div class="decision-module">
    <!-- 引导问题 -->
    <div class="guide-question">
      <div class="guide-icon">💡</div>
      <div class="guide-text">引导问题：今天有什么需要决策的事情？通过结构化思考来推进决策</div>
    </div>

    <div class="form-content space-y-6">
      <!-- 决策列表 -->
      <div v-if="localData.length === 0" class="empty-state">
        <el-empty description="今天还没有需要决策的事情" :image-size="100">
          <el-button type="primary" :icon="Plus" @click="addDecision">
            添加新决策
          </el-button>
        </el-empty>
      </div>

      <div v-else class="decisions-list space-y-4">
        <div
          v-for="(decision, index) in localData"
          :key="decision.决策ID"
          class="decision-card"
        >
          <div class="decision-header">
            <span class="decision-title">决策 {{ index + 1 }}</span>
            <div class="decision-actions">
              <el-switch
                v-model="decision.是否解决"
                active-text="已决策"
                inactive-text="思考中"
                size="small"
              />
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                circle
                @click="removeDecision(index)"
              />
            </div>
          </div>

          <div class="decision-content space-y-4">
            <el-form-item label="决策主题" label-width="140px" required>
              <el-input
                v-model="decision.决策主题"
                placeholder="例如：是否买车 / 是否换工作"
                :maxlength="100"
                show-word-limit
              />
            </el-form-item>

            <div class="decision-framework">
              <el-form-item label="带来什么" label-width="140px" required>
                <el-input
                  v-model="decision.带来什么"
                  type="textarea"
                  :rows="3"
                  placeholder="如果做这个决策，会带来什么？"
                  :maxlength="300"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="失去什么" label-width="140px" required>
                <el-input
                  v-model="decision.失去什么"
                  type="textarea"
                  :rows="3"
                  placeholder="会失去什么？"
                  :maxlength="300"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="真实痛点" label-width="140px" required>
                <el-input
                  v-model="decision.真实痛点"
                  type="textarea"
                  :rows="3"
                  placeholder="我真正想解决的是什么问题？"
                  :maxlength="300"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="替代方案" label-width="140px" required>
                <el-input
                  v-model="decision.替代方案"
                  type="textarea"
                  :rows="3"
                  placeholder="有没有不通过这个决策也能解决痛点的方法？"
                  :maxlength="300"
                  show-word-limit
                />
              </el-form-item>
            </div>

            <el-divider v-if="decision.是否解决" />

            <div v-if="decision.是否解决" class="decision-conclusion">
              <el-form-item label="决策结论" label-width="140px">
                <el-input
                  v-model="decision.决策结论"
                  type="textarea"
                  :rows="3"
                  placeholder="最终决定是什么？为什么？"
                  :maxlength="300"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="下一步行动" label-width="140px">
                <el-input
                  v-model="decision.下一步行动"
                  placeholder="如果决定做，下一步具体行动是什么？"
                  :maxlength="100"
                  show-word-limit
                />
              </el-form-item>
            </div>
          </div>
        </div>
      </div>

      <el-button
        type="primary"
        :icon="Plus"
        @click="addDecision"
        class="w-full"
      >
        添加新决策
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { debounce } from 'lodash'
import { Plus, Delete } from '@element-plus/icons-vue'
import { getDefaultDecision } from '../utils/storage'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

// 初始化数据结构
function initLocalData() {
  if (props.modelValue && Array.isArray(props.modelValue) && props.modelValue.length > 0) {
    return JSON.parse(JSON.stringify(props.modelValue))
  }
  return []
}

const localData = ref(initLocalData())
// 标记是否正在更新，避免循环更新
const isUpdating = ref(false)

// 添加决策
function addDecision() {
  const newDecision = getDefaultDecision()
  localData.value.push(newDecision)
  debouncedUpdateParent()
}

// 删除决策
function removeDecision(index) {
  localData.value.splice(index, 1)
  debouncedUpdateParent()
}

// 监听本地数据变化，更新父组件（使用防抖）
const debouncedUpdateParent = debounce(() => {
  if (!isUpdating.value) {
    emit('update:modelValue', [...localData.value])
  }
}, 300)

watch(localData, () => {
  debouncedUpdateParent()
}, { deep: true })

// 当父组件的modelValue变化时，更新localData
watch(() => props.modelValue, (newVal, oldVal) => {
  // 避免循环更新
  if (isUpdating.value) return
  
  // 深度比较，避免不必要的更新
  const currentStr = JSON.stringify(localData.value)
  const newStr = JSON.stringify(newVal && Array.isArray(newVal) ? newVal : [])
  
  if (currentStr !== newStr) {
    isUpdating.value = true
    try {
      if (newVal && Array.isArray(newVal) && newVal.length > 0) {
        localData.value = JSON.parse(JSON.stringify(newVal))
      } else {
        localData.value = []
      }
    } finally {
      // 使用nextTick确保更新完成后再重置标志
      setTimeout(() => {
        isUpdating.value = false
      }, 100)
    }
  }
}, { deep: true, immediate: true })

// 初始化时确保数据结构完整
onMounted(() => {
  if (!Array.isArray(localData.value)) {
    localData.value = []
  }
  // 确保初始数据同步
  if (props.modelValue && Array.isArray(props.modelValue)) {
    const currentStr = JSON.stringify(localData.value)
    const propStr = JSON.stringify(props.modelValue)
    if (currentStr !== propStr) {
      localData.value = JSON.parse(JSON.stringify(props.modelValue))
    }
  }
})
</script>

<style scoped>
.decision-module {
  @apply space-y-6;
}

.guide-question {
  @apply flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100 mb-4;
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

.empty-state {
  @apply py-8;
}

.decisions-list {
  @apply space-y-4;
}

.decision-card {
  @apply bg-gray-50 rounded-lg p-4 border border-gray-200;
}

.decision-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-300;
}

.decision-title {
  @apply font-semibold text-gray-800;
}

.decision-actions {
  @apply flex items-center gap-2;
}

.decision-content {
  @apply mt-4;
}

.decision-framework {
  @apply space-y-4;
}

.decision-conclusion {
  @apply space-y-4 bg-green-50 p-4 rounded-lg border border-green-200;
}

:deep(.el-form-item) {
  margin-bottom: 1rem;
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

  .decision-card {
    @apply p-3;
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
}
</style>

