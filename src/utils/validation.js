// 数据完整性检查工具

// 检查时间花销模块完整性
export function checkTimeSpendComplete(data) {
  if (!data) return { complete: false, missing: ['时间花销数据为空'] }
  
  const total = (data.副业 || 0) + 
                (data.对象 || 0) + 
                (data.主职 || 0) + 
                (data.娱乐内耗 || 0) + 
                (data.通勤 || 0) + 
                (data.睡眠 || 0)
  
  const missing = []
  if (total === 0) {
    missing.push('时间总和为0，请填写时间分配')
  } else if (total < 20) {
    missing.push('时间总和偏少，可能遗漏了部分活动')
  }
  
  if (!data.评价 || data.评价.trim() === '') {
    missing.push('缺少一句话评价')
  }
  
  return {
    complete: missing.length === 0,
    missing,
    totalHours: total
  }
}

// 检查LIFE模块完整性
export function checkLifeComplete(data) {
  if (!data) return { complete: false, missing: ['LIFE数据为空'] }
  
  const missing = []
  
  if (!data.习惯 || data.习惯.length === 0) {
    missing.push('未记录习惯')
  }
  
  if (!data.反思与感悟 || data.反思与感悟.trim() === '') {
    missing.push('缺少反思与感悟')
  }
  
  const hasTasks = data.明日计划?.首要任务?.some(task => task && task.trim() !== '')
  if (!hasTasks) {
    missing.push('未设置明日首要任务')
  }
  
  return {
    complete: missing.length === 0,
    missing
  }
}

// 检查AM模块完整性
export function checkAmComplete(data) {
  if (!data) return { complete: false, missing: ['AM数据为空'] }
  
  const missing = []
  
  if (data.项目进度 === 0) {
    missing.push('项目进度为0')
  }
  
  if (!data.产出 || data.产出.trim() === '') {
    missing.push('未记录工作产出')
  }
  
  if (!data.反思与感悟 || data.反思与感悟.trim() === '') {
    missing.push('缺少反思与感悟')
  }
  
  return {
    complete: missing.length === 0,
    missing
  }
}

// 检查LOVE模块完整性
export function checkLoveComplete(data) {
  if (!data) return { complete: false, missing: ['LOVE数据为空'] }
  
  const missing = []
  
  if (!data.记录 || data.记录.trim() === '') {
    missing.push('未记录情感相关内容')
  }
  
  return {
    complete: missing.length === 0,
    missing
  }
}

// 检查整体完整性
export function checkOverallComplete(formData) {
  const results = {
    时间花销: checkTimeSpendComplete(formData.时间花销),
    LIFE: checkLifeComplete(formData.LIFE),
    AM: checkAmComplete(formData.AM),
    LOVE: checkLoveComplete(formData.LOVE)
  }
  
  const allComplete = Object.values(results).every(r => r.complete)
  const totalMissing = Object.values(results).reduce((sum, r) => sum + r.missing.length, 0)
  
  return {
    allComplete,
    totalMissing,
    results,
    completionRate: Math.round((1 - totalMissing / 10) * 100) // 粗略估算完成度
  }
}

