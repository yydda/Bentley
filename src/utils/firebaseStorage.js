// Firebase Firestore 数据存储工具

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  getDocs,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../config/firebase'

const COLLECTION_NAME = 'diaries'

// 获取用户日记数据路径
function getUserDiaryPath(userId, date) {
  return `${COLLECTION_NAME}/${userId}/dates/${date}`
}

// 获取指定日期的日记数据
export async function getDiaryDataFromFirebase(userId, date) {
  try {
    const docRef = doc(db, getUserDiaryPath(userId, date))
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      return null
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    throw error
  }
}

// 保存日记数据到Firebase
export async function saveDiaryDataToFirebase(userId, date, data) {
  try {
    const docRef = doc(db, getUserDiaryPath(userId, date))
    await setDoc(docRef, {
      ...data,
      date,
      updatedAt: new Date().toISOString()
    }, { merge: true })
    return { success: true }
  } catch (error) {
    console.error('保存数据失败:', error)
    throw error
  }
}

// 获取用户所有日期列表
export async function getAllDatesFromFirebase(userId) {
  try {
    const datesRef = collection(db, `${COLLECTION_NAME}/${userId}/dates`)
    const querySnapshot = await getDocs(datesRef)
    
    const dates = []
    querySnapshot.forEach((doc) => {
      dates.push(doc.id)
    })
    
    return dates.sort().reverse()
  } catch (error) {
    console.error('获取日期列表失败:', error)
    throw error
  }
}

// 实时监听指定日期的数据变化
export function subscribeDiaryData(userId, date, callback) {
  const docRef = doc(db, getUserDiaryPath(userId, date))
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data())
    } else {
      callback(null)
    }
  }, (error) => {
    console.error('监听数据失败:', error)
    callback(null, error)
  })
}

// 实时监听用户所有日期列表
export function subscribeAllDates(userId, callback) {
  const datesRef = collection(db, `${COLLECTION_NAME}/${userId}/dates`)
  
  return onSnapshot(datesRef, (querySnapshot) => {
    const dates = []
    querySnapshot.forEach((doc) => {
      dates.push(doc.id)
    })
    callback(dates.sort().reverse())
  }, (error) => {
    console.error('监听日期列表失败:', error)
    callback([], error)
  })
}

// 迁移localStorage数据到Firebase（如果存在旧数据）
export async function migrateLocalStorageToFirebase(userId) {
  try {
    // 从localStorage读取所有数据
    const STORAGE_KEY = 'diary_data'
    const localData = localStorage.getItem(STORAGE_KEY)
    
    if (!localData) {
      return { success: true, migrated: 0, message: '没有本地数据需要迁移' }
    }
    
    const allData = JSON.parse(localData)
    const dates = Object.keys(allData)
    
    if (dates.length === 0) {
      return { success: true, migrated: 0, message: '没有数据需要迁移' }
    }
    
    // 批量迁移数据
    let migrated = 0
    for (const date of dates) {
      try {
        await saveDiaryDataToFirebase(userId, date, allData[date])
        migrated++
      } catch (error) {
        console.error(`迁移日期 ${date} 失败:`, error)
      }
    }
    
    // 迁移成功后，清除localStorage中的数据
    if (migrated > 0) {
      localStorage.removeItem(STORAGE_KEY)
    }
    
    return {
      success: true,
      migrated,
      total: dates.length,
      message: `成功迁移 ${migrated}/${dates.length} 条记录到云端`
    }
  } catch (error) {
    console.error('迁移数据失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

