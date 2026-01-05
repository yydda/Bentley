<template>
  <div class="todo-list-module">
    <!-- 紧凑工具栏 -->
    <div class="todo-toolbar-compact">
      <div class="toolbar-row-1">
        <el-input
          v-model="quickInputText"
          placeholder="输入事项，按回车添加..."
          @keyup.enter="handleQuickAdd"
          class="quick-input-compact"
          size="small"
          clearable
        >
          <template #prefix>
            <el-icon class="input-icon"><Plus /></el-icon>
          </template>
        </el-input>
        <el-button
          text
          :icon="Download"
          @click="importFromPlans"
          :disabled="!hasPlans"
          size="small"
          title="从明日计划导入"
          class="import-btn"
        />
      </div>
      <div class="toolbar-row-2">
        <el-input
          v-model="searchText"
          placeholder="搜索..."
          clearable
          size="small"
          class="search-input-compact"
        >
          <template #prefix>
            <el-icon class="input-icon"><Search /></el-icon>
          </template>
        </el-input>
        <div class="filter-buttons">
          <span
            class="filter-btn"
            :class="{ active: filterStatus === 'all' }"
            @click="filterStatus = 'all'"
          >
            全部
          </span>
          <span
            class="filter-btn"
            :class="{ active: filterStatus === 'pending' }"
            @click="filterStatus = 'pending'"
          >
            待办
          </span>
          <span
            class="filter-btn"
            :class="{ active: filterStatus === 'in-progress' }"
            @click="filterStatus = 'in-progress'"
          >
            进行中
          </span>
        </div>
        <div class="todo-stats-compact">
          <span class="stat-compact">{{ filteredTodos.length }}</span>
          <span class="stat-divider">|</span>
          <span class="stat-compact text-orange-500">{{ pendingCount }}</span>
          <span class="stat-divider">|</span>
          <span class="stat-compact text-blue-500">{{ inProgressCount }}</span>
          <span class="stat-divider">|</span>
          <span class="stat-compact text-green-500">{{ completedCount }}</span>
        </div>
      </div>
    </div>

    <!-- 事项列表 -->
    <div v-if="filteredTodos.length === 0" class="empty-state-compact">
      <div class="empty-text">还没有事项，在上方输入框输入后按回车添加</div>
    </div>

    <!-- 待办事项组 -->
    <div v-if="pendingTodos.length > 0" class="todo-group-compact">
      <div class="group-header-compact">
        <span class="group-title-compact">待办</span>
        <span class="group-count-compact">{{ pendingTodos.length }}</span>
      </div>
      <div class="todo-list-compact">
        <div
          v-for="todo in pendingTodos"
          :key="todo.事项ID"
          class="todo-item-compact"
          @mouseenter="hoveredTodoId = todo.事项ID"
          @mouseleave="hoveredTodoId = null"
        >
          <el-checkbox
            :model-value="false"
            @change="() => toggleTodoStatus(todo, '进行中')"
            class="todo-checkbox-compact"
          />
          <div class="todo-content-compact" @click.stop="editTodo(todo)">
            <span class="todo-title-compact-text">
              {{ todo.事项内容 || '未命名事项' }}
            </span>
            <div class="todo-meta-compact" v-if="todo.优先级 || todo.关联主线 || todo.来源计划 || todo.备注">
              <span v-if="todo.优先级" class="priority-dot" :class="`priority-${todo.优先级}`"></span>
              <span v-if="todo.关联主线" class="meta-tag thread-tag">{{ getThreadName(todo.关联主线) }}</span>
              <span v-if="todo.来源计划" class="meta-tag plan-tag">计划</span>
              <span v-if="todo.备注" class="meta-tag note-tag">{{ todo.备注 }}</span>
            </div>
          </div>
          <div class="todo-actions-compact" v-show="hoveredTodoId === todo.事项ID">
            <span class="action-btn" @click.stop="toggleTodoStatus(todo, '进行中')">进行中</span>
            <span class="action-btn" @click.stop="toggleTodoStatus(todo, '已完成')">完成</span>
            <el-icon class="action-icon" @click.stop="removeTodoById(todo.事项ID)"><Delete /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 进行中事项组 -->
    <div v-if="inProgressTodos.length > 0" class="todo-group-compact">
      <div class="group-header-compact">
        <span class="group-title-compact">进行中</span>
        <span class="group-count-compact">{{ inProgressTodos.length }}</span>
      </div>
      <div class="todo-list-compact">
        <div
          v-for="todo in inProgressTodos"
          :key="todo.事项ID"
          class="todo-item-compact status-in-progress"
          @mouseenter="hoveredTodoId = todo.事项ID"
          @mouseleave="hoveredTodoId = null"
        >
          <el-checkbox
            :model-value="false"
            @change="() => toggleTodoStatus(todo, '已完成')"
            class="todo-checkbox-compact"
          />
          <div class="todo-content-compact" @click.stop="editTodo(todo)">
            <span class="todo-title-compact-text">
              {{ todo.事项内容 || '未命名事项' }}
            </span>
            <div class="todo-meta-compact" v-if="todo.优先级 || todo.关联主线 || todo.来源计划 || todo.备注">
              <span v-if="todo.优先级" class="priority-dot" :class="`priority-${todo.优先级}`"></span>
              <span v-if="todo.关联主线" class="meta-tag thread-tag">{{ getThreadName(todo.关联主线) }}</span>
              <span v-if="todo.来源计划" class="meta-tag plan-tag">计划</span>
              <span v-if="todo.备注" class="meta-tag note-tag">{{ todo.备注 }}</span>
            </div>
          </div>
          <div class="todo-actions-compact" v-show="hoveredTodoId === todo.事项ID">
            <span class="action-btn" @click.stop="toggleTodoStatus(todo, '待办')">待办</span>
            <span class="action-btn" @click.stop="toggleTodoStatus(todo, '已完成')">完成</span>
            <el-icon class="action-icon" @click.stop="removeTodoById(todo.事项ID)"><Delete /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 已完成事项组（可折叠） -->
    <div v-if="completedTodos.length > 0" class="todo-group-compact">
      <div class="group-header-compact" @click="completedExpanded = !completedExpanded" style="cursor: pointer;">
        <span class="group-title-compact">已完成</span>
        <span class="group-count-compact">{{ completedTodos.length }}</span>
        <el-icon class="expand-icon-compact" :class="{ 'expanded': completedExpanded }">
          <ArrowDown />
        </el-icon>
      </div>
      <el-collapse-transition>
        <div v-show="completedExpanded" class="todo-list-compact">
          <div
            v-for="todo in completedTodos"
            :key="todo.事项ID"
            class="todo-item-compact status-completed"
            @mouseenter="hoveredTodoId = todo.事项ID"
            @mouseleave="hoveredTodoId = null"
          >
            <el-checkbox
              :model-value="true"
              @change="() => toggleTodoStatus(todo, '待办')"
              class="todo-checkbox-compact"
            />
            <div class="todo-content-compact" @click.stop="editTodo(todo)">
              <span class="todo-title-compact-text completed">
                {{ todo.事项内容 || '未命名事项' }}
              </span>
              <div class="todo-meta-compact" v-if="todo.关联主线 || todo.来源计划">
                <span v-if="todo.关联主线" class="meta-tag thread-tag">{{ getThreadName(todo.关联主线) }}</span>
                <span v-if="todo.来源计划" class="meta-tag plan-tag">计划</span>
              </div>
            </div>
            <div class="todo-actions-compact" v-show="hoveredTodoId === todo.事项ID">
              <span class="action-btn" @click.stop="toggleTodoStatus(todo, '待办')">恢复</span>
              <el-icon class="action-icon" @click.stop="removeTodoById(todo.事项ID)"><Delete /></el-icon>
            </div>
          </div>
        </div>
      </el-collapse-transition>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑事项"
      width="90%"
      :max-width="600"
      @close="editingTodo = null"
    >
      <div v-if="editingTodo" class="edit-form">
        <el-form label-width="100px">
          <el-form-item label="事项内容" required>
            <el-input
              v-model="editingTodo.事项内容"
              placeholder="输入事项内容"
              :maxlength="200"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="editingTodo.状态" class="w-full">
              <el-option label="待办" value="待办" />
              <el-option label="进行中" value="进行中" />
              <el-option label="已完成" value="已完成" />
              <el-option label="已取消" value="已取消" />
            </el-select>
          </el-form-item>
          <el-form-item label="优先级">
            <el-select v-model="editingTodo.优先级" placeholder="选择优先级" clearable class="w-full">
              <el-option label="高" value="高" />
              <el-option label="中" value="中" />
              <el-option label="低" value="低" />
            </el-select>
          </el-form-item>
          <el-form-item label="关联主线">
            <el-select
              v-model="editingTodo.关联主线"
              placeholder="选择主线（可选）"
              clearable
              class="w-full"
            >
              <el-option
                v-for="thread in availableThreads"
                :key="thread.主线ID"
                :label="thread.主线名称"
                :value="thread.主线ID"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="editingTodo.备注"
              type="textarea"
              :rows="3"
              placeholder="备注（可选）"
              :maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
        <div class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="saveEditTodo">保存</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { debounce } from 'lodash'
