<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="90%"
    :max-width="800"
    :close-on-click-modal="true"
    class="history-review-dialog"
  >
    <div class="review-content">
      <!-- 筛选和排序 -->
      <div class="filter-bar mb-4">
        <div class="filter-group">
          <el-radio-group v-model="filterStatus" size="small">
            <el-radio-button value="all">全部</el-radio-button>
            <el-radio-button v-if="type === 'decision'" value="unsolved">思考中</el-radio-button>
            <el-radio-button v-if="type === 'decision'" value="solved">已决策</el-radio-button>
            <el-radio-button v-if="type === 'problem'" value="unsolved">未解决</el-radio-button>
            <el-radio-button v-if="type === 'problem'" value="solved">已解决</el-radio-button>
            <el-radio-button v-if="type === 'habit'" value="active">活跃</el-radio-button>
            <el-radio-button v-if="type === 'habit'" value="inactive">停用</el-radio-button>
          </el-radio-group>
        </div>
        <div class="sort-group">
          <el-select v-model="sortBy" size="small" style="width: 120px">
            <el-option label="创建时间" value="createTime" />
            <el-option label="更新时间" value="updateTime" />
            <el-option v-if="type === 'problem'" label="优先级" value="priority" />
            <el-option v-if="type === 'habit'" label="连续天数" value="streak" />
          </el-select>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 数据列表 -->
      <div v-else class="data-list space-y-3">
        <!-- 决策列表 -->
        <div
          v-if="type === 'decision' && filteredDecisions.length > 0"
          class="decision-item"
          v-for="decision in filteredDecisions"
          :key="decision.决策ID"
          :class="{ 'is-follow-up': decision.是否跟进 }"
        >
          <div class="item-header">
            <div class="item-title">
              <span class="item-name">{{ decision.决策主题 || '未命名决策' }}</span>
              <el-tag v-if="decision.是否跟进" type="info" size="small">跟进</el-tag>
              <el-tag v-if="decision.是否解决" type="success" size="small">已决策</el-tag>
              <el-tag v-else type="warning" size="small">思考中</el-tag>
            </div>
            <div class="item-meta">
              <span class="item-date">创建：{{ formatDate(decision.创建时间) }}</span>
              <span v-if="decision.关联日期 && decision.关联日期.length > 1" class="item-follow-count">
                跟进{{ decision.关联日期.length }}次
              </span>
            </div>
          </div>
          <div class="item-content">
            <div v-if="decision.真实痛点" class="item-summary">
              <strong>真实痛点：</strong>{{ decision.真实痛点 }}
            </div>
            <div v-if="decision.决策结论" class="item-summary">
              <strong>决策结论：</strong>{{ decision.决策结论 }}
            </div>
          </div>
          <div class="item-actions">
            <el-button type="primary" size="small" @click="handleFollowUp(decision)">
              跟进到今天
            </el-button>
            <el-button type="default" size="small" @click="handleViewDetail(decision)">
              查看详情
            </el-button>
          </div>
        </div>

        <!-- 问题列表 -->
        <div
          v-if="type === 'problem' && filteredProblems.length > 0"
          class="problem-item"
          v-for="problem in filteredProblems"
          :key="problem.问题ID"
          :class="getPriorityClass(problem.优先级)"
        >
          <div class="item-header">
            <div class="item-title">
              <el-tag :type="getPriorityTagType(problem.优先级)" size="small">
                {{ problem.优先级 }}
              </el-tag>
              <span class="item-name">{{ problem.问题描述 || '未命名问题' }}</span>
              <el-tag v-if="problem.是否跟进" type="info" size="small">跟进</el-tag>
              <el-tag v-if="problem.是否解决" type="success" size="small">已解决</el-tag>
              <el-tag v-else type="warning" size="small">未解决</el-tag>
            </div>
            <div class="item-meta">
              <span class="item-category">{{ problem.问题分类 }}</span>
              <span class="item-date">创建：{{ formatDate(problem.创建时间) }}</span>
              <span v-if="problem.关联日期 && problem.关联日期.length > 1" class="item-follow-count">
                跟进{{ problem.关联日期.length }}次
              </span>
            </div>
          </div>
          <div class="item-actions">
            <el-button type="primary" size="small" @click="handleFollowUp(problem)">
              跟进到今天
            </el-button>
            <el-button type="default" size="small" @click="handleViewDetail(problem)">
              查看详情
            </el-button>
          </div>
        </div>

        <!-- 习惯列表 -->
        <div
          v-if="type === 'habit' && filteredHabits.length > 0"
          class="habit-item"
          v-for="habit in filteredHabits"
          :key="habit.习惯ID"
        >
          <div class="item-header">
            <div class="item-title">
              <span class="item-name">{{ habit.习惯名称 || '未命名习惯' }}</span>
              <el-tag v-if="habit.连续天数 > 0" type="success" size="small">
                {{ habit.连续天数 }}天 🔥
              </el-tag>
              <el-tag v-if="habit.是否激活" type="success" size="small">活跃</el-tag>
              <el-tag v-else type="info" size="small">停用</el-tag>
            </div>
            <div class="item-meta">
              <span class="item-stat">
                执行率：{{ habit.执行率 }}% ({{ habit.总执行次数 }}/{{ habit.总天数 }})
              </span>
              <span class="item-date">创建：{{ formatDate(habit.创建时间) }}</span>
            </div>
          </div>
          <div class="item-actions">
            <el-button type="primary" size="small" @click="handleFollowUp(habit)">
              跟进到今天
            </el-button>
            <el-button type="default" size="small" @click="handleViewDetail(habit)">
              查看详情
            </el-button>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="(type === 'decision' && filteredDecisions.length === 0) ||
                 (type === 'problem' && filteredProblems.length === 0) ||
                 (type === 'habit' && filteredHabits.length === 0)"
          :description="`暂无${type === 'decision' ? '决策' : type === 'problem' ? '问题' : '习惯'}数据`"
          :image-size="100"
        />
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 详情对话框 -->
  <el-dialog
    v-model="detailDialogVisible"
    :title="detailTitle"
    width="90%"
    :max-width="600"
  >
    <div v-if="currentDetail" class="detail-content">
      <!-- 决策详情 -->
      <div v-if="type === 'decision'" class="space-y-4">
        <div><strong>决策主题：</strong>{{ currentDetail.决策主题 }}</div>
        <div><strong>带来什么：</strong>{{ currentDetail.带来什么 }}</div>
        <div><strong>失去什么：</strong>{{ currentDetail.失去什么 }}</div>
        <div><strong>真实痛点：</strong>{{ currentDetail.真实痛点 }}</div>
        <div><strong>替代方案：</strong>{{ currentDetail.替代方案 }}</div>
        <div v-if="currentDetail.决策结论"><strong>决策结论：</strong>{{ currentDetail.决策结论 }}</div>
        <div v-if="currentDetail.下一步行动"><strong>下一步行动：</strong>{{ currentDetail.下一步行动 }}</div>
        <div><strong>状态：</strong>{{ currentDetail.是否解决 ? '已决策' : '思考中' }}</div>
        <div><strong>创建时间：</strong>{{ formatDate(currentDetail.创建时间) }}</div>
        <div v-if="currentDetail.关联日期 && currentDetail.关联日期.length > 0">
          <strong>关联日期：</strong>{{ currentDetail.关联日期.join(', ') }}
        </div>
      </div>

      <!-- 问题详情 -->
      <div v-if="type === 'problem'" class="space-y-4">
        <div><strong>问题描述：</strong>{{ currentDetail.问题描述 }}</div>
        <div><strong>问题分类：</strong>{{ currentDetail.问题分类 }}</div>
        <div><strong>优先级：</strong>{{ currentDetail.优先级 }}</div>
        <div><strong>状态：</strong>{{ currentDetail.是否解决 ? '已解决' : '未解决' }}</div>
        <div><strong>创建时间：</strong>{{ formatDate(currentDetail.创建时间) }}</div>
        <div v-if="currentDetail.关联日期 && currentDetail.关联日期.length > 0">
          <strong>关联日期：</strong>{{ currentDetail.关联日期.join(', ') }}
        </div>
      </div>

      <!-- 习惯详情 -->
      <div v-if="type === 'habit'" class="space-y-4">
        <div><strong>习惯名称：</strong>{{ currentDetail.习惯名称 }}</div>
        <div v-if="currentDetail.关联主线"><strong>关联主线：</strong>{{ currentDetail.关联主线 }}</div>
        <div><strong>连续天数：</strong>{{ currentDetail.连续天数 }}天</div>
        <div><strong>执行率：</strong>{{ currentDetail.执行率 }}%</div>
        <div><strong>总执行次数：</strong>{{ currentDetail.总执行次数 }}/{{ currentDetail.总天数 }}</div>
        <div><strong>创建时间：</strong>{{ formatDate(currentDetail.创建时间) }}</div>
        <div v-if="currentDetail.执行历史 && currentDetail.执行历史.length > 0">
          <strong>最近执行记录：</strong>
          <div class="execution-history mt-2">
            <div
              v-for="(exec, index) in currentDetail.执行历史.slice(-7)"
              :key="index"
              class="execution-item"
            >
              {{ formatDate(exec.日期) }}: {{ exec.是否执行 ? '✅' : '❌' }}
              <span v-if="exec.执行感受"> - {{ exec.执行感受 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getAllDecisions, getAllProblems, getAllHabits } from '../utils/storage'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    required: true, // 'decision' | 'problem' | 'habit'
    validator: (value) => ['decision', 'problem', 'habit'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'follow-up'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const dialogTitle = computed(() => {
  const titles = {
    decision: '历史决策回顾',
    problem: '历史问题回顾',
    habit: '历史习惯回顾'
  }
  return titles[props.type] || '历史回顾'
})

const loading = ref(false)
const filterStatus = ref('all')
const sortBy = ref('createTime')
const decisions = ref([])
const problems = ref([])
const habits = ref([])
const detailDialogVisible = ref(false)
const currentDetail = ref(null)

// 筛选后的决策
const filteredDecisions = computed(() => {
  let result = [...decisions.value]
  
  // 状态筛选
  if (filterStatus.value === 'solved') {
    result = result.filter(d => d.是否解决)
  } else if (filterStatus.value === 'unsolved') {
    result = result.filter(d => !d.是否解决)
  }
  
  // 排序
  if (sortBy.value === 'createTime') {
    result.sort((a, b) => new Date(b.创建时间) - new Date(a.创建时间))
  } else if (sortBy.value === 'updateTime') {
    result.sort((a, b) => {
      const aUpdate = a.最后更新时间 || a.创建时间
      const bUpdate = b.最后更新时间 || b.创建时间
      return new Date(bUpdate) - new Date(aUpdate)
    })
  }
  
  return result
})

// 筛选后的问题
const filteredProblems = computed(() => {
  let result = [...problems.value]
  
  // 状态筛选
  if (filterStatus.value === 'solved') {
    result = result.filter(p => p.是否解决)
  } else if (filterStatus.value === 'unsolved') {
    result = result.filter(p => !p.是否解决)
  }
  
  // 排序
  if (sortBy.value === 'createTime') {
    result.sort((a, b) => new Date(b.创建时间) - new Date(a.创建时间))
  } else if (sortBy.value === 'updateTime') {
    result.sort((a, b) => {
      const aUpdate = a.最后更新时间 || a.创建时间
      const bUpdate = b.最后更新时间 || b.创建时间
      return new Date(bUpdate) - new Date(aUpdate)
    })
  } else if (sortBy.value === 'priority') {
    const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2 }
    result.sort((a, b) => {
      const aPriority = priorityOrder[a.优先级] ?? 3
      const bPriority = priorityOrder[b.优先级] ?? 3
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }
      return new Date(b.创建时间) - new Date(a.创建时间)
    })
  }
  
  return result
})

