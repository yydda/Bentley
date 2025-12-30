<template>
  <div class="relationships-module">
    <!-- 引导问题 -->
    <div class="guide-question">
      <div class="guide-icon">💡</div>
      <div class="guide-text">引导问题：我对他人和关系负责了吗？</div>
    </div>

    <!-- 关键关系 -->
    <el-collapse v-model="activeCollapse" class="form-section">
      <el-collapse-item name="relationships" :title="'👥 关键关系'">
        <div class="form-content">
          <el-form-item label="与父母互动" label-width="120px">
            <el-input
              v-model="localData.关键关系.与父母互动"
              placeholder="今天和父母有互动吗？（可选）"
              :maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="与伴侣互动" label-width="120px">
            <el-input
              v-model="localData.关键关系.与伴侣互动"
              placeholder="今天和伴侣有互动吗？（可选）"
              :maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="与朋友互动" label-width="120px">
            <el-input
              v-model="localData.关键关系.与朋友互动"
              placeholder="今天和朋友有互动吗？（可选）"
              :maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="关系质量" label-width="120px">
            <div class="slider-container">
              <el-slider
                v-model="localData.关键关系.关系质量"
                :min="1"
                :max="5"
                :step="1"
                show-stops
                show-input
                class="flex-1"
              />
              <span class="slider-label">{{ ['很差', '较差', '一般', '较好', '很好'][localData.关键关系.关系质量 - 1] }}</span>
            </div>
          </el-form-item>
        </div>
      </el-collapse-item>

      <!-- 贡献与帮助 -->
      <el-collapse-item name="contribution" :title="'🤝 贡献与帮助'">
        <div class="form-content">
          <el-form-item label="帮助他人" label-width="120px">
            <el-input
              v-model="localData.贡献与帮助.帮助他人"
              type="textarea"
              :rows="2"
              placeholder="今天有没有帮到谁？哪怕是很小的事（可选）"
              :maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="新连接数" label-width="120px">
            <el-input-number
              v-model="localData.贡献与帮助.新连接数"
              :min="0"
              controls-position="right"
              class="w-full"
            />
          </el-form-item>

          <el-form-item label="有效互动量" label-width="120px">
            <el-input-number
              v-model="localData.贡献与帮助.有效互动量"
              :min="0"
              controls-position="right"
              class="w-full"
            />
          </el-form-item>
        </div>
      </el-collapse-item>

      <!-- 内耗与冲突 -->
      <el-collapse-item name="conflict" :title="'💭 内耗与冲突'">
        <div class="form-content">
          <el-button
            type="primary"
            :icon="Plus"
            @click="addConflict"
            class="mb-4"
            plain
          >
            添加内耗记录
          </el-button>

          <div class="space-y-4">
            <div
              v-for="(item, index) in localData.内耗与冲突"
              :key="index"
              class="conflict-item"
            >
              <div class="conflict-header">
                <span class="conflict-title">内耗 #{{ index + 1 }}</span>
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  size="small"
                  @click="removeConflict(index)"
                />
              </div>
              <div class="conflict-content">
                <el-form-item label="事件" label-width="100px">
                  <el-input
                    v-model="item.事件"
                    placeholder="发生了什么？"
                    :maxlength="100"
                    show-word-limit
                  />
                </el-form-item>
                <el-form-item label="我的反应" label-width="100px">
                  <el-input
                    v-model="item.我的反应"
                    type="textarea"
                    :rows="2"
                    placeholder="我当时是怎么反应的？"
                    :maxlength="100"
                    show-word-limit
                  />
                </el-form-item>
                <el-form-item label="真实感受" label-width="100px">
                  <el-input
                    v-model="item.真实感受"
                    type="textarea"
                    :rows="2"
                    placeholder="我真实的感受是什么？"
                    :maxlength="100"
                    show-word-limit
                  />
                </el-form-item>
                <el-form-item label="更好的做法" label-width="100px">
                  <el-input
                    v-model="item.更好的做法"
                    type="textarea"
                    :rows="2"
                    placeholder="如果重来，我会怎么做？"
                    :maxlength="100"
                    show-word-limit
                  />
                </el-form-item>
                <el-form-item label="是否解决" label-width="100px">
                  <el-radio-group v-model="item.是否解决">
                    <el-radio :label="true">是</el-radio>
                    <el-radio :label="false">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <!-- 总结问题（必填） -->
    <div class="summary-section">
      <div class="summary-label">
        <span class="required-mark">*</span>
        <span>总结问题：今天，我对他人和关系负责了吗？</span>
      </div>
      <el-input
        v-model="localData.总结"
        type="textarea"
        :rows="4"
        placeholder="请用200字以内总结今天对关系和他人负责的情况..."
        :maxlength="200"
        show-word-limit
        class="summary-input"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { debounce } from 'lodash'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      关键关系: {
        与父母互动: '',
        与伴侣互动: '',
        与朋友互动: '',
        关系质量: 3
      },
      贡献与帮助: {
        帮助他人: '',
        新连接数: 0,
        有效互动量: 0
      },
      内耗与冲突: [],
      总结: ''
    })
  }
})

const emit = defineEmits(['update:modelValue', 'next'])

