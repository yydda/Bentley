// 导出为Markdown格式（新版本：三大课题模型）
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
  
  // 第二步：生活
  markdown += `## 第二步：生活（Life）\n\n`
  const life = data.生活 || {}
  if (life.主问题) markdown += `### 生活主问题\n${life.主问题}\n\n`
  if (life.今日行动) markdown += `### 今日生活行动\n${life.今日行动}\n\n`
  if (life.事件记录) {
    markdown += `### 生活事件记录\n${life.事件记录}\n\n`
  }
  if (life.反思_是否推进) {
    markdown += `### 是否推进了生活课题？\n${life.反思_是否推进}`
    if (life.反思_是否推进_说明) markdown += ` - ${life.反思_是否推进_说明}`
    markdown += `\n\n`
  }
  if (life.反思_今天最消耗的点) {
    markdown += `### 今天最消耗我的一个点\n${life.反思_今天最消耗的点}\n\n`
  }
  if (life.反思_明天如何调整) {
    markdown += `### 如果明天重来，如何调整？\n${life.反思_明天如何调整}\n\n`
  }
  if (life.明日一小步) {
    markdown += `### 明日生活一小步\n${life.明日一小步}\n\n`
  }
  
  // 第三步：项目
  markdown += `## 第三步：项目（Project）\n\n`
  const project = data.项目 || {}
  if (project.项目名称) markdown += `### 当前主项目\n${project.项目名称}\n\n`
  if (project.项目阶段) markdown += `### 项目阶段\n${project.项目阶段}\n\n`
  if (project.今日关键推进) markdown += `### 今日关键推进（一句话）\n${project.今日关键推进}\n\n`
  if (project.今日项目记录) {
    markdown += `### 今日项目工作清单\n${project.今日项目记录}\n\n`
  }
  if (project.今日项目产出) {
    markdown += `### 今日项目产出（可选）\n${project.今日项目产出}\n\n`
  }
  if (project.项目进度感 !== undefined) {
    markdown += `### 项目进度感\n${project.项目进度感}%\n\n`
  }
  if (project.最有效动作) {
    markdown += `### 今天最有效的一个动作\n${project.最有效动作}\n\n`
  }
  if (project.今日浪费) {
    markdown += `### 今天最没必要的一件事\n${project.今日浪费}\n\n`
  }
  if (project.卡点与疑问) {
    markdown += `### 卡点与未解决问题\n${project.卡点与疑问}\n\n`
  }
  if (project.明日任务列表) {
    markdown += `### 明日项目任务（1-3个）\n${project.明日任务列表}\n\n`
  }
  if (project.明日优先级理由) {
    markdown += `### 明日优先级说明（可选）\n${project.明日优先级理由}\n\n`
  }
  if (project.明日风险与准备) {
    markdown += `### 明日风险与对策（可选）\n${project.明日风险与准备}\n\n`
  }
  
  // 第四步：情感
  markdown += `## 第四步：情感（Love）\n\n`
  const love = data.情感 || {}
  if (love.主课题) markdown += `### 情感主课题（长期）\n${love.主课题}\n\n`
  if (love.今日焦点问题) markdown += `### 今日情感焦点问题\n${love.今日焦点问题}\n\n`
  if (love.今日行动) markdown += `### 今日情感行动\n${love.今日行动}\n\n`
  if (love.事件记录) {
    markdown += `### 情感事件记录\n${love.事件记录}\n\n`
  }
  if (love.反思_违背理想自我的瞬间) {
    markdown += `### 今天在哪个瞬间违背了理想中的自己？\n${love.反思_违背理想自我的瞬间}\n\n`
  }
  if (love.反思_对自己说实话) {
    markdown += `### 用一句话对自己说实话\n${love.反思_对自己说实话}\n\n`
  }
  if (love.反思_下次可以尝试的小动作) {
    markdown += `### 下一次类似场景可以尝试的小动作\n${love.反思_下次可以尝试的小动作}\n\n`
  }
  if (love.明日一小步) {
    markdown += `### 明日情感一小步\n${love.明日一小步}\n\n`
  }
  
  // 第五步：每日三省
  markdown += `## 第五步：每日三省\n\n`
  const reflections = data.每日三省 || {}
  if (reflections.动机偏差) {
    markdown += `### 第一问：动机偏差\n${reflections.动机偏差}\n\n`
  }
  if (reflections.理想不一致) {
    markdown += `### 第二问：理想不一致\n${reflections.理想不一致}\n\n`
  }
  if (reflections.理想的一天) {
    markdown += `### 第三问：理想的一天\n${reflections.理想的一天}\n\n`
  }
  
  return markdown
}

