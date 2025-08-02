---
title: "Node.js 开发环境搭建指南"
excerpt: "完整的 Node.js 开发环境搭建指南，包括安装、版本管理、包管理器和开发工具推荐。"
slug: "nodejs-setup-guide"
status: "published"
categories: ["技术", "后端"]
tags: ["Node.js", "JavaScript", "开发环境", "教程"]
date: "2024-01-25"
views: 189
author: "博主"
---

# Node.js 开发环境搭建指南

Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境，让我们可以在服务器端运行 JavaScript。

## 安装 Node.js

### 方法一：官网下载
1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 LTS 版本（推荐）
3. 按照安装向导完成安装

### 方法二：使用包管理器

#### macOS
```bash
# 使用 Homebrew
brew install node

# 使用 MacPorts
sudo port install nodejs18
```

#### Ubuntu/Debian
```bash
# 更新包索引
sudo apt update

# 安装 Node.js
sudo apt install nodejs npm
```

#### Windows
```bash
# 使用 Chocolatey
choco install nodejs

# 使用 Scoop
scoop install nodejs
```

## 版本管理

推荐使用 Node Version Manager (nvm) 来管理多个 Node.js 版本：

```bash
# 安装 nvm (Linux/macOS)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装最新 LTS 版本
nvm install --lts

# 使用特定版本
nvm use 18.17.0

# 列出已安装版本
nvm list
```

## 包管理器

### npm (Node Package Manager)
```bash
# 初始化项目
npm init -y

# 安装依赖
npm install express

# 全局安装
npm install -g nodemon

# 查看已安装包
npm list
```

### yarn (可选)
```bash
# 安装 yarn
npm install -g yarn

# 初始化项目
yarn init -y

# 安装依赖
yarn add express

# 全局安装
yarn global add nodemon
```

## 开发工具推荐

1. **IDE/编辑器**
   - Visual Studio Code
   - WebStorm
   - Atom

2. **调试工具**
   - Node.js Inspector
   - VS Code Debugger
   - Chrome DevTools

3. **实用工具**
   - nodemon (自动重启)
   - pm2 (进程管理)
   - ESLint (代码检查)

## 第一个 Node.js 应用

创建 `app.js`：

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, Node.js!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
```

运行应用：
```bash
node app.js
```

现在你的 Node.js 开发环境就搭建完成了！