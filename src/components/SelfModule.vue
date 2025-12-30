<template>
  <div class="self-module">
    <!-- 引导问题 -->
    <div class="guide-question">
      <div class="guide-icon">💡</div>
      <div class="guide-text">引导问题：我对自己负责了吗？</div>
    </div>

    <!-- 身体与精力 -->
    <el-collapse v-model="activeCollapse" class="form-section">
      <el-collapse-item name="body" :title="'📊 身体与精力'">
        <div class="form-content">
          <el-form-item label="睡眠时长" label-width="120px">
            <div class="flex items-center gap-2">
              <el-input-number
                v-model="localData.身体与精力.睡眠时长"
                :min="0"
                :max="24"
                :precision="1"
                :step="0.5"
                controls-position="right"
                class="flex-1"
                placeholder="0"
                @change="syncSleepToWork"
              />
              <span class="unit-text">小时</span>
            </div>
          </el-form-item>

          <el-form-item label="睡眠质量" label-width="120px">
            <div class="rating-emojis">
              <span
                v-for="n in 5"
                :key="n"
                class="rating-emoji"
                :class="{ 'rating-active': (localData.身体与精力?.睡眠质量 || 3) === n }"
                @click="localData.身体与精力.睡眠质量 = n"
              >
                {{ ['😴', '😑', '😐', '😊', '😴'][n - 1] }}
              </span>
            </div>
          </el-form-item>

          <el-form-item label="运动情况" label-width="120px">
            <el-input
              v-model="localData.身体与精力.运动情况"
              placeholder="今天有运动吗？（可选）"
              :maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="精力水平" label-width="120px">
            <div class="slider-container">
              <el-slider
                v-model="localData.身体与精力.精力水平"
                :min="1"
                :max="5"
                :step="1"
                show-stops
                show-input
                class="flex-1"
              />
              <span class="slider-label">{{ ['很差', '较差', '一般', '较好', '很好'][(localData.身体与精力?.精力水平 || 3) - 1] }}</span>
            </div>
          </el-form-item>

          <el-form-item label="疲劳原因" label-width="120px">
            <el-checkbox-group v-model="localData.身体与精力.疲劳原因">
              <el-checkbox label="工作">工作</el-checkbox>
              <el-checkbox label="社交">社交</el-checkbox>
              <el-checkbox label="情绪">情绪</el-checkbox>
              <el-checkbox label="其他">其他</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>
      </el-collapse-item>

      <!-- 心情与情绪 -->
      <el-collapse-item name="emotion" :title="'😊 心情与情绪'">
        <div class="form-content">
          <el-form-item label="今日心情" label-width="120px">
            <div class="rating-emojis">
              <span
                v-for="n in 5"
                :key="n"
                class="rating-emoji"
                :class="{ 'rating-active': (localData.心情与情绪?.今日心情 || 3) === n }"
                @click="localData.心情与情绪.今日心情 = n"
              >
                {{ ['😢', '😐', '😊', '😄', '🤩'][n - 1] }}
              </span>
            </div>
          </el-form-item>

          <el-form-item label="高光时刻" label-width="120px">
            <el-input
              v-model="localData.心情与情绪.高光时刻"
              placeholder="今天最开心/满足的一刻是什么？（可选）"
              :maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="低谷时刻" label-width="120px">
            <el-input
              v-model="localData.心情与情绪.低谷时刻"
              placeholder="今天最难受/沮丧的一刻是什么？（可选）"
              :maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="情绪关键词" label-width="120px">
            <el-checkbox-group v-model="localData.心情与情绪.情绪关键词">
              <el-checkbox label="焦虑">焦虑</el-checkbox>
              <el-checkbox label="平静">平静</el-checkbox>
              <el-checkbox label="兴奋">兴奋</el-checkbox>
              <el-checkbox label="疲惫">疲惫</el-checkbox>
              <el-checkbox label="满足">满足</el-checkbox>
              <el-checkbox label="失落">失落</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>
      </el-collapse-item>

      <!-- 学习与成长 -->
      <el-collapse-item name="growth" :title="'📚 学习与成长'">
        <div class="form-content">
          <el-form-item label="今日学习" label-width="120px">
            <el-input
              v-model="localData.学习与成长.今日学习"
              type="textarea"
              :rows="2"
              placeholder="今天学到了什么新东西？（可选）"
              :maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="成长瞬间" label-width="120px">
            <el-input
              v-model="localData.学习与成长.成长瞬间"
              type="textarea"
              :rows="2"
              placeholder="今天有没有做一件对未来的自己有帮助的事？（可选）"
              :maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="自我觉察" label-width="120px">
            <el-input
              v-model="localData.学习与成长.自我觉察"
              type="textarea"
              :rows="3"
              placeholder="今天什么事情最消耗你？为什么？（可选）"
              :maxlength="200"
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
        <span>总结问题：今天，我对自己负责了吗？</span>
      </div>
      <el-input
        v-model="localData.总结"
        type="textarea"
        :rows="4"
        placeholder="请用200字以内总结今天对自己负责的情况..."
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

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      身体与精力: {
        睡眠时长: 0,
        睡眠质量: 3,
        运动情况: '',
        精力水平: 3,
        疲劳原因: []
      },
      心情与情绪: {
        今日心情: 3,
        高光时刻: '',
        低谷时刻: '',
        情绪关键词: []
      },
      学习与成长: {
        今日学习: '',
        成长瞬间: '',
        自我觉察: ''
      },
      总结: ''
    })
  }
})

