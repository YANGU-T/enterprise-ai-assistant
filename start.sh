#!/bin/bash

echo "========================================"
echo "企业AI助手中控平台 - 启动脚本"
echo "========================================"
echo ""

echo "[1/4] 检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi
echo "Node.js 环境检查通过"

echo ""
echo "[2/4] 安装项目依赖..."
if ! npm run install:all; then
    echo "错误: 依赖安装失败"
    exit 1
fi
echo "依赖安装完成"

echo ""
echo "[3/4] 配置环境变量..."
if [ ! -f "server/.env" ]; then
    cp "server/.env.example" "server/.env"
    echo "已创建环境变量配置文件"
else
    echo "环境变量配置文件已存在"
fi

echo ""
echo "[4/4] 启动开发服务器..."
echo "前端将运行在: http://localhost:5173"
echo "后端将运行在: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev