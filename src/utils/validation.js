// 数据完整性检查工具（新版本：人生主线系统）

// 检查今日概览模块完整性
export function checkOverviewComplete(data) {
  if (!data) return { complete: false, missing: ['今日概览数据为空'] }
  
  const missing = []
  
  if (!data.一句话标题 || data.一句话标题.trim() === '') {
    missing.push('缺少一句话标题')
  }
  
  if (!data.今日最关键一件事 || data.今日最关键一件事.trim() === '') {
    missing.push('缺少今日最关键一件事')
  }
  
  return {
    complete: missing.length === 0,
    missing
  }
}

// 检查今日主线推进模块完整性
export function checkThreadProgressComplete(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { complete: false, missing: ['请至少选择一条主线并填写推进记录'] }
  }
  
  const missing = []
  
  data.forEach((progress, index) => {
    const threadLabel = `主线${index + 1}`
    
    if (!progress.主线ID) {
      missing.push(`${threadLabel}：缺少主线ID`)
    }
    
    if (!progress.今日关键行动 || progress.今日关键行动.trim() === '') {
      missing.push(`${threadLabel}：缺少今日关键行动`)
    }
    
    if (!progress.行动记录 || progress.行动记录.trim() === '') {
      missing.push(`${threadLabel}：缺少行动记录`)
    }
    
    if (progress.推进效果 === undefined || progress.推进效果 === null) {
      missing.push(`${threadLabel}：缺少推进效果评分`)
    }
  })
  
  return {
    complete: missing.length === 0,
    missing
  }
}

// 检查决策与内耗模块完整性（可选，但如果有决策，则检查必填字段）
export function checkDecisionComplete(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { complete: true, missing: [] } // 决策是可选的
  }
  
  const missing = []
  
  data.forEach((decision, index) => {
    if (!decision.决策主题 || decision.决策主题.trim() === '') {
      missing.push(`决策${index + 1}：缺少决策主题`)
    }
    if (!decision.带来什么 || decision.带来什么.trim() === '') {
      missing.push(`决策${index + 1}：缺少"带来什么"`)
    }
    if (!decision.失去什么 || decision.失去什么.trim() === '') {
      missing.push(`决策${index + 1}：缺少"失去什么"`)
    }
    if (!decision.真实痛点 || decision.真实痛点.trim() === '') {
      missing.push(`决策${index + 1}：缺少"真实痛点"`)
    }
    if (!decision.替代方案 || decision.替代方案.trim() === '') {
      missing.push(`决策${index + 1}：缺少"替代方案"`)
    }
    // 如果已做出决策，则决策结论和下一步行动是必填的
    if (decision.是否解决 && (!decision.决策结论 || decision.决策结论.trim() === '')) {
      missing.push(`决策${index + 1}：已标记为已决策，但缺少决策结论`)
    }
  })
  
  return {
    complete: missing.length === 0,
    missing
  }
}

// 检查问题库模块完整性（可选）
export function checkProblemComplete(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { complete: true, missing: [] } // 问题库是可选的
  }
  
  const missing = []
  
  data.forEach((problem, index) => {
    if (!problem.问题描述 || problem.问题描述.trim() === '') {
      missing.push(`问题${index + 1}：缺少问题描述`)
    }
    if (!problem.问题分类 || problem.问题分类.trim() === '') {
      missing.push(`问题${index + 1}：缺少问题分类`)
    }
    if (!problem.优先级 || problem.优先级.trim() === '') {
      missing.push(`问题${index + 1}：缺少优先级`)
    }
  })
  
  return {
    complete: missing.length === 0,
    missing
  }
}

// 检查习惯追踪模块完整性（可选）
export function checkHabitComplete(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { complete: true, missing: [] } // 习惯追踪是可选的
  }
  
  const missing = []
  
  data.forEach((habit, index) => {
    if (!habit.习惯名称 || habit.习惯名称.trim() === '') {
      missing.push(`习惯${index + 1}：缺少习惯名称`)
    }
  })
  
  return {
    complete: missing.length === 0,
    missing
  }
}

// 检查每日三省模块完整性
export function checkReflectionsComplete(data) {
  if (!data) return { complete: false, missing: ['每日三省数据为空'] }
  
  const missing = []
  
  if (!data.动机偏差 || data.动机偏差.trim() === '') {
    missing.push('缺少"动机偏差"的反思')
  }
  
  if (!data.理想不一致 || data.理想不一致.trim() === '') {
    missing.push('缺少"理想不一致"的反思')
  }
  
  if (!data.主线对齐 || data.主线对齐.trim() === '') {
    missing.push('缺少"主线对齐"的反思')
  }
  
  return {
    complete: missing.length === 0,
    missing
  }
}

// 检查整体完整性
export function checkOverallComplete(formData) {
  const results = {
    今日概览: checkOverviewComplete(formData.今日概览),
    今日主线推进: checkThreadProgressComplete(formData.今日主线推进),
    决策与内耗: checkDecisionComplete(formData.决策与内耗),
    问题库: checkProblemComplete(formData.问题库),
    习惯追踪: checkHabitComplete(formData.习惯追踪),
    每日三省: checkReflectionsComplete(formData.每日三省)
  }
  
  const allComplete = Object.values(results).every(r => r.complete)
  const totalMissing = Object.values(results).reduce((sum, r) => sum + r.missing.length, 0)
  
  // 估算完成度（核心必填项约10个）
  const coreRequired = [
    results.今日概览,
    results.今日主线推进,
    results.每日三省
  ]
  const coreMissing = coreRequired.reduce((sum, r) => sum + r.missing.length, 0)
  const completionRate = Math.round((1 - coreMissing / 10) * 100)
  
  return {
    allComplete,
    totalMissing,
    results,
    completionRate
  }
}
