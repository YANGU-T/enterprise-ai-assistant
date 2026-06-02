$pnpmDir = "node_modules\.pnpm"
$serverNm = "server\node_modules"

# 清理旧的 node_modules
if (Test-Path $serverNm) { Remove-Item -Recurse -Force $serverNm }
New-Item -ItemType Directory -Path $serverNm -Force | Out-Null

# 获取所有 server 依赖包
$packages = @(
    "express", "cors", "helmet", "morgan", "compression", "dotenv",
    "jsonwebtoken", "bcryptjs", "express-validator", "sequelize",
    "sqlite", "sqlite3", "nodemon"
)

foreach ($pkg in $packages) {
    $dirs = Get-ChildItem -Path $pnpmDir -Directory -Filter "$pkg@*" | Select-Object -First 1
    if ($dirs) {
        $src = Join-Path $dirs.FullName "node_modules\$pkg"
        if (Test-Path $src) {
            Write-Host "复制 $pkg..."
            Copy-Item -Path $src -Destination (Join-Path $serverNm $pkg) -Recurse -Force
        }
    }
}

# 复制 express 的所有依赖
$expressDir = Get-ChildItem -Path $pnpmDir -Directory -Filter "express@*" | Select-Object -First 1
if ($expressDir) {
    $expressNm = Join-Path $expressDir.FullName "node_modules"
    Get-ChildItem -Path $expressNm -Directory | ForEach-Object {
        $dest = Join-Path $serverNm $_.Name
        if (-not (Test-Path $dest)) {
            Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
        }
    }
}

# 复制 sequelize 的所有依赖
$sequelizeDir = Get-ChildItem -Path $pnpmDir -Directory -Filter "sequelize@*" | Select-Object -First 1
if ($sequelizeDir) {
    $sequelizeNm = Join-Path $sequelizeDir.FullName "node_modules"
    if (Test-Path $sequelizeNm) {
        Get-ChildItem -Path $sequelizeNm -Directory | ForEach-Object {
            $dest = Join-Path $serverNm $_.Name
            if (-not (Test-Path $dest)) {
                Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
            }
        }
    }
}

Write-Host "`nDone!"
pause