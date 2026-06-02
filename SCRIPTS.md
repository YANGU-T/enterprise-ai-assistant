# 企业AI中台 - 脚本使用说明

## 可用脚本

### 1. 启动脚本
- **`start.bat`** - 一键启动前后端服务（推荐首次使用）

### 2. 重启脚本
- **`restart-backend.bat`** - 仅重启后端服务（批处理版本）
- **`restart-backend-ps.bat`** - 仅重启后端服务（PowerShell版本，功能更强大）
- **`restart-all.bat`** - 重启前后端所有服务
- **`restart-dev.bat`** - 开发模式重启（使用 nodemon 热重载）

### 3. PowerShell 脚本
- **`restart-backend.ps1`** - PowerShell 版本的后端重启脚本

## 使用方法

### 首次启动
```bash
# 双击运行 start.bat
start.bat
```

### 开发时重启后端
```bash
# 方式1: 使用批处理脚本（推荐）
restart-backend.bat

# 方式2: 使用 PowerShell 脚本
restart-backend-ps.bat

# 方式3: 开发模式（热重载）
restart-dev.bat
```

### 重启所有服务
```bash
# 重启前后端所有服务
restart-all.bat
```

## 脚本功能说明

### start.bat
- 检查 Node.js 和 pnpm 环境
- 自动安装项目依赖
- 检查端口占用并释放
- 启动前后端服务
- 自动打开浏览器

### restart-backend.bat
- 检查 Node.js 环境
- 检查后端目录结构
- 停止占用 3000 端口的进程
- 启动后端服务

### restart-backend-ps.bat
- 调用 PowerShell 脚本
- 绕过 PowerShell 执行策略
- 如果失败则回退到批处理版本

### restart-all.bat
- 检查完整环境
- 停止所有现有服务
- 重启前后端服务
- 自动打开浏览器

### restart-dev.bat
- 快速重启后端服务
- 使用 nodemon 热重载
- 文件修改后自动重启

## 常见问题

### 1. PowerShell 执行策略错误
如果遇到 PowerShell 执行策略错误，请使用批处理版本：
```bash
restart-backend.bat
```

### 2. 端口被占用
脚本会自动检测并释放被占用的端口（3000 和 5173）。

### 3. 依赖未安装
首次使用请运行 `start.bat`，它会自动安装依赖。

### 4. Node.js 未安装
请先安装 Node.js: https://nodejs.org/

## 开发建议

1. **日常开发**: 使用 `restart-dev.bat` 启动热重载模式
2. **调试后端**: 使用 `restart-backend.bat` 单独重启后端
3. **完整重启**: 使用 `restart-all.bat` 重启所有服务
4. **首次使用**: 使用 `start.bat` 初始化项目

## 端口说明

- **前端**: http://localhost:5173
- **后端**: http://localhost:3000
- **健康检查**: http://localhost:3000/api/health

## 注意事项

1. 所有脚本都需要在项目根目录运行
2. 确保已安装 Node.js 和 pnpm
3. 首次使用建议运行 `start.bat` 初始化项目
4. 开发时建议使用 `restart-dev.bat` 启动热重载模式