// 初始化数据结构，确保所有嵌套对象都存在
function initLocalData() {
  const defaultData = {
    关键关系: {
      与父母互动: '',
      与伴侣互动: '',
      与朋友互动: '',
      关系质量: 3
    },
    贡献与帮助: {
      帮助他人: '',
      新连接数: 0,
      有效互动量: 0
    },
    内耗与冲突: [],
    总结: ''
  }
  
  // 深度合并默认数据和传入的数据
  const merged = JSON.parse(JSON.stringify(defaultData))
  if (props.modelValue) {
    if (props.modelValue.关键关系) {
      merged.关键关系 = { ...merged.关键关系, ...props.modelValue.关键关系 }
    }
    if (props.modelValue.贡献与帮助) {
      merged.贡献与帮助 = { ...merged.贡献与帮助, ...props.modelValue.贡献与帮助 }
    }
    if (props.modelValue.内耗与冲突) {
      merged.内耗与冲突 = Array.isArray(props.modelValue.内耗与冲突) 
        ? [...props.modelValue.内耗与冲突] 
        : []
    }
    if (props.modelValue.总结 !== undefined) {
      merged.总结 = props.modelValue.总结
    }
  }
  
  return merged
}

const localData = ref(initLocalData())
const activeCollapse = ref(['relationships', 'contribution']) // 默认展开前两个

// 添加内耗记录
function addConflict() {
  if (!localData.value.内耗与冲突) {
    localData.value.内耗与冲突 = []
  }
  localData.value.内耗与冲突.push({
    事件: '',
    我的反应: '',
    真实感受: '',
    更好的做法: '',
    是否解决: false
  })
  // 展开内耗面板
  if (!activeCollapse.value.includes('conflict')) {
    activeCollapse.value.push('conflict')
  }
}

// 删除内耗记录
function removeConflict(index) {
  localData.value.内耗与冲突.splice(index, 1)
}

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
    if (newVal.关键关系) {
      localData.value.关键关系 = { ...localData.value.关键关系, ...newVal.关键关系 }
    }
    if (newVal.贡献与帮助) {
      localData.value.贡献与帮助 = { ...localData.value.贡献与帮助, ...newVal.贡献与帮助 }
    }
    if (newVal.内耗与冲突) {
      localData.value.内耗与冲突 = Array.isArray(newVal.内耗与冲突) 
        ? [...newVal.内耗与冲突] 
        : []
    }
    if (newVal.总结 !== undefined) {
      localData.value.总结 = newVal.总结
    }
  }
}, { deep: true })

// 初始化时确保数据结构完整
onMounted(() => {
  if (!localData.value.关键关系) {
    localData.value.关键关系 = {
      与父母互动: '',
      与伴侣互动: '',
      与朋友互动: '',
      关系质量: 3
    }
  }
  if (!localData.value.贡献与帮助) {
    localData.value.贡献与帮助 = {
      帮助他人: '',
      新连接数: 0,
      有效互动量: 0
    }
  }
  if (!localData.value.内耗与冲突) {
    localData.value.内耗与冲突 = []
  }
  if (!localData.value.总结) {
    localData.value.总结 = ''
  }
})
</script>

<style scoped>
.relationships-module {
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

.form-section {
  @apply bg-white rounded-xl shadow-sm border border-gray-200/50;
}

.form-content {
  @apply p-4 space-y-4;
}

.slider-container {
  @apply flex items-center gap-4 w-full;
}

.slider-label {
  @apply text-sm text-gray-600 min-w-16 text-right;
}

.conflict-item {
  @apply bg-gray-50 rounded-lg p-4 border border-gray-200;
}

.conflict-header {
  @apply flex items-center justify-between mb-3;
}

.conflict-title {
  @apply font-semibold text-gray-700;
}

.conflict-content {
  @apply space-y-3;
}

.summary-section {
  @apply bg-yellow-50 rounded-xl p-4 border border-yellow-200;
}

.summary-label {
  @apply text-base font-semibold text-gray-700 mb-3;
}

.required-mark {
  @apply text-red-500 mr-1;
}

.summary-input {
  @apply w-full;
}

:deep(.el-form-item) {
  margin-bottom: 1rem;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

:deep(.el-collapse-item__header) {
  font-weight: 600;
  font-size: 15px;
  padding: 12px 16px;
}

:deep(.el-collapse-item__content) {
  padding: 0;
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
    @apply p-3;
  }

  .conflict-item {
    @apply p-3;
  }

  :deep(.el-form-item) {
    flex-direction: column;
    align-items: flex-start;
  }

  :deep(.el-form-item__label) {
    width: 100% !important;
    margin-bottom: 6px;
    text-align: left;
  }

  :deep(.el-form-item__content) {
    width: 100%;
    margin-left: 0 !important;
  }

  :deep(.el-input-number) {
    width: 100% !important;
  }

  :deep(.el-input-number__decrease),
  :deep(.el-input-number__increase) {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }

  :deep(.el-input__inner) {
    font-size: 16px;
    min-height: 48px;
    padding: 12px;
  }

  :deep(.el-textarea__inner) {
    font-size: 16px;
    min-height: 48px;
    padding: 12px;
  }
}
</style>

