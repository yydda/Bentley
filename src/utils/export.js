// 导出为Markdown格式（新版本：人生主线系统）
export function exportToMarkdown(date, data) {
  let markdown = `# 日记 - ${date}\n\n`
  
  // 第一步：今日概览
  markdown += `## 第一步：今日概览\n\n`
  const overview = data.今日概览 || {}
  if (overview.一句话标题) markdown += `### 一句话标题\n${overview.一句话标题}\n\n`
  markdown += `- 能量值：${overview.能量值 || 3}/5\n`
  markdown += `- 压力值：${overview.压力值 || 3}/5\n`
  if (overview.今日最关键一件事) {
    markdown += `- 今日最关键一件事：${overview.今日最关键一件事}\n\n`
  }
  
  // 第二步：今日主线推进
  const threadProgressList = data.今日主线推进 || []
  if (threadProgressList.length > 0) {
    markdown += `## 第二步：今日主线推进\n\n`
    threadProgressList.forEach((progress, index) => {
      markdown += `### 主线 ${index + 1}\n\n`
      if (progress.今日关键行动) {
        markdown += `**今日关键行动：**\n${progress.今日关键行动}\n\n`
      }
      if (progress.行动记录) {
        markdown += `**行动记录：**\n${progress.行动记录}\n\n`
      }
      if (progress.推进效果 !== undefined) {
        markdown += `**推进效果：** ${progress.推进效果}/5\n\n`
      }
    })
  }
  
  // 第三步：决策与内耗
  const decisions = data.决策与内耗 || []
  if (decisions.length > 0) {
    markdown += `## 第三步：决策与内耗\n\n`
    decisions.forEach((decision, index) => {
      markdown += `### 决策 ${index + 1}：${decision.决策主题 || '未命名决策'}\n\n`
      if (decision.带来什么) markdown += `**带来什么：**\n${decision.带来什么}\n\n`
      if (decision.失去什么) markdown += `**失去什么：**\n${decision.失去什么}\n\n`
      if (decision.真实痛点) markdown += `**真实痛点：**\n${decision.真实痛点}\n\n`
      if (decision.替代方案) markdown += `**替代方案：**\n${decision.替代方案}\n\n`
      if (decision.是否解决) {
        markdown += `**状态：** 已做出决策\n\n`
        if (decision.决策结论) markdown += `**决策结论：**\n${decision.决策结论}\n\n`
        if (decision.下一步行动) markdown += `**下一步行动：**\n${decision.下一步行动}\n\n`
      } else {
        markdown += `**状态：** 思考中\n\n`
      }
    })
  }
  
  // 第四步：问题库
  const problems = data.问题库 || []
  if (problems.length > 0) {
    markdown += `## 第四步：问题库\n\n`
    problems.forEach((problem, index) => {
      markdown += `### 问题 ${index + 1}\n\n`
      markdown += `- **优先级：** ${problem.优先级 || '未设置'}\n`
      markdown += `- **分类：** ${problem.问题分类 || '未分类'}\n`
      markdown += `- **状态：** ${problem.是否解决 ? '已解决' : '未解决'}\n`
      if (problem.问题描述) {
        markdown += `- **问题描述：**\n${problem.问题描述}\n\n`
      }
    })
  }
  
  // 第五步：习惯追踪
  const habits = data.习惯追踪 || []
  if (habits.length > 0) {
    markdown += `## 第五步：习惯追踪\n\n`
    habits.forEach((habit, index) => {
      markdown += `### 习惯 ${index + 1}：${habit.习惯名称 || '未命名习惯'}\n\n`
      markdown += `- **执行状态：** ${habit.是否执行 ? '已执行' : '未执行'}\n`
      if (habit.连续天数 > 0) {
        markdown += `- **连续天数：** ${habit.连续天数}天 🔥\n`
      }
      if (habit.关联主线) {
        markdown += `- **关联主线：** ${habit.关联主线}\n`
      }
      if (habit.执行感受) {
        markdown += `- **执行感受：**\n${habit.执行感受}\n\n`
      }
    })
  }
  
  // 第六步：每日三省
  markdown += `## 第六步：每日三省\n\n`
  const reflections = data.每日三省 || {}
  if (reflections.动机偏差) {
    markdown += `### 第一问：动机偏差\n${reflections.动机偏差}\n\n`
  }
  if (reflections.理想不一致) {
    markdown += `### 第二问：理想不一致\n${reflections.理想不一致}\n\n`
  }
  if (reflections.主线对齐) {
    markdown += `### 第三问：主线对齐\n${reflections.主线对齐}\n\n`
  }
  
  return markdown
}

// 下载文件
export function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
