@echo off
chcp 65001 >nul 2>&1
title 企业AI中台 - 后端服务重启 (PowerShell)

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║       企业AI中台 - 后端服务重启脚本      ║
echo  ╚══════════════════════════════════════════╝
echo.

echo  正在使用 PowerShell 启动后端服务重启脚本...
echo.

:: 使用 PowerShell 执行脚本，绕过执行策略
powershell -ExecutionPolicy Bypass -File "restart-backend.ps1"

:: 如果 PowerShell 执行失败，回退到批处理版本
if errorlevel 1 (
    echo.
    echo  ⚠ PowerShell 脚本执行失败，尝试使用批处理版本...
    call restart-backend.bat
)