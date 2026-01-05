// 数据迁移工具 - 将旧数据格式转换为新格式

import { getDefaultData } from './storage'

/**
 * 将旧数据格式（4模块）转换为新格式（三省吾身模型）
 * @param {Object} oldData - 旧数据格式
 * @returns {Object} - 新数据格式
 */
export function migrateOldDataToNew(oldData) {
  if (!oldData) {
    return getDefaultData()
  }
  
  // 如果已经是新格式（有今日概览字段），直接返回（但需要清理undefined）
  if (oldData.今日概览) {
    // 清理可能存在的undefined值
    return oldData
  }
  
  // 创建新数据结构（人生主线系统）
  const newData = getDefaultData()
  
  // 从旧数据中提取有用信息，迁移到新格式
  // 注意：旧格式（时间花销、LIFE、AM、LOVE、省身等）与新格式（人生主线系统）差异较大
  // 这里只做基本的数据提取，不强制映射
  
  // 如果有旧格式的反思内容，可以迁移到每日三省
  if (oldData.LIFE && oldData.LIFE.反思与感悟) {
    newData.每日三省.动机偏差 = oldData.LIFE.反思与感悟.substring(0, 200)
  }
  
  if (oldData.AM && oldData.AM.反思与感悟) {
    newData.每日三省.理想不一致 = oldData.AM.反思与感悟.substring(0, 200)
  }
  
  // 不保留旧字段，避免undefined值导致Firebase保存失败
  // 新格式使用完全不同的数据结构，旧数据无法直接映射
  
  return newData
}

/**
 * 检查数据是否需要迁移
 * @param {Object} data - 数据对象
 * @returns {boolean} - 是否需要迁移
 */
export function needsMigration(data) {
  if (!data) return false
  
  // 如果已经有新格式字段（今日概览），说明已经是新格式
  if (data.今日概览) {
    return false
  }
  
  // 如果有旧格式字段（时间花销、省身等），需要迁移
  if (data.时间花销 || data.省身 || data.LIFE || data.AM || data.LOVE) {
    return true
  }
  
  // 如果既没有新格式也没有旧格式，返回false（使用默认数据）
  return false
}

