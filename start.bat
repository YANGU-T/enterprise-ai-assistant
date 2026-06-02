@echo off
chcp 65001 >nul
echo ========================================
echo   企业AI助手中控平台 - 启动脚本
echo ========================================
echo.

:: 检查依赖是否已安装
if not exist "client\node_modules\vue" (
    echo [INFO] 首次运行，正在安装依赖...
    call pnpm install
    if errorlevel 1 (
        echo [ERROR] 依赖安装失败！
        pause
        exit /b 1
    )
    echo [INFO] 依赖安装完成！
    echo.
)

echo [INFO] 正在启动前端服务 (端口 5173)...
start "Frontend" cmd /c "cd client && npx vite --host"

echo [INFO] 正在启动后端服务 (端口 3000)...
start "Backend" cmd /c "cd server && node src/index.js"

echo.
echo [INFO] 等待服务启动...
timeout /t 3 /nobreak >nul

echo ========================================
echo   启动成功！
echo   前端地址: http://localhost:5173
echo   后端地址: http://localhost:3000
echo ========================================
echo.
echo 按任意键打开浏览器...
pause >nul
start http://localhost:5173