import { Plus, Delete, Download, Search, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  lifeThreads: {
    type: Array,
    default: () => []
  },
  tomorrowPlans: {
    type: Object,
    default: () => ({ 计划列表: [] })
  }
})

const emit = defineEmits(['update:modelValue'])

// 可用的主线（只显示激活的）
const availableThreads = computed(() => {
  return props.lifeThreads.filter(thread => thread.是否激活)
})

// 本地事项列表
const todos = ref([])
const isUpdating = ref(false)

// 快速输入
const quickInputText = ref('')
const quickInputFocused = ref(false)

// 搜索和过滤
const searchText = ref('')
const filterStatus = ref('all') // all, pending, in-progress

// UI状态
const hoveredTodoId = ref(null)
const showEditDialog = ref(false)
const editingTodo = ref(null)
const completedExpanded = ref(false)

// 统计信息
const pendingCount = computed(() => todos.value.filter(t => t.状态 === '待办').length)
const inProgressCount = computed(() => todos.value.filter(t => t.状态 === '进行中').length)
const completedCount = computed(() => todos.value.filter(t => t.状态 === '已完成').length)
const hasPlans = computed(() => props.tomorrowPlans?.计划列表?.length > 0)

// 过滤后的事项列表
const filteredTodos = computed(() => {
  let result = todos.value

  // 搜索过滤
  if (searchText.value.trim()) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(todo => 
      todo.事项内容?.toLowerCase().includes(keyword) ||
      todo.备注?.toLowerCase().includes(keyword) ||
      getThreadName(todo.关联主线)?.toLowerCase().includes(keyword)
    )
  }

  // 状态过滤
  if (filterStatus.value === 'pending') {
    result = result.filter(t => t.状态 === '待办')
  } else if (filterStatus.value === 'in-progress') {
    result = result.filter(t => t.状态 === '进行中')
  }

  return result
})

