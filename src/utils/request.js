import axios from 'axios'
import { message } from 'ant-design-vue'

// 创建 axios 实例
const request = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
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
    const res = response.data
    // 检查业务 code
    if (res.code !== undefined && res.code !== '0') {
      // 显示错误消息
      message.error(res.msg || '操作失败')
      // 返回一个特殊的错误对象，但作为 resolved Promise
      // 这样 Modal.onOk 会失败关闭，但不会抛出未捕获错误
      return Promise.resolve({ __error: true, msg: res.msg || '操作失败' })
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
        // 401 错误不返回，因为会跳转
        return Promise.resolve({ __error: true, msg: errorMsg })
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
    } else if (error.message) {
      errorMsg = error.message
    }
    message.error(errorMsg)
    // 返回 resolved Promise 但带上错误标记
    return Promise.resolve({ __error: true, msg: errorMsg })
  }
)

export default request
