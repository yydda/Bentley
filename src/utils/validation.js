// 数据完整性检查工具（新版本：三大课题模型）

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

// 检查生活模块完整性
export function checkLifeComplete(data) {
  if (!data) return { complete: false, missing: ['生活数据为空'] }
  
  const missing = []
  
  if (!data.主问题 || data.主问题.trim() === '') {
    missing.push('缺少生活主问题')
  }
  
  if (!data.今日行动 || data.今日行动.trim() === '') {
    missing.push('缺少今日生活行动')
  }
  
  if (!data.事件记录 || data.事件记录.trim() === '') {
    missing.push('缺少生活事件记录')
  }
  
  if (!data.反思_是否推进 || data.反思_是否推进.trim() === '') {
    missing.push('缺少"是否推进了生活课题"的反思')
  }
  
  if (!data.反思_今天最消耗的点 || data.反思_今天最消耗的点.trim() === '') {
    missing.push('缺少"今天最消耗的点"的反思')
  }
  
  if (!data.反思_明天如何调整 || data.反思_明天如何调整.trim() === '') {
    missing.push('缺少"明天如何调整"的反思')
  }
  
  if (!data.明日一小步 || data.明日一小步.trim() === '') {
    missing.push('缺少明日生活一小步')
  }
  
  return {
    complete: missing.length === 0,
    missing
  }
}

// 检查项目模块完整性
export function checkWealthComplete(data) {
  if (!data) return { complete: false, missing: ['项目数据为空'] }
  
  const missing = []
  
  if (!data.今日关键推进 || data.今日关键推进.trim() === '') {
    missing.push('缺少今日关键推进')
  }
  
  if (!data.今日项目记录 || data.今日项目记录.trim() === '') {
    missing.push('缺少今日项目工作清单')
  }
  
  if (data.项目进度感 === undefined || data.项目进度感 === null) {
    missing.push('缺少项目进度感')
  }
  
  if (!data.最有效动作 || data.最有效动作.trim() === '') {
    missing.push('缺少"最有效动作"的记录')
  }
  
  if (!data.今日浪费 || data.今日浪费.trim() === '') {
    missing.push('缺少"今日浪费"的记录')
  }
  
  if (!data.卡点与疑问 || data.卡点与疑问.trim() === '') {
    missing.push('缺少"卡点与疑问"的记录')
  }
  
  if (!data.明日任务列表 || data.明日任务列表.trim() === '') {
    missing.push('缺少明日项目任务列表')
  }
  
  return {
    complete: missing.length === 0,
    missing
  }
}

// 检查情感模块完整性
export function checkLoveComplete(data) {
  if (!data) return { complete: false, missing: ['情感数据为空'] }
  
  const missing = []
  
  if (!data.今日焦点问题 || data.今日焦点问题.trim() === '') {
    missing.push('缺少今日情感焦点问题')
  }
  
  if (!data.今日行动 || data.今日行动.trim() === '') {
    missing.push('缺少今日情感行动')
  }
  
  if (!data.事件记录 || data.事件记录.trim() === '') {
    missing.push('缺少情感事件记录')
  }
  
  if (!data.反思_违背理想自我的瞬间 || data.反思_违背理想自我的瞬间.trim() === '') {
    missing.push('缺少"违背理想自我的瞬间"的反思')
  }
  
  if (!data.反思_对自己说实话 || data.反思_对自己说实话.trim() === '') {
    missing.push('缺少"对自己说实话"的反思')
  }
  
  if (!data.反思_下次可以尝试的小动作 || data.反思_下次可以尝试的小动作.trim() === '') {
    missing.push('缺少"下次可以尝试的小动作"的反思')
  }
  
  if (!data.明日一小步 || data.明日一小步.trim() === '') {
    missing.push('缺少明日情感一小步')
  }
  
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
  
  if (!data.理想的一天 || data.理想的一天.trim() === '') {
    missing.push('缺少"理想的一天"的反思')
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
    生活: checkLifeComplete(formData.生活),
    项目: checkWealthComplete(formData.项目),
    情感: checkLoveComplete(formData.情感),
    每日三省: checkReflectionsComplete(formData.每日三省)
  }
  
  const allComplete = Object.values(results).every(r => r.complete)
  const totalMissing = Object.values(results).reduce((sum, r) => sum + r.missing.length, 0)
  
  return {
    allComplete,
    totalMissing,
    results,
    completionRate: Math.round((1 - totalMissing / 20) * 100) // 粗略估算完成度（约20个必填项）
  }
}

