const STORAGE_KEY = 'diary_data'

// 获取今天的日期字符串 YYYY-MM-DD
export function getTodayDate() {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// 获取所有日记数据
export function getAllDiaryData() {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : {}
}

// 获取指定日期的日记数据
export function getDiaryData(date) {
  const allData = getAllDiaryData()
  return allData[date] || getDefaultData()
}

// 保存日记数据
export function saveDiaryData(date, data) {
  const allData = getAllDiaryData()
  allData[date] = data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allData))
}

// 获取默认数据结构
export function getDefaultData() {
  return {
    时间花销: {
      副业: 0,
      对象: 0,
      主职: 0,
      娱乐内耗: 0,
      通勤: 0,
      睡眠: 0,
      评分: ['💔', '💔', '💔', '💔', '💔'],
      评价: ''
    },
    LIFE: {
      坚持天数: 0,
      习惯: [],
      内耗: [],
      浪费时间点: '',
      反思与感悟: '',
      明日计划: {
        首要任务: ['', '', ''],
        待解决问题: ''
      }
    },
    AM: {
      项目进度: 0,
      时间追踪: 0,
      效率管理: 0,
      产出: '',
      反思与感悟: '',
      明日计划: {
        首要任务: ['', '', ''],
        待解决问题: ''
      }
    },
    LOVE: {
      新连接数: 0,
      有效互动量: 0,
      主动邀约次数: 0,
      记录: '',
      反思与感悟: '',
      明日计划: {
        首要任务: ['', '', ''],
        待解决问题: ''
      }
    }
  }
}

// 获取所有日期列表
export function getAllDates() {
  return Object.keys(getAllDiaryData()).sort().reverse()
}

