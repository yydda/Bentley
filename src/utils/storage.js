// 数据存储工具 - 仅使用Firebase

import { getDiaryDataFromFirebase, saveDiaryDataToFirebase, getAllDatesFromFirebase } from './firebaseStorage'
import { waitForAuth } from './firebaseAuth'

// 获取今天的日期字符串 YYYY-MM-DD
export function getTodayDate() {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// 获取指定日期的日记数据
export async function getDiaryData(date) {
  // 等待认证状态初始化
  const user = await waitForAuth()
  if (!user) {
    // 如果未登录，返回默认数据
    return getDefaultData()
  }
  
  const data = await getDiaryDataFromFirebase(user.uid, date)
  return data || getDefaultData()
}

// 保存日记数据
export async function saveDiaryData(date, data) {
  // 等待认证状态初始化
  const user = await waitForAuth()
  if (!user) {
    throw new Error('请先登录以保存数据')
  }
  
  await saveDiaryDataToFirebase(user.uid, date, data)
}

// 获取所有日期列表
export async function getAllDates() {
  // 等待认证状态初始化
  const user = await waitForAuth()
  if (!user) {
    return []
  }
  
  return await getAllDatesFromFirebase(user.uid)
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
