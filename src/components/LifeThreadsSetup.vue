<template>
  <div class="life-threads-setup">
    <div class="setup-header">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">设置你的人生主线</h2>
      <p class="text-gray-600">建议设置3条主线，每天的行动都围绕这些主线推进</p>
    </div>

    <div class="threads-list space-y-4">
      <div
        v-for="(thread, index) in localThreads"
        :key="thread.主线ID"
        class="thread-card"
      >
        <div class="thread-header">
          <span class="thread-number">主线{{ index + 1 }}</span>
          <div class="thread-actions">
            <el-switch
              v-model="thread.是否激活"
              active-text="激活"
              inactive-text="停用"
              size="small"
            />
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              circle
              @click="removeThread(index)"
              :disabled="localThreads.length <= 1"
            />
          </div>
        </div>

        <div class="thread-content space-y-4">
          <el-form-item label="主线名称" label-width="120px" required>
            <el-input
              v-model="thread.主线名称"
              placeholder="例如：事业突破 / 找到合适对象 / 健康管理"
              :maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="当前阶段" label-width="120px" required>
            <el-select
              v-model="thread.当前阶段"
              placeholder="选择当前阶段"
              class="w-full"
            >
              <el-option label="探索期" value="探索期" />
              <el-option label="执行期" value="执行期" />
              <el-option label="优化期" value="优化期" />
              <el-option label="转型期" value="转型期" />
            </el-select>
          </el-form-item>

          <el-form-item label="当前关键问题" label-width="120px" required>
            <el-input
              v-model="thread.当前关键问题"
              type="textarea"
              :rows="2"
              placeholder="这条主线当前最需要解决的一个问题是什么？"
              :maxlength="200"
              show-word-limit
            />
            <div class="hint-text">可复用，不需要每天改</div>
          </el-form-item>

          <el-form-item label="三个月目标" label-width="120px" required>
            <el-input
              v-model="thread.三个月目标"
              type="textarea"
              :rows="2"
              placeholder="这条主线在3个月内要达到什么状态？"
              :maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </div>
      </div>

      <el-button
        type="primary"
        :icon="Plus"
        @click="addThread"
        class="w-full"
        :disabled="localThreads.length >= 10"
      >
        添加新主线
      </el-button>
      <div v-if="localThreads.length >= 10" class="hint-text text-center">
        最多支持10条主线，建议同时激活3条
      </div>
    </div>

    <div class="setup-footer">
      <el-button type="primary" size="large" @click="handleSave" :loading="saving">
        保存并开始
      </el-button>
      <div class="hint-text text-center mt-2">
        至少需要1条激活的主线才能开始
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { getLifeThreads, saveLifeThreads, getDefaultLifeThreads } from '../utils/storage'

const emit = defineEmits(['saved'])

const localThreads = ref([])
const saving = ref(false)

// 添加主线
function addThread() {
  const newThread = {
    主线ID: `thread_${Date.now()}`,
    主线名称: '',
    当前阶段: '探索期',
    当前关键问题: '',
    三个月目标: '',
    创建时间: new Date().toISOString(),
    最后更新时间: new Date().toISOString(),
    是否激活: true
  }
  localThreads.value.push(newThread)
}

// 删除主线
function removeThread(index) {
  localThreads.value.splice(index, 1)
}

// 保存
async function handleSave() {
  // 验证至少有一条激活的主线
  const activeThreads = localThreads.value.filter(t => t.是否激活)
  if (activeThreads.length === 0) {
    ElMessage.warning('至少需要1条激活的主线才能开始')
    return
  }

  // 验证必填字段
  for (const thread of localThreads.value) {
    if (thread.是否激活) {
      if (!thread.主线名称 || !thread.当前阶段 || !thread.当前关键问题 || !thread.三个月目标) {
        ElMessage.warning('请填写完整的主线信息')
        return
      }
    }
  }

  saving.value = true
  try {
    // 更新最后更新时间
    localThreads.value.forEach(thread => {
      thread.最后更新时间 = new Date().toISOString()
    })

    await saveLifeThreads(localThreads.value)
    ElMessage.success('人生主线保存成功')
    emit('saved', localThreads.value)
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 加载数据
async function loadThreads() {
  try {
    const threads = await getLifeThreads()
    if (threads.length > 0) {
      localThreads.value = threads
    } else {
      // 如果没有主线，使用默认模板
      localThreads.value = getDefaultLifeThreads()
    }
  } catch (error) {
    console.error('加载主线失败:', error)
    // 如果加载失败，使用默认模板
    localThreads.value = getDefaultLifeThreads()
  }
}

onMounted(() => {
  loadThreads()
})
</script>

<style scoped>
.life-threads-setup {
  @apply max-w-4xl mx-auto p-6;
}

.setup-header {
  @apply mb-6 text-center;
}

.threads-list {
  @apply mb-6;
}

.thread-card {
  @apply bg-white rounded-xl p-6 shadow-sm border border-gray-200;
}

.thread-header {
  @apply flex items-center justify-between mb-4 pb-4 border-b border-gray-200;
}

.thread-number {
  @apply text-lg font-semibold text-gray-800;
}

.thread-actions {
  @apply flex items-center gap-2;
}

.thread-content {
  @apply mt-4;
}

.setup-footer {
  @apply mt-8 text-center;
}

.hint-text {
  @apply text-xs text-gray-500 mt-1;
}

:deep(.el-form-item) {
  margin-bottom: 1rem;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .life-threads-setup {
    @apply p-4;
  }

  .thread-card {
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
}
</style>

