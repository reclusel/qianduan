# 项目启动指南

## 环境要求

- Node.js 16+ 
- npm 或 yarn
- 现代浏览器（Chrome、Firefox、Safari、Edge）

## 安装步骤

### 1. 克隆项目
```bash
git clone <repository-url>
cd bbs-demo
```

### 2. 安装依赖

#### 使用 npm
```bash
npm install
```

#### 使用 yarn
```bash
yarn install
```

### 3. 配置后端地址

编辑 `.env.development` 文件：
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 4. 启动开发服务器

#### 使用 npm
```bash
npm run dev
```

#### 使用 yarn
```bash
yarn dev
```

### 5. 访问应用

开发服务器启动后，在浏览器中访问：
```
http://localhost:3000
```

## Windows PowerShell 执行策略问题

如果在 Windows 上遇到 PowerShell 执行策略错误，可以使用以下解决方案：

### 方案1：使用 CMD
```cmd
npm install
npm run dev
```

### 方案2：临时修改执行策略
以管理员身份运行 PowerShell，然后执行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 方案3：使用 npx
```bash
npx vite
```

## 构建生产版本

```bash
npm run build
```

构建完成后，生产文件将在 `dist` 目录中。

## 预览生产版本

```bash
npm run preview
```

## 常见问题

### 1. 端口被占用
如果 3000 端口被占用，Vite 会自动使用下一个可用端口。

### 2. 依赖安装失败
尝试清除缓存后重新安装：
```bash
npm cache clean --force
npm install
```

### 3. 热重载不工作
检查防火墙设置，确保允许 Vite 开发服务器的端口访问。

### 4. API 请求失败
1. 确认后端服务已启动
2. 检查 `.env.development` 中的 API 地址配置
3. 查看浏览器控制台的网络请求

## 开发工具推荐

- **IDE**: VS Code
- **插件**: 
  - Vue Language Features (Volar)
  - Vue 3 Snippets
  - Auto Rename Tag
  - Bracket Pair Colorizer
  - GitLens

## 浏览器开发者工具

启动应用后，可以在浏览器控制台中看到：
- API 配置信息
- 请求/响应日志（开发环境）
- Vue DevTools 扩展支持

## 下一步

项目启动成功后，你可以：
1. 注册新用户账号
2. 浏览版块和帖子
3. 发布新帖子
4. 参与评论和点赞

更多功能说明请查看 [README.md](../README.md)。