// 按状态分组并排序
const pendingTodos = computed(() => {
  const items = filteredTodos.value.filter(t => t.状态 === '待办')
  return sortTodos(items)
})

const inProgressTodos = computed(() => {
  const items = filteredTodos.value.filter(t => t.状态 === '进行中')
  return sortTodos(items)
})

const completedTodos = computed(() => {
  const items = filteredTodos.value.filter(t => t.状态 === '已完成')
  // 已完成事项按完成时间倒序排列
  return items.sort((a, b) => {
    const timeA = new Date(a.更新时间 || a.创建时间).getTime()
    const timeB = new Date(b.更新时间 || b.创建时间).getTime()
    return timeB - timeA
  })
})

// 获取事项排序时间：优先使用关联的明日计划开始时间，其次使用创建时间
function getTodoSortTime(todo) {
  // 关联明日计划的开始时间
  if (todo.来源计划 && props.tomorrowPlans?.计划列表?.length) {
    const plan = props.tomorrowPlans.计划列表.find(p => p.计划ID === todo.来源计划)
    if (plan && plan.开始时间) {
      // 仅用时间部分排序，例如 08:00、14:30
      return new Date(`2000-01-01T${plan.开始时间}:00`).getTime()
    }
  }
  // 回退到事项的创建时间
  return new Date(todo.创建时间 || todo.更新时间 || Date.now()).getTime()
}

