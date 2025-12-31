<template>
  <div class="flex min-h-screen">
    <!-- 左侧侧边栏 -->
    <a-layout-sider
      :width="200"
      class="!bg-[#001529] overflow-auto h-screen"
    >
      <!-- Logo -->
      <div class="flex items-center p-4 border-b border-white/10">
        <img src="@/assets/logo.png" alt="Logo" class="h-8 w-auto" />
        <span class="ml-3 text-lg font-bold text-white">AbsAdmin</span>
      </div>

      <!-- 竖向菜单 -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        theme="dark"
        mode="inline"
        class="!bg-[#001529]"
      >
        <!-- 首页 -->
        <a-menu-item key="home" @click="$router.push('/')">
          <template #icon><span>🏠</span></template>
          首页
        </a-menu-item>

        <!-- 设置子菜单 -->
        <a-sub-menu key="setting">
          <template #icon><span>⚙️</span></template>
          <template #title>设置</template>
          <a-menu-item key="user" @click="$router.push('/setting/user')">账号管理</a-menu-item>
          <a-menu-item key="role" @click="$router.push('/setting/role')">角色管理</a-menu-item>
          <a-menu-item key="res" @click="$router.push('/setting/res')">权限管理</a-menu-item>
          <a-menu-item key="dict" @click="$router.push('/setting/dict')">字典管理</a-menu-item>
          <a-menu-item key="kv" @click="$router.push('/setting/kv')">KV管理</a-menu-item>
        </a-sub-menu>

        <!-- 退出 -->
        <a-menu-item key="logout" @click="handleLogout">
          <template #icon><span>🚪</span></template>
          退出
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!-- 右侧内容区 -->
    <div class="flex-1 bg-[#f0f2f5]">
      <div class="p-6">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const selectedKeys = ref(['home'])
const openKeys = ref(['setting'])

function updateSelectedKeys(path) {
  if (path === '/') {
    selectedKeys.value = ['home']
  } else if (path.includes('/setting/user')) {
    selectedKeys.value = ['user']
  } else if (path.includes('/setting/role')) {
    selectedKeys.value = ['role']
  } else if (path.includes('/setting/res')) {
    selectedKeys.value = ['res']
  } else if (path.includes('/setting/dict')) {
    selectedKeys.value = ['dict']
  } else if (path.includes('/setting/kv')) {
    selectedKeys.value = ['kv']
  }
}

function handleLogout() {
  localStorage.removeItem('access_token')
  router.push('/user/login')
}

watch(() => route.path, (newPath) => {
  updateSelectedKeys(newPath)
})

onMounted(() => {
  updateSelectedKeys(route.path)
})
</script>
