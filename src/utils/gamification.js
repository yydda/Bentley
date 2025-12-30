// 游戏化系统工具

// 计算成就（新版本：三大课题模型）
export function calculateAchievements(formData, date) {
  const achievements = []
  
  // 新数据结构：三大课题模型
  const hasOverview = formData.今日概览?.一句话标题
  const hasLife = formData.生活?.主问题
  const hasWealth = formData.项目?.今日关键推进
  const hasLove = formData.情感?.今日焦点问题
  const hasReflections = formData.每日三省?.动机偏差
  
  const energyLevel = formData.今日概览?.能量值 || 0
  const stressLevel = formData.今日概览?.压力值 || 0
  
  // 完成度成就
  const completedTopics = [hasLife, hasWealth, hasLove].filter(Boolean).length
  if (completedTopics === 3) {
    achievements.push({
      icon: '🎯',
      title: '三大课题全完成',
      description: '生活、项目、情感三大课题全部完成！'
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
  
  // 深度反思成就
  if (hasReflections && formData.每日三省?.理想不一致 && formData.每日三省?.理想的一天) {
    achievements.push({
      icon: '💭',
      title: '深度反省',
      description: '完成了每日三省，深度思考！'
    })
  }
  
  // 行动力成就
  if (hasLife && hasWealth && hasLove && 
      formData.生活?.今日行动 && 
      formData.项目?.今日项目记录 && 
      formData.情感?.今日行动) {
    achievements.push({
      icon: '🚀',
      title: '行动力爆表',
      description: '三大课题都有具体行动！'
    })
  }
  
  // 明日计划成就
  if (formData.生活?.明日一小步 && 
      formData.项目?.明日任务列表 && 
      formData.情感?.明日一小步) {
    achievements.push({
      icon: '📅',
      title: '规划达人',
      description: '三大课题都规划了明日行动！'
    })
  }
  
  // 完整性成就
  if (isNewFormat) {
    const hasAllSections = formData.省身?.总结 && 
                          formData.省事?.总结 && 
                          formData.省人?.总结 &&
                          formData.每日三省?.动机偏差
    if (hasAllSections) {
      achievements.push({
        icon: '📝',
        title: '完整记录',
        description: '所有模块都已填写！'
      })
    }
  } else {
    const hasAllSections = formData.时间花销 && formData.LIFE && formData.AM && formData.LOVE
    if (hasAllSections) {
      achievements.push({
        icon: '📝',
        title: '完整记录',
        description: '所有模块都已填写！'
      })
    }
  }
  
  return achievements
}

// 计算统计数据（新版本：三大课题模型）
export function calculateStats(formData) {
  // 新数据结构：三大课题模型
  const hasOverview = formData.今日概览?.一句话标题
  const hasLife = formData.生活?.主问题
  const hasWealth = formData.项目?.今日关键推进
  const hasLove = formData.情感?.今日焦点问题
  const hasReflections = formData.每日三省?.动机偏差
  
  const energyLevel = formData.今日概览?.能量值 || 0
  const stressLevel = formData.今日概览?.压力值 || 0
  
  // 统计完成的课题数
  const completedTopics = [hasLife, hasWealth, hasLove].filter(Boolean).length
  
  // 统计有明日计划的课题数
  const plannedTopics = [
    formData.生活?.明日一小步,
    formData.项目?.明日任务列表,
    formData.情感?.明日一小步
  ].filter(Boolean).length
  
  // 统计有具体行动的课题数
  const actionTopics = [
    formData.生活?.今日行动,
    formData.项目?.今日项目记录,
    formData.情感?.今日行动
  ].filter(Boolean).length
  
  return {
    完成课题数: `${completedTopics}/3`,
    能量值: `${energyLevel}/5`,
    压力值: `${stressLevel}/5`,
    行动力: `${actionTopics}/3`,
    规划力: `${plannedTopics}/3`,
    深度反省: hasReflections ? '是' : '否'
  }
}

// 生成鼓励文案
export function generateEncouragement(achievements, stats) {
  const encouragements = []
  
  if (achievements.length >= 5) {
    encouragements.push({
      type: 'excellent',
      message: '太棒了！你今天获得了多个成就，继续保持！',
      emoji: '🎉'
    })
  } else if (achievements.length >= 3) {
    encouragements.push({
      type: 'good',
      message: '做得很好！你正在朝着更好的自己前进！',
      emoji: '✨'
    })
  } else {
    encouragements.push({
      type: 'normal',
      message: '记录本身就是一种成长，继续加油！',
      emoji: '💪'
    })
  }
  
  // 根据统计数据添加鼓励
  const completedTopics = parseInt(stats.完成课题数?.split('/')[0] || '0')
  if (completedTopics === 3) {
    encouragements.push({
      type: 'topics',
      message: '三大课题全部完成，太棒了！',
      emoji: '🎯'
    })
  }
  
  const energyLevel = parseInt(stats.能量值?.split('/')[0] || '0')
  if (energyLevel >= 4) {
    encouragements.push({
      type: 'energy',
      message: '能量值很高，状态很好！',
      emoji: '⚡'
    })
  }
  
  const stressLevel = parseInt(stats.压力值?.split('/')[0] || '0')
  if (stressLevel <= 2) {
    encouragements.push({
      type: 'stress',
      message: '压力值很低，保持轻松！',
      emoji: '😌'
    })
  }
  
  return encouragements
}

// 计算连续天数
export function calculateStreak(dates) {
  // 确保 dates 是数组
  if (!dates) return 0
  if (!Array.isArray(dates)) {
    // 如果不是数组，尝试转换
    if (typeof dates === 'object' && dates !== null) {
      dates = Object.keys(dates)
    } else {
      return 0
    }
  }
  if (dates.length === 0) return 0
  
  // 创建新数组并排序，避免修改原数组
  const sortedDates = [...dates].sort().reverse()
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i])
    date.setHours(0, 0, 0, 0)
    
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)
    
    if (date.getTime() === expectedDate.getTime()) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