// 排序事项：按时间优先（早的在前），同一时间再按优先级
function sortTodos(items) {
  const priorityOrder = { '高': 3, '中': 2, '低': 1, '': 0 }
  return items.sort((a, b) => {
    // 先按时间排序（越早越靠前）
    const timeA = getTodoSortTime(a)
    const timeB = getTodoSortTime(b)
    if (timeA !== timeB) return timeA - timeB

    // 同一时间段内再按优先级排序（高优先级在前）
    const priorityDiff = (priorityOrder[b.优先级] || 0) - (priorityOrder[a.优先级] || 0)
    if (priorityDiff !== 0) return priorityDiff

    // 时间和优先级都相同，按创建时间（新的在后，保持相对稳定）
    const createdA = new Date(a.创建时间 || a.更新时间 || 0).getTime()
    const createdB = new Date(b.创建时间 || b.更新时间 || 0).getTime()
    return createdA - createdB
  })
}

// 获取主线名称
function getThreadName(threadId) {
  if (!threadId) return ''
  const thread = availableThreads.value.find(t => t.主线ID === threadId)
  return thread ? thread.主线名称 : ''
}

// 获取优先级类型
function getPriorityType(priority) {
  const typeMap = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return typeMap[priority] || 'info'
}

// 初始化数据
function initTodos() {
  if (props.modelValue && Array.isArray(props.modelValue) && props.modelValue.length > 0) {
    todos.value = JSON.parse(JSON.stringify(props.modelValue))
  } else {
    todos.value = []
  }
}

// 获取事项状态样式类
function getTodoStatusClass(status) {
  const statusMap = {
    '待办': 'status-pending',
    '进行中': 'status-in-progress',
    '已完成': 'status-completed',
    '已取消': 'status-cancelled'
  }
  return statusMap[status] || 'status-pending'
}

// 快速添加事项
function handleQuickAdd() {
  const content = quickInputText.value.trim()
  if (!content) return

  const newTodo = {
    事项ID: `todo_${Date.now()}_${Math.random()}`,
    事项内容: content,
    状态: '待办',
    关联主线: '',
    来源计划: '',
    优先级: '',
    备注: '',
    创建时间: new Date().toISOString(),
    更新时间: new Date().toISOString()
  }
  todos.value.push(newTodo)
  quickInputText.value = ''
  debouncedUpdateParent()
  ElMessage.success('事项已添加')
}

// 添加事项（空事项）
function addTodo() {
  const newTodo = {
    事项ID: `todo_${Date.now()}_${Math.random()}`,
    事项内容: '',
    状态: '待办',
    关联主线: '',
    来源计划: '',
    优先级: '',
    备注: '',
    创建时间: new Date().toISOString(),
    更新时间: new Date().toISOString()
  }
  todos.value.push(newTodo)
  debouncedUpdateParent()
  // 打开编辑对话框
  nextTick(() => {
    editTodo(newTodo)
  })
}

// 删除事项
function removeTodoById(todoId) {
  const index = todos.value.findIndex(t => t.事项ID === todoId)
  if (index > -1) {
    todos.value.splice(index, 1)
    debouncedUpdateParent()
  }
}

// 切换事项状态
function toggleTodoStatus(todo, targetStatus = null) {
  if (targetStatus) {
    todo.状态 = targetStatus
  } else {
    if (todo.状态 === '已完成') {
      todo.状态 = '待办'
    } else {
      todo.状态 = '已完成'
    }
  }
  todo.更新时间 = new Date().toISOString()
  updateTodo(todo)
}

// 编辑事项
function editTodo(todo) {
  editingTodo.value = JSON.parse(JSON.stringify(todo))
  showEditDialog.value = true
}

