<template>
  <div class="wealth-module">
    <!-- 引导问题 -->
    <div class="guide-question">
      <div class="guide-icon">💡</div>
      <div class="guide-text">引导问题：今天最值得做的一件"有复利"的事是什么？</div>
    </div>

    <div class="form-content space-y-6">
      <!-- 主目标（可选，可复用） -->
      <el-form-item label="财富主目标（长期）" label-width="140px">
        <el-input
          v-model="localData.主目标"
          placeholder="例如：三年内把可支配现金流做到X，靠主职+副业（可选，可复用）"
          :maxlength="100"
          show-word-limit
        />
        <div class="hint-text">长期目标，不需要每天改</div>
      </el-form-item>

      <!-- 今日焦点问题 -->
      <el-form-item label="今日财富焦点问题" label-width="140px" required>
        <el-input
          v-model="localData.今日焦点问题"
          placeholder="例如：今天最值得做的一件&quot;有复利&quot;的事是什么？"
          :maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <!-- 今日行动 + 预计时间 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <el-form-item label="今日关键行动（MIT-财富）" label-width="140px" class="md:col-span-2" required>
          <el-input
            v-model="localData.今日行动"
            placeholder="例如：整理副业产品的landing page文案"
            :maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="预计时间" label-width="100px">
          <div class="flex items-center gap-2">
            <el-input-number
              v-model="localData.预计时间"
              :min="0"
              :max="24"
              :precision="0.5"
              :step="0.5"
              controls-position="right"
              class="flex-1"
            />
            <span class="unit-text">小时</span>
          </div>
        </el-form-item>
      </div>

      <!-- 事件记录 -->
      <el-form-item label="财富事件记录" label-width="140px" required>
        <el-input
          v-model="localData.事件记录"
          type="textarea"
          :rows="6"
          placeholder="今天做了哪些跟赚钱/成长有关的事情？有没有拖延、瞎忙？只写事实。"
          :maxlength="300"
          show-word-limit
        />
        <div class="hint-text">200-300字，只记录事实</div>
      </el-form-item>

      <!-- 反思：忙还是在积累 -->
      <el-form-item label="今天更像是在&quot;忙&quot;还是在&quot;积累&quot;？" label-width="140px" required>
        <el-radio-group v-model="localData.反思_忙还是在积累" class="w-full">
          <el-radio label="忙">忙</el-radio>
          <el-radio label="积累">积累</el-radio>
          <el-radio label="两者都有">两者都有</el-radio>
        </el-radio-group>
        <el-input
          v-if="localData.反思_忙还是在积累"
          v-model="localData.反思_忙还是在积累_说明"
          type="textarea"
          :rows="2"
          placeholder="为什么？"
          :maxlength="200"
          show-word-limit
          class="mt-2"
        />
      </el-form-item>

      <!-- 反思：今天的浪费 -->
      <el-form-item label="今天一个可以避免的浪费" label-width="140px" required>
        <el-input
          v-model="localData.反思_今天的浪费"
          type="textarea"
          :rows="3"
          placeholder="时间/金钱/机会的浪费"
          :maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <!-- 反思：30天最有复利的一件事 -->
      <el-form-item label="如果只选一件事坚持30天" label-width="140px" required>
        <el-input
          v-model="localData.反思_30天最有复利的一件事"
          type="textarea"
          :rows="3"
          placeholder="对财富最有帮助的是什么？"
          :maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <!-- 明日一小步 -->
      <el-form-item label="明日财富一小步" label-width="140px" required>
        <el-input
          v-model="localData.明日一小步"
          placeholder="例如：给副业产品写3条用户痛点文案草稿"
          :maxlength="100"
          show-word-limit
        />
        <div class="hint-text">明日财富承诺（一件小事）</div>
      </el-form-item>
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
      主目标: '',
      今日焦点问题: '',
      今日行动: '',
      预计时间: 0,
      事件记录: '',
      反思_忙还是在积累: '',
      反思_忙还是在积累_说明: '',
      反思_今天的浪费: '',
      反思_30天最有复利的一件事: '',
      明日一小步: ''
    })
  }
})

const emit = defineEmits(['update:modelValue', 'next', 'prev'])

// 初始化数据结构
function initLocalData() {
  const defaultData = {
    主目标: '',
    今日焦点问题: '',
    今日行动: '',
    预计时间: 0,
    事件记录: '',
    反思_忙还是在积累: '',
    反思_忙还是在积累_说明: '',
    反思_今天的浪费: '',
    反思_30天最有复利的一件事: '',
    明日一小步: ''
  }
  
  const merged = JSON.parse(JSON.stringify(defaultData))
  if (props.modelValue) {
    Object.keys(defaultData).forEach(key => {
      if (props.modelValue[key] !== undefined) {
        merged[key] = props.modelValue[key]
      }
    })
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
    Object.keys(localData.value).forEach(key => {
      if (newVal[key] !== undefined) {
        localData.value[key] = newVal[key]
      }
    })
  }
}, { deep: true })

// 初始化时确保数据结构完整
onMounted(() => {
  const defaultData = {
    主目标: '',
    今日焦点问题: '',
    今日行动: '',
    预计时间: 0,
    事件记录: '',
    反思_忙还是在积累: '',
    反思_忙还是在积累_说明: '',
    反思_今天的浪费: '',
    反思_30天最有复利的一件事: '',
    明日一小步: ''
  }
  Object.keys(defaultData).forEach(key => {
    if (localData.value[key] === undefined) {
      localData.value[key] = defaultData[key]
    }
  })
})
</script>

<style scoped>
.wealth-module {
  @apply space-y-6;
}

.guide-question {
  @apply flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-100 mb-4;
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

.hint-text {
  @apply text-xs text-gray-500 mt-1;
}

.unit-text {
  @apply text-sm text-gray-500 whitespace-nowrap;
  min-width: 32px;
}

:deep(.el-form-item) {
  margin-bottom: 1.5rem;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
  font-size: 15px;
}

:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
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

  :deep(.el-input__inner) {
    font-size: 16px;
    min-height: 48px;
    padding: 12px;
  }

  :deep(.el-textarea__inner) {
    font-size: 16px;
    min-height: 100px;
    padding: 12px;
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

  :deep(.el-radio-group) {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

