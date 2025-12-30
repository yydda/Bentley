<template>
  <div class="work-module">
    <!-- 引导问题 -->
    <div class="guide-question">
      <div class="guide-icon">💡</div>
      <div class="guide-text">引导问题：我在做的事，是否对目标有推进？</div>
    </div>

    <!-- 时间分配 -->
    <el-collapse v-model="activeCollapse" class="form-section">
      <el-collapse-item name="time" :title="'⏰ 时间分配'">
        <div class="form-content">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <el-form-item label="主职工作" label-width="120px">
              <div class="flex items-center gap-2">
                <el-input-number
                  v-model="localData.时间分配.主职工作"
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

            <el-form-item label="副业/项目" label-width="120px">
              <div class="flex items-center gap-2">
                <el-input-number
                  v-model="localData.时间分配.副业项目"
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

            <el-form-item label="学习/成长" label-width="120px">
              <div class="flex items-center gap-2">
                <el-input-number
                  v-model="localData.时间分配.学习成长"
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

            <el-form-item label="娱乐/放松" label-width="120px">
              <div class="flex items-center gap-2">
                <el-input-number
                  v-model="localData.时间分配.娱乐放松"
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

            <el-form-item label="社交/关系" label-width="120px">
              <div class="flex items-center gap-2">
                <el-input-number
                  v-model="localData.时间分配.社交关系"
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

            <el-form-item label="通勤/杂事" label-width="120px">
              <div class="flex items-center gap-2">
                <el-input-number
                  v-model="localData.时间分配.通勤杂事"
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

            <el-form-item label="睡眠" label-width="120px">
              <div class="flex items-center gap-2">
                <el-input-number
                  v-model="localData.时间分配.睡眠"
                  :min="0"
                  :max="24"
                  :precision="1"
                  :step="0.5"
                  controls-position="right"
                  class="flex-1"
                  placeholder="0"
                  disabled
                />
                <span class="unit-text">小时（与省身模块同步）</span>
              </div>
            </el-form-item>
          </div>

          <!-- 时间总和提示 -->
          <div class="time-summary">
            <el-alert
              v-if="totalHours !== 24"
              :title="`时间总和：${totalHours.toFixed(1)} 小时（不等于24小时，请检查！）`"
              type="warning"
              show-icon
              :closable="false"
            />
            <el-alert
              v-else
              title="时间分配完美！"
              type="success"
              show-icon
              :closable="false"
            />
            <div class="target-time-info">
              <span>目标相关时间占比：</span>
              <span class="target-percentage">{{ targetTimePercentage.toFixed(1) }}%</span>
              <span class="target-desc">（主职+副业+学习）</span>
            </div>
          </div>
        </div>
      </el-collapse-item>

      <!-- 目标与产出 -->
      <el-collapse-item name="goal" :title="'🎯 目标与产出'">
        <div class="form-content">
          <el-form-item label="今日MIT" label-width="120px">
            <el-input
              v-model="localData.目标与产出.今日MIT"
              placeholder="今天最重要的一件事是什么？"
              :maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="MIT完成度" label-width="120px">
            <div class="slider-container">
              <el-slider
                v-model="localData.目标与产出.MIT完成度"
                :min="0"
                :max="100"
                :step="1"
                show-stops
                show-input
                class="flex-1"
              />
              <span class="slider-label">{{ localData.目标与产出.MIT完成度 }}%</span>
            </div>
          </el-form-item>

          <el-form-item label="未完成原因" label-width="120px">
            <el-input
              v-model="localData.目标与产出.未完成原因"
              type="textarea"
              :rows="2"
              placeholder="如果没完成，真实原因是什么？（可选）"
              :maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="今日产出" label-width="120px">
            <el-input
              v-model="localData.目标与产出.今日产出"
              type="textarea"
              :rows="3"
              placeholder="今天最值得被写进履历/作品集的一件事是什么？（可选）"
              :maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="效率自评" label-width="120px">
            <div class="slider-container">
              <el-slider
                v-model="localData.目标与产出.效率自评"
                :min="1"
                :max="5"
                :step="1"
                show-stops
                show-input
                class="flex-1"
              />
              <span class="slider-label">{{ ['很低', '较低', '一般', '较高', '很高'][localData.目标与产出.效率自评 - 1] }}</span>
            </div>
          </el-form-item>
        </div>
      </el-collapse-item>

      <!-- 项目进度 -->
      <el-collapse-item name="project" :title="'📈 项目进度'">
        <div class="form-content">
          <el-form-item label="项目进度" label-width="120px">
            <div class="slider-container">
              <el-slider
                v-model="localData.项目进度.项目进度"
                :min="0"
                :max="100"
                :step="1"
                show-stops
                show-input
                class="flex-1"
              />
              <span class="slider-label">{{ localData.项目进度.项目进度 }}%</span>
            </div>
          </el-form-item>

          <el-form-item label="工作反思" label-width="120px">
            <el-input
              v-model="localData.项目进度.工作反思"
              type="textarea"
              :rows="4"
              placeholder="今天的工作反思和知识整理（可选）"
              :maxlength="300"
              show-word-limit
            />
          </el-form-item>
        </div>
      </el-collapse-item>
    </el-collapse>

    <!-- 总结问题（必填） -->
    <div class="summary-section">
      <div class="summary-label">
        <span class="required-mark">*</span>
        <span>总结问题：今天，我在做的事是否对目标有推进？</span>
      </div>
      <el-input
        v-model="localData.总结"
        type="textarea"
        :rows="4"
        placeholder="请用200字以内总结今天对目标的推进情况..."
        :maxlength="200"
        show-word-limit
        class="summary-input"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { debounce } from 'lodash'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      时间分配: {
        主职工作: 0,
        副业项目: 0,
        学习成长: 0,
        娱乐放松: 0,
        社交关系: 0,
        通勤杂事: 0,
        睡眠: 0
      },
      目标与产出: {
        今日MIT: '',
        MIT完成度: 0,
        未完成原因: '',
        今日产出: '',
        效率自评: 3
      },
      项目进度: {
        项目进度: 0,
        工作反思: ''
      },
      总结: ''
    })
  },
  sleepHours: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'next'])

