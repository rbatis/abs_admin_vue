import request from '@/utils/request'

interface LoginParams {
  account: string
  password: string
  vcode?: string
}

interface ApiResponse<T = any> {
  code: string
  msg?: string
  data: T
}

const userApi = {
  Login: '/admin/sys_login',
  Logout: 'Logout',
  ForgePassword: '/admin/forge-password',
  Register: '/admin/register',
  SendSms: '/admin/sms',
  SendSmsErr: '/admin/sms_err',
  UserInfo: '/admin/sys_user_info',
  UserMenu: '/admin/user/nav'
}

/**
 * login func
 */
export function login(parameter: LoginParams): Promise<ApiResponse> {
  return request({
    url: userApi.Login,
    method: 'post',
    data: parameter
  })
}

export function getSmsCaptcha(parameter: any): Promise<ApiResponse> {
  return request({
    url: userApi.SendSms,
    method: 'post',
    data: parameter
  })
}

export function getInfo(): Promise<ApiResponse> {
  return request({
    url: userApi.UserInfo,
    method: 'post',
    data: {}
  })
}

export function getCurrentUserNav(): Promise<ApiResponse> {
  return request({
    url: userApi.UserMenu,
    method: 'get'
  })
}

export function logout(): Promise<ApiResponse> {
  return request({
    url: userApi.Logout,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
