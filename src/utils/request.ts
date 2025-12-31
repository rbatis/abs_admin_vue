import axios from 'axios'
import { message } from 'ant-design-vue'

interface ApiResponse {
  code: string
  msg?: string
  data?: any
}

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    config.headers['Content-Type'] = 'application/json'
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers['Authorization'] = token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data as ApiResponse
    // 检查业务 code
    if (res.code !== undefined && res.code !== '0') {
      // 显示错误消息
      message.error(res.msg || '操作失败')
      // reject，让调用方的 catch 或 try-catch 捕获
      return Promise.reject(new Error(res.msg || '操作失败'))
    }
    return res
  },
  error => {
    // 处理 HTTP 错误
    let errorMsg = '请求失败，请稍后再试'
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      if (status === 401) {
        errorMsg = '未授权，请重新登录'
        localStorage.removeItem('access_token')
        window.location.href = '/user/login'
      } else if (status === 403) {
        errorMsg = '拒绝访问'
      } else if (status === 404) {
        errorMsg = '请求的资源不存在'
      } else if (status === 500) {
        errorMsg = '服务器错误'
      }
      // 尝试从响应数据中获取错误消息
      if (data?.msg) {
        errorMsg = data.msg
      } else if (data?.message) {
        errorMsg = data.message
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMsg = '请求超时，请检查网络连接'
    } else if (error.message) {
      errorMsg = error.message
    }
    message.error(errorMsg)
    // reject，让调用方捕获
    return Promise.reject(new Error(errorMsg))
  }
)

export default request