// 筛选后的习惯
const filteredHabits = computed(() => {
  let result = [...habits.value]
  
  // 状态筛选
  if (filterStatus.value === 'active') {
    result = result.filter(h => h.是否激活)
  } else if (filterStatus.value === 'inactive') {
    result = result.filter(h => !h.是否激活)
  }
  
  // 排序
  if (sortBy.value === 'createTime') {
    result.sort((a, b) => new Date(b.创建时间) - new Date(a.创建时间))
  } else if (sortBy.value === 'updateTime') {
    result.sort((a, b) => new Date(b.最后更新时间) - new Date(a.最后更新时间))
  } else if (sortBy.value === 'streak') {
    result.sort((a, b) => b.连续天数 - a.连续天数)
  }
  
  return result
})

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

// 获取优先级样式类
function getPriorityClass(priority) {
  if (priority === 'P0') return 'priority-p0'
  if (priority === 'P1') return 'priority-p1'
  return 'priority-p2'
}

function getPriorityTagType(priority) {
  if (priority === 'P0') return 'danger'
  if (priority === 'P1') return 'warning'
  return 'info'
}

// 跟进到今天
function handleFollowUp(item) {
  emit('follow-up', item)
  visible.value = false
}

// 查看详情
function handleViewDetail(item) {
  currentDetail.value = item
  detailDialogVisible.value = true
}

