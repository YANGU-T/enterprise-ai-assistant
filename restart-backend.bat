@echo off
chcp 65001 >nul 2>&1
title 企业AI中台 - 后端服务重启

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║       企业AI中台 - 后端服务重启脚本      ║
echo  ╚══════════════════════════════════════════╝
echo.

:: ========== 检查 Node.js ==========
echo [1/4] 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo  ✗ 错误: 未找到 Node.js
    echo  请先安装 Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo  ✓ Node.js %NODE_VER% 已安装

:: ========== 检查后端目录 ==========
echo.
echo [2/4] 检查后端目录...
if not exist "server\src\index.js" (
    echo  ✗ 错误: 未找到后端入口文件 server\src\index.js
    echo  请确保在项目根目录运行此脚本
    pause
    exit /b 1
)
echo  ✓ 后端目录结构正常

:: ========== 停止现有后端服务 ==========
echo.
echo [3/4] 停止现有后端服务...

:: 检查 3000 端口占用
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo  ⚠ 端口 3000 已被占用，正在停止...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
        echo    - 终止进程 PID: %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo  ✓ 后端服务已停止
) else (
    echo  ✓ 端口 3000 未被占用
)

:: ========== 启动后端服务 ==========
echo.
echo [4/4] 启动后端服务...
echo.
echo  ┌────────────────────────────────────────┐
echo  │  后端地址: http://localhost:3000       │
echo  │  健康检查: http://localhost:3000/api/health │
echo  └────────────────────────────────────────┘
echo.
echo  提示: 按 Ctrl+C 可停止后端服务
echo.

:: 切换到后端目录并启动
cd server
title 企业AI中台 - 后端服务运行中
node src/index.js

:: 如果启动失败，显示错误信息
if errorlevel 1 (
    echo.
    echo  ✗ 后端服务启动失败
    echo  请检查:
    echo    1. 依赖是否已安装 (运行 pnpm install)
    echo    2. 端口 3000 是否被其他程序占用
    echo    3. 查看上方错误日志
    echo.
    pause
)