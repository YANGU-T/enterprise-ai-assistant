#!/bin/bash

# 企业AI助手 - Render部署脚本
# 使用方法: ./deploy-to-render.sh

set -e

echo "🚀 开始部署企业AI助手到Render..."

# 检查是否安装了git
if ! command -v git &> /dev/null; then
    echo "❌ 错误: 未安装git"
    exit 1
fi

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  警告: 有未提交的更改"
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 部署已取消"
        exit 1
    fi
fi

# 提交所有更改
echo "📦 提交更改..."
git add .
git commit -m "准备部署到Render - $(date +%Y-%m-%d_%H:%M:%S)" || true

# 推送到远程仓库
echo "📤 推送到远程仓库..."
git push origin main

echo "✅ 代码已推送到GitHub"
echo ""
echo "📋 接下来请按照以下步骤在Render控制台完成部署:"
echo ""
echo "1. 访问 https://render.com 并登录"
echo "2. 点击 'New' → 'PostgreSQL' 创建数据库"
echo "3. 记录数据库连接字符串"
echo "4. 点击 'New' → 'Web Service'"
echo "5. 连接您的GitHub仓库"
echo "6. 配置以下设置:"
echo "   - Runtime: Node"
echo "   - Build Command: cd server && npm install"
echo "   - Start Command: cd server && npm start"
echo "7. 添加环境变量:"
echo "   - DATABASE_URL: 您的PostgreSQL连接字符串"
echo "   - NODE_ENV: production"
echo "   - JWT_SECRET: 生成一个随机密钥"
echo "   - BOCHA_API_KEY: sk-eeea0ef033be4bcca7f7be5fd5c67ee9"
echo "8. 点击 'Create Web Service' 完成部署"
echo ""
echo "🔗 部署完成后，您将获得一个类似 https://your-app.onrender.com 的URL"
echo ""
echo "📱 前端部署:"
echo "   - 访问 https://vercel.com 部署前端"
echo "   - Build Command: cd client && npm run build"
echo "   - Output Directory: client/dist"
echo "   - 添加环境变量 VITE_API_URL 指向后端URL"
echo ""
echo "🎉 部署完成！"