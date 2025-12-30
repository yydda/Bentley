# Firebase 授权域名配置详细说明

## 📍 导航路径

### 方法一：通过设置标签
1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 选择你的项目（`bentley-c62d5`）
3. 点击左侧菜单的 **"Authentication"（身份验证）**
4. 在页面顶部，你会看到两个标签：
   - **"Sign-in method"（登录方法）**
   - **"Settings"（设置）** ← 点击这个
5. 向下滚动，找到 **"Authorized domains"（授权域名）** 部分
6. 点击 **"Add domain"（添加域名）** 按钮
7. 输入你的GitHub Pages域名

### 方法二：通过设置图标
1. 在"Authentication"页面
2. 点击页面右上角的 **设置图标（⚙️）**
3. 选择 **"Project settings"（项目设置）**
4. 向下滚动找到 **"Authorized domains"** 部分

## 🎯 需要添加的域名

根据你的GitHub Pages部署方式，添加对应的域名：

### 情况1：根域名部署
如果你的仓库名是 `yourusername.github.io`，添加：
```
yourusername.github.io
```

### 情况2：子路径部署
如果你的仓库名是其他名称，添加：
```
yourusername.github.io
```
（注意：不需要包含 `/repo-name`，只需要根域名）

### 情况3：自定义域名
如果你使用了自定义域名，添加：
```
your-custom-domain.com
```

## 📸 界面说明

授权域名部分通常显示：
```
Authorized domains
These domains can be used when authenticating with Firebase.

localhost
your-project.firebaseapp.com
your-project.web.app
[Add domain]  ← 点击这个按钮
```

## ⚠️ 常见问题

### Q1: 找不到"Settings"标签？
**A:** 
- 确保你已经启用了Authentication服务
- 尝试刷新页面
- 或者直接访问：`https://console.firebase.google.com/project/your-project-id/authentication/settings`

### Q2: 添加域名后还是无法登录？
**A:**
- 检查域名格式是否正确（不需要 `https://` 前缀）
- 确保域名和你的GitHub Pages实际域名完全一致
- 清除浏览器缓存后重试

### Q3: 本地开发需要配置吗？
**A:** 不需要，`localhost` 默认已经在授权列表中。

## 🔍 验证配置

配置完成后，你可以：
1. 在授权域名列表中看到你添加的域名
2. 在GitHub Pages上测试登录功能
3. 如果登录成功，说明配置正确

## 📝 示例

假设你的GitHub用户名是 `john`，仓库名是 `diary-app`，GitHub Pages地址是：
- `https://john.github.io/diary-app`

那么你需要添加的授权域名是：
```
john.github.io
```

**注意**：只添加根域名，不需要包含路径 `/diary-app`。

---

如果还是找不到，请告诉我你看到的界面，我可以提供更具体的指导！