const detailTitle = computed(() => {
  if (!currentDetail.value) return '详情'
  if (props.type === 'decision') {
    return `决策详情：${currentDetail.value.决策主题 || '未命名决策'}`
  } else if (props.type === 'problem') {
    return `问题详情：${currentDetail.value.问题描述 || '未命名问题'}`
  } else {
    return `习惯详情：${currentDetail.value.习惯名称 || '未命名习惯'}`
  }
})

// 加载数据
async function loadData() {
  loading.value = true
  try {
    console.log('HistoryReviewDialog: 开始加载历史数据，类型:', props.type)
    if (props.type === 'decision') {
      const data = await getAllDecisions()
      console.log('HistoryReviewDialog: 加载的决策数据:', data)
      console.log('HistoryReviewDialog: 决策数据数量:', data?.length || 0)
      decisions.value = data || []
    } else if (props.type === 'problem') {
      const data = await getAllProblems()
      console.log('HistoryReviewDialog: 加载的问题数据:', data)
      console.log('HistoryReviewDialog: 问题数据数量:', data?.length || 0)
      problems.value = data || []
    } else if (props.type === 'habit') {
      const data = await getAllHabits()
      console.log('HistoryReviewDialog: 加载的习惯数据:', data)
      console.log('HistoryReviewDialog: 习惯数据数量:', data?.length || 0)
      habits.value = data || []
    }
  } catch (error) {
    console.error('HistoryReviewDialog: 加载数据失败:', error)
    console.error('HistoryReviewDialog: 错误堆栈:', error.stack)
    // 确保即使出错也设置空数组
    if (props.type === 'decision') {
      decisions.value = []
    } else if (props.type === 'problem') {
      problems.value = []
    } else if (props.type === 'habit') {
      habits.value = []
    }
  } finally {
    loading.value = false
    console.log('HistoryReviewDialog: 数据加载完成')
  }
}

