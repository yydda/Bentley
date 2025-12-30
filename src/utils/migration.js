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
  
  // 如果已经是新格式（有省身字段），直接返回
  if (oldData.省身) {
    return oldData
  }
  
  // 创建新数据结构
  const newData = getDefaultData()
  
  // 迁移时间花销 -> 省事.时间分配
  if (oldData.时间花销) {
    newData.省事.时间分配 = {
      主职工作: oldData.时间花销.主职 || 0,
      副业项目: oldData.时间花销.副业 || 0,
      学习成长: 0, // 旧数据没有这个字段
      娱乐放松: oldData.时间花销.娱乐内耗 || 0,
      社交关系: oldData.时间花销.对象 || 0,
      通勤杂事: oldData.时间花销.通勤 || 0,
      睡眠: oldData.时间花销.睡眠 || 0
    }
    
    // 迁移睡眠到省身
    newData.省身.身体与精力.睡眠时长 = oldData.时间花销.睡眠 || 0
    
    // 如果有评分，转换为今日心情（简化处理）
    if (oldData.时间花销.评分) {
      const happyCount = oldData.时间花销.评分.filter(e => e === '💓').length
      // 将满意度转换为心情评分（1-5）
      newData.省身.心情与情绪.今日心情 = Math.max(1, Math.min(5, happyCount))
    }
  }
  
  // 迁移LIFE -> 省身（部分）和 省人（内耗）
  if (oldData.LIFE) {
    // 学习与成长（如果有反思与感悟）
    if (oldData.LIFE.反思与感悟) {
      newData.省身.学习与成长.自我觉察 = oldData.LIFE.反思与感悟
    }
    
    // 内耗迁移到省人
    if (oldData.LIFE.内耗 && Array.isArray(oldData.LIFE.内耗)) {
      newData.省人.内耗与冲突 = oldData.LIFE.内耗.map(item => ({
        事件: item.标题 || item.原因 || '',
        我的反应: item.原因 || '',
        真实感受: item.想开了吗 || '',
        更好的做法: item.是否能解决 || item.权衡 || item.结论 || '',
        是否解决: item.结论 ? true : false
      }))
    }
  }
  
  // 迁移AM -> 省事.目标与产出 和 项目进度
  if (oldData.AM) {
    newData.省事.目标与产出.项目进度 = oldData.AM.项目进度 || 0
    newData.省事.目标与产出.时间追踪 = oldData.AM.时间追踪 || 0
    newData.省事.目标与产出.今日产出 = oldData.AM.产出 || ''
    newData.省事.项目进度.项目进度 = oldData.AM.项目进度 || 0
    newData.省事.项目进度.工作反思 = oldData.AM.反思与感悟 || ''
  }
  
  // 迁移LOVE -> 省人.贡献与帮助
  if (oldData.LOVE) {
    newData.省人.贡献与帮助.新连接数 = oldData.LOVE.新连接数 || 0
    newData.省人.贡献与帮助.有效互动量 = oldData.LOVE.有效互动量 || 0
    if (oldData.LOVE.记录) {
      newData.省人.贡献与帮助.帮助他人 = oldData.LOVE.记录
    }
  }
  
  // 保留旧字段（用于兼容）
  newData.时间花销 = oldData.时间花销
  newData.LIFE = oldData.LIFE
  newData.AM = oldData.AM
  newData.LOVE = oldData.LOVE
  
  return newData
}

/**
 * 检查数据是否需要迁移
 * @param {Object} data - 数据对象
 * @returns {boolean} - 是否需要迁移
 */
export function needsMigration(data) {
  if (!data) return false
  // 如果没有省身字段，说明是旧格式
  return !data.省身
}

