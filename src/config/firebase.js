// Firebase 配置
// 注意：在生产环境中，这些配置应该从环境变量读取
// 为了安全，建议使用环境变量，但GitHub Pages是静态部署，所以这里使用配置对象
// 实际使用时，Firebase的安全规则会保护数据

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// 获取方式：Firebase Console -> 项目设置 -> 你的应用 -> SDK设置和配置
const firebaseConfig = {
    apiKey: "AIzaSyBodkDdA0cynW2uj_13gJ3FAay_bHe8kg0",
    authDomain: "bentley-c62d5.firebaseapp.com",
    projectId: "bentley-c62d5",
    storageBucket: "bentley-c62d5.firebasestorage.app",
    messagingSenderId: "466984184798",
    appId: "1:466984184798:web:64f9c90be70826578ccb4f"
  };

// 初始化Firebase
const app = initializeApp(firebaseConfig)

// 初始化服务
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

// 配置Google登录
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export default app

