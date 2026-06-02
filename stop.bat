@echo off
chcp 65001 >nul 2>&1

echo.
echo  正在停止企业AI中台服务...
echo.

:: 杀掉 5173 端口进程（前端）
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo  ✓ 前端服务已停止 (PID: %%a)
)

:: 杀掉 3000 端口进程（后端）
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo  ✓ 后端服务已停止 (PID: %%a)
)

:: 杀掉所有 node 相关的 dev 进程
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *enterprise*" >nul 2>&1

echo.
echo  ✓ 所有服务已停止
echo.
pause
