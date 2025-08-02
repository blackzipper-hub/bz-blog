# 🚀 静态个人博客

一个基于React的静态个人博客系统，适合部署到GitHub Pages等静态网站托管平台。

## ✨ 功能特性

- 📝 **文章展示**: 支持Markdown格式的文章展示
- 🏷️ **分类标签**: 文章分类和标签系统
- 🔍 **搜索功能**: 全文搜索支持
- 📱 **响应式设计**: 适配各种设备屏幕
- ⚡ **静态生成**: 无需后端，部署简单
- 🎨 **现代UI**: 使用styled-components的现代化界面
- 🔗 **SEO优化**: 完整的meta标签和结构化数据

## 📁 项目结构

```
client/
├── public/
│   ├── data/                 # 静态数据文件
│   │   ├── articles.json     # 文章数据
│   │   ├── categories.json   # 分类数据
│   │   └── tags.json         # 标签数据
│   └── index.html
├── src/
│   ├── components/           # 公共组件
│   │   ├── Header.tsx        # 页面头部
│   │   └── Footer.tsx        # 页面底部
│   ├── pages/               # 页面组件
│   │   ├── HomePage.tsx      # 首页
│   │   └── ArticlePage.tsx   # 文章详情页
│   ├── services/            # 数据服务
│   │   └── dataService.ts    # 静态数据管理
│   ├── App.tsx              # 主应用组件
│   └── index.tsx            # 应用入口
└── package.json
```

## 🛠 技术栈

- **React 19** - 用户界面库
- **TypeScript** - 类型安全的JavaScript
- **React Router** - 客户端路由
- **Styled Components** - CSS-in-JS样式方案
- **React Helmet** - SEO优化
- **React Markdown** - Markdown渲染

## 🚀 快速开始

### 1. 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 2. 安装依赖

```bash
cd client
npm install
```

### 3. 开发运行

```bash
npm start
```

访问 `http://localhost:3000` 查看博客。

### 4. 构建生产版本

```bash
npm run build
```

## 📝 内容管理

### 添加新文章

1. 编辑 `public/data/articles.json` 文件
2. 按照现有格式添加新文章：

```json
{
  "id": 5,
  "title": "文章标题",
  "content": "# 文章内容\n\n这里是Markdown格式的文章内容...",
  "excerpt": "文章摘要",
  "slug": "article-slug",
  "status": "published",
  "categories": ["分类1", "分类2"],
  "tags": ["标签1", "标签2"],
  "date": "2024-02-01",
  "views": 0,
  "author": "作者名"
}
```

### 管理分类和标签

- 编辑 `public/data/categories.json` 添加新分类
- 编辑 `public/data/tags.json` 添加新标签
- 确保文章中使用的分类和标签都在对应文件中存在

### 文章编写规范

- 使用标准Markdown语法
- 支持代码高亮
- 支持表格、引用等格式
- 图片建议放在 `public/images/` 目录下

## 🌐 部署到GitHub Pages

### 1. 准备仓库

```bash
# 创建GitHub仓库，然后克隆到本地
git clone https://github.com/yourusername/personal-blog.git
cd personal-blog

# 将client目录内容移到根目录
cp -r client/* .
rm -rf client
```

### 2. 配置部署

修改 `package.json` 中的 `homepage` 字段：

```json
{
  "homepage": "https://yourusername.github.io/personal-blog"
}
```

### 3. 安装部署工具

```bash
npm install --save-dev gh-pages
```

### 4. 部署

```bash
npm run deploy
```

### 5. 启用GitHub Pages

1. 进入GitHub仓库的Settings页面
2. 找到Pages设置
3. Source选择 `Deploy from a branch`
4. Branch选择 `gh-pages`
5. 保存设置

几分钟后，你的博客就可以通过 `https://yourusername.github.io/personal-blog` 访问了！

## 🔧 自定义配置

### 修改主题颜色

编辑 `src/App.tsx` 中的 `theme` 对象：

```typescript
const theme = {
  colors: {
    primary: '#007acc',    // 主色调
    secondary: '#6c757d',  // 次要颜色
    // ... 其他颜色
  }
  // ... 其他配置
};
```

### 修改网站信息

编辑以下文件：
- `public/index.html` - 网站标题和meta信息
- `src/components/Header.tsx` - 网站名称和导航
- `src/components/Footer.tsx` - 底部信息

### 添加自定义样式

在 `src/App.tsx` 的 `GlobalStyle` 中添加全局样式。

## 📊 SEO优化

博客已包含基本的SEO优化：

- ✅ 动态标题和描述
- ✅ Open Graph标签
- ✅ 结构化数据
- ✅ 响应式设计
- ✅ 快速加载

### 进一步优化建议

1. 添加 `sitemap.xml`
2. 配置 `robots.txt`
3. 使用Google Analytics
4. 添加JSON-LD结构化数据

## 🎨 界面定制

### 响应式断点

```typescript
breakpoints: {
  xs: '480px',   // 手机
  sm: '768px',   // 平板
  md: '992px',   // 小桌面
  lg: '1200px',  // 大桌面
  xl: '1400px'   // 超大屏
}
```

### 组件样式

所有组件都使用styled-components，支持主题变量和响应式设计。

## 🔍 搜索功能

支持以下搜索方式：
- 文章标题搜索
- 内容全文搜索
- 分类筛选
- 标签筛选
- 组合筛选

## 📈 性能优化

- ✅ 代码分割
- ✅ 懒加载
- ✅ 图片优化
- ✅ 缓存策略
- ✅ 轻量级依赖

## 🐛 故障排除

### 常见问题

1. **路由404错误**: 确保GitHub Pages配置正确
2. **样式显示异常**: 检查主题配置是否正确
3. **文章不显示**: 检查JSON文件格式是否正确
4. **部署失败**: 检查仓库权限和分支设置

### 调试技巧

```bash
# 本地调试
npm start

# 构建检查
npm run build
npx serve -s build

# 清除缓存
rm -rf node_modules package-lock.json
npm install
```

## 📝 更新日志

### v1.0.0 (2024-01-30)
- ✨ 首次发布
- 📝 支持Markdown文章
- 🏷️ 分类标签系统
- 🔍 搜索功能
- 📱 响应式设计

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 📄 许可证

MIT License

## 🎉 结语

享受写作和分享的乐趣！如果你觉得这个项目有用，请给个⭐️支持一下。

---

**Happy Blogging!** ✨