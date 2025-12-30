// 日期工具函数

// 获取今天的日期字符串 YYYY-MM-DD
export function getTodayDate() {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// 格式化日期显示
export function formatDate(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (dateStr === getTodayDate()) {
    return `今天 (${dateStr})`
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 (${dateStr})`
  } else {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${dateStr} ${weekdays[date.getDay()]}`
  }
}