// 保存编辑
function saveEditTodo() {
  if (!editingTodo.value.事项内容?.trim()) {
    ElMessage.warning('请输入事项内容')
    return
  }

  const index = todos.value.findIndex(t => t.事项ID === editingTodo.value.事项ID)
  if (index > -1) {
    editingTodo.value.更新时间 = new Date().toISOString()
    todos.value[index] = editingTodo.value
    debouncedUpdateParent()
    showEditDialog.value = false
    editingTodo.value = null
  }
}

// 更新事项
function updateTodo(todo) {
  todo.更新时间 = new Date().toISOString()
  debouncedUpdateParent()
}

// 从明日计划导入
function importFromPlans() {
  if (!hasPlans.value) {
    ElMessage.warning('没有可导入的明日计划')
    return
  }

  const plans = props.tomorrowPlans.计划列表 || []
  let importedCount = 0

  plans.forEach(plan => {
    // 检查是否已经导入过
    const alreadyImported = todos.value.some(todo => todo.来源计划 === plan.计划ID)
    if (!alreadyImported && plan.任务内容) {
      const newTodo = {
        事项ID: `todo_${Date.now()}_${Math.random()}`,
        事项内容: plan.任务内容,
        状态: '待办',
        优先级: '',
        关联主线: plan.关联主线 || '',
        来源计划: plan.计划ID,
        备注: plan.备注 || '',
        创建时间: new Date().toISOString(),
        更新时间: new Date().toISOString()
      }
      todos.value.push(newTodo)
      importedCount++
    }
  })

  if (importedCount > 0) {
    ElMessage.success(`成功导入 ${importedCount} 个事项`)
    debouncedUpdateParent()
  } else {
    ElMessage.info('所有计划已导入，或没有可导入的计划')
  }
}

// 防抖更新父组件
const debouncedUpdateParent = debounce(() => {
  if (!isUpdating.value) {
    emit('update:modelValue', [...todos.value])
  }
}, 300)

// 监听本地数据变化
watch(todos, () => {
  debouncedUpdateParent()
}, { deep: true })

// 监听父组件数据变化
watch(() => props.modelValue, (newVal) => {
  if (isUpdating.value) return
  
  const currentStr = JSON.stringify(todos.value)
  const newStr = JSON.stringify(newVal && Array.isArray(newVal) ? newVal : [])
  
  if (currentStr !== newStr) {
    isUpdating.value = true
    try {
      if (newVal && Array.isArray(newVal) && newVal.length > 0) {
        todos.value = JSON.parse(JSON.stringify(newVal))
      } else {
        todos.value = []
      }
    } finally {
      setTimeout(() => {
        isUpdating.value = false
      }, 100)
    }
  }
}, { deep: true, immediate: true })

// 初始化
onMounted(() => {
  initTodos()
})
</script>

<style scoped>
.todo-list-module {
  @apply space-y-2;
}

/* 紧凑工具栏 */
.todo-toolbar-compact {
  @apply bg-white rounded border border-gray-200 p-2;
}

.toolbar-row-1 {
  @apply flex items-center gap-2 mb-2;
}

.quick-input-compact {
  @apply flex-1;
}

.quick-input-compact :deep(.el-input__wrapper) {
  @apply h-8;
  padding: 0 8px;
}

.quick-input-compact :deep(.el-input__inner) {
  font-size: 13px;
  height: 24px;
  line-height: 24px;
}

.input-icon {
  font-size: 14px;
  color: #909399;
}

.import-btn {
  @apply flex-shrink-0;
  padding: 4px 8px;
}

.toolbar-row-2 {
  @apply flex items-center gap-2;
}

.search-input-compact {
  width: 180px;
}

.search-input-compact :deep(.el-input__wrapper) {
  @apply h-7;
  padding: 0 6px;
}

.search-input-compact :deep(.el-input__inner) {
  font-size: 12px;
  height: 20px;
  line-height: 20px;
}

.filter-buttons {
  @apply flex items-center gap-1;
}

.filter-btn {
  @apply px-2 py-0.5 text-xs cursor-pointer rounded;
  @apply text-gray-600 hover:text-gray-800 hover:bg-gray-100;
  transition: all 0.2s;
}

.filter-btn.active {
  @apply bg-blue-50 text-blue-600 font-medium;
}

