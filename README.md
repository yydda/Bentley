# 日记填写系统

一个基于 Vue 3 + Element Plus + Tailwind CSS 的日记填写系统，帮助用户有条理地完成每日日记记录。

## 功能特性

- 📝 **分步骤引导填写** - 四个模块（时间花销、LIFE、AM、LOVE）分步完成
- 💾 **本地数据存储** - 使用 LocalStorage 保存数据，无需后端
- 📊 **数据验证** - 时间总和验证、必填项提示
- 📤 **Markdown 导出** - 支持导出为 Markdown 格式
- 📱 **响应式设计** - PC 和移动端自适应
- 🎨 **现代化 UI** - 基于 Element Plus 和 Tailwind CSS

## 技术栈

- Vue 3
- Element Plus
- Tailwind CSS
- Vite
- Vue Router

## 安装和运行

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist` 目录。

### 预览生产版本

```bash
npm run preview
```

## 部署到 GitHub Pages

### 方法一：手动部署

1. 构建项目：
```bash
npm run build
```

2. 将 `dist` 目录的内容推送到 GitHub 仓库的 `gh-pages` 分支

3. 在 GitHub 仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支

### 方法二：使用 GitHub Actions 自动部署

1. 创建 `.github/workflows/deploy.yml` 文件（已包含在项目中）

2. 在 GitHub 仓库设置中添加 `GITHUB_TOKEN`（通常自动提供）

3. 推送代码到 `main` 分支，GitHub Actions 会自动构建并部署

## 项目结构

```
├── src/
│   ├── components/      # 组件
│   │   ├── TimeSpend.vue    # 时间花销模块
│   │   ├── LifeModule.vue   # LIFE模块
│   │   ├── AmModule.vue     # AM模块
│   │   └── LoveModule.vue   # LOVE模块
│   ├── views/           # 视图
│   │   └── Home.vue     # 主页面
│   ├── utils/           # 工具函数
│   │   ├── storage.js   # 数据存储
│   │   └── export.js    # 导出功能
│   ├── router/          # 路由配置
│   ├── App.vue          # 根组件
│   ├── main.js          # 入口文件
│   └── style.css        # 全局样式
├── index.html           # HTML 模板
├── vite.config.js       # Vite 配置
├── tailwind.config.js   # Tailwind 配置
└── package.json         # 项目配置
```

## 使用说明

1. **选择日期** - 在顶部选择要填写的日期（默认为今天）

2. **填写时间花销** - 记录各项活动的时间，系统会自动计算总和并提示

3. **填写 LIFE 模块** - 记录生活习惯、内耗、反思等

4. **填写 AM 模块** - 记录工作相关的内容

5. **填写 LOVE 模块** - 记录情感相关的内容

6. **导出日记** - 点击"导出Markdown"按钮，将日记导出为 Markdown 文件

## 数据存储

所有数据存储在浏览器的 LocalStorage 中，键名为 `diary_data`。

数据结构：
```javascript
{
  "2024-01-15": {
    时间花销: { ... },
    LIFE: { ... },
    AM: { ... },
    LOVE: { ... }
  }
}
```

## 开发计划

- [x] MVP 版本（基础功能）
- [ ] 历史记录查看
- [ ] 数据统计图表
- [ ] 自定义模板
- [ ] 主题切换
- [ ] 数据导入功能

## 许可证

MIT

