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

// 检查明日计划模块完整性
export function checkTomorrowPlanComplete(data) {
  if (!data) return { complete: false, missing: ['明日计划数据为空'] }
  
  const missing = []
  
  // 承诺是必填的
  if (!data.承诺 || data.承诺.trim() === '') {
    missing.push('缺少"明日承诺"')
  }
  
  // 如果有计划列表，检查每个计划的必填字段
  if (data.计划列表 && Array.isArray(data.计划列表) && data.计划列表.length > 0) {
    data.计划列表.forEach((plan, index) => {
      if (!plan.任务内容 || plan.任务内容.trim() === '') {
        missing.push(`计划${index + 1}：缺少任务内容`)
      }
    })
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
    明日计划: checkTomorrowPlanComplete(formData.明日计划)
  }
  
  const allComplete = Object.values(results).every(r => r.complete)
  const totalMissing = Object.values(results).reduce((sum, r) => sum + r.missing.length, 0)
  
  // 估算完成度（核心必填项约8个）
  const coreRequired = [
    results.今日概览,
    results.今日主线推进,
    results.明日计划
  ]
  const coreMissing = coreRequired.reduce((sum, r) => sum + r.missing.length, 0)
  const completionRate = Math.round((1 - coreMissing / 8) * 100)
  
  return {
    allComplete,
    totalMissing,
    results,
    completionRate
  }
}
