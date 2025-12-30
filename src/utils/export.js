// 导出为Markdown格式
export function exportToMarkdown(date, data) {
  let markdown = `时间花销\n`
  markdown += `副业：${data.时间花销.副业}\n`
  markdown += `对象：${data.时间花销.对象}\n`
  markdown += `主职：${data.时间花销.主职}\n`
  markdown += `娱乐+内耗：${data.时间花销.娱乐内耗}\n`
  markdown += `通勤：${data.时间花销.通勤}\n`
  markdown += `睡眠：${data.时间花销.睡眠}\n`
  markdown += `\n${data.时间花销.评分.join('')}\n`
  markdown += `一句话评价：${data.时间花销.评价}\n\n\n\n`

  markdown += `LIFE\n`
  markdown += `坚持天数: ${data.LIFE.坚持天数}\n`
  markdown += `习惯：\n`
  data.LIFE.习惯.forEach(habit => {
    markdown += `${habit}\n`
  })
  markdown += `\n\n`

  if (data.LIFE.内耗 && data.LIFE.内耗.length > 0) {
    data.LIFE.内耗.forEach(neihao => {
      markdown += `内耗\n`
      markdown += `${neihao.标题}\n`
      markdown += `内耗的原因：\n`
      markdown += `${neihao.原因}\n\n`
      markdown += `想开了吗？\n`
      markdown += `${neihao.想开了吗}\n\n`
      markdown += `是否能进行解决？\n`
      markdown += `${neihao.是否能解决}\n\n`
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

  markdown += `浪费时间的点\n`
  markdown += `${data.LIFE.浪费时间点}\n\n\n\n`

  markdown += `反思与感悟\n`
  markdown += `${data.LIFE.反思与感悟}\n\n\n\n`

  markdown += `明日计划\n`
  markdown += `首要任务（MIT-1）：`
  const tasks = data.LIFE.明日计划.首要任务.filter(t => t.trim())
  if (tasks.length > 0) {
    markdown += tasks.join('、')
  }
  markdown += `\n待解决问题/新需求：${data.LIFE.明日计划.待解决问题}\n\n\n\n`

  markdown += `AM\n`
  markdown += `项目进度:   ${data.AM.项目进度}%  \n`
  markdown += `时间追踪:   ${data.AM.时间追踪}h  \n`
  markdown += `效率管理:   ${data.AM.效率管理}h  \n\n\n\n`
  markdown += `产出（记录每日完成的具体功能模块、解决的bug数量）\n`
  markdown += `${data.AM.产出}\n\n\n\n`
  markdown += `反思与感悟  知识库整理 \n`
  markdown += `${data.AM.反思与感悟}\n\n\n\n`
  markdown += `明日计划\n`
  const amTasks = data.AM.明日计划.首要任务.filter(t => t.trim())
  markdown += `首要任务（MIT-1）：`
  if (amTasks.length > 0) {
    markdown += amTasks.join('、')
  }
  markdown += `\n待解决问题/新需求：${data.AM.明日计划.待解决问题}\n\n\n\n`

  markdown += `LOVE\n`
  markdown += `新连接数: ${data.LOVE.新连接数}\n`
  markdown += `有效互动量：${data.LOVE.有效互动量}\n`
  markdown += `主动邀约/接受邀约次数：${data.LOVE.主动邀约次数}\n\n\n\n`
  markdown += `记录（此维度重在过程体验和自我成长，而非结果。记录是为了鼓励自己保持开放心态，避免变成功利性的数字游戏）\n`
  markdown += `${data.LOVE.记录}\n\n\n\n`
  markdown += `反思与感悟 \n`
  markdown += `${data.LOVE.反思与感悟}\n\n\n\n`
  markdown += `明日计划\n`
  const loveTasks = data.LOVE.明日计划.首要任务.filter(t => t.trim())
  markdown += `首要任务（MIT-1）：`
  if (loveTasks.length > 0) {
    markdown += loveTasks.join('、')
  }
  markdown += `\n待解决问题/新需求：${data.LOVE.明日计划.待解决问题}\n`

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

