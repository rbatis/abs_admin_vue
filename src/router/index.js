import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/user/Login.vue'
import Home from '@/views/home/home.vue'
import User from '@/views/setting/User.vue'
import Role from '@/views/setting/Role.vue'
import Res from '@/views/setting/Res.vue'
import Dict from '@/views/setting/Dict.vue'
import KV from '@/views/setting/KV.vue'
import NotFound from '@/views/exception/404.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/user/login',
    name: 'login',
    component: Login
  },
  {
    path: '/setting/user',
    name: 'setting_user',
    component: User
  },
  {
    path: '/setting/role',
    name: 'setting_role',
    component: Role
  },
  {
    path: '/setting/res',
    name: 'setting_res',
    component: Res
  },
  {
    path: '/setting/dict',
    name: 'setting_dict',
    component: Dict
  },
  {
    path: '/setting/kv',
    name: 'setting_kv',
    component: KV
  },
  {
    path: '/404',
    name: '404',
    component: NotFound
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫 - 检查登录状态
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')

  // 如果访问登录页，直接放行
  if (to.path === '/user/login') {
    next()
    return
  }

  // 如果有 token，放行
  if (token) {
    next()
    return
  }

  // 没有 token，重定向到登录页
  next('/user/login')
})

export default router
