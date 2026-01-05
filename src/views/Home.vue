<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm px-2 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between min-h-16 md:h-16 fixed top-0 left-0 right-0 z-50">
      <h1 class="text-lg md:text-xl font-bold text-gray-800 px-2 md:px-0 py-2 md:py-0">日记填写系统</h1>
      <div class="flex items-center gap-1 md:gap-4 w-full md:w-auto px-2 md:px-0 pb-2 md:pb-0">
        <!-- 日期导航 -->
        <el-button
          :icon="ArrowLeft"
          circle
          size="small"
          @click="navigateDate(-1)"
          :disabled="!canNavigatePrev"
        />
        <el-date-picker
          v-model="currentDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
          class="flex-1 md:w-32"
          size="small"
        />
        <el-button
          :icon="ArrowRight"
          circle
          size="small"
          @click="navigateDate(1)"
          :disabled="!canNavigateNext"
        />
        <el-button
          type="default"
          @click="showHistoryDialog = true"
          :icon="Calendar"
          size="small"
          plain
        >
          <span class="hidden sm:inline">历史</span>
        </el-button>
        <el-button 
          type="default" 
          @click="handleExport" 
          :icon="Download" 
          size="small"
          plain
        >
          <span class="hidden md:inline">导出</span>
        </el-button>
        <el-button 
          type="primary"  
          @click="saveManually" 
          size="small"
          title="保存 (Ctrl+S / Cmd+S)"
          :loading="isSaving"
          :disabled="isSaving"
          v-if="user"
        >
          <span class="hidden sm:inline">{{ isSaving ? '保存中...' : '保存' }}</span>
        </el-button>
        <el-button 
          type="success"  
          @click="handlePreview" 
          size="small"
          :icon="Check"
          v-if="user"
        >
          <span class="hidden sm:inline">预览</span>
        </el-button>
        <el-button 
          type="text"
          @click="showLoginDialog = true" 
          :icon="User" 
          size="small"
          v-if="!user"
        >
          <span class="hidden sm:inline">登录</span>
        </el-button>
        <el-avatar 
          v-else
          :src="user.photoURL" 
          :size="32"
          @click="showLoginDialog = true"
          class="cursor-pointer"
        >
          {{ user.displayName?.[0] || user.email?.[0] }}
        </el-avatar>
      </div>
    </header>

    <!-- 历史记录对话框 -->
    <el-dialog
      v-model="showHistoryDialog"
      title="历史记录"
      width="90%"
      :max-width="600"
      @opened="handleHistoryDialogOpened"
    >
      <div v-if="!user" class="text-center text-gray-500 py-8">
        <p class="mb-4">请先登录以查看历史记录</p>
        <el-button type="primary" @click="showLoginDialog = true">立即登录</el-button>
      </div>
      <div 
        v-else 
        v-loading="isLoadingHistory"
        element-loading-text="加载历史记录..."
        element-loading-background="rgba(255, 255, 255, 0.8)"
        class="space-y-2 max-h-96 overflow-y-auto"
      >
        <transition-group name="list" tag="div">
          <div
            v-for="date in historyDates"
            :key="date"
            class="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer transition-all duration-200"
            @click="selectHistoryDate(date)"
          >
            <div class="flex-1">
              <div class="font-medium text-gray-800">{{ formatDate(date) }}</div>
              <div class="text-sm text-gray-500 mt-1">{{ dateSummaryMap[date] || '加载中...' }}</div>
            </div>
            <el-button
              text
              type="primary"
              @click.stop="selectHistoryDate(date)"
            >
              查看
            </el-button>
          </div>
        </transition-group>
        <div v-if="historyDates.length === 0 && !isLoadingHistory" class="text-center text-gray-500 py-8">
          <p class="mb-2">暂无历史记录</p>
          <p class="text-xs text-gray-400">填写日记后，记录会自动出现在这里</p>
        </div>
      </div>
    </el-dialog>

    <div class="container mx-auto px-2 md:px-4 py-4 md:py-6 max-w-6xl pt-20 md:pt-24">
      <!-- 步骤条 -->
      <div class="mb-8">
        <el-steps 
          :active="activeStep" 
          finish-status="success"
        >
          <el-step title="概览" />
          <el-step title="主线推进" />
          <el-step title="决策" />
          <el-step title="问题库" />
          <el-step title="习惯" />
          <el-step title="三省" />
        </el-steps>
        <!-- 模块快速跳转按钮 -->
        <div class="mt-3 md:mt-4 flex justify-center gap-1 md:gap-2 flex-wrap">
          <el-button
            v-for="(title, index) in ['概览', '主线推进', '决策', '问题库', '习惯', '三省']"
            :key="index"
            :type="activeStep === index ? 'primary' : 'default'"
            size="small"
            @click="handleStepClick(index)"
            :class="activeStep === index ? '' : 'opacity-70'"
            class="text-xs md:text-sm"
          >
            {{ title }}
          </el-button>
        </div>
        <!-- 管理主线按钮 -->
        <div class="mt-2 text-center">
          <el-button
            type="text"
            size="small"
            @click="showThreadsSetupDialog = true"
            class="text-xs text-gray-500"
          >
            管理人生主线
          </el-button>
        </div>
      </div>

      <!-- 进度提示 -->
      <div class="mb-6 space-y-2">
        <el-progress
          :percentage="Math.round((activeStep + 1) / 6 * 100)"
          :status="activeStep === 5 ? 'success' : undefined"
          :stroke-width="8"
        />
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between text-xs md:text-sm gap-1 md:gap-0">
          <span class="text-gray-600">
            当前进度: {{ Math.round((activeStep + 1) / 6 * 100) }}% - {{ ['概览', '主线推进', '决策', '问题库', '习惯', '三省'][activeStep] }}
          </span>
          <span 
            v-if="completionInfo.totalMissing > 0"
            class="text-orange-500 text-xs"
          >
            ⚠️ 还有 {{ completionInfo.totalMissing }} 项待完善
          </span>
          <span 
            v-else-if="completionInfo.allComplete"
            class="text-green-500 text-xs"
          >
            ✅ 填写完整
          </span>
        </div>
      </div>

      <!-- 模块内容 -->
      <el-card 
        class="mb-6 content-card"
        v-loading="isLoadingData"
        element-loading-text="正在加载数据..."
        element-loading-background="rgba(255, 255, 255, 0.8)"
        element-loading-spinner="el-icon-loading"
      >
        <template #header>
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-1 md:gap-0">
            <span class="text-base md:text-lg font-semibold">
              {{ ['第一步：今日概览', '第二步：今日主线推进', '第三步：决策与内耗', '第四步：问题库', '第五步：习惯追踪', '第六步：每日三省'][activeStep] }}
            </span>
            <div class="text-xs md:text-sm text-gray-500">
              {{ formatDate(currentDate) }}
            </div>
          </div>
        </template>
        <transition name="fade" mode="out-in">
          <div :key="`${currentDate}-${activeStep}`">
            <OverviewModule
              v-if="activeStep === 0"
              v-model="formData.今日概览"
              @next="handleNext"
            />
            <DailyThreadProgressModule
              v-if="activeStep === 1"
              v-model="formData.今日主线推进"
              :life-threads="lifeThreads"
              @update:modelValue="formData.今日主线推进 = $event"
              @setup-threads="showThreadsSetupDialog = true"
              @next="handleNext"
              @prev="handlePrev"
            />
            <DecisionModule
              v-if="activeStep === 2"
              v-model="formData.决策与内耗"
              @update:modelValue="formData.决策与内耗 = $event"
              @next="handleNext"
              @prev="handlePrev"
            />
            <ProblemLibraryModule
              v-if="activeStep === 3"
              v-model="formData.问题库"
              :all-problems="[]"
              @update:modelValue="formData.问题库 = $event"
              @next="handleNext"
              @prev="handlePrev"
            />
            <HabitTrackingModule
              v-if="activeStep === 4"
              v-model="formData.习惯追踪"
              :life-threads="lifeThreads"
              :all-habits-history="{}"
              @update:modelValue="formData.习惯追踪 = $event"
              @next="handleNext"
              @prev="handlePrev"
            />
            <ThreeReflectionsModule
              v-if="activeStep === 5"
              v-model="formData.每日三省"
              @prev="handlePrev"
              @complete="handleComplete"
            />
          </div>
        </transition>
      </el-card>

      <!-- 底部导航按钮 -->
      <div class="flex flex-col gap-3 mt-4 md:mt-6">
        <!-- 上一步/下一步按钮 -->
        <div class="flex justify-between gap-2">
          <el-button 
            v-if="activeStep > 0" 
            @click="handlePrev" 
            :icon="ArrowLeft"
            size="default"
            class="flex-1 md:flex-initial"
          >
            上一步
          </el-button>
          <div v-else class="flex-1 md:flex-initial"></div>
          <el-button
            v-if="activeStep < 5"
            type="primary"
            @click="handleNext"
            :icon="ArrowRight"
            size="default"
            class="flex-1 md:flex-initial"
          >
            下一步
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 登录对话框 -->
    <el-dialog
      v-model="showLoginDialog"
      title="登录与同步设置"
      width="90%"
      :max-width="500"
      :close-on-click-modal="false"
    >
      <Login @login="handleUserLogin" @logout="handleUserLogout" />
    </el-dialog>

    <!-- 主线设置对话框 -->
    <el-dialog
      v-model="showThreadsSetupDialog"
      title="管理人生主线"
      width="90%"
      :max-width="800"
      :close-on-click-modal="false"
    >
      <LifeThreadsSetup @saved="handleThreadsSaved" />
    </el-dialog>

    <!-- 预览总览弹窗 -->
    <el-dialog
      v-model="showOverviewDialog"
      title=""
      width="95%"
      :max-width="1000"
      :close-on-click-modal="true"
      class="overview-dialog"
      @opened="handleOverviewOpened"
      :show-close="true"
      :close-on-press-escape="true"
    >
      <template #header>
        <div class="dialog-header-custom">
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-3 flex-1">
              <div class="header-icon-wrapper">
                <span class="text-2xl">📖</span>
              </div>
              <div class="flex-1">
                <div class="text-lg font-bold text-gray-800">日记预览</div>
                <div class="text-sm text-gray-500">{{ formatDate(currentDate) }}</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <!-- 快速导航菜单 -->
              <el-dropdown trigger="click" placement="bottom-end" @command="handleQuickNav">
                <el-button text size="small" :icon="Menu">
                  <span class="hidden sm:inline">快速导航</span>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="summary" :icon="Document">核心摘要</el-dropdown-item>
                    <el-dropdown-item command="achievements" :icon="Star" v-if="overviewAchievements.length > 0">今日成就</el-dropdown-item>
                    <el-dropdown-item command="stats" :icon="List">数据统计</el-dropdown-item>
                    <el-dropdown-item command="threads" :icon="Location" v-if="formData.今日主线推进?.length > 0">主线推进</el-dropdown-item>
                    <el-dropdown-item command="reflections" :icon="CircleCheck" v-if="formData.每日三省?.动机偏差 || formData.每日三省?.理想不一致 || formData.每日三省?.主线对齐">今日三省</el-dropdown-item>
                    <el-dropdown-item command="decisions" :icon="Check" v-if="formData.决策与内耗?.length > 0">决策与内耗</el-dropdown-item>
                    <el-dropdown-item command="habits" :icon="Star" v-if="formData.习惯追踪?.length > 0">习惯追踪</el-dropdown-item>
                    <el-dropdown-item command="actions" :icon="Setting">快速操作</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-tag 
                :type="overviewCompletionRate >= 80 ? 'success' : overviewCompletionRate >= 50 ? 'warning' : 'info'" 
                size="small"
                class="completion-tag"
              >
                <span class="tag-icon">{{ overviewCompletionRate >= 80 ? '✓' : overviewCompletionRate >= 50 ? '○' : '◯' }}</span>
                完成度 {{ overviewCompletionRate }}%
              </el-tag>
            </div>
          </div>
        </div>
      </template>
      
      <div class="overview-content" v-loading="isCalculatingOverview" element-loading-text="正在生成预览..." ref="overviewContentRef">
        <!-- 顶部核心摘要卡片 -->
        <div class="summary-hero-card mb-4" id="overview-summary">
          <div class="hero-content">
            <div class="hero-left">
              <div class="hero-title">{{ formData.今日概览?.一句话标题 || '今天还没有标题' }}</div>
              <div class="hero-subtitle">{{ formatDate(currentDate) }} 的记录</div>
            </div>
            <div class="hero-right">
              <div class="hero-stats">
                <!-- 能量值可视化 -->
                <div class="hero-stat-item stat-item-enhanced">
                  <div class="stat-visual-wrapper">
                    <div class="stat-visual-bar">
                      <div 
                        class="stat-visual-fill energy-fill" 
                        :style="{ width: `${((overviewStats.能量值 || 0) / 5) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="stat-value-large">{{ overviewStats.能量值 || 0 }}</div>
                  <div class="stat-label-small">能量值</div>
                </div>
                <div class="hero-stat-divider"></div>
                <!-- 压力值可视化 -->
                <div class="hero-stat-item stat-item-enhanced">
                  <div class="stat-visual-wrapper">
                    <div class="stat-visual-bar">
                      <div 
                        class="stat-visual-fill stress-fill" 
                        :style="{ width: `${((overviewStats.压力值 || 0) / 5) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="stat-value-large">{{ overviewStats.压力值 || 0 }}</div>
                  <div class="stat-label-small">压力值</div>
                </div>
                <div class="hero-stat-divider"></div>
                <div class="hero-stat-item stat-item-enhanced">
                  <div class="stat-value-large streak-value">{{ typeof overviewStreak === 'number' ? overviewStreak : 0 }}</div>
                  <div class="stat-label-small">连续天数</div>
                  <div v-if="overviewStreak > 0" class="streak-badge-mini">🔥</div>
                </div>
              </div>
            </div>
          </div>
          <!-- 完成度进度条 -->
          <div class="hero-progress">
            <div class="progress-label">
              <span>今日完成度</span>
              <span class="progress-percentage">{{ overviewCompletionRate }}%</span>
            </div>
            <el-progress 
              :percentage="overviewCompletionRate" 
              :status="overviewCompletionRate >= 80 ? 'success' : overviewCompletionRate >= 50 ? 'warning' : undefined"
              :stroke-width="8"
              :show-text="false"
            />
          </div>
        </div>

        <!-- 鼓励文案和成就（并排显示） -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- 鼓励文案 -->
          <el-card class="encouragement-card" shadow="hover">
            <div class="text-center py-4">
              <div class="text-4xl mb-3 animate-bounce">{{ mainEncouragement.emoji }}</div>
              <div class="text-base font-semibold text-white leading-relaxed">{{ mainEncouragement.message }}</div>
            </div>
          </el-card>
          
          <!-- 连续天数卡片 -->
          <el-card v-if="overviewStreak > 0" class="streak-card-preview" shadow="hover">
            <div class="flex items-center justify-between h-full">
              <div>
                <div class="text-sm text-gray-600 mb-2">连续记录</div>
                <div class="text-4xl font-bold text-orange-500">{{ typeof overviewStreak === 'number' ? overviewStreak : 0 }} 天</div>
                <div class="text-xs text-gray-500 mt-2">
                  <span v-if="overviewStreak >= 30">坚持一个月了，太厉害了！🔥</span>
                  <span v-else-if="overviewStreak >= 7">坚持一周了，继续保持！</span>
                  <span v-else>继续坚持，形成习惯！</span>
                </div>
              </div>
              <div class="text-6xl">🔥</div>
            </div>
          </el-card>
        </div>

        <!-- 成就展示（可折叠） -->
        <el-card v-if="overviewAchievements.length > 0" class="mb-4" shadow="hover" id="overview-achievements">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-2xl">🏆</span>
                <span class="text-lg font-semibold">今日成就</span>
                <el-tag type="success" size="small">{{ overviewAchievements.length }} 项</el-tag>
              </div>
              <el-button 
                text 
                size="small" 
                @click="overviewAchievementsExpanded = !overviewAchievementsExpanded"
              >
                {{ overviewAchievementsExpanded ? '收起' : '展开' }}
              </el-button>
            </div>
          </template>
          <el-collapse-transition>
            <div v-show="overviewAchievementsExpanded">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="(achievement, index) in overviewAchievements"
                  :key="index"
                  class="achievement-item"
                >
                  <div class="achievement-icon">{{ achievement.icon }}</div>
                  <div class="achievement-content">
                    <div class="achievement-title">{{ achievement.title }}</div>
                    <div class="achievement-desc">{{ achievement.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </el-card>

        <!-- 数据统计（优化显示） -->
        <el-card class="mb-4" shadow="hover" id="overview-stats">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-2xl">📊</span>
                <span class="text-lg font-semibold">今日数据统计</span>
              </div>
              <el-button 
                text 
                size="small" 
                @click="overviewStatsExpanded = !overviewStatsExpanded"
              >
                {{ overviewStatsExpanded ? '收起' : '展开' }}
              </el-button>
            </div>
          </template>
          <el-collapse-transition>
            <div v-show="overviewStatsExpanded">
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-icon">🎯</div>
                  <div class="stat-content">
                    <div class="stat-label">主线推进</div>
                    <div class="stat-value">{{ formData.今日主线推进?.length || 0 }}<span class="stat-unit">条</span></div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">💡</div>
                  <div class="stat-content">
                    <div class="stat-label">决策完成</div>
                    <div class="stat-value">{{ overviewStats.已决策数 || 0 }}/{{ overviewStats.决策数 || 0 }}</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">🔥</div>
                  <div class="stat-content">
                    <div class="stat-label">习惯执行</div>
                    <div class="stat-value">{{ overviewStats.已执行习惯数 || 0 }}/{{ overviewStats.习惯数 || 0 }}</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">❓</div>
                  <div class="stat-content">
                    <div class="stat-label">问题记录</div>
                    <div class="stat-value">{{ overviewStats.问题数 || 0 }}<span class="stat-unit">个</span></div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">⚡</div>
                  <div class="stat-content">
                    <div class="stat-label">能量值</div>
                    <div class="stat-value">{{ overviewStats.能量值 || 0 }}/5</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">😌</div>
                  <div class="stat-content">
                    <div class="stat-label">压力值</div>
                    <div class="stat-value">{{ overviewStats.压力值 || 0 }}/5</div>
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </el-card>

        <!-- 今日主线推进总结（核心内容，优先展示） -->
        <el-card v-if="formData.今日主线推进?.length > 0" class="mb-4 thread-progress-card" shadow="hover" id="overview-threads">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-2xl">🎯</span>
                <span class="text-lg font-semibold">今日主线推进</span>
                <el-tag type="primary" size="small">{{ formData.今日主线推进.length }} 条主线</el-tag>
              </div>
            </div>
          </template>
          <div class="space-y-4">
            <div
              v-for="(progress, index) in formData.今日主线推进"
              :key="progress.主线ID"
              class="thread-progress-summary"
            >
              <div class="thread-progress-header">
                <div class="flex items-center gap-3">
                  <div class="thread-progress-badge">{{ index + 1 }}</div>
                  <div>
                    <div class="thread-progress-name">{{ getThreadNameById(progress.主线ID) }}</div>
                    <div class="thread-progress-effect">
                      <el-rate
                        :model-value="progress.推进效果 || 0"
                        :max="5"
                        disabled
                        show-score
                        text-color="#ff9900"
                        score-template="{value} 分"
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="thread-progress-content">
                <div v-if="progress.今日关键行动" class="thread-action">
                  <div class="action-label">🎯 关键行动</div>
                  <div class="action-text">{{ progress.今日关键行动 }}</div>
                </div>
                <div v-if="progress.行动记录" class="thread-record">
                  <div class="record-label">📝 行动记录</div>
                  <div class="record-text">{{ progress.行动记录 }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 每日三省（核心，可折叠） -->
        <el-card v-if="formData.每日三省?.动机偏差 || formData.每日三省?.理想不一致 || formData.每日三省?.主线对齐" class="mb-4 reflections-card" shadow="hover" id="overview-reflections">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-2xl">💪</span>
                <span class="text-lg font-semibold">今日三省（核心反思）</span>
              </div>
              <el-button 
                text 
                size="small" 
                @click="overviewReflectionsExpanded = !overviewReflectionsExpanded"
              >
                {{ overviewReflectionsExpanded ? '收起' : '展开' }}
              </el-button>
            </div>
          </template>
          <el-collapse-transition>
            <div v-show="overviewReflectionsExpanded">
              <div class="space-y-4">
                <div v-if="formData.每日三省?.动机偏差" class="reflection-item">
                  <div class="reflection-question">
                    <span class="reflection-icon">🤔</span>
                    <span>动机偏差</span>
                  </div>
                  <div class="reflection-answer">{{ formData.每日三省.动机偏差 }}</div>
                </div>
                <div v-if="formData.每日三省?.理想不一致" class="reflection-item">
                  <div class="reflection-question">
                    <span class="reflection-icon">🎯</span>
                    <span>理想不一致</span>
                  </div>
                  <div class="reflection-answer">{{ formData.每日三省.理想不一致 }}</div>
                </div>
                <div v-if="formData.每日三省?.主线对齐" class="reflection-item">
                  <div class="reflection-question">
                    <span class="reflection-icon">🌟</span>
                    <span>主线对齐</span>
                  </div>
                  <div class="reflection-answer">{{ formData.每日三省.主线对齐 }}</div>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </el-card>
        
        <!-- 决策与内耗（可折叠） -->
        <el-card v-if="formData.决策与内耗?.length > 0" class="mb-4" shadow="hover" id="overview-decisions">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-2xl">💡</span>
                <span class="text-lg font-semibold">决策与内耗</span>
                <el-tag type="info" size="small">{{ formData.决策与内耗.length }} 项</el-tag>
              </div>
              <el-button 
                text 
                size="small" 
                @click="overviewDecisionsExpanded = !overviewDecisionsExpanded"
              >
                {{ overviewDecisionsExpanded ? '收起' : '展开' }}
              </el-button>
            </div>
          </template>
          <el-collapse-transition>
            <div v-show="overviewDecisionsExpanded">
              <div class="space-y-4">
                <div
                  v-for="(decision, index) in formData.决策与内耗"
                  :key="decision.决策ID"
                  class="decision-summary-item"
                >
                  <div class="decision-header-summary">
                    <span class="decision-number">决策 {{ index + 1 }}</span>
                    <el-tag :type="decision.是否解决 ? 'success' : 'warning'" size="small">
                      {{ decision.是否解决 ? '已决策' : '思考中' }}
                    </el-tag>
                  </div>
                  <div class="decision-title-summary">{{ decision.决策主题 || '未命名决策' }}</div>
                  <div v-if="decision.决策结论" class="decision-conclusion-summary">
                    <strong>决策结论：</strong>{{ decision.决策结论 }}
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </el-card>
        
        <!-- 习惯追踪（可折叠） -->
        <el-card v-if="formData.习惯追踪?.length > 0" class="mb-4" shadow="hover" id="overview-habits">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-2xl">🔥</span>
                <span class="text-lg font-semibold">习惯追踪</span>
                <el-tag type="success" size="small">
                  {{ overviewStats.已执行习惯数 || 0 }}/{{ overviewStats.习惯数 || 0 }} 已执行
                </el-tag>
              </div>
              <el-button 
                text 
                size="small" 
                @click="overviewHabitsExpanded = !overviewHabitsExpanded"
              >
                {{ overviewHabitsExpanded ? '收起' : '展开' }}
              </el-button>
            </div>
          </template>
          <el-collapse-transition>
            <div v-show="overviewHabitsExpanded">
              <div class="space-y-3">
                <div
                  v-for="(habit, index) in formData.习惯追踪"
                  :key="habit.习惯ID"
                  class="habit-summary-item"
                  :class="{ 'habit-executed': habit.是否执行 }"
                >
                  <div class="flex items-center gap-3">
                    <el-checkbox :model-value="habit.是否执行" disabled />
                    <div class="flex-1">
                      <div class="habit-name-summary">{{ habit.习惯名称 || '未命名习惯' }}</div>
                      <div v-if="habit.连续天数 > 0" class="habit-streak-summary">
                        连续 {{ habit.连续天数 }} 天 🔥
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </el-card>

        <!-- 内容完整性提示 -->
        <el-card v-if="overviewCompletionRate < 100" class="mb-4 completion-tip-card" shadow="hover">
          <template #header>
            <div class="flex items-center gap-2">
              <span class="text-xl">💡</span>
              <span class="text-base font-semibold">完善建议</span>
            </div>
          </template>
          <div class="completion-tips">
            <div v-if="completionInfo.totalMissing > 0" class="tip-content">
              <p class="tip-text">还有 <strong>{{ completionInfo.totalMissing }}</strong> 项待完善，完善后可以获得更好的记录体验。</p>
              <el-button 
                type="primary" 
                size="small" 
                @click="handleGoToEdit"
                class="mt-2"
              >
                去完善
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 快速操作（增强版） -->
        <el-card class="mb-4" shadow="hover" id="overview-actions">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-2xl">⚡</span>
                <span class="text-lg font-semibold">快速操作</span>
              </div>
              <div class="text-xs text-gray-400 hidden md:block">
                快捷键：Esc 关闭 | Ctrl+E 导出 | Ctrl+C 复制
              </div>
            </div>
          </template>
          <div class="flex flex-col md:flex-row gap-3">
            <el-button
              type="primary"
              size="default"
              @click="handleOverviewExport"
              :icon="Download"
              class="flex-1 action-btn"
              title="导出为 Markdown 文件 (Ctrl+E)"
            >
              导出Markdown
            </el-button>
            <el-button
              type="success"
              size="default"
              @click="handleCopyToClipboard"
              :icon="DocumentCopy"
              class="flex-1 action-btn"
              title="复制内容到剪贴板 (Ctrl+C)"
            >
              复制内容
            </el-button>
            <el-button
              type="info"
              size="default"
              @click="handlePrintPreview"
              :icon="Printer"
              class="flex-1 action-btn"
              title="打印预览 (Ctrl+P)"
            >
              打印预览
            </el-button>
            <el-button
              type="warning"
              size="default"
              @click="handleGoToEdit"
              class="flex-1 action-btn"
              title="返回编辑页面"
            >
              继续编辑
            </el-button>
            <el-button
              type="success"
              size="default"
              @click="handleNewDay"
              :icon="Calendar"
              class="flex-1 action-btn"
              title="切换到新的一天"
            >
              新的一天
            </el-button>
          </div>
        </el-card>

        <!-- 鼓励提示 -->
        <div class="encouragement-tips">
          <div class="tip-item">
            <span class="tip-icon">💡</span>
            <span class="tip-text">每天记录，见证自己的成长</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">📈</span>
            <span class="tip-text">坚持记录，数据会告诉你答案</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">🎯</span>
            <span class="tip-text">设定目标，一步步实现梦想</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, ArrowLeft, ArrowRight, Calendar, Check, User, DocumentCopy, Printer, Menu, Document, Star, List, Location, CircleCheck, Setting } from '@element-plus/icons-vue'
import { getTodayDate, getDiaryData, saveDiaryData, getAllDates, getDefaultData } from '../utils/storage'
import { exportToMarkdown, downloadFile } from '../utils/export'
import { checkOverallComplete } from '../utils/validation'
import { calculateAchievements, calculateStats, generateEncouragement, calculateStreak } from '../utils/gamification'
import { onAuthChange, getCurrentUser, waitForAuth } from '../utils/firebaseAuth'
import { subscribeDiaryData } from '../utils/firebaseStorage'
import OverviewModule from '../components/OverviewModule.vue'
import DailyThreadProgressModule from '../components/DailyThreadProgressModule.vue'
import DecisionModule from '../components/DecisionModule.vue'
import ProblemLibraryModule from '../components/ProblemLibraryModule.vue'
import HabitTrackingModule from '../components/HabitTrackingModule.vue'
import ThreeReflectionsModule from '../components/ThreeReflectionsModule.vue'
import LifeThreadsSetup from '../components/LifeThreadsSetup.vue'
import Login from '../components/Login.vue'
import { getLifeThreads, saveLifeThreads } from '../utils/storage'

const currentDate = ref(getTodayDate())
const activeStep = ref(0)
const showHistoryDialog = ref(false)
const showLoginDialog = ref(false)
const showThreadsSetupDialog = ref(false)
const user = ref(null)
// 初始化formData，使用getDefaultData确保数据结构完整
const formData = ref(getDefaultData())
// 人生主线数据
const lifeThreads = ref([])

// 历史记录日期列表
const historyDates = ref([])
// 日期摘要映射（缓存）
const dateSummaryMap = ref({})

// 日期导航
const canNavigatePrev = computed(() => {
  if (!Array.isArray(historyDates.value) || historyDates.value.length === 0) {
    return false
  }
  const currentIndex = historyDates.value.indexOf(currentDate.value)
  return currentIndex < historyDates.value.length - 1
})

const canNavigateNext = computed(() => {
  const today = getTodayDate()
  return currentDate.value < today
})

// 格式化日期显示
function formatDate(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (dateStr === getTodayDate()) {
    return `今天 (${dateStr})`
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 (${dateStr})`
  } else {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${dateStr} ${weekdays[date.getDay()]}`
  }
}

// 获取日期摘要（异步）
async function getDateSummary(dateStr) {
  try {
    const data = await getDiaryData(dateStr)
    // 新数据结构：人生主线系统
    const hasContent = (data.今日概览?.一句话标题) ||
                       (data.今日主线推进?.length > 0) ||
                       (data.决策与内耗?.length > 0) ||
                       (data.问题库?.length > 0) ||
                       (data.习惯追踪?.length > 0) ||
                       (data.每日三省?.动机偏差)
    
    if (hasContent) {
      // 统计已填写的模块数
      let completedCount = 0
      if (data.今日概览?.一句话标题) completedCount++
      if (data.今日主线推进?.length > 0) completedCount++
      if (data.决策与内耗?.length > 0) completedCount++
      if (data.问题库?.length > 0) completedCount++
      if (data.习惯追踪?.length > 0) completedCount++
      if (data.每日三省?.动机偏差) completedCount++
      return `已填写 (${completedCount}/6模块)`
    }
    return '未填写'
  } catch (e) {
    console.error('获取日期摘要失败:', e)
    return '加载中...'
  }
}

// 选择历史日期
async function selectHistoryDate(date) {
  if (!date) return
  
  // 先保存当前日期的数据（如果数据有变化）
  if (user.value && editingDate.value) {
    try {
      await saveDataImmediately()
    } catch (e) {
      console.warn('切换日期前保存失败:', e)
    }
  }
  
  // 切换到选中的日期
  currentDate.value = date
  showHistoryDialog.value = false
  
  // 加载选中日期的数据
  await loadData(date)
  
  ElMessage.success(`已切换到 ${formatDate(date)}`)
}

// 日期导航
function navigateDate(direction) {
  const dates = historyDates.value
  const currentIndex = dates.indexOf(currentDate.value)
  
  if (direction === -1 && currentIndex < dates.length - 1) {
    // 向前（更早的日期）
    currentDate.value = dates[currentIndex + 1]
  } else if (direction === 1) {
    // 向后（更晚的日期）
    const today = getTodayDate()
    if (currentDate.value < today) {
      const nextDate = new Date(currentDate.value)
      nextDate.setDate(nextDate.getDate() + 1)
      const nextDateStr = nextDate.toISOString().split('T')[0]
      currentDate.value = nextDateStr
    }
  }
}

// 当前正在编辑的日期（用于保存时使用）
const editingDate = ref(getTodayDate())
// 记录上次保存的数据，用于比较是否有变化
const lastSavedData = ref(null)

// 标记是否正在加载数据，避免实时监听覆盖
const isLoadingData = ref(false)
// 标记是否正在加载历史记录
const isLoadingHistory = ref(false)

// 记录最后一次保存的时间戳，用于判断实时更新是否来自当前设备的保存
const lastSaveTimestamp = ref(null)
// 标记是否正在保存，保存期间忽略实时监听更新
const isSavingRef = ref(false)

// 加载数据（支持异步）
async function loadData(date = null) {
  const targetDate = date || currentDate.value
  editingDate.value = targetDate
  
  isLoadingData.value = true
  
  try {
    const data = await getDiaryData(targetDate)
    // 深拷贝避免引用问题，并确保数据结构完整
    const defaultData = getDefaultData()
    const cleanData = JSON.parse(JSON.stringify(data))
    
    // 确保所有必需的字段都存在，使用默认值填充缺失的字段
    const newFormData = {
      今日概览: cleanData.今日概览 || defaultData.今日概览,
      今日主线推进: Array.isArray(cleanData.今日主线推进) ? cleanData.今日主线推进 : (defaultData.今日主线推进 || []),
      决策与内耗: Array.isArray(cleanData.决策与内耗) ? cleanData.决策与内耗 : (defaultData.决策与内耗 || []),
      问题库: Array.isArray(cleanData.问题库) ? cleanData.问题库 : (defaultData.问题库 || []),
      习惯追踪: Array.isArray(cleanData.习惯追踪) ? cleanData.习惯追踪 : (defaultData.习惯追踪 || []),
      每日三省: cleanData.每日三省 || defaultData.每日三省
    }
    
    formData.value = newFormData
    
    // 更新上次保存的数据（用于比较变化）
    lastSavedData.value = JSON.parse(JSON.stringify(formData.value))
    
    // 如果已登录，设置实时监听
    if (user.value) {
      // 取消之前的监听
      if (window.currentDataUnsubscribe) {
        window.currentDataUnsubscribe()
      }
      
      // 设置新的监听
      try {
        window.currentDataUnsubscribe = subscribeDiaryData(
          user.value.uid,
          targetDate,
          (data) => {
            // 如果正在加载数据，忽略实时更新（避免覆盖）
            if (isLoadingData.value) {
              return
            }
            
            // 如果正在保存，忽略实时更新（避免覆盖用户正在输入的内容）
            if (isSavingRef.value) {
              console.log('正在保存中，忽略实时监听更新')
              return
            }
            
            // 如果更新来自刚刚的保存（1秒内），忽略（避免覆盖用户正在输入的内容）
            if (data && data.updatedAt && lastSaveTimestamp.value) {
              const updateTime = new Date(data.updatedAt).getTime()
              const timeDiff = Math.abs(updateTime - lastSaveTimestamp.value)
              if (timeDiff < 2000) { // 2秒内的更新认为是自己保存的
                console.log('实时监听：忽略来自当前设备的更新（避免覆盖用户输入）')
                return
              }
            }
            
            if (data) {
              // 移除Firebase的元数据
              const { date, updatedAt, ...diaryData } = data
              const cleanData = JSON.parse(JSON.stringify(diaryData))
              
              // 确保数据结构完整
              const defaultData = getDefaultData()
              const mergedData = {
                今日概览: cleanData.今日概览 || defaultData.今日概览,
                今日主线推进: Array.isArray(cleanData.今日主线推进) ? cleanData.今日主线推进 : (defaultData.今日主线推进 || []),
                决策与内耗: Array.isArray(cleanData.决策与内耗) ? cleanData.决策与内耗 : (defaultData.决策与内耗 || []),
                问题库: Array.isArray(cleanData.问题库) ? cleanData.问题库 : (defaultData.问题库 || []),
                习惯追踪: Array.isArray(cleanData.习惯追踪) ? cleanData.习惯追踪 : (defaultData.习惯追踪 || []),
                每日三省: cleanData.每日三省 || defaultData.每日三省
              }
              
              // 只在数据确实变化时才更新（避免覆盖用户正在编辑的内容）
              // 并且只有当新数据比当前数据"更新"时才更新（来自其他设备的更新）
              const currentStr = JSON.stringify(formData.value)
              const newStr = JSON.stringify(mergedData)
              
              if (currentStr !== newStr) {
                // 检查是否是用户正在编辑的内容（当前数据比保存的数据"新"）
                const lastSavedStr = lastSavedData.value ? JSON.stringify(lastSavedData.value) : ''
                const isUserEditing = currentStr !== lastSavedStr
                
                if (isUserEditing) {
                  // 用户正在编辑，不覆盖（除非数据明显来自其他设备）
                  console.log('实时监听：检测到用户正在编辑，不覆盖本地数据')
                  // 可以选择性地提示用户有其他设备更新了数据
                  // ElMessage.info('检测到其他设备的数据更新，但您正在编辑，暂不覆盖')
                } else {
                  // 用户没有在编辑，可以安全更新
                  console.log('实时监听：检测到数据变化，更新formData（来自其他设备）')
                  formData.value = mergedData
                  // 更新上次保存的数据（来自其他设备的更新）
                  lastSavedData.value = JSON.parse(JSON.stringify(mergedData))
                }
              }
            }
          }
        )
      } catch (e) {
        console.warn('设置实时监听失败:', e)
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败：' + error.message)
    // 使用默认数据
    formData.value = JSON.parse(JSON.stringify(getDefaultData()))
  } finally {
    // 延迟重置加载标志，确保子组件有时间更新
    // 添加最小加载时间，避免闪烁（如果加载太快）
    const minLoadTime = 300 // 最小显示300ms
    const loadStartTime = Date.now()
    
    setTimeout(() => {
      const elapsed = Date.now() - loadStartTime
      const remaining = Math.max(0, minLoadTime - elapsed)
      
      setTimeout(() => {
        isLoadingData.value = false
      }, remaining)
    }, 100)
  }
}

// 比较两个数据对象是否相同（忽略Firebase的元数据）
function isDataChanged(newData, oldData) {
  if (!oldData) return true
  
  // 移除Firebase的元数据进行比较
  const cleanNewData = { ...newData }
  delete cleanNewData.date
  delete cleanNewData.updatedAt
  
  const cleanOldData = { ...oldData }
  delete cleanOldData.date
  delete cleanOldData.updatedAt
  
  return JSON.stringify(cleanNewData) !== JSON.stringify(cleanOldData)
}

// 手动保存（强制保存，忽略变化检测）
async function saveManually() {
  // 检查用户是否已登录
  if (!user.value) {
    ElMessage.warning('请先登录以保存数据')
    return
  }
  
  // 检查editingDate是否有效
  if (!editingDate.value) {
    editingDate.value = currentDate.value
  }
  
  // 如果正在保存，等待完成
  if (isSaving.value) {
    ElMessage.info('正在保存中，请稍候...')
    return
  }
  
  // 清除防抖定时器
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  
  isSaving.value = true
  isSavingRef.value = true // 标记正在保存
  try {
    const currentData = JSON.parse(JSON.stringify(formData.value))
    console.log('手动保存数据到服务器...', {
      date: editingDate.value,
      user: user.value.uid,
      dataKeys: Object.keys(currentData)
    })
    await saveDiaryData(editingDate.value, currentData)
    lastSavedData.value = currentData
    lastSaveTimestamp.value = Date.now() // 记录保存时间戳
    console.log('手动保存成功')
    ElMessage.success('数据已保存')
    
    // 保存成功后，更新历史记录列表
    await updateHistoryDates()
    
    // 延迟重置保存标志，确保实时监听不会立即覆盖
    setTimeout(() => {
      isSavingRef.value = false
    }, 2000) // 2秒后重置
  } catch (error) {
    console.error('保存数据失败:', error)
    ElMessage.error('保存数据失败：' + error.message)
    isSavingRef.value = false // 保存失败立即重置
  } finally {
    isSaving.value = false
  }
}

// 防抖保存函数（支持异步，只在数据变化时保存）
let saveTimer = null
// isSaving已经在上面定义为ref了

async function saveData(showMessage = false) {
  // 检查用户是否已登录
  if (!user.value) {
    console.warn('用户未登录，无法保存数据')
    if (showMessage) {
      ElMessage.warning('请先登录以保存数据')
    }
    return
  }
  
  // 检查editingDate是否有效
  if (!editingDate.value) {
    console.warn('editingDate无效，无法保存数据')
    editingDate.value = currentDate.value
  }
  
  // 如果正在保存，跳过
  if (isSaving.value) {
    console.log('正在保存中，跳过本次保存')
    return
  }
  
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  saveTimer = setTimeout(async () => {
    if (isSaving.value) {
      return
    }
    
    isSaving.value = true
    isSavingRef.value = true // 标记正在保存
    try {
      const currentData = JSON.parse(JSON.stringify(formData.value))
      
      // 检查数据是否有变化
      const hasChanged = isDataChanged(currentData, lastSavedData.value)
      console.log('数据变化检查:', {
        hasChanged,
        editingDate: editingDate.value,
        userLoggedIn: !!user.value
      })
      
      if (!hasChanged) {
        // 数据没有变化，跳过保存
        console.log('数据未变化，跳过保存')
        isSavingRef.value = false // 重置保存标志
        return
      }
      
      // 使用editingDate确保保存到正确的日期
      console.log('开始保存数据到服务器...', editingDate.value)
      await saveDiaryData(editingDate.value, currentData)
      console.log('数据保存成功')
      
      // 更新上次保存的数据
      lastSavedData.value = currentData
      lastSaveTimestamp.value = Date.now() // 记录保存时间戳
      
      // 保存成功后，更新历史记录列表（静默更新，不显示消息）
      updateHistoryDates().catch(err => {
        console.warn('更新历史记录列表失败:', err)
      })
      
      if (showMessage) {
        ElMessage.success('数据已保存')
      }
      
      // 延迟重置保存标志，确保实时监听不会立即覆盖
      setTimeout(() => {
        isSavingRef.value = false
      }, 2000) // 2秒后重置
    } catch (error) {
      console.error('保存数据失败:', error)
      ElMessage.error('保存数据失败：' + error.message)
      isSavingRef.value = false // 保存失败立即重置
    } finally {
      isSaving.value = false
    }
  }, 1000) // 1秒防抖
}

// 立即保存（用于切换步骤时，也会检查变化）
async function saveDataImmediately() {
  // 检查用户是否已登录
  if (!user.value) {
    console.warn('用户未登录，无法保存数据')
    return
  }
  
  // 检查editingDate是否有效
  if (!editingDate.value) {
    console.warn('editingDate无效，使用currentDate')
    editingDate.value = currentDate.value
  }
  
  // 如果正在保存，等待完成
  if (isSaving.value) {
    console.log('正在保存中，等待完成...')
    // 等待最多3秒
    let waitCount = 0
    while (isSaving.value && waitCount < 30) {
      await new Promise(resolve => setTimeout(resolve, 100))
      waitCount++
    }
    if (isSaving.value) {
      console.warn('保存超时，跳过立即保存')
      return
    }
  }
  
  // 清除防抖定时器
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  
  isSaving.value = true
  isSavingRef.value = true // 标记正在保存
  try {
    const currentData = JSON.parse(JSON.stringify(formData.value))
    
    // 检查数据是否有变化
    const hasChanged = isDataChanged(currentData, lastSavedData.value)
    console.log('立即保存 - 数据变化检查:', {
      hasChanged,
      editingDate: editingDate.value,
      userLoggedIn: !!user.value
    })
    
    if (!hasChanged) {
      // 数据没有变化，跳过保存
      console.log('立即保存 - 数据未变化，跳过保存')
      isSavingRef.value = false // 重置保存标志
      return
    }
    
    // 使用editingDate确保保存到正确的日期
    console.log('立即保存数据到服务器...', editingDate.value)
    await saveDiaryData(editingDate.value, currentData)
    console.log('立即保存成功')
    
    // 更新上次保存的数据
    lastSavedData.value = currentData
    lastSaveTimestamp.value = Date.now() // 记录保存时间戳
    
    // 保存成功后，更新历史记录列表（静默更新）
    updateHistoryDates().catch(err => {
      console.warn('更新历史记录列表失败:', err)
    })
    
    // 延迟重置保存标志，确保实时监听不会立即覆盖
    setTimeout(() => {
      isSavingRef.value = false
    }, 2000) // 2秒后重置
  } catch (error) {
    console.error('立即保存数据失败:', error)
    ElMessage.error('保存数据失败：' + error.message)
    isSavingRef.value = false // 保存失败立即重置
  } finally {
    isSaving.value = false
  }
}

// 日期变化
async function handleDateChange(newDate) {
  if (newDate && newDate !== editingDate.value) {
    // 先保存当前日期的数据（如果数据有变化）
    await saveDataImmediately()
    // 重置上次保存的数据（切换日期后需要重新比较）
    lastSavedData.value = null
    // 加载新日期的数据
    await loadData(newDate)
    activeStep.value = 0
    ElMessage.info(`已切换到 ${formatDate(newDate)}`)
  }
}

// 步骤点击（支持直接跳转）
async function handleStepClick(index) {
  if (index !== activeStep.value && index <= activeStep.value + 1) {
    await saveDataImmediately()
    activeStep.value = index
  }
}

// 下一步
async function handleNext() {
  if (activeStep.value < 5) {
    await saveDataImmediately()
    activeStep.value++
  }
}


// 上一步
async function handlePrev() {
  if (activeStep.value > 0) {
    await saveDataImmediately()
    activeStep.value--
  }
}

// 完成
async function handleComplete() {
  await saveDataImmediately()
  ElMessage.success('日记填写完成！')
}

// 提交日记相关状态
const showOverviewDialog = ref(false)
const overviewAchievements = ref([])
const overviewStats = ref({})
const overviewStreak = ref(0)
const overviewEncouragements = ref([])
const overviewCompletionRate = ref(0)
const isCalculatingOverview = ref(false)

// 预览弹窗折叠状态
const overviewAchievementsExpanded = ref(true)
const overviewStatsExpanded = ref(true)
const overviewReflectionsExpanded = ref(true)
const overviewDecisionsExpanded = ref(false)
const overviewHabitsExpanded = ref(false)

// 预览弹窗内容引用（用于快速导航）
const overviewContentRef = ref(null)

// 保存状态（需要在script中暴露给template）
const isSaving = ref(false)

const mainEncouragement = computed(() => {
  return overviewEncouragements.value[0] || {
    type: 'normal',
    message: '记录本身就是一种成长，继续加油！',
    emoji: '💪'
  }
})

// 预览日记（打开总览弹窗）
async function handlePreview() {
  await saveDataImmediately()
  showOverviewDialog.value = true
}

// 弹窗打开后计算数据
async function handleOverviewOpened() {
  isCalculatingOverview.value = true
  
  try {
    // 计算完成度
    const completionInfo = checkOverallComplete(formData.value)
    overviewCompletionRate.value = completionInfo.completionRate || 0
    
    // 计算成就
    overviewAchievements.value = calculateAchievements(formData.value, currentDate.value)
    
    // 计算统计数据
    overviewStats.value = calculateStats(formData.value)
    
    // 计算鼓励信息
    overviewEncouragements.value = generateEncouragement(overviewAchievements.value, overviewStats.value)
    
    // 计算连续天数
    try {
      const dates = await getAllDates()
      const streak = calculateStreak(dates || [])
      // 确保是数字类型
      overviewStreak.value = typeof streak === 'number' ? streak : 0
    } catch (e) {
      console.error('加载日期列表失败:', e)
      overviewStreak.value = 0
    }
    
    // 重置折叠状态
    overviewAchievementsExpanded.value = overviewAchievements.value.length > 0
    overviewStatsExpanded.value = true
    overviewReflectionsExpanded.value = true
    overviewDecisionsExpanded.value = false
    overviewHabitsExpanded.value = false
    
    // 添加键盘快捷键监听
    document.addEventListener('keydown', handleOverviewKeyboard)
  } finally {
    // 延迟隐藏加载状态，确保动画流畅
    setTimeout(() => {
      isCalculatingOverview.value = false
    }, 300)
  }
}

// 弹窗关闭时移除键盘监听
watch(showOverviewDialog, (newVal) => {
  if (!newVal) {
    document.removeEventListener('keydown', handleOverviewKeyboard)
  }
})

// 快速导航处理
function handleQuickNav(command) {
  // 先展开对应的折叠部分
  switch(command) {
    case 'achievements':
      overviewAchievementsExpanded.value = true
      break
    case 'stats':
      overviewStatsExpanded.value = true
      break
    case 'reflections':
      overviewReflectionsExpanded.value = true
      break
    case 'decisions':
      overviewDecisionsExpanded.value = true
      break
    case 'habits':
      overviewHabitsExpanded.value = true
      break
  }
  
  // 等待DOM更新后再滚动
  setTimeout(() => {
    const elementId = `overview-${command}`
    const element = document.getElementById(elementId)
    
    if (!element) {
      ElMessage.warning('未找到目标区域')
      return
    }
    
    // 优先使用overviewContentRef，如果没有则查找最近的滚动容器
    const scrollContainer = overviewContentRef.value || 
                           element.closest('.overview-content') ||
                           element.closest('.el-dialog__body') ||
                           document.querySelector('.overview-dialog .el-dialog__body')
    
    if (scrollContainer) {
      // 计算目标元素相对于容器的位置
      const containerRect = scrollContainer.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const currentScrollTop = scrollContainer.scrollTop || 0
      const targetScrollTop = currentScrollTop + elementRect.top - containerRect.top - 20 // 20px 偏移
      
      // 平滑滚动
      scrollContainer.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      })
      
      ElMessage.success('已跳转到' + getSectionName(command))
    } else {
      // 备用方案：使用标准滚动（会滚动整个页面）
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      })
      ElMessage.success('已跳转到' + getSectionName(command))
    }
  }, 150) // 增加延迟确保DOM更新完成
}

