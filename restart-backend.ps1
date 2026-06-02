# 企业AI中台 - 后端服务重启脚本 (PowerShell)
# 用法: .\restart-backend.ps1

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       企业AI中台 - 后端服务重启脚本      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "[1/4] 检查 Node.js 环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Node.js $nodeVersion 已安装" -ForegroundColor Green
    } else {
        throw "Node.js 未找到"
    }
} catch {
    Write-Host "  ✗ 错误: 未找到 Node.js" -ForegroundColor Red
    Write-Host "  请先安装 Node.js: https://nodejs.org/" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}

# 检查后端目录
Write-Host ""
Write-Host "[2/4] 检查后端目录..." -ForegroundColor Yellow
if (-not (Test-Path "server\src\index.js")) {
    Write-Host "  ✗ 错误: 未找到后端入口文件 server\src\index.js" -ForegroundColor Red
    Write-Host "  请确保在项目根目录运行此脚本" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}
Write-Host "  ✓ 后端目录结构正常" -ForegroundColor Green

# 停止现有后端服务
Write-Host ""
Write-Host "[3/4] 停止现有后端服务..." -ForegroundColor Yellow

$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
if ($port3000) {
    Write-Host "  ⚠ 端口 3000 已被占用，正在停止..." -ForegroundColor Yellow
    $port3000 | ForEach-Object {
        $processId = $_.OwningProcess
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "    - 终止进程: $($process.ProcessName) (PID: $processId)" -ForegroundColor Gray
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
    Write-Host "  ✓ 后端服务已停止" -ForegroundColor Green
} else {
    Write-Host "  ✓ 端口 3000 未被占用" -ForegroundColor Green
}

# 启动后端服务
Write-Host ""
Write-Host "[4/4] 启动后端服务..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  ┌────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "  │  后端地址: http://localhost:3000       │" -ForegroundColor Cyan
Write-Host "  │  健康检查: http://localhost:3000/api/health │" -ForegroundColor Cyan
Write-Host "  └────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""
Write-Host "  提示: 按 Ctrl+C 可停止后端服务" -ForegroundColor Gray
Write-Host ""

# 切换到后端目录并启动
Set-Location server
$host.UI.RawUI.WindowTitle = "企业AI中台 - 后端服务运行中"
node src/index.js

# 如果启动失败，显示错误信息
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  ✗ 后端服务启动失败" -ForegroundColor Red
    Write-Host "  请检查:" -ForegroundColor Red
    Write-Host "    1. 依赖是否已安装 (运行 pnpm install)" -ForegroundColor Red
    Write-Host "    2. 端口 3000 是否被其他程序占用" -ForegroundColor Red
    Write-Host "    3. 查看上方错误日志" -ForegroundColor Red
    Write-Host ""
    Read-Host "按 Enter 键退出"
}