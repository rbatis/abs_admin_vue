import request from '@/utils/request'

const api = {
  sys_res_page: '/sys_res_page',
  sys_res_add: '/sys_res_add',
  sys_res_update: '/sys_res_update',
  sys_res_delete: '/sys_res_remove',

  sys_role_page: '/sys_role_page',
  sys_role_add: '/sys_role_add',
  sys_role_update: '/sys_role_update',
  sys_role_delete: '/sys_role_delete',
  sys_res_all: '/sys_res_all',

  user: '/user',
  role: '/role',
  service: '/service',
  permission: '/permission',
  permissionNoPager: '/permission/no-pager',
  orgTree: '/org/tree'
}

export default api

export function getUserList (parameter) {
  return request({
    url: api.user,
    method: 'get',
    params: parameter
  })
}

export function getRoleList (parameter) {
  return request({
    url: api.role,
    method: 'get',
    params: parameter
  })
}

export function getServiceList (parameter) {
  return request({
    url: api.service,
    method: 'get',
    params: parameter
  })
}

export function getPermissions (parameter) {
  return request({
    url: api.permissionNoPager,
    method: 'get',
    params: parameter
  })
}

export function getOrgTree (parameter) {
  return request({
    url: api.orgTree,
    method: 'get',
    params: parameter
  })
}

// id == 0 add     post
// id != 0 update  put
export function saveService (parameter) {
  return request({
    url: api.service,
    method: parameter.id === 0 ? 'post' : 'put',
    data: parameter
  })
}

export function saveSub (sub) {
  return request({
    url: '/sub',
    method: sub.id === 0 ? 'post' : 'put',
    data: sub
  })
}


export function res_page (arg) {
  return request({
    url: api.sys_res_page,
    method: 'post',
    data: arg
  })
}

export function res_add (arg) {
  return request({
    url: api.sys_res_add,
    method: 'post',
    data: arg
  })
}

export function res_update (arg) {
  return request({
    url: api.sys_res_update,
    method: 'post',
    data: arg
  })
}

export function res_delete (arg) {
  return request({
    url: api.sys_res_delete,
    method: 'post',
    data: arg
  })
}

export function res_all (arg) {
  return request({
    url: api.sys_res_all,
    method: 'post',
    data: arg
  })
}


export function role_page(arg) {
  return request({
    url: api.sys_role_page,
    method: 'post',
    data: arg
  })
}

export function role_add(arg) {
  return request({
    url: api.sys_role_add,
    method: 'post',
    data: arg
  })
}

export function role_update(arg) {
  return request({
    url: api.sys_role_update,
    method: 'post',
    data: arg
  })
}

export function role_delete(arg) {
  return request({
    url: api.sys_role_delete,
    method: 'post',
    data: arg
  })
}