// 导出旧格式数据（兼容）
function exportOldFormat(date, data) {
  let markdown = `# 日记 - ${date}\n\n`
  markdown += `## 时间花销\n`
  markdown += `副业：${data.时间花销?.副业 || 0}\n`
  markdown += `对象：${data.时间花销?.对象 || 0}\n`
  markdown += `主职：${data.时间花销?.主职 || 0}\n`
  markdown += `娱乐+内耗：${data.时间花销?.娱乐内耗 || 0}\n`
  markdown += `通勤：${data.时间花销?.通勤 || 0}\n`
  markdown += `睡眠：${data.时间花销?.睡眠 || 0}\n`
  if (data.时间花销?.评分) {
    markdown += `\n${data.时间花销.评分.join('')}\n`
  }
  if (data.时间花销?.评价) {
    markdown += `一句话评价：${data.时间花销.评价}\n`
  }
  markdown += `\n\n`

  markdown += `## LIFE\n`
  markdown += `坚持天数: ${data.LIFE?.坚持天数 || 0}\n`
  if (data.LIFE?.习惯 && data.LIFE.习惯.length > 0) {
    markdown += `习惯：\n`
    data.LIFE.习惯.forEach(habit => {
      markdown += `${habit}\n`
    })
    markdown += `\n\n`
  }

  if (data.LIFE?.内耗 && data.LIFE.内耗.length > 0) {
    data.LIFE.内耗.forEach(neihao => {
      markdown += `### 内耗\n`
      if (neihao.标题) markdown += `${neihao.标题}\n`
      if (neihao.原因) {
        markdown += `内耗的原因：\n`
        markdown += `${neihao.原因}\n\n`
      }
      if (neihao.想开了吗) {
        markdown += `想开了吗？\n`
        markdown += `${neihao.想开了吗}\n\n`
      }
      if (neihao.是否能解决) {
        markdown += `是否能进行解决？\n`
        markdown += `${neihao.是否能解决}\n\n`
      }
      if (neihao.权衡) {
        markdown += `权衡：\n`
        markdown += `${neihao.权衡}\n\n`
      }
      if (neihao.结论) {
        markdown += `结论：\n`
        markdown += `${neihao.结论}\n\n`
      }
      markdown += `\n\n`
    })
  }

  if (data.LIFE?.浪费时间点) {
    markdown += `## 浪费时间的点\n`
    markdown += `${data.LIFE.浪费时间点}\n\n\n`
  }

  if (data.LIFE?.反思与感悟) {
    markdown += `## 反思与感悟\n`
    markdown += `${data.LIFE.反思与感悟}\n\n\n`
  }

  if (data.LIFE?.明日计划) {
    markdown += `## 明日计划\n`
    const tasks = data.LIFE.明日计划.首要任务?.filter(t => t.trim()) || []
    markdown += `首要任务（MIT-1）：`
    if (tasks.length > 0) {
      markdown += tasks.join('、')
    }
    markdown += `\n`
    if (data.LIFE.明日计划.待解决问题) {
      markdown += `待解决问题/新需求：${data.LIFE.明日计划.待解决问题}\n`
    }
    markdown += `\n\n`
  }

  markdown += `## AM\n`
  markdown += `项目进度:   ${data.AM?.项目进度 || 0}%  \n`
  markdown += `时间追踪:   ${data.AM?.时间追踪 || 0}h  \n`
  markdown += `效率管理:   ${data.AM?.效率管理 || 0}h  \n\n\n`
  if (data.AM?.产出) {
    markdown += `## 产出（记录每日完成的具体功能模块、解决的bug数量）\n`
    markdown += `${data.AM.产出}\n\n\n`
  }
  if (data.AM?.反思与感悟) {
    markdown += `## 反思与感悟  知识库整理 \n`
    markdown += `${data.AM.反思与感悟}\n\n\n`
  }
  if (data.AM?.明日计划) {
    markdown += `## 明日计划\n`
    const amTasks = data.AM.明日计划.首要任务?.filter(t => t.trim()) || []
    markdown += `首要任务（MIT-1）：`
    if (amTasks.length > 0) {
      markdown += amTasks.join('、')
    }
    markdown += `\n`
    if (data.AM.明日计划.待解决问题) {
      markdown += `待解决问题/新需求：${data.AM.明日计划.待解决问题}\n`
    }
    markdown += `\n\n`
  }

  markdown += `## LOVE\n`
  markdown += `新连接数: ${data.LOVE?.新连接数 || 0}\n`
  markdown += `有效互动量：${data.LOVE?.有效互动量 || 0}\n`
  markdown += `主动邀约/接受邀约次数：${data.LOVE?.主动邀约次数 || 0}\n\n\n`
  if (data.LOVE?.记录) {
    markdown += `## 记录（此维度重在过程体验和自我成长，而非结果。记录是为了鼓励自己保持开放心态，避免变成功利性的数字游戏）\n`
    markdown += `${data.LOVE.记录}\n\n\n`
  }
  if (data.LOVE?.反思与感悟) {
    markdown += `## 反思与感悟 \n`
    markdown += `${data.LOVE.反思与感悟}\n\n\n`
  }
  if (data.LOVE?.明日计划) {
    markdown += `## 明日计划\n`
    const loveTasks = data.LOVE.明日计划.首要任务?.filter(t => t.trim()) || []
    markdown += `首要任务（MIT-1）：`
    if (loveTasks.length > 0) {
      markdown += loveTasks.join('、')
    }
    markdown += `\n`
    if (data.LOVE.明日计划.待解决问题) {
      markdown += `待解决问题/新需求：${data.LOVE.明日计划.待解决问题}\n`
    }
  }

  return markdown
}

// 下载文件
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