// 监听对话框打开
watch(visible, (newVal) => {
  if (newVal) {
    loadData()
  }
})
</script>

<style scoped>
.history-review-dialog {
  @apply space-y-4;
}

.review-content {
  @apply min-h-[400px];
}

.filter-bar {
  @apply flex items-center justify-between gap-4;
}

.filter-group {
  @apply flex-1;
}

.sort-group {
  @apply flex-shrink-0;
}

.loading-state {
  @apply py-8;
}

.data-list {
  @apply space-y-3;
}

.decision-item,
.problem-item,
.habit-item {
  @apply bg-white rounded-lg p-4 border-2 border-gray-200;
}

.decision-item.is-follow-up {
  @apply border-blue-300 bg-blue-50;
}

.problem-item.priority-p0 {
  @apply border-red-300 bg-red-50;
}

.problem-item.priority-p1 {
  @apply border-orange-300 bg-orange-50;
}

.problem-item.priority-p2 {
  @apply border-gray-300 bg-gray-50;
}

.item-header {
  @apply flex items-start justify-between mb-3;
}

.item-title {
  @apply flex items-center gap-2 flex-wrap;
}

.item-name {
  @apply font-semibold text-gray-800;
}

.item-meta {
  @apply flex items-center gap-2 text-xs text-gray-500;
}

.item-category {
  @apply text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded;
}

.item-follow-count {
  @apply text-blue-600 font-semibold;
}

.item-content {
  @apply mb-3;
}

.item-summary {
  @apply text-sm text-gray-700 mb-2;
}

.item-actions {
  @apply flex items-center gap-2;
}

.detail-content {
  @apply space-y-4;
}

.execution-history {
  @apply space-y-1 text-sm;
}

.execution-item {
  @apply text-gray-600;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .filter-bar {
    @apply flex-col items-stretch;
  }

  .item-header {
    @apply flex-col items-start gap-2;
  }

  .item-actions {
    @apply w-full flex-col;
  }

  .item-actions .el-button {
    @apply w-full;
  }
}
</style>

