import axios from 'axios'
import { ElMessage } from 'element-plus'
import config from '@/config'

// 创建axios实例
const request = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求日志（仅在开发环境启用）
if (config.enableRequestLog) {
  console.log('API配置:', {
    baseURL: config.baseURL,
    timeout: config.timeout,
    environment: import.meta.env.MODE
  })
}

// 请求拦截器
request.interceptors.request.use(
  (requestConfig) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`
    }

    // 请求日志
    if (config.enableRequestLog) {
      console.log('发送请求:', {
        method: requestConfig.method?.toUpperCase(),
        url: requestConfig.url,
        baseURL: requestConfig.baseURL,
        data: requestConfig.data,
        params: requestConfig.params
      })
    }

    return requestConfig
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data } = response

    // 响应日志
    if (config.enableRequestLog) {
      console.log('收到响应:', {
        status: response.status,
        url: response.config.url,
        method: response.config.method?.toUpperCase(),
        data: data
      })
    }

    // 如果是下载文件等特殊情况，直接返回
    if (response.config.responseType === 'blob') {
      return response
    }

    // 正常情况下返回data
    return data
  },
  (error) => {
    console.error('Response error:', error)

    // 处理不同的错误状态码
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token')
          ElMessage.error('登录已过期，请重新登录')
          // 这里可以添加跳转到登录页的逻辑
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

export default request
