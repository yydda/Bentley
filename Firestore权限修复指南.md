# Firestore 权限错误修复指南

## 🔴 错误信息
```
FirebaseError: Missing or insufficient permissions.
```

## ✅ 解决方案

### 步骤 1：打开 Firestore 规则页面

直接访问以下链接（已包含你的项目ID）：
```
https://console.firebase.google.com/project/bentley-c62d5/firestore/rules
```

或者手动导航：
1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 选择项目 `bentley-c62d5`
3. 点击左侧菜单的 **"Firestore Database"**
4. 点击顶部的 **"规则"** 或 **"Rules"** 标签

### 步骤 2：更新安全规则

将规则编辑器中的内容**完全替换**为以下内容：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 日记数据：只有登录用户才能读写自己的数据
    match /diaries/{userId}/dates/{date} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 人生主线数据：只有登录用户才能读写自己的数据
    match /lifeThreads/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 步骤 3：发布规则

1. 点击 **"发布"** 或 **"Publish"** 按钮
2. 等待发布完成（通常几秒钟）
3. 看到"规则已发布"的提示

### 步骤 4：验证修复

1. **刷新应用页面**（重要！）
2. 重新登录（如果需要）
3. 尝试打开"管理人生主线"对话框
4. 应该不再出现权限错误

---

## 🔍 如何确认规则已生效？

### 方法 1：检查规则页面
- 规则页面应该显示你刚才发布的规则
- 没有语法错误提示

### 方法 2：检查浏览器控制台
- 刷新应用后，不应该再看到 `Missing or insufficient permissions` 错误
- 应该能看到成功加载主线的日志

### 方法 3：测试功能
- 打开"管理人生主线"对话框
- 应该能正常加载和保存主线数据

---

## ⚠️ 常见问题

### Q1: 点击"发布"后没有反应？
**A:** 
- 检查规则语法是否正确（所有括号是否匹配）
- 查看是否有错误提示
- 尝试刷新页面后重新发布

### Q2: 规则发布后仍然报错？
**A:**
- **等待 10-30 秒**：规则生效需要时间
- **刷新应用页面**：确保使用最新的规则
- **重新登录**：确保认证状态正确
- **清除浏览器缓存**：有时需要清除缓存

### Q3: 规则语法错误？
**A:**
- 确保所有括号 `{}` 和 `()` 都匹配
- 确保每行末尾有分号 `;`
- 确保 `rules_version = '2';` 在第一行

### Q4: 仍然无法访问？
**A:**
- 确认你已经**登录**（右上角显示用户头像）
- 确认你的用户ID与规则中的 `userId` 匹配
- 检查 Firebase 控制台是否有其他错误提示

---

## 📝 规则说明

### 规则结构
```
lifeThreads/{userId}
```
- `lifeThreads`：集合名称（固定）
- `{userId}`：文档ID，必须是当前登录用户的UID

### 权限检查
```javascript
if request.auth != null && request.auth.uid == userId
```
- `request.auth != null`：确保用户已登录
- `request.auth.uid == userId`：确保用户只能访问自己的数据

---

## 🆘 如果仍然无法解决

1. **截图规则页面**：保存当前规则配置
2. **截图错误信息**：保存浏览器控制台的完整错误
3. **检查用户登录状态**：确认右上角显示用户头像
4. **检查网络连接**：确认能正常访问 Firebase

---

## ✅ 修复后的预期行为

修复成功后，你应该能够：
- ✅ 打开"管理人生主线"对话框
- ✅ 加载已保存的主线（如果有）
- ✅ 添加、编辑、删除主线
- ✅ 保存主线到 Firebase
- ✅ 在"今日主线推进"中选择主线