.todo-stats-compact {
  @apply flex items-center gap-1 ml-auto;
  font-size: 11px;
  color: #909399;
}

.stat-compact {
  @apply font-medium;
}

.stat-divider {
  color: #dcdfe6;
}

.empty-state-compact {
  @apply py-8 text-center;
}

.empty-text {
  @apply text-sm text-gray-400;
}

/* 分组样式 */
.todo-group-compact {
  @apply mb-3;
}

.group-header-compact {
  @apply flex items-center gap-2 mb-1 px-1;
  @apply text-xs font-semibold text-gray-600;
  height: 24px;
}

.group-title-compact {
  font-size: 12px;
  font-weight: 600;
}

.group-count-compact {
  @apply px-1.5 py-0 bg-gray-100 text-gray-500 rounded;
  font-size: 11px;
  font-weight: 500;
}

.expand-icon-compact {
  @apply ml-auto transition-transform duration-200;
  font-size: 12px;
  color: #909399;
}

.expand-icon-compact.expanded {
  transform: rotate(180deg);
}

/* 事项列表 - 高密度单行布局 */
.todo-list-compact {
  @apply space-y-0;
}

.todo-item-compact {
  @apply flex items-center gap-2 px-2 py-1.5;
  @apply border-b border-gray-100;
  @apply transition-colors duration-150;
  @apply hover:bg-gray-50;
  min-height: 32px;
  cursor: pointer;
}

.todo-item-compact.status-in-progress {
  @apply bg-blue-50/30;
}

.todo-item-compact.status-completed {
  @apply bg-gray-50/50;
}

.todo-checkbox-compact {
  @apply flex-shrink-0;
  margin: 0;
}

.todo-checkbox-compact :deep(.el-checkbox__input) {
  width: 16px;
  height: 16px;
}

.todo-checkbox-compact :deep(.el-checkbox__inner) {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.todo-content-compact {
  @apply flex-1 min-w-0 flex items-center gap-2;
  overflow: hidden;
}

.todo-title-compact-text {
  @apply text-sm text-gray-800 flex-1;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.todo-title-compact-text.completed {
  @apply text-gray-400 line-through;
}

.todo-meta-compact {
  @apply flex items-center gap-1.5 flex-shrink-0;
  font-size: 11px;
}

.priority-dot {
  @apply w-2 h-2 rounded-full flex-shrink-0;
}

.priority-dot.priority-高 {
  background-color: #f56c6c;
}

.priority-dot.priority-中 {
  background-color: #e6a23c;
}

.priority-dot.priority-低 {
  background-color: #909399;
}

.meta-tag {
  @apply px-1.5 py-0.5 rounded;
  font-size: 11px;
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.thread-tag {
  @apply bg-blue-50 text-blue-600;
}

.plan-tag {
  @apply bg-gray-100 text-gray-600;
}

.note-tag {
  @apply bg-gray-50 text-gray-500;
  font-style: italic;
}

.todo-actions-compact {
  @apply flex items-center gap-1 flex-shrink-0;
  @apply opacity-0 transition-opacity duration-150;
}

.todo-item-compact:hover .todo-actions-compact {
  @apply opacity-100;
}

.action-btn {
  @apply px-1.5 py-0.5 text-xs text-gray-600;
  @apply hover:text-blue-600 hover:bg-blue-50 rounded;
  cursor: pointer;
  transition: all 0.15s;
}

.action-icon {
  @apply text-gray-400 hover:text-red-500 cursor-pointer;
  font-size: 14px;
  transition: color 0.15s;
}

/* 编辑对话框 */
.edit-form {
  @apply space-y-4;
}

.dialog-footer {
  @apply flex justify-end gap-2 mt-6;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .toolbar-row-1 {
    @apply flex-col;
  }

  .quick-input-compact {
    @apply w-full;
  }

  .toolbar-row-2 {
    @apply flex-col items-stretch;
  }

  .search-input-compact {
    @apply w-full;
  }

  .todo-stats-compact {
    @apply ml-0 justify-center;
  }

  .todo-meta-compact {
    @apply flex-wrap;
  }

  .todo-actions-compact {
    @apply opacity-100;
  }
}
</style>

