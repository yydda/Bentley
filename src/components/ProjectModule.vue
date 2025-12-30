<template>
  <div class="project-module">
    <!-- 引导问题 -->
    <div class="guide-question">
      <div class="guide-icon">💡</div>
      <div class="guide-text">引导问题：今天在项目上，最关键的一块推进是什么？</div>
    </div>

    <div class="form-content space-y-6">
      <!-- 项目基本信息（可复用） -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <el-form-item label="当前主项目" label-width="140px">
          <el-input
            v-model="localData.项目名称"
            placeholder="例如：AI 日记系统 MVP / 个人主页重构（可选）"
            :maxlength="100"
            show-word-limit
          />
          <div class="hint-text">可复用，不需要每天改</div>
        </el-form-item>
        <el-form-item label="项目阶段" label-width="140px">
          <el-select
            v-model="localData.项目阶段"
            placeholder="选择项目阶段（可选）"
            class="w-full"
            clearable
          >
            <el-option label="探索期" value="探索期" />
            <el-option label="MVP" value="MVP" />
            <el-option label="打磨期" value="打磨期" />
            <el-option label="上线后迭代" value="上线后迭代" />
          </el-select>
        </el-form-item>
      </div>

      <!-- 今日关键推进 -->
      <el-form-item label="今日关键推进（一句话）" label-width="140px" required>
        <el-input
          v-model="localData.今日关键推进"
          placeholder="例如：完成登录模块单测 / 写完销售页面主要文案"
          :maxlength="100"
          show-word-limit
        />
        <div class="hint-text">今天这个项目往前推了一小步在哪里</div>
      </el-form-item>

      <!-- 今日项目记录 -->
      <el-form-item label="今日项目工作清单" label-width="140px" required>
        <el-input
          v-model="localData.今日项目记录"
          type="textarea"
          :rows="6"
          placeholder="按时间线或事项列出：今天具体做了哪些工作？只写事实，不评价。例如：10:00-11:30 重构 Home 页面表单结构 / 15:00-16:00 调试 Firebase 存储问题"
          :maxlength="500"
          show-word-limit
        />
        <div class="hint-text">建议 200-300 字，记录客观工作过程</div>
      </el-form-item>

      <!-- 今日项目产出（可选） -->
      <el-form-item label="今日项目产出（可选）" label-width="140px">
        <el-input
          v-model="localData.今日项目产出"
          type="textarea"
          :rows="3"
          placeholder="今天有哪些看得见的产出？例如：完成登录模块单测 / 写完 1 篇功能介绍文案 / 搭好部署流水线雏形"
          :maxlength="300"
          show-word-limit
        />
      </el-form-item>

      <!-- 项目进度感 -->
      <el-form-item label="项目进度感（0-100%）" label-width="140px" required>
        <div class="flex items-center gap-4">
          <el-slider
            v-model="localData.项目进度感"
            :min="0"
            :max="100"
            :step="5"
            show-stops
            show-input
            class="flex-1"
          />
          <span class="text-sm text-gray-600 min-w-[60px]">{{ localData.项目进度感 }}%</span>
        </div>
        <div class="hint-text">这个项目离阶段目标还有多远？</div>
      </el-form-item>

      <!-- 最有效动作 -->
      <el-form-item label="今天最有效的一个动作" label-width="140px" required>
        <el-input
          v-model="localData.最有效动作"
          type="textarea"
          :rows="3"
          placeholder="例如：和真实用户聊了 30 分钟需求 / 把阻塞了三天的 bug 解决掉了"
          :maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <!-- 今日浪费 -->
      <el-form-item label="今天最没必要的一件事" label-width="140px" required>
        <el-input
          v-model="localData.今日浪费"
          type="textarea"
          :rows="3"
          placeholder="例如：花 1 小时纠结按钮颜色 / 重构了暂时用不到的部分"
          :maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <!-- 卡点与疑问 -->
      <el-form-item label="卡点与未解决问题" label-width="140px" required>
        <el-input
          v-model="localData.卡点与疑问"
          type="textarea"
          :rows="3"
          placeholder="今天卡在哪里？有哪些还想不明白的问题？"
          :maxlength="300"
          show-word-limit
        />
      </el-form-item>

      <!-- 明日任务列表 -->
      <el-form-item label="明日项目任务（1-3个）" label-width="140px" required>
        <el-input
          v-model="localData.明日任务列表"
          type="textarea"
          :rows="4"
          placeholder="每行一个，写得足够具体：&#10;1）给日记系统加项目模块字段并保存到 Firebase&#10;2）写 500 字项目说明文档&#10;3）约第一批内测用户"
          :maxlength="500"
          show-word-limit
        />
        <div class="hint-text">只写你明天真的会做的 1-3 件事</div>
      </el-form-item>

      <!-- 明日优先级理由（可选） -->
      <el-form-item label="明日优先级说明（可选）" label-width="140px">
        <el-input
          v-model="localData.明日优先级理由"
          type="textarea"
          :rows="2"
          placeholder="例如：这三个任务完成后，就可以约第一批内测用户了"
          :maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <!-- 明日风险与准备（可选） -->
      <el-form-item label="明日风险与对策（可选）" label-width="140px">
        <el-input
          v-model="localData.明日风险与准备"
          type="textarea"
          :rows="3"
          placeholder="例如：白天会议多 → 上午只做 1 个最重要任务 / 对 XX 技术不熟 → 先看 30 分钟官方文档"
          :maxlength="300"
          show-word-limit
        />
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
      项目名称: '',
      项目阶段: '',
      今日关键推进: '',
      今日项目记录: '',
      今日项目产出: '',
      项目进度感: 0,
      最有效动作: '',
      今日浪费: '',
      卡点与疑问: '',
      明日任务列表: '',
      明日优先级理由: '',
      明日风险与准备: ''
    })
  }
})

const emit = defineEmits(['update:modelValue', 'next', 'prev'])

// 初始化数据结构
function initLocalData() {
  const defaultData = {
    项目名称: '',
    项目阶段: '',
    今日关键推进: '',
    今日项目记录: '',
    今日项目产出: '',
    项目进度感: 0,
    最有效动作: '',
    今日浪费: '',
    卡点与疑问: '',
    明日任务列表: '',
    明日优先级理由: '',
    明日风险与准备: ''
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
    项目名称: '',
    项目阶段: '',
    今日关键推进: '',
    今日项目记录: '',
    今日项目产出: '',
    项目进度感: 0,
    最有效动作: '',
    今日浪费: '',
    卡点与疑问: '',
    明日任务列表: '',
    明日优先级理由: '',
    明日风险与准备: ''
  }
  Object.keys(defaultData).forEach(key => {
    if (localData.value[key] === undefined) {
      localData.value[key] = defaultData[key]
    }
  })
})
</script>

<style scoped>
.project-module {
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

:deep(.el-form-item) {
  margin-bottom: 1.5rem;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
  font-size: 15px;
}

:deep(.el-slider) {
  margin: 0;
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

  :deep(.el-slider__runway) {
    margin: 10px 0;
  }
}
</style>

