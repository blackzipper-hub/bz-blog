#!/bin/bash

# 静态博客部署脚本

echo "🚀 开始部署静态博客到GitHub Pages..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在client目录下运行此脚本"
    exit 1
fi

# 检查是否有gh-pages包
if ! npm list gh-pages &> /dev/null; then
    echo "📦 安装 gh-pages..."
    npm install --save-dev gh-pages
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 部署到GitHub Pages
echo "🌐 部署到GitHub Pages..."
npm run deploy

if [ $? -eq 0 ]; then
    echo "✅ 部署成功!"
    echo "🎉 你的博客将在几分钟内在GitHub Pages上可用"
    echo "📝 如果这是首次部署，请确保在GitHub仓库设置中启用GitHub Pages"
else
    echo "❌ 部署失败"
    exit 1
fi