// 初始化数据结构，确保所有嵌套对象都存在
function initLocalData() {
  const defaultData = {
    时间分配: {
      主职工作: 0,
      副业项目: 0,
      学习成长: 0,
      娱乐放松: 0,
      社交关系: 0,
      通勤杂事: 0,
      睡眠: props.sleepHours || 0
    },
    目标与产出: {
      今日MIT: '',
      MIT完成度: 0,
      未完成原因: '',
      今日产出: '',
      效率自评: 3
    },
    项目进度: {
      项目进度: 0,
      工作反思: ''
    },
    总结: ''
  }
  
  // 深度合并默认数据和传入的数据
  const merged = JSON.parse(JSON.stringify(defaultData))
  if (props.modelValue) {
    if (props.modelValue.时间分配) {
      merged.时间分配 = { ...merged.时间分配, ...props.modelValue.时间分配 }
      // 同步睡眠时长
      if (props.sleepHours !== undefined) {
        merged.时间分配.睡眠 = props.sleepHours
      }
    }
    if (props.modelValue.目标与产出) {
      merged.目标与产出 = { ...merged.目标与产出, ...props.modelValue.目标与产出 }
    }
    if (props.modelValue.项目进度) {
      merged.项目进度 = { ...merged.项目进度, ...props.modelValue.项目进度 }
    }
    if (props.modelValue.总结 !== undefined) {
      merged.总结 = props.modelValue.总结
    }
  }
  
  return merged
}

const localData = ref(initLocalData())
const activeCollapse = ref(['time', 'goal']) // 默认展开前两个

// 计算总小时数
const totalHours = computed(() => {
  return (
    (localData.value.时间分配.主职工作 || 0) +
    (localData.value.时间分配.副业项目 || 0) +
    (localData.value.时间分配.学习成长 || 0) +
    (localData.value.时间分配.娱乐放松 || 0) +
    (localData.value.时间分配.社交关系 || 0) +
    (localData.value.时间分配.通勤杂事 || 0) +
    (localData.value.时间分配.睡眠 || 0)
  )
})

// 计算目标相关时间占比
const targetTimePercentage = computed(() => {
  const targetTime = 
    (localData.value.时间分配.主职工作 || 0) +
    (localData.value.时间分配.副业项目 || 0) +
    (localData.value.时间分配.学习成长 || 0)
  return totalHours.value > 0 ? (targetTime / totalHours.value) * 100 : 0
})

// 同步睡眠时长
watch(() => props.sleepHours, (newVal) => {
  if (newVal !== undefined && newVal !== null) {
    localData.value.时间分配.睡眠 = newVal
  }
})

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
    if (newVal.时间分配) {
      localData.value.时间分配 = { ...localData.value.时间分配, ...newVal.时间分配 }
      // 同步睡眠时长
      if (props.sleepHours !== undefined) {
        localData.value.时间分配.睡眠 = props.sleepHours
      }
    }
    if (newVal.目标与产出) {
      localData.value.目标与产出 = { ...localData.value.目标与产出, ...newVal.目标与产出 }
    }
    if (newVal.项目进度) {
      localData.value.项目进度 = { ...localData.value.项目进度, ...newVal.项目进度 }
    }
    if (newVal.总结 !== undefined) {
      localData.value.总结 = newVal.总结
    }
  }
}, { deep: true })

// 初始化时确保数据结构完整
onMounted(() => {
  if (!localData.value.时间分配) {
    localData.value.时间分配 = {
      主职工作: 0,
      副业项目: 0,
      学习成长: 0,
      娱乐放松: 0,
      社交关系: 0,
      通勤杂事: 0,
      睡眠: props.sleepHours || 0
    }
  }
  if (!localData.value.目标与产出) {
    localData.value.目标与产出 = {
      今日MIT: '',
      MIT完成度: 0,
      未完成原因: '',
      今日产出: '',
      效率自评: 3
    }
  }
  if (!localData.value.项目进度) {
    localData.value.项目进度 = {
      项目进度: 0,
      工作反思: ''
    }
  }
  if (!localData.value.总结) {
    localData.value.总结 = ''
  }
  
  // 同步睡眠时长
  if (props.sleepHours) {
    localData.value.时间分配.睡眠 = props.sleepHours
  }
})
</script>

<style scoped>
.work-module {
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

.unit-text {
  @apply text-sm text-gray-500 whitespace-nowrap;
  min-width: 32px;
}

.time-summary {
  @apply mt-4 space-y-2;
}

.target-time-info {
  @apply text-sm text-gray-600 mt-2;
}

.target-percentage {
  @apply font-semibold text-blue-600;
}

.target-desc {
  @apply text-gray-500;
}

.slider-container {
  @apply flex items-center gap-4 w-full;
}

.slider-label {
  @apply text-sm text-gray-600 min-w-16 text-right;
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

