<template>
  <div class="life-module">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">LIFE（生活）</h2>

    <div class="space-y-6">
      <!-- 坚持天数 -->
      <el-form-item label="坚持天数">
        <el-input-number
          v-model="localData.坚持天数"
          :min="0"
          controls-position="right"
          class="w-32"
        />
      </el-form-item>

      <!-- 习惯列表 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          习惯列表
        </label>
        <div class="space-y-2">
          <div
            v-for="(habit, index) in localData.习惯"
            :key="index"
            class="flex gap-2 items-center"
          >
            <el-input
              v-model="localData.习惯[index]"
              placeholder="输入习惯"
              class="flex-1"
            />
            <el-button
              type="danger"
              :icon="Delete"
              circle
              @click="removeHabit(index)"
            />
          </div>
          <el-button
            type="primary"
            :icon="Plus"
            @click="addHabit"
            class="w-full"
          >
            添加习惯
          </el-button>
        </div>
      </div>

      <!-- 内耗记录 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          内耗记录
        </label>
        <el-collapse v-model="activeCollapse" class="mb-4">
          <el-collapse-item
            v-for="(neihao, index) in localData.内耗"
            :key="index"
            :name="index"
            :title="neihao.标题 || `内耗 ${index + 1}`"
          >
            <div class="space-y-4 p-4">
              <el-input
                v-model="neihao.标题"
                placeholder="内耗主题"
                class="mb-4"
              />
              <el-form-item label="内耗的原因">
                <el-input
                  v-model="neihao.原因"
                  type="textarea"
                  :rows="2"
                  placeholder="描述内耗的原因..."
                />
              </el-form-item>
              <el-form-item label="想开了吗？">
                <el-input
                  v-model="neihao.想开了吗"
                  type="textarea"
                  :rows="2"
                  placeholder="描述是否想开了..."
                />
              </el-form-item>
              <el-form-item label="是否能进行解决？">
                <el-input
                  v-model="neihao.是否能解决"
                  type="textarea"
                  :rows="2"
                  placeholder="描述解决方案..."
                />
              </el-form-item>
              <el-form-item label="权衡（可选）">
                <el-input
                  v-model="neihao.权衡"
                  type="textarea"
                  :rows="2"
                  placeholder="描述权衡..."
                />
              </el-form-item>
              <el-form-item label="结论（可选）">
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
              >
                删除此内耗
              </el-button>
            </div>
          </el-collapse-item>
        </el-collapse>
        <el-button
          type="primary"
          :icon="Plus"
          @click="addNeihao"
          class="w-full"
        >
          添加内耗记录
        </el-button>
      </div>

      <!-- 浪费时间点 -->
      <el-form-item label="浪费时间的点">
        <el-input
          v-model="localData.浪费时间点"
          type="textarea"
          :rows="3"
          placeholder="记录今天浪费时间的点..."
          :maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <!-- 反思与感悟 -->
      <el-form-item label="反思与感悟">
        <el-input
          v-model="localData.反思与感悟"
          type="textarea"
          :rows="4"
          placeholder="记录今天的反思与感悟..."
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
:deep(.el-form-item) {
  margin-bottom: 1rem;
}

:deep(.el-collapse-item__header) {
  font-weight: 500;
}
</style>

