// 数据存储工具 - 仅使用Firebase

import { getDiaryDataFromFirebase, saveDiaryDataToFirebase, getAllDatesFromFirebase } from './firebaseStorage'
import { waitForAuth } from './firebaseAuth'
import { migrateOldDataToNew, needsMigration } from './migration'

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
  if (!data) {
    return getDefaultData()
  }
  
  // 检查是否需要迁移
  if (needsMigration(data)) {
    const migratedData = migrateOldDataToNew(data)
    // 自动保存迁移后的数据
    try {
      await saveDiaryDataToFirebase(user.uid, date, migratedData)
    } catch (error) {
      console.warn('迁移数据后保存失败:', error)
    }
    return migratedData
  }
  
  return data
}

// 保存日记数据
export async function saveDiaryData(date, data) {
  if (!date) {
    throw new Error('日期不能为空')
  }
  
  if (!data) {
    throw new Error('数据不能为空')
  }
  
  // 等待认证状态初始化
  const user = await waitForAuth()
  if (!user) {
    throw new Error('请先登录以保存数据')
  }
  
  console.log('保存数据到Firebase:', {
    userId: user.uid,
    date: date,
    dataKeys: Object.keys(data)
  })
  
  try {
    await saveDiaryDataToFirebase(user.uid, date, data)
    console.log('数据保存到Firebase成功')
  } catch (error) {
    console.error('保存到Firebase失败:', error)
    throw error
  }
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

// 获取默认数据结构（新版本：三大人生课题模型）
export function getDefaultData() {
  return {
    // 第一步：今日概览
    今日概览: {
      一句话标题: '', // 必填
      能量值: 3, // 1-5，默认3
      压力值: 3, // 1-5，默认3
      今日最关键一件事: '' // 必填
    },
    
    // 第二步：生活（Life）
    生活: {
      主问题: '', // 必填：今天想思考/推进的生活课题
      今日行动: '', // 必填：具体、可执行的小行动
      事件记录: '', // 必填：200-300字，只写事实
      反思_是否推进: '', // 必填：是否推进了生活课题
      反思_今天最消耗的点: '', // 必填：今天最消耗我的一个点
      反思_明天如何调整: '', // 必填：如果明天重来，如何调整
      明日一小步: '' // 必填：明日生活承诺
    },
    
    // 第三步：项目（Project）
    项目: {
      项目名称: '', // 当前主项目（可选，可复用）
      项目阶段: '', // 项目阶段：探索期/MVP/打磨期/上线后迭代（可选）
      今日关键推进: '', // 必填：今日最关键推进点（一句话）
      今日项目记录: '', // 必填：今日项目工作清单（事实）
      今日项目产出: '', // 可选：今日可见产出
      项目进度感: 0, // 0-100%，项目进度感
      最有效动作: '', // 必填：今天最有效的一个动作
      今日浪费: '', // 必填：今天最没必要的一件事
      卡点与疑问: '', // 必填：卡点与未解决问题
      明日任务列表: '', // 必填：明日1-3个项目任务
      明日优先级理由: '', // 可选：明日优先级说明
      明日风险与准备: '' // 可选：明日风险与对策
    },
    
    // 第四步：情感（Love）
    情感: {
      主课题: '', // 当前主课题（可选，可复用）
      今日焦点问题: '', // 必填：今天的情感焦点问题
      今日行动: '', // 必填：今日情感行动
      事件记录: '', // 必填：200-300字，事实记录
      反思_违背理想自我的瞬间: '', // 必填：今天在哪个瞬间违背了理想中的自己
      反思_对自己说实话: '', // 必填：用一句话对自己说实话
      反思_下次可以尝试的小动作: '', // 必填：下一次类似场景可以尝试的小动作
      明日一小步: '' // 必填：明日情感承诺
    },
    
    // 第五步：每日三省（总反省）
    每日三省: {
      动机偏差: '', // 必填：今天在动机上有没有为了逃避或迎合而做的选择
      理想不一致: '', // 必填：今天有哪个瞬间和理想状态最不一致
      理想的一天: '' // 必填：如果明天只允许围绕三大课题各做一件小事，会选什么
    }
  }
}