// 获取章节名称
function getSectionName(command) {
  const names = {
    summary: '核心摘要',
    achievements: '今日成就',
    stats: '数据统计',
    threads: '主线推进',
    reflections: '今日三省',
    decisions: '决策与内耗',
    habits: '习惯追踪',
    actions: '快速操作'
  }
  return names[command] || '该部分'
}

// 键盘快捷键处理
function handleOverviewKeyboard(event) {
  // 只在预览弹窗打开时处理
  if (!showOverviewDialog.value) return
  
  // Ctrl/Cmd + E: 导出
  if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
    event.preventDefault()
    handleOverviewExport()
    return
  }
  
  // Ctrl/Cmd + C: 复制（只在没有选中文本时）
  if ((event.ctrlKey || event.metaKey) && event.key === 'c' && !window.getSelection().toString()) {
    event.preventDefault()
    handleCopyToClipboard()
    return
  }
  
  // Ctrl/Cmd + P: 打印预览
  if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
    event.preventDefault()
    handlePrintPreview()
    return
  }
  
  // Esc: 关闭弹窗
  if (event.key === 'Escape') {
    showOverviewDialog.value = false
    return
  }
}

// 导出（在总览弹窗中）
function handleOverviewExport() {
  const markdown = exportToMarkdown(currentDate.value, formData.value)
  const filename = `日记_${currentDate.value}.md`
  downloadFile(markdown, filename, 'text/markdown')
  ElMessage.success('导出成功！')
}

