---
title: "Node.js 环境搭建与项目初始化"
excerpt: "详细介绍如何搭建 Node.js 开发环境，包括安装、配置和项目初始化的完整流程。"
slug: "nodejs-setup-guide"
status: "published"
categories: ["技术", "后端"]
tags: ["Node.js", "环境搭建", "开发工具", "npm"]
date: "2024-01-08"
views: 189
author: "博主"
---

# Node.js 环境搭建与项目初始化

Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时，让我们能够在服务器端运行 JavaScript。本文将详细介绍如何搭建 Node.js 开发环境。

## 安装 Node.js

### 方法一：官网下载

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 LTS（长期支持）版本
3. 运行安装程序并按照提示安装

### 方法二：使用包管理器

**macOS (使用 Homebrew):**
```bash
brew install node
```

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows (使用 Chocolatey):**
```bash
choco install nodejs
```

### 方法三：使用 Node Version Manager (NVM)

NVM 允许你安装和管理多个 Node.js 版本：

**安装 NVM:**
```bash
# macOS/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重启终端或运行
source ~/.bashrc
```

**使用 NVM:**
```bash
# 查看可用版本
nvm list-remote

# 安装最新 LTS 版本
nvm install --lts

# 使用特定版本
nvm use 18.17.0

# 设置默认版本
nvm alias default 18.17.0
```

## 验证安装

安装完成后，验证 Node.js 和 npm 是否正确安装：

```bash
# 检查 Node.js 版本
node --version
# 或者
node -v

# 检查 npm 版本
npm --version
# 或者
npm -v
```

## 配置 npm

### 设置镜像源（可选）

如果下载速度较慢，可以设置淘宝镜像：

```bash
# 设置淘宝镜像
npm config set registry https://registry.npmmirror.com

# 查看当前镜像
npm config get registry

# 恢复官方镜像
npm config set registry https://registry.npmjs.org
```

### 全局包安装目录配置

```bash
# 查看全局包安装目录
npm config get prefix

# 设置全局包安装目录（可选）
npm config set prefix "C:\nodejs\npm-global"  # Windows
npm config set prefix "/usr/local"           # macOS/Linux
```

## 创建第一个 Node.js 项目

### 1. 创建项目目录

```bash
mkdir my-node-project
cd my-node-project
```

### 2. 初始化项目

```bash
# 交互式初始化
npm init

# 使用默认配置快速初始化
npm init -y
```

这会创建一个 `package.json` 文件：

```json
{
  "name": "my-node-project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

### 3. 创建入口文件

创建 `index.js` 文件：

```javascript
// index.js
console.log('Hello, Node.js!');

// 创建一个简单的 HTTP 服务器
const http = require('http');
const port = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>欢迎来到我的 Node.js 应用！</h1>');
});

server.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
```

### 4. 运行项目

```bash
node index.js
```

浏览器访问 `http://localhost:3000` 即可看到结果。

## 常用开发工具和包

### 开发依赖

```bash
# 安装 nodemon（自动重启开发服务器）
npm install --save-dev nodemon

# 在 package.json 中添加脚本
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

### 生产依赖示例

```bash
# Express 框架
npm install express

# 环境变量管理
npm install dotenv

# 日期处理
npm install moment

# HTTP 请求
npm install axios
```

## Express 快速开始

安装 Express 并创建一个基本的 Web 应用：

```bash
npm install express
```

更新 `index.js`：

```javascript
const express = require('express');
const app = express();
const port = 3000;

// 中间件
app.use(express.json());
app.use(express.static('public'));

// 路由
app.get('/', (req, res) => {
  res.send('<h1>欢迎来到 Express 应用！</h1>');
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' }
  ]);
});

app.listen(port, () => {
  console.log(`Express 应用运行在 http://localhost:${port}`);
});
```

## 项目结构建议

```
my-node-project/
├── node_modules/     # 依赖包
├── public/          # 静态文件
├── src/             # 源代码
│   ├── controllers/ # 控制器
│   ├── models/      # 数据模型
│   ├── routes/      # 路由
│   └── utils/       # 工具函数
├── tests/           # 测试文件
├── .env             # 环境变量
├── .gitignore       # Git 忽略文件
├── package.json     # 项目配置
└── README.md        # 项目说明
```

现在你已经成功搭建了 Node.js 开发环境，可以开始愉快的服务器端 JavaScript 开发之旅了！