@echo off
chcp 65001 >nul 2>&1
title 企业AI中台 - 全服务重启

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║       企业AI中台 - 全服务重启脚本        ║
echo  ╚══════════════════════════════════════════╝
echo.

:: ========== 检查 Node.js ==========
echo [1/6] 检查 Node.js 环境...
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

:: ========== 检查 pnpm ==========
echo.
echo [2/6] 检查 pnpm 环境...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo  ⚠ pnpm 未安装，正在自动安装...
    call npm install -g pnpm
    if errorlevel 1 (
        echo  ✗ pnpm 安装失败，请手动运行: npm install -g pnpm
        pause
        exit /b 1
    )
    echo  ✓ pnpm 安装完成
) else (
    for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VER=%%i
    echo  ✓ pnpm %PNPM_VER% 已安装
)

:: ========== 检查项目依赖 ==========
echo.
echo [3/6] 检查项目依赖...
if not exist "node_modules" (
    echo  - 依赖未安装，正在安装...
    call pnpm install
    if errorlevel 1 (
        echo.
        echo  ✗ 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
    echo  ✓ 依赖安装完成
) else (
    echo  ✓ 项目依赖已就绪
)

:: ========== 停止现有服务 ==========
echo.
echo [4/6] 停止现有服务...

:: 停止前端服务 (端口 5173)
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo  ⚠ 停止前端服务 (端口 5173)...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    echo  ✓ 前端服务已停止
) else (
    echo  ✓ 前端服务未运行
)

:: 停止后端服务 (端口 3000)
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo  ⚠ 停止后端服务 (端口 3000)...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    echo  ✓ 后端服务已停止
) else (
    echo  ✓ 后端服务未运行
)

:: 等待端口完全释放
timeout /t 2 /nobreak >nul

:: ========== 配置环境变量 ==========
echo.
echo [5/6] 检查环境配置...
if not exist "server\.env" (
    if exist "server\.env.example" (
        copy "server\.env.example" "server\.env" >nul
        echo  ✓ 已创建 .env 配置文件
    ) else (
        echo  ✓ 跳过（无 .env.example）
    )
) else (
    echo  ✓ 环境配置已存在
)

:: ========== 启动服务 ==========
echo.
echo [6/6] 启动服务...
echo.
echo  ┌────────────────────────────────────────┐
echo  │  前端地址: http://localhost:5173       │
echo  │  后端地址: http://localhost:3000       │
echo  │  健康检查: http://localhost:3000/api/health │
echo  └────────────────────────────────────────┘
echo.
echo  提示: 按 Ctrl+C 可停止所有服务
echo.

:: 等待 3 秒后自动打开浏览器
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: 启动前后端
title 企业AI中台 - 运行中
call pnpm run dev