<template>
  <div class="love-module">
    <!-- 引导问题 -->
    <div class="guide-question">
      <div class="guide-icon">💡</div>
      <div class="guide-text">引导问题：今天有没有哪一个场景，让我觉得"我不是我自己"？</div>
    </div>

    <div class="form-content space-y-6">
      <!-- 主课题（可选，可复用） -->
      <el-form-item label="情感主课题（长期）" label-width="140px">
        <el-input
          v-model="localData.主课题"
          placeholder="例如：我到底想要什么样的亲密关系？ / 如何和父母相处得更轻松（可选，可复用）"
          :maxlength="100"
          show-word-limit
        />
        <div class="hint-text">当前主课题，不需要每天改</div>
      </el-form-item>

      <!-- 今日焦点问题 -->
      <el-form-item label="今日情感焦点问题" label-width="140px" required>
        <el-input
          v-model="localData.今日焦点问题"
          placeholder="例如：今天有没有哪一个场景，让我觉得&quot;我不是我自己&quot;？"
          :maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <!-- 今日行动 -->
      <el-form-item label="今日情感行动" label-width="140px" required>
        <el-input
          v-model="localData.今日行动"
          placeholder="例如：给相亲对象发一条真诚的信息，不评判，只表达真实想法 / 给爸妈打一个10分钟的电话，只听他们说"
          :maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <!-- 事件记录 -->
      <el-form-item label="情感事件记录" label-width="140px" required>
        <el-input
          v-model="localData.事件记录"
          type="textarea"
          :rows="6"
          placeholder="发生了什么互动？我表面上怎么做的？内心真实感受是什么？只写事实。"
          :maxlength="300"
          show-word-limit
        />
        <div class="hint-text">200-300字，只记录事实</div>
      </el-form-item>

      <!-- 反思：违背理想自我的瞬间 -->
      <el-form-item label="今天在哪个瞬间违背了理想中的自己？" label-width="140px" required>
        <el-input
          v-model="localData.反思_违背理想自我的瞬间"
          type="textarea"
          :rows="3"
          placeholder="今天在哪个瞬间，我&quot;违背&quot;了理想中的自己？"
          :maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <!-- 反思：对自己说实话 -->
      <el-form-item label="用一句话对自己说实话" label-width="140px" required>
        <el-input
          v-model="localData.反思_对自己说实话"
          type="textarea"
          :rows="3"
          placeholder="如果用一句话对自己说实话，会说什么？"
          :maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <!-- 反思：下次可以尝试的小动作 -->
      <el-form-item label="下一次类似场景可以尝试的小动作" label-width="140px" required>
        <el-input
          v-model="localData.反思_下次可以尝试的小动作"
          type="textarea"
          :rows="3"
          placeholder="下一次类似场景，我可以尝试的一个不一样的小动作？"
          :maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <!-- 明日一小步 -->
      <el-form-item label="明日情感一小步" label-width="140px" required>
        <el-input
          v-model="localData.明日一小步"
          placeholder="例如：给对象发一条不评判的信息，只表达感受"
          :maxlength="100"
          show-word-limit
        />
        <div class="hint-text">明日情感承诺（一件小事）</div>
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
      主课题: '',
      今日焦点问题: '',
      今日行动: '',
      事件记录: '',
      反思_违背理想自我的瞬间: '',
      反思_对自己说实话: '',
      反思_下次可以尝试的小动作: '',
      明日一小步: ''
    })
  }
})

const emit = defineEmits(['update:modelValue', 'next', 'prev'])

// 初始化数据结构
function initLocalData() {
  const defaultData = {
    主课题: '',
    今日焦点问题: '',
    今日行动: '',
    事件记录: '',
    反思_违背理想自我的瞬间: '',
    反思_对自己说实话: '',
    反思_下次可以尝试的小动作: '',
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
    主课题: '',
    今日焦点问题: '',
    今日行动: '',
    事件记录: '',
    反思_违背理想自我的瞬间: '',
    反思_对自己说实话: '',
    反思_下次可以尝试的小动作: '',
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
.love-module {
  @apply space-y-6;
}

.guide-question {
  @apply flex items-center gap-3 p-4 bg-pink-50 rounded-lg border border-pink-100 mb-4;
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

:deep(.el-form-item) {
  margin-bottom: 1.5rem;
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
}
</style>
