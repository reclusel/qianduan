// 应用配置文件
const config = {
  // 开发环境配置
  development: {
    // 后端API基础地址
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    // 请求超时时间（毫秒）
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
    // 是否启用请求日志
    enableRequestLog: import.meta.env.VITE_ENABLE_REQUEST_LOG === 'true'
  },

  // 生产环境配置
  production: {
    // 后端API基础地址 - 生产环境请修改为实际的后端地址
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://your-production-api.com/api',
    // 请求超时时间（毫秒）
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 15000,
    // 是否启用请求日志
    enableRequestLog: import.meta.env.VITE_ENABLE_REQUEST_LOG === 'true'
  },

  // 测试环境配置
  test: {
    // 后端API基础地址
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    // 请求超时时间（毫秒）
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
    // 是否启用请求日志
    enableRequestLog: import.meta.env.VITE_ENABLE_REQUEST_LOG === 'true'
  }
}

// 获取当前环境
const getEnvironment = () => {
  // 优先使用环境变量 VITE_APP_ENV
  if (import.meta.env.VITE_APP_ENV) {
    return import.meta.env.VITE_APP_ENV
  }

  // 其次使用 Vite 的模式
  if (import.meta.env.MODE) {
    return import.meta.env.MODE
  }

  // 默认为开发环境
  return 'development'
}

// 获取当前环境的配置
const getCurrentConfig = () => {
  const env = getEnvironment()
  return config[env] || config.development
}

// 导出当前环境配置
export default getCurrentConfig()

// 也可以导出所有配置和工具函数
export {
  config,
  getEnvironment,
  getCurrentConfig
}
