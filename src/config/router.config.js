// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout,PageView } from '@/layouts'
import { bxAnaalyse } from '@/core/icons'

const RouteView = {
  name: 'RouteView',
  render: h => h('router-view')
}

export const asyncRouterMap = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: 'menu.home' },
    redirect: '/dashboard/workplace',
    children: [
      {
        path: '/',
        name: 'index',
        component: () => import('@/views/home/home'),
        meta: { title: '首页', icon: 'home', keepAlive: true, permission: ['/'] },
      },
      {
        path: '/setting',
        component: RouteView,
        redirect: '/setting/user',
        name: 'setting',
        meta: { title: '设置', icon: 'setting', keepAlive: true, permission: ['setting'] },
        children: [
          {
            path: '/setting/user',
            name: 'setting_user',
            component: () => import('@/views/setting/User'),
            meta: { title: '账号管理', keepAlive: true, permission: ['setting'] }
          },
          {
            path: '/setting/role',
            name: 'setting_role',
            component: () => import('@/views/setting/Role'),
            meta: { title: '角色管理', keepAlive: true, permission: ['setting'] }
          },
          {
            path: '/setting/res',
            name: 'setting_res',
            component: () => import('@/views/setting/Res'),
            meta: { title: '权限管理', keepAlive: true, permission: ['setting'] }
          },
          {
            path: '/setting/dict',
            name: 'setting_dict',
            component: () => import('@/views/setting/Dict'),
            meta: { title: '字典管理', keepAlive: true, permission: ['setting'] }
          }
        ]
      }
    ]
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      },
      {
        path: 'recover',
        name: 'recover',
        component: undefined
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }
]
