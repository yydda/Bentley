// Firebase 认证工具函数

import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'

// Google登录
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      }
    }
  } catch (error) {
    console.error('登录失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 登出
export async function signOutUser() {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    console.error('登出失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取当前用户
export function getCurrentUser() {
  return auth.currentUser
}

// 等待认证状态初始化（返回Promise）
export function waitForAuth() {
  return new Promise((resolve) => {
    // 如果已经有用户，立即resolve
    if (auth.currentUser) {
      resolve({
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL
      })
      return
    }
    
    // 否则等待认证状态变化
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe() // 只监听一次
      if (user) {
        resolve({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        })
      } else {
        resolve(null)
      }
    })
    
    // 超时保护：500ms后无论如何都resolve
    setTimeout(() => {
      unsubscribe()
      resolve(auth.currentUser ? {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL
      } : null)
    }, 500)
  })
}

// 监听认证状态变化
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      })
    } else {
      callback(null)
    }
  })
}

