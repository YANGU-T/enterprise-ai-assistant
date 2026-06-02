# 项目记忆

## 项目信息
- 项目名称：enterprise-ai-assistant（企业AI助手中控平台）
- 技术栈：Vue.js 3 (Vite) + Express.js + SQLite
- 前端端口：5173，后端端口：3000
- 使用 npm workspaces 管理 monorepo（client + server）
- 根目录运行：`npm run dev` 同时启动前后端
- `shared` 目录不存在，已从 workspaces 中移除

## PowerShell 限制
- 此环境 PowerShell 禁止运行 `npm` 脚本，需使用 `cmd /c "..."` 执行 npm 命令

## 模型配置架构
- **2026-05-28**: 重构为用户自定义模型配置模式
- 数据结构：`modelConfig.models[]` 数组，每个模型包含 `{ id, name, provider, description, endpoint, apiKey, status, createdAt }`
- API密钥按模型配置（非按供应商），支持自定义API端点
- 后端使用 OpenAI 兼容格式调用自定义端点：`config.endpoint` + `Bearer ${apiKey}`
- 已移除预定义虚拟模型，全部由用户自行添加配置
