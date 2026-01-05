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
  const hasHabits = formData.习惯追踪?.length > 0
  const hasReflections = formData.每日三省?.动机偏差
  
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
    hasReflections
  ].filter(Boolean).length
  
  if (completedModules === 3) {
    achievements.push({
      icon: '🎯',
      title: '核心模块全完成',
      description: '今日概览、主线推进、每日三省全部完成！'
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
  
  // 习惯坚持成就
  if (hasHabits) {
    const executedHabits = formData.习惯追踪?.filter(h => h.是否执行).length || 0
    const totalHabits = formData.习惯追踪?.length || 0
    if (executedHabits === totalHabits && totalHabits > 0) {
      achievements.push({
        icon: '🔥',
        title: '习惯全执行',
        description: '所有习惯都执行了！'
      })
    }
    
    // 检查连续天数
    const maxStreak = Math.max(...(formData.习惯追踪?.map(h => h.连续天数 || 0) || [0]))
    if (maxStreak >= 7) {
      achievements.push({
        icon: '🏆',
        title: '习惯坚持',
        description: `有习惯连续执行${maxStreak}天！`
      })
    }
  }
  
  // 深度反思成就
  if (hasReflections && formData.每日三省?.理想不一致 && formData.每日三省?.主线对齐) {
    achievements.push({
      icon: '💭',
      title: '深度反省',
      description: '完成了每日三省，深度思考！'
    })
  }
  
  // 完整性成就
  const allModules = [
    hasOverview,
    hasThreadProgress,
    hasDecisions,
    hasProblems,
    hasHabits,
    hasReflections
  ].filter(Boolean).length
  
  if (allModules >= 5) {
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
    习惯数: formData.习惯追踪?.length || 0,
    已执行习惯数: formData.习惯追踪?.filter(h => h.是否执行).length || 0,
    最长连续天数: Math.max(...(formData.习惯追踪?.map(h => h.连续天数 || 0) || [0]))
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
  
  // 基于习惯的鼓励
  if (stats.最长连续天数 >= 7) {
    encouragements.push({
      type: 'excellent',
      message: `习惯坚持${stats.最长连续天数}天，太厉害了！`,
      emoji: '🔥'
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