// 新的一天
function handleNewDay() {
  showOverviewDialog.value = false
  // 切换到今天
  currentDate.value = getTodayDate()
  ElMessage.success('已切换到新的一天，开始新的记录吧！')
}

// 复制内容到剪贴板
async function handleCopyToClipboard() {
  try {
    const markdown = exportToMarkdown(currentDate.value, formData.value)
    await navigator.clipboard.writeText(markdown)
    ElMessage.success('内容已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

// 打印预览
function handlePrintPreview() {
  const printWindow = window.open('', '_blank')
  const markdown = exportToMarkdown(currentDate.value, formData.value)
  
  // 将Markdown转换为HTML（简单版本）
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>日记 - ${currentDate.value}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
        h2 { margin-top: 30px; color: #409eff; }
        h3 { margin-top: 20px; color: #666; }
        p { line-height: 1.8; }
        strong { color: #333; }
        .date { color: #999; font-size: 14px; }
      </style>
    </head>
    <body>
      <h1>日记 - ${currentDate.value}</h1>
      <div class="date">${formatDate(currentDate.value)}</div>
      <div style="white-space: pre-wrap; line-height: 1.8;">${markdown.replace(/\n/g, '<br>').replace(/#{1,6}\s/g, (match) => {
        const level = match.trim().length
        return `<h${level}>`
      })}</div>
    </body>
    </html>
  `
  
  printWindow.document.write(html)
  printWindow.document.close()
  
  setTimeout(() => {
    printWindow.print()
  }, 500)
}

// 跳转到编辑
function handleGoToEdit() {
  showOverviewDialog.value = false
  // 根据完成度跳转到第一个未完成的步骤
  const completionInfo = checkOverallComplete(formData.value)
  
  if (!completionInfo.results.今日概览.complete) {
    activeStep.value = 0
  } else if (!completionInfo.results.今日主线推进.complete) {
    activeStep.value = 1
  } else if (!completionInfo.results.每日三省.complete) {
    activeStep.value = 5
  } else {
    activeStep.value = 0
  }
  
  ElMessage.info('已跳转到编辑页面')
}

// 导出
async function handleExport() {
  await saveDataImmediately() // 导出前先保存
  const markdown = exportToMarkdown(currentDate.value, formData.value)
  const filename = `日记_${currentDate.value}.md`
  downloadFile(markdown, filename, 'text/markdown')
  ElMessage.success('导出成功！')
}

// 用户登录
async function handleUserLogin(userData) {
  user.value = userData
  showLoginDialog.value = false
  ElMessage.success('登录成功！')
  console.log('用户登录成功:', userData.uid)
  // 重新加载数据
  await loadData()
  await updateHistoryDates()
  await loadLifeThreads()
  
  // 监听日期列表变化
  if (window.datesUnsubscribe) {
    window.datesUnsubscribe()
  }
  const { subscribeAllDates } = await import('../utils/firebaseStorage')
  window.datesUnsubscribe = subscribeAllDates(userData.uid, (dates) => {
    historyDates.value = dates
  })
}

// 加载人生主线
async function loadLifeThreads() {
  try {
    const threads = await getLifeThreads()
    if (threads.length > 0) {
      lifeThreads.value = threads
    } else {
      // 如果没有主线，提示用户设置
      lifeThreads.value = []
    }
  } catch (error) {
    console.error('加载人生主线失败:', error)
    lifeThreads.value = []
  }
}

// 主线保存后的处理
async function handleThreadsSaved(threads) {
  lifeThreads.value = threads
  showThreadsSetupDialog.value = false
  ElMessage.success('人生主线已更新')
}

// 用户登出
function handleUserLogout() {
  user.value = null
  showLoginDialog.value = false
  // 取消Firebase监听
  if (window.currentDataUnsubscribe) {
    window.currentDataUnsubscribe()
    window.currentDataUnsubscribe = null
  }
  // 取消日期列表监听
  if (window.datesUnsubscribe) {
    window.datesUnsubscribe()
    window.datesUnsubscribe = null
  }
  // 清空数据
  historyDates.value = []
  formData.value = JSON.parse(JSON.stringify(getDefaultData()))
  lastSavedData.value = null
}

// 监听日期变化
watch(currentDate, async (newDate) => {
  await handleDateChange(newDate)
})

// 更新历史记录列表
async function updateHistoryDates() {
  // 如果用户未登录，清空历史记录
  if (!user.value) {
    historyDates.value = []
    dateSummaryMap.value = {}
    isLoadingHistory.value = false
    return
  }
  
  isLoadingHistory.value = true
  try {
    console.log('更新历史记录列表...')
    const dates = await getAllDates()
    console.log('获取到历史日期:', dates)
    historyDates.value = dates || []
    
    // 异步加载所有日期的摘要
    dates.forEach(async (date) => {
      if (!dateSummaryMap.value[date]) {
        try {
          dateSummaryMap.value[date] = await getDateSummary(date)
        } catch (e) {
          console.warn(`获取日期 ${date} 摘要失败:`, e)
          dateSummaryMap.value[date] = '加载失败'
        }
      }
    })
  } catch (e) {
    console.error('加载日期列表失败:', e)
    historyDates.value = []
  } finally {
    // 延迟重置加载状态，避免闪烁
    setTimeout(() => {
      isLoadingHistory.value = false
    }, 300)
  }
}

// 历史记录对话框打开时的处理
async function handleHistoryDialogOpened() {
  // 打开对话框时刷新历史记录列表
  if (user.value) {
    await updateHistoryDates()
  }
}

// 监听键盘快捷键（Ctrl+S / Cmd+S）
function handleKeydown(event) {
  // Ctrl+S (Windows/Linux) 或 Cmd+S (Mac)
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault() // 阻止浏览器默认保存行为
    if (user.value) {
      saveManually()
    }
  }
}

// 监听认证状态
onMounted(async () => {
  // 确保editingDate初始化
  editingDate.value = currentDate.value
  console.log('初始化editingDate:', editingDate.value)
  
  // 先等待认证状态初始化
  user.value = await waitForAuth()
  console.log('初始化时用户状态:', user.value ? `已登录 (${user.value.uid})` : '未登录')
  
  // 初始化加载数据
  await loadData()
  await updateHistoryDates()
  await loadLifeThreads()
  
  // 添加键盘快捷键监听
  window.addEventListener('keydown', handleKeydown)
  
  // 继续监听认证状态变化
  onAuthChange((currentUser) => {
    console.log('认证状态变化:', currentUser ? `已登录 (${currentUser.uid})` : '未登录')
    user.value = currentUser
    if (currentUser) {
      // 用户登录后重新加载数据
      loadData()
      updateHistoryDates()
      loadLifeThreads()
      
      // 监听日期列表变化
      // 取消之前的监听
      if (window.datesUnsubscribe) {
        window.datesUnsubscribe()
      }
      import('../utils/firebaseStorage').then(({ subscribeAllDates }) => {
        window.datesUnsubscribe = subscribeAllDates(currentUser.uid, (dates) => {
          historyDates.value = dates
        })
      })
    } else {
      // 用户登出后清空列表
      historyDates.value = []
      lastSavedData.value = null
    }
  })
  
  // 如果已经登录，监听日期列表变化
  if (user.value) {
    const { subscribeAllDates } = await import('../utils/firebaseStorage')
    window.datesUnsubscribe = subscribeAllDates(user.value.uid, (dates) => {
      historyDates.value = dates
    })
  }
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (window.currentDataUnsubscribe) {
    window.currentDataUnsubscribe()
  }
  if (window.datesUnsubscribe) {
    window.datesUnsubscribe()
  }
})

// 完成度检查
const completionInfo = computed(() => {
  return checkOverallComplete(formData.value)
})

// 根据主线ID获取主线名称（用于预览）
function getThreadNameById(threadId) {
  const thread = lifeThreads.value.find(t => t.主线ID === threadId)
  return thread ? thread.主线名称 : '未知主线'
}

// 自动保存（防抖，不显示消息）
watch(formData, () => {
  // 确保用户已登录且使用正确的日期保存
  if (user.value && editingDate.value) {
    saveData(false)
  } else {
    console.log('自动保存跳过:', {
      userLoggedIn: !!user.value,
      editingDate: editingDate.value
    })
  }
}, { deep: true })
</script>

<style scoped>
/* 内容卡片过渡动画 */
.content-card {
  transition: opacity 0.3s ease;
  position: relative;
}

/* 淡入淡出过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* 加载状态样式优化 */
:deep(.el-loading-mask) {
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  transition: opacity 0.3s ease;
}

:deep(.el-loading-spinner) {
  margin-top: -25px;
}

:deep(.el-loading-text) {
  color: #409eff;
  font-size: 14px;
  margin-top: 10px;
  font-weight: 500;
}

:deep(.el-loading-spinner .path) {
  stroke: #409eff;
}

/* 历史记录列表过渡动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-move {
  transition: transform 0.3s ease;
}

:deep(.el-steps) {
  background: transparent;
}

:deep(.el-step__head) {
  cursor: pointer;
}

:deep(.el-step__head:hover) {
  opacity: 0.8;
}

:deep(.el-card) {
  border-radius: 8px;
}

:deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-card__body) {
  padding: 16px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  :deep(.el-steps) {
    padding: 8px 0;
  }
  
  :deep(.el-step__title) {
    font-size: 12px;
    line-height: 1.4;
  }

  :deep(.el-step__head) {
    width: 24px;
    height: 24px;
  }

  :deep(.el-step__icon) {
    font-size: 12px;
  }
  
  :deep(.el-card__header) {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  :deep(.el-card__body) {
    padding: 12px;
  }
  
  :deep(.el-progress-bar__outer) {
    height: 6px !important;
  }

  :deep(.el-progress__text) {
    font-size: 12px;
  }
  
  :deep(.el-dialog) {
    margin: 5vh auto;
    width: 95% !important;
    max-height: 90vh;
  }

  :deep(.el-dialog__header) {
    padding: 12px 16px;
  }

  :deep(.el-dialog__title) {
    font-size: 16px;
  }

  :deep(.el-dialog__body) {
    padding: 12px 16px;
    max-height: calc(90vh - 120px);
    overflow-y: auto;
  }

  :deep(.el-button) {
    font-size: 13px;
    padding: 8px 16px;
  }

  :deep(.el-button--small) {
    padding: 6px 12px;
    font-size: 12px;
  }

  :deep(.el-date-picker) {
    width: 100%;
  }

  :deep(.el-date-editor) {
    width: 100%;
  }

  :deep(.el-alert) {
    padding: 10px 12px;
  }

  :deep(.el-alert__title) {
    font-size: 13px;
    line-height: 1.5;
  }
}

/* 小屏幕手机优化 */
@media (max-width: 480px) {
  :deep(.el-steps) {
    padding: 6px 0;
  }

  :deep(.el-step__title) {
    font-size: 11px;
    padding: 0 4px;
  }

  :deep(.el-step__head) {
    width: 20px;
    height: 20px;
  }

  :deep(.el-step__icon) {
    font-size: 11px;
  }
  
  :deep(.el-card__header) {
    padding: 8px 10px;
    font-size: 13px;
  }
  
  :deep(.el-card__body) {
    padding: 10px;
  }

  :deep(.el-progress-bar__outer) {
    height: 5px !important;
  }

  :deep(.el-progress__text) {
    font-size: 11px;
  }

  :deep(.el-dialog) {
    width: 98% !important;
    margin: 2vh auto;
  }

  :deep(.el-dialog__header) {
    padding: 10px 12px;
  }

  :deep(.el-dialog__title) {
    font-size: 15px;
  }

  :deep(.el-dialog__body) {
    padding: 10px 12px;
  }

  :deep(.el-button) {
    font-size: 12px;
    padding: 6px 12px;
  }

  :deep(.el-button--small) {
    padding: 5px 10px;
    font-size: 11px;
  }

  :deep(.el-alert) {
    padding: 8px 10px;
  }

  :deep(.el-alert__title) {
    font-size: 12px;
  }
}

/* 总览弹窗样式 */
.overview-dialog :deep(.el-dialog__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
}

.overview-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.dialog-header-custom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.completion-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.tag-icon {
  font-size: 14px;
}

.overview-content {
  max-height: 75vh;
  overflow-y: auto;
  padding: 0;
  scroll-behavior: smooth;
}

/* 核心摘要卡片样式 */
.summary-hero-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 20px;
}

.hero-left {
  flex: 1;
}

.hero-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.3;
}

.hero-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

.hero-right {
  flex-shrink: 0;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 70px;
}

.stat-item-enhanced {
  position: relative;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.stat-visual-wrapper {
  width: 100%;
  margin-bottom: 4px;
}

.stat-visual-bar {
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.stat-visual-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
}

.energy-fill {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
}

.stress-fill {
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
}

.stat-value-large {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.streak-value {
  color: #f59e0b !important;
}

.streak-badge-mini {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 16px;
  animation: pulse 2s infinite;
}

.stat-label-small {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.hero-stat-divider {
  width: 1px;
  height: 40px;
  background: #e5e7eb;
}

.hero-progress {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: #6b7280;
}

.progress-percentage {
  font-weight: 600;
  color: #1f2937;
}

.celebration-header {
  text-align: center;
  padding: 1.5rem 0 1rem 0;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  margin: -20px -20px 1.5rem -20px;
  border-radius: 8px 8px 0 0;
}

.celebration-animation {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.celebration-emoji {
  font-size: 2rem;
  display: inline-block;
  animation: float 2s ease-in-out infinite;
}

.celebration-emoji:nth-child(2) {
  animation-delay: 0.2s;
}

.celebration-emoji:nth-child(3) {
  animation-delay: 0.4s;
}

.celebration-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.celebration-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

.encouragement-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.encouragement-card :deep(.el-card__body) {
  color: white;
  padding: 16px;
}

.encouragement-card :deep(.el-card__body) .text-gray-800 {
  color: white !important;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #e5e7eb;
}

.achievement-item:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.achievement-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.achievement-desc {
  font-size: 0.875rem;
  color: #6b7280;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.875rem;
}

.stat-item {
  text-align: center;
  padding: 0.875rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
}

.stat-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
}

.stat-unit {
  font-size: 0.875rem;
  font-weight: normal;
  color: #6b7280;
  margin-left: 0.25rem;
}

.topic-summary {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}

.topic-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.topic-icon {
  font-size: 1.5rem;
}

.topic-title {
  font-weight: 600;
  font-size: 1rem;
  color: #1f2937;
}

.topic-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.topic-question,
.topic-action,
.topic-next {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.6;
}

.topic-question strong,
.topic-action strong,
.topic-next strong {
  color: #1f2937;
  font-weight: 600;
}

.reflections-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fbbf24;
}

.reflection-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #fef3c7;
}

.reflection-item:last-child {
  border-bottom: none;
}

.reflection-question {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.reflection-answer {
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.75;
  white-space: pre-wrap;
}

.streak-card {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
}

.streak-card :deep(.el-card__body) {
  color: white;
  padding: 16px;
}

.streak-card :deep(.el-card__body) .text-gray-600,
.streak-card :deep(.el-card__body) .text-gray-500 {
  color: rgba(255, 255, 255, 0.9) !important;
}

.streak-card :deep(.el-card__body) .text-orange-500 {
  color: white !important;
}

.encouragement-tips {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.tip-icon {
  font-size: 1.125rem;
}

.tip-text {
  flex: 1;
}

/* 快速操作按钮优化 */
.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 快速导航下拉菜单优化 */
.overview-dialog :deep(.el-dropdown-menu) {
  padding: 8px;
}

.overview-dialog :deep(.el-dropdown-menu__item) {
  padding: 10px 16px;
  border-radius: 6px;
  transition: all 0.2s;
}

.overview-dialog :deep(.el-dropdown-menu__item:hover) {
  background: #f3f4f6;
  transform: translateX(4px);
}

/* 滚动到目标时的动画效果 */
[id^="overview-"] {
  scroll-margin-top: 20px;
  transition: all 0.3s ease;
}

[id^="overview-"]:target {
  animation: highlight 1s ease;
}

@keyframes highlight {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(102, 126, 234, 0.1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.1);
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .celebration-title {
    font-size: 1.25rem;
  }

  .celebration-emoji {
    font-size: 1.75rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-value {
    font-size: 1.125rem;
  }

  .achievement-item {
    padding: 0.75rem;
  }

  .achievement-icon {
    font-size: 1.5rem;
  }

  /* 预览弹窗移动端优化 */
  .dialog-header-custom {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .hero-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-stats {
    width: 100%;
    justify-content: space-around;
  }

  .hero-stat-item {
    min-width: auto;
    flex: 1;
  }

  .hero-title {
    font-size: 1.25rem;
  }

  .summary-hero-card {
    padding: 16px;
  }

  .overview-dialog :deep(.el-dialog) {
    width: 98% !important;
    margin: 2vh auto;
  }

  .overview-content {
    max-height: 85vh;
  }
}

.submit-btn {
  padding: 14px 32px;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
  transition: all 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(103, 194, 58, 0.4);
}

@media (max-width: 768px) {
  .submit-btn {
    padding: 12px 24px;
    font-size: 16px;
  }
}
</style>

