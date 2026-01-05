# Firestore 数据库创建详细指南

## 🔍 找不到"Firestore Database"菜单？

### 原因分析
1. **数据库还未创建**：Firestore需要先创建才能看到
2. **菜单被折叠**：可能在"Build"或"构建"菜单下
3. **界面语言不同**：中文界面可能显示为"Firestore 数据库"

---

## 📍 方法一：通过直接链接访问（推荐）

直接访问以下链接（已包含你的项目ID）：
```
https://console.firebase.google.com/project/bentley-c62d5/firestore
```

如果数据库未创建，会显示创建界面。

---

## 📍 方法二：通过首页创建

1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 选择项目 `bentley-c62d5`
3. 在项目首页（Overview），向下滚动
4. 找到 **"Firestore Database"** 卡片
5. 点击 **"创建数据库"** 或 **"Create database"** 按钮

---

## 📍 方法三：通过左侧菜单

### 步骤1：展开构建菜单
1. 在Firebase控制台左侧菜单
2. 找到 **"Build"（构建）** 或 **"构建"** 选项
3. 点击展开（如果有下拉箭头）

### 步骤2：查找Firestore
在展开的菜单中，查找：
- **"Firestore Database"**（英文）
- **"Firestore 数据库"**（中文）
- **"Cloud Firestore"**

### 步骤3：如果仍然找不到
1. 点击左侧菜单底部的 **"更多"** 或 **"More"**
2. 在展开的菜单中查找Firestore

---

## 🚀 创建数据库详细步骤

### 第1步：选择安全规则
选择 **"以测试模式启动"** 或 **"Start in test mode"**

⚠️ **重要提示**：
- 测试模式允许所有读写（不安全）
- 稍后必须配置安全规则（见第4.2步）
- 仅用于开发阶段

### 第2步：选择数据库位置
推荐选择：
- **`asia-east1`**（台湾）- 适合中国大陆用户
- **`asia-southeast1`**（新加坡）- 适合东南亚用户
- **`us-central1`**（美国中部）- 如果其他区域不可用

**注意**：
- 位置选择后**无法更改**
- 选择离你最近的区域以获得最佳性能

### 第3步：启用数据库
1. 点击 **"启用"** 或 **"Enable"**
2. 等待创建完成（30-60秒）
3. 创建完成后会自动跳转到Firestore页面

---

## ✅ 验证数据库已创建

创建成功后，你应该能看到：
1. Firestore Database页面
2. 顶部有 **"数据"** 和 **"规则"** 标签
3. 左侧菜单中出现了 **"Firestore Database"** 选项

---

## 🔧 配置安全规则

数据库创建后，**立即配置安全规则**：

### 导航到规则页面
1. 在Firestore Database页面
2. 点击顶部的 **"规则"** 或 **"Rules"** 标签
3. 或者直接访问：
   ```
   https://console.firebase.google.com/project/bentley-c62d5/firestore/rules
   ```

### 配置规则
将规则编辑器中的内容替换为：

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

### 发布规则
1. 点击 **"发布"** 或 **"Publish"** 按钮
2. 等待发布完成（几秒钟）

---

## ⚠️ 常见问题

### Q1: 点击"创建数据库"后没有反应？
**A:** 
- 刷新页面重试
- 检查浏览器控制台是否有错误
- 尝试使用直接链接访问

### Q2: 选择位置时没有看到asia-east1？
**A:**
- 某些区域可能不可用
- 选择其他亚洲区域（如asia-southeast1）
- 或选择us-central1（美国中部）

### Q3: 创建后还是看不到菜单？
**A:**
- 刷新页面
- 清除浏览器缓存
- 尝试直接链接访问

### Q4: 规则发布失败？
**A:**
- 检查规则语法是否正确
- 确保所有括号都匹配
- 查看错误提示信息

---

## 📸 界面参考

### Firestore创建界面应该显示：
```
创建 Cloud Firestore 数据库
Create Cloud Firestore database

选择安全规则：
○ 以生产模式启动
○ 以测试模式启动  ← 选择这个

选择 Cloud Firestore 位置：
[下拉菜单选择区域]

[启用] 按钮
```

### Firestore页面应该显示：
```
Firestore Database
[数据] [规则] [索引] [使用情况]  ← 标签页

（空数据库，还没有集合）
```

---

## 🆘 如果还是找不到

请告诉我：
1. 你在Firebase控制台的哪个页面？
2. 左侧菜单显示了哪些选项？
3. 首页（Overview）显示了哪些卡片？

我可以根据你的具体情况提供更精确的指导！

---

## ✅ 完成检查清单

- [ ] 成功创建Firestore数据库
- [ ] 选择了合适的区域位置
- [ ] 配置了安全规则
- [ ] 规则已成功发布
- [ ] 可以在左侧菜单看到"Firestore Database"

完成以上步骤后，就可以开始使用Firestore存储数据了！

