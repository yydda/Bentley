// 游戏化系统工具（新版本：人生主线系统）

// 计算成就
export function calculateAchievements(formData, date) {
  const achievements = []
  
  // 新数据结构：人生主线系统
  const hasOverview = formData.今日概览?.一句话标题
  const threadProgressList = formData.今日主线推进 || []
  const hasThreadProgress = threadProgressList.length > 0
  const hasDecisions = formData.决策与内耗?.length > 0
  const hasProblems = formData.问题库?.length > 0
  const hasPlans = formData.明日计划?.计划列表?.length > 0
  
  const energyLevel = formData.今日概览?.能量值 || 0
  const stressLevel = formData.今日概览?.压力值 || 0
  // 计算平均推进效果
  const progressEffect = threadProgressList.length > 0
    ? Math.round(threadProgressList.reduce((sum, p) => sum + (p.推进效果 || 0), 0) / threadProgressList.length)
    : 0
  
  // 完成度成就
  const completedModules = [
    hasOverview,
    hasThreadProgress,
    hasPlans
  ].filter(Boolean).length
  
  if (completedModules === 3) {
    achievements.push({
      icon: '🎯',
      title: '核心模块全完成',
      description: '今日概览、主线推进、明日计划全部完成！'
    })
  }
  
  // 能量成就
  if (energyLevel >= 4) {
    achievements.push({
      icon: '⚡',
      title: '能量满满',
      description: '今天能量值很高！'
    })
  }
  
  // 压力管理成就
  if (stressLevel <= 2) {
    achievements.push({
      icon: '😌',
      title: '压力管理',
      description: '压力值很低，状态很好！'
    })
  }
  
  // 主线推进成就
  if (progressEffect >= 4 && hasThreadProgress) {
    achievements.push({
      icon: '🚀',
      title: '高效推进',
      description: '主线推进效果很好！'
    })
  }
  
  // 多主线推进成就
  if (threadProgressList.length >= 3) {
    achievements.push({
      icon: '🎯',
      title: '多线并进',
      description: `同时推进了${threadProgressList.length}条主线！`
    })
  }
  
  // 决策成就
  if (hasDecisions) {
    const solvedDecisions = formData.决策与内耗?.filter(d => d.是否解决).length || 0
    if (solvedDecisions > 0) {
      achievements.push({
        icon: '💡',
        title: '决策达人',
        description: `完成了${solvedDecisions}个决策！`
      })
    }
  }
  
  // 明日计划成就
  if (hasPlans) {
    const plansWithThread = formData.明日计划?.计划列表?.filter(p => p.关联主线).length || 0
    const totalPlans = formData.明日计划?.计划列表?.length || 0
    if (plansWithThread === totalPlans && totalPlans > 0) {
      achievements.push({
        icon: '📅',
        title: '计划清晰',
        description: '所有计划都关联了主线！'
      })
    }
  }
  
  // 完整性成就
  const allModules = [
    hasOverview,
    hasThreadProgress,
    hasDecisions,
    hasProblems,
    hasPlans
  ].filter(Boolean).length
  
  if (allModules >= 4) {
    achievements.push({
      icon: '📝',
      title: '完整记录',
      description: '几乎所有模块都已填写！'
    })
  }
  
  return achievements
}

// 计算统计数据
export function calculateStats(formData) {
  const stats = {
    能量值: formData.今日概览?.能量值 || 0,
    压力值: formData.今日概览?.压力值 || 0,
    推进效果: formData.今日主线推进?.推进效果 || 0,
    决策数: formData.决策与内耗?.length || 0,
    已决策数: formData.决策与内耗?.filter(d => d.是否解决).length || 0,
    问题数: formData.问题库?.length || 0,
    已解决问题数: formData.问题库?.filter(p => p.是否解决).length || 0,
    计划数: formData.明日计划?.计划列表?.length || 0,
    主线关联计划数: formData.明日计划?.计划列表?.filter(p => p.关联主线).length || 0
  }
  
  return stats
}

