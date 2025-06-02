# 配置说明文档

## 概述

本项目使用了灵活的配置系统，支持通过环境变量和配置文件来管理不同环境下的设置。

## 配置文件结构

```
├── .env                    # 默认环境变量
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
└── src/config/index.js     # 配置文件
```

## 环境变量说明

### 基础配置

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `VITE_APP_TITLE` | 应用标题 | BBS论坛系统 | BBS论坛系统 |
| `VITE_APP_ENV` | 应用环境 | development | development/production/test |

### API配置

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `VITE_API_BASE_URL` | 后端API基础地址 | http://localhost:8080/api | http://localhost:8080/api |
| `VITE_API_TIMEOUT` | 请求超时时间（毫秒） | 10000 | 10000 |
| `VITE_ENABLE_REQUEST_LOG` | 是否启用请求日志 | true | true/false |

## 环境配置

### 开发环境 (.env.development)

```env
# 开发环境配置
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=10000
VITE_ENABLE_REQUEST_LOG=true
```

### 生产环境 (.env.production)

```env
# 生产环境配置
VITE_APP_ENV=production
VITE_API_BASE_URL=https://your-production-api.com/api
VITE_API_TIMEOUT=15000
VITE_ENABLE_REQUEST_LOG=false
```

## 如何修改后端地址

### 方法1：修改环境变量文件

1. **开发环境**：编辑 `.env.development` 文件
```env
VITE_API_BASE_URL=http://your-backend-server:port/api
```

2. **生产环境**：编辑 `.env.production` 文件
```env
VITE_API_BASE_URL=https://your-production-api.com/api
```

### 方法2：修改配置文件

编辑 `src/config/index.js` 文件中的默认值：

```javascript
development: {
  baseURL: 'http://your-backend-server:port/api',
  // ...其他配置
}
```

### 方法3：运行时环境变量

在启动应用时设置环境变量：

```bash
# Windows
set VITE_API_BASE_URL=http://localhost:3000/api && npm run dev

# Linux/Mac
VITE_API_BASE_URL=http://localhost:3000/api npm run dev
```

## 配置优先级

配置的优先级从高到低：

1. 运行时环境变量
2. 环境特定的 `.env` 文件（如 `.env.development`）
3. 通用 `.env` 文件
4. 配置文件中的默认值

## 常见配置场景

### 场景1：本地开发连接远程后端

修改 `.env.development`：
```env
VITE_API_BASE_URL=http://192.168.1.100:8080/api
```

### 场景2：使用不同端口的本地后端

修改 `.env.development`：
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 场景3：启用/禁用请求日志

修改对应环境的配置文件：
```env
VITE_ENABLE_REQUEST_LOG=false
```

### 场景4：调整请求超时时间

修改对应环境的配置文件：
```env
VITE_API_TIMEOUT=20000
```

## 配置验证

启动应用后，在浏览器控制台中可以看到当前的API配置信息（仅在启用请求日志时）：

```
API配置: {
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
  environment: "development"
}
```

## 注意事项

1. **环境变量必须以 `VITE_` 开头**才能在前端代码中访问
2. **修改环境变量后需要重启开发服务器**才能生效
3. **生产环境部署时**，确保设置正确的 `VITE_API_BASE_URL`
4. **请求日志**在生产环境中建议关闭以提高性能
5. **不要在代码中硬编码API地址**，始终使用配置文件

## 故障排除

### 问题1：API请求失败

检查控制台中的API配置信息，确认 `baseURL` 是否正确。

### 问题2：环境变量不生效

1. 确认变量名以 `VITE_` 开头
2. 重启开发服务器
3. 检查 `.env` 文件是否在项目根目录

### 问题3：跨域问题

如果遇到跨域问题，可以在 `vite.config.js` 中配置代理：

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

然后将 `VITE_API_BASE_URL` 设置为 `/api`。
