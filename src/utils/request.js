import axios from 'axios'

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
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    if (response.status !== 200) {
      console.error('Error Response:', response.status)
      return Promise.reject(new Error('http code=' + response.status || 'Error'))
    }
    // 检查业务 code
    if (res.code !== undefined && res.code !== '0') {
      return Promise.reject({ response: { data: res } })
    }
    return res
  },
  error => {
    console.error('Response Error:', error)
    return Promise.reject(error)
  }
)

export default request
