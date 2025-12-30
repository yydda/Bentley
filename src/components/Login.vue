<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <template #header>
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-800">欢迎使用日记系统</h2>
          <p class="text-gray-600 mt-2">请登录以同步您的数据</p>
        </div>
      </template>
      
      <div class="login-content">
        <!-- 用户信息 -->
        <div v-if="user" class="user-info mb-6">
          <div class="flex items-center gap-4">
            <el-avatar :src="user.photoURL" :size="60">
              {{ user.displayName?.[0] || user.email?.[0] }}
            </el-avatar>
            <div class="flex-1">
              <div class="text-lg font-semibold">{{ user.displayName || '用户' }}</div>
              <div class="text-sm text-gray-500">{{ user.email }}</div>
            </div>
          </div>
        </div>
        
        <!-- 登录按钮 -->
        <el-button
          v-if="!user"
          type="primary"
          size="large"
          @click="handleLogin"
          :loading="loading"
          class="w-full"
          :icon="User"
        >
          使用 Google 账号登录
        </el-button>
        
        <!-- 登出按钮 -->
        <el-button
          v-else
          type="danger"
          size="large"
          @click="handleLogout"
          :loading="loading"
          class="w-full"
          :icon="SwitchButton"
        >
          退出登录
        </el-button>
        
        <!-- 数据迁移提示 -->
        <div v-if="user && hasLocalData" class="migration-tip mt-4">
          <el-alert
            title="检测到本地数据"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="text-sm">
                <p class="mb-2">您有本地存储的数据，是否迁移到云端？</p>
                <el-button
                  type="primary"
                  size="small"
                  @click="handleMigrate"
                  :loading="migrating"
                >
                  立即迁移
                </el-button>
              </div>
            </template>
          </el-alert>
        </div>
        
        <!-- 提示信息 -->
        <div v-if="user" class="info-tip mt-4">
          <el-alert
            title="数据将自动保存到云端"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="text-sm">
                <p>所有数据将存储在Firebase云端，支持多设备自动同步</p>
              </div>
            </template>
          </el-alert>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, SwitchButton } from '@element-plus/icons-vue'
import { signInWithGoogle, signOutUser, onAuthChange } from '../utils/firebaseAuth'
import { migrateLocalStorageToFirebase } from '../utils/firebaseStorage'

const emit = defineEmits(['login', 'logout'])

const user = ref(null)
const loading = ref(false)
const migrating = ref(false)
const hasLocalData = ref(false)

// 检查是否有本地数据（用于迁移）
onMounted(() => {
  // 检查localStorage中是否有旧数据
  try {
    const localData = localStorage.getItem('diary_data')
    if (localData) {
      const data = JSON.parse(localData)
      hasLocalData.value = Object.keys(data).length > 0
    }
  } catch (e) {
    hasLocalData.value = false
  }
  
  // 监听认证状态
  onAuthChange((currentUser) => {
    user.value = currentUser
    if (currentUser) {
      emit('login', currentUser)
    } else {
      emit('logout')
    }
  })
})

// 登录
async function handleLogin() {
  loading.value = true
  try {
    const result = await signInWithGoogle()
    if (result.success) {
      user.value = result.user
      ElMessage.success('登录成功！')
      emit('login', result.user)
    } else {
      ElMessage.error(result.error || '登录失败')
    }
  } catch (error) {
    ElMessage.error('登录失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 登出
async function handleLogout() {
  loading.value = true
  try {
    const result = await signOutUser()
    if (result.success) {
      user.value = null
      ElMessage.success('已退出登录')
      emit('logout')
    } else {
      ElMessage.error(result.error || '登出失败')
    }
  } catch (error) {
    ElMessage.error('登出失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 迁移数据
async function handleMigrate() {
  if (!user.value) {
    ElMessage.warning('请先登录')
    return
  }
  
  migrating.value = true
  try {
    const result = await migrateLocalStorageToFirebase(user.value.uid)
    if (result.success) {
      ElMessage.success(result.message || '数据迁移成功！')
    } else {
      ElMessage.error(result.error || '数据迁移失败')
    }
  } catch (error) {
    ElMessage.error('数据迁移失败：' + error.message)
  } finally {
    migrating.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 450px;
}

.login-content {
  padding: 1rem 0;
}

.user-info {
  padding: 1rem;
  background: #f5f7fa;
  border-radius: 8px;
}

.migration-tip {
  margin-top: 1rem;
}

.storage-mode {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-card {
    max-width: 100%;
  }
}
</style>

