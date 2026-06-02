@echo off
chcp 65001 >nul 2>&1
title 企业AI中台 - 开发模式重启

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║       企业AI中台 - 开发模式重启脚本      ║
echo  ╚══════════════════════════════════════════╝
echo.

:: 快速重启后端服务（开发模式）
echo  正在重启后端服务...
echo.

:: 停止后端服务
echo [1/2] 停止后端服务...
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 1 /nobreak >nul
    echo  ✓ 后端服务已停止
) else (
    echo  ✓ 后端服务未运行
)

:: 启动后端服务（使用 nodemon 热重载）
echo.
echo [2/2] 启动后端服务（热重载模式）...
echo.
echo  ┌────────────────────────────────────────┐
echo  │  后端地址: http://localhost:3000       │
echo  │  健康检查: http://localhost:3000/api/health │
echo  │  热重载:   文件修改后自动重启          │
echo  └────────────────────────────────────────┘
echo.
echo  提示: 按 Ctrl+C 可停止后端服务
echo.

:: 切换到后端目录并启动 nodemon
cd server
title 企业AI中台 - 后端开发模式
call npx nodemon src/index.js

:: 如果 nodemon 未安装，回退到 node
if errorlevel 1 (
    echo.
    echo  ⚠ nodemon 启动失败，尝试使用 node 启动...
    node src/index.js
)