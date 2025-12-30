// 游戏化系统工具

// 计算成就
export function calculateAchievements(formData, date) {
  const achievements = []
  
  // 时间花销相关成就
  const totalHours = (formData.时间花销?.副业 || 0) + 
                     (formData.时间花销?.对象 || 0) + 
                     (formData.时间花销?.主职 || 0) + 
                     (formData.时间花销?.娱乐内耗 || 0) + 
                     (formData.时间花销?.通勤 || 0) + 
                     (formData.时间花销?.睡眠 || 0)
  
  if (totalHours >= 22 && totalHours <= 26) {
    achievements.push({
      icon: '⏰',
      title: '时间管理大师',
      description: '时间分配合理，完美的一天！'
    })
  }
  
  const happyCount = formData.时间花销?.评分?.filter(e => e === '💓').length || 0
  if (happyCount >= 4) {
    achievements.push({
      icon: '😊',
      title: '快乐满满',
      description: '今天有4个以上的满意评分！'
    })
  }
  
  // LIFE相关成就
  if (formData.LIFE?.习惯?.length >= 5) {
    achievements.push({
      icon: '🌟',
      title: '习惯达人',
      description: '记录了5个以上的习惯！'
    })
  }
  
  if (formData.LIFE?.坚持天数 >= 7) {
    achievements.push({
      icon: '🔥',
      title: '坚持一周',
      description: '连续坚持7天了，太棒了！'
    })
  }
  
  // AM相关成就
  if (formData.AM?.项目进度 >= 100) {
    achievements.push({
      icon: '🎯',
      title: '项目完成',
      description: '项目进度达到100%！'
    })
  }
  
  if (formData.AM?.时间追踪 >= 8) {
    achievements.push({
      icon: '💪',
      title: '高效工作',
      description: '工作时间超过8小时！'
    })
  }
  
  // LOVE相关成就
  if (formData.LOVE?.新连接数 > 0) {
    achievements.push({
      icon: '🤝',
      title: '社交达人',
      description: '今天建立了新的连接！'
    })
  }
  
  // 完整性成就
  const hasAllSections = formData.时间花销 && formData.LIFE && formData.AM && formData.LOVE
  if (hasAllSections) {
    achievements.push({
      icon: '📝',
      title: '完整记录',
      description: '所有模块都已填写！'
    })
  }
  
  return achievements
}

// 计算统计数据
export function calculateStats(formData) {
  const totalHours = (formData.时间花销?.副业 || 0) + 
                     (formData.时间花销?.对象 || 0) + 
                     (formData.时间花销?.主职 || 0) + 
                     (formData.时间花销?.娱乐内耗 || 0) + 
                     (formData.时间花销?.通勤 || 0) + 
                     (formData.时间花销?.睡眠 || 0)
  
  const happyCount = formData.时间花销?.评分?.filter(e => e === '💓').length || 0
  const habitCount = formData.LIFE?.习惯?.length || 0
  const neihaoCount = formData.LIFE?.内耗?.length || 0
  
  return {
    时间总和: totalHours.toFixed(1),
    满意度: `${happyCount}/5`,
    习惯数: habitCount,
    内耗数: neihaoCount,
    项目进度: formData.AM?.项目进度 || 0,
    工作小时: formData.AM?.时间追踪 || 0,
    新连接: formData.LOVE?.新连接数 || 0
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
  if (parseFloat(stats.时间总和) >= 22 && parseFloat(stats.时间总和) <= 26) {
    encouragements.push({
      type: 'time',
      message: '时间分配很合理，继续保持！',
      emoji: '⏰'
    })
  }
  
  if (parseInt(stats.满意度.split('/')[0]) >= 3) {
    encouragements.push({
      type: 'happy',
      message: '看起来今天过得很开心呢！',
      emoji: '😊'
    })
  }
  
  return encouragements
}

// 计算连续天数
export function calculateStreak(dates) {
  if (!dates || dates.length === 0) return 0
  
  const sortedDates = dates.sort().reverse()
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

