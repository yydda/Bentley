// 数据存储工具 - 仅使用Firebase

import { getDiaryDataFromFirebase, saveDiaryDataToFirebase, getAllDatesFromFirebase, getLifeThreadsFromFirebase, saveLifeThreadsToFirebase } from './firebaseStorage'
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

// 获取人生主线
export async function getLifeThreads() {
  const user = await waitForAuth()
  if (!user) {
    return []
  }
  
  return await getLifeThreadsFromFirebase(user.uid)
}

// 保存人生主线
export async function saveLifeThreads(threads) {
  const user = await waitForAuth()
  if (!user) {
    throw new Error('请先登录以保存数据')
  }
  
  if (!Array.isArray(threads)) {
    throw new Error('主线数据必须是数组')
  }
  
  await saveLifeThreadsToFirebase(user.uid, threads)
}

// 获取默认主线模板
export function getDefaultLifeThreads() {
  return [
    {
      主线ID: 'thread_1',
      主线名称: '事业突破',
      当前阶段: '探索期',
      当前关键问题: '',
      三个月目标: '',
      创建时间: new Date().toISOString(),
      最后更新时间: new Date().toISOString(),
      是否激活: true
    },
    {
      主线ID: 'thread_2',
      主线名称: '关系建立',
      当前阶段: '探索期',
      当前关键问题: '',
      三个月目标: '',
      创建时间: new Date().toISOString(),
      最后更新时间: new Date().toISOString(),
      是否激活: true
    },
    {
      主线ID: 'thread_3',
      主线名称: '健康管理',
      当前阶段: '探索期',
      当前关键问题: '',
      三个月目标: '',
      创建时间: new Date().toISOString(),
      最后更新时间: new Date().toISOString(),
      是否激活: true
    }
  ]
}

// 获取默认数据结构（新版本：人生主线系统）
export function getDefaultData() {
  return {
    // 第一步：今日概览
    今日概览: {
      一句话标题: '', // 必填
      能量值: 3, // 1-5，默认3
      压力值: 3, // 1-5，默认3
      今日最关键一件事: '' // 必填
    },
    
    // 第二步：今日主线推进（核心）
    今日主线推进: [], // 数组，每个元素对应一条主线的推进记录
    
    // 第三步：决策与内耗（可选，但重要）
    决策与内耗: [], // 数组，每个元素是一个决策对象
    
    // 第四步：问题库（可选）
    问题库: [], // 数组，每个元素是一个问题对象
    
    // 第五步：习惯追踪（可选）
    习惯追踪: [], // 数组，每个元素是一个习惯对象
    
    // 第六步：每日三省（优化）
    每日三省: {
      动机偏差: '', // 必填：今天有没有为了逃避/迎合而做的选择？
      理想不一致: '', // 必填：今天有哪个瞬间和理想状态最不一致？
      主线对齐: '' // 必填：如果明天只允许围绕三条主线各做一件小事，会选什么？
    }
  }
}

// 获取默认决策对象
export function getDefaultDecision() {
  return {
    决策ID: `decision_${Date.now()}`,
    决策主题: '',
    带来什么: '',
    失去什么: '',
    真实痛点: '',
    替代方案: '',
    决策结论: '',
    下一步行动: '',
    创建时间: new Date().toISOString(),
    是否解决: false
  }
}

// 获取默认问题对象
export function getDefaultProblem() {
  return {
    问题ID: `problem_${Date.now()}`,
    问题描述: '',
    问题分类: '', // 技术问题/关系问题/决策问题/其他
    优先级: '', // P0/P1/P2
    是否解决: false,
    创建时间: new Date().toISOString(),
    最后更新时间: new Date().toISOString()
  }
}

// 获取默认习惯对象
export function getDefaultHabit() {
  return {
    习惯ID: `habit_${Date.now()}`,
    习惯名称: '',
    是否执行: false,
    关联主线: '', // 主线ID
    执行感受: '',
    连续天数: 0 // 系统自动计算
  }
}