const emit = defineEmits(['update:modelValue', 'next'])

// 初始化数据结构，确保所有嵌套对象都存在
function initLocalData() {
  const defaultData = {
    身体与精力: {
      睡眠时长: 0,
      睡眠质量: 3,
      运动情况: '',
      精力水平: 3,
      疲劳原因: []
    },
    心情与情绪: {
      今日心情: 3,
      高光时刻: '',
      低谷时刻: '',
      情绪关键词: []
    },
    学习与成长: {
      今日学习: '',
      成长瞬间: '',
      自我觉察: ''
    },
    总结: ''
  }
  
  // 深度合并默认数据和传入的数据
  const merged = JSON.parse(JSON.stringify(defaultData))
  if (props.modelValue) {
    if (props.modelValue.身体与精力) {
      merged.身体与精力 = { ...merged.身体与精力, ...props.modelValue.身体与精力 }
    }
    if (props.modelValue.心情与情绪) {
      merged.心情与情绪 = { ...merged.心情与情绪, ...props.modelValue.心情与情绪 }
    }
    if (props.modelValue.学习与成长) {
      merged.学习与成长 = { ...merged.学习与成长, ...props.modelValue.学习与成长 }
    }
    if (props.modelValue.总结 !== undefined) {
      merged.总结 = props.modelValue.总结
    }
  }
  
  return merged
}

const localData = ref(initLocalData())
const activeCollapse = ref(['body', 'emotion']) // 默认展开前两个

// 同步睡眠时长到省事模块
function syncSleepToWork() {
  const sleepHours = localData.value.身体与精力?.睡眠时长 || 0
  emit('syncSleep', sleepHours)
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
    if (newVal.身体与精力) {
      localData.value.身体与精力 = { ...localData.value.身体与精力, ...newVal.身体与精力 }
    }
    if (newVal.心情与情绪) {
      localData.value.心情与情绪 = { ...localData.value.心情与情绪, ...newVal.心情与情绪 }
    }
    if (newVal.学习与成长) {
      localData.value.学习与成长 = { ...localData.value.学习与成长, ...newVal.学习与成长 }
    }
    if (newVal.总结 !== undefined) {
      localData.value.总结 = newVal.总结
    }
  }
}, { deep: true })

// 初始化时确保数据结构完整（已在initLocalData中处理）
onMounted(() => {
  // 确保数据已初始化
  if (!localData.value.身体与精力) {
    localData.value.身体与精力 = {
      睡眠时长: 0,
      睡眠质量: 3,
      运动情况: '',
      精力水平: 3,
      疲劳原因: []
    }
  }
  if (!localData.value.心情与情绪) {
    localData.value.心情与情绪 = {
      今日心情: 3,
      高光时刻: '',
      低谷时刻: '',
      情绪关键词: []
    }
  }
  if (!localData.value.学习与成长) {
    localData.value.学习与成长 = {
      今日学习: '',
      成长瞬间: '',
      自我觉察: ''
    }
  }
  if (localData.value.总结 === undefined || localData.value.总结 === null) {
    localData.value.总结 = ''
  }
})
</script>

<style scoped>
.self-module {
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

.rating-emojis {
  @apply flex gap-3;
}

.rating-emoji {
  @apply text-3xl cursor-pointer transition-all duration-200;
  @apply hover:scale-125 active:scale-110;
}

.rating-active {
  @apply scale-125;
}

.slider-container {
  @apply flex items-center gap-4 w-full;
}

.slider-label {
  @apply text-sm text-gray-600 min-w-12;
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

  .rating-emoji {
    @apply text-2xl;
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