// 生成鼓励信息
export function generateEncouragement(achievements, stats) {
  const encouragements = []
  
  // 基于成就的鼓励
  if (achievements.length >= 3) {
    encouragements.push({
      type: 'excellent',
      message: '太棒了！今天完成了多项成就！',
      emoji: '🎉'
    })
  } else if (achievements.length >= 1) {
    encouragements.push({
      type: 'good',
      message: '很好！继续保持！',
      emoji: '👍'
    })
  }
  
  // 基于主线推进的鼓励
  if (stats.推进效果 >= 4) {
    encouragements.push({
      type: 'excellent',
      message: '主线推进效果很好，继续加油！',
      emoji: '🚀'
    })
  }
  
  // 基于计划的鼓励
  if (stats.计划数 > 0 && stats.主线关联计划数 === stats.计划数) {
    encouragements.push({
      type: 'excellent',
      message: '所有计划都关联了主线，目标清晰！',
      emoji: '📅'
    })
  }
  
  // 基于决策的鼓励
  if (stats.已决策数 > 0) {
    encouragements.push({
      type: 'good',
      message: `完成了${stats.已决策数}个决策，行动力很强！`,
      emoji: '💡'
    })
  }
  
  // 默认鼓励
  if (encouragements.length === 0) {
    encouragements.push({
      type: 'normal',
      message: '记录本身就是一种成长，继续加油！',
      emoji: '💪'
    })
  }
  
  return encouragements
}

// 计算连续天数（同步函数）
export function calculateStreak(dates) {
  if (!Array.isArray(dates) || dates.length === 0) {
    return 0
  }
  
  // 确保dates是数组并排序
  const sortedDates = [...dates].sort().reverse()
  
  // 计算连续天数
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i])
    date.setHours(0, 0, 0, 0)
    
    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)
    
    if (date.getTime() === expectedDate.getTime()) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

// 计算主线推进的实时反馈（用于主线推进模块）
export function calculateThreadProgressFeedback(progressData, threadId) {
  const progress = progressData.find(p => p.主线ID === threadId)
  if (!progress) {
    return null
  }
  
  const feedback = {
    level: 'normal', // normal, good, excellent
    message: '',
    icon: '',
    score: progress.推进效果 || 0
  }
  
  // 根据推进效果给出反馈
  if (progress.推进效果 >= 4) {
    feedback.level = 'excellent'
    feedback.message = '推进效果很好！继续保持！'
    feedback.icon = '🚀'
  } else if (progress.推进效果 >= 3) {
    feedback.level = 'good'
    feedback.message = '推进效果不错，继续努力！'
    feedback.icon = '👍'
  } else if (progress.推进效果 >= 1) {
    feedback.level = 'normal'
    feedback.message = '有推进就是进步，加油！'
    feedback.icon = '💪'
  } else {
    feedback.level = 'normal'
    feedback.message = '开始记录就是第一步！'
    feedback.icon = '📝'
  }
  
  // 检查是否填写完整
  const hasAction = progress.今日关键行动 && progress.今日关键行动.trim() !== ''
  const hasRecord = progress.行动记录 && progress.行动记录.trim() !== ''
  const hasEffect = progress.推进效果 !== undefined && progress.推进效果 !== null
  
  if (hasAction && hasRecord && hasEffect) {
    feedback.complete = true
    if (progress.推进效果 >= 4) {
      feedback.message = '完美！推进效果很好，记录也很完整！'
      feedback.icon = '🌟'
    }
  } else {
    feedback.complete = false
    const missing = []
    if (!hasAction) missing.push('关键行动')
    if (!hasRecord) missing.push('行动记录')
    if (!hasEffect) missing.push('推进效果')
    feedback.message = `还缺少：${missing.join('、')}`
  }
  
  return feedback
}

// 计算主线状态（用于显示主线进度）
export function calculateThreadStatus(progressData, threadId) {
  const progress = progressData.find(p => p.主线ID === threadId)
  if (!progress) {
    return {
      status: '未开始',
      progress: 0,
      color: 'gray'
    }
  }
  
  // 根据填写完整度和推进效果计算状态
  const hasAction = progress.今日关键行动 && progress.今日关键行动.trim() !== ''
  const hasRecord = progress.行动记录 && progress.行动记录.trim() !== ''
  const hasEffect = progress.推进效果 !== undefined && progress.推进效果 !== null
  
  let progressValue = 0
  if (hasAction) progressValue += 33
  if (hasRecord) progressValue += 33
  if (hasEffect) progressValue += 34
  
  let status = '进行中'
  let color = 'blue'
  
  if (progressValue === 100) {
    if (progress.推进效果 >= 4) {
      status = '优秀'
      color = 'green'
    } else if (progress.推进效果 >= 3) {
      status = '良好'
      color = 'blue'
    } else {
      status = '完成'
      color = 'gray'
    }
  } else if (progressValue === 0) {
    status = '未开始'
    color = 'gray'
  }
  
  return {
    status,
    progress: progressValue,
    color,
    effect: progress.推进效果 || 0
  }
}
