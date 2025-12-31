<template>
  <div class="admin-layout">
    <!-- 左侧侧边栏 -->
    <a-layout-sider
      :width="200"
      class="admin-sider"
    >
      <!-- Logo -->
      <div class="admin-logo">
        <img src="@/assets/logo.png" alt="Logo" class="logo-img" />
        <span class="logo-text">AbsAdmin</span>
      </div>

      <!-- 竖向菜单 -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        theme="dark"
        mode="inline"
        class="admin-menu"
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
        </a-sub-menu>

        <!-- 退出 -->
        <a-menu-item key="logout" @click="handleLogout">
          <template #icon><span>🚪</span></template>
          退出
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!-- 右侧内容区 -->
    <div class="admin-content">
      <div class="admin-content-inner">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * AdminLayout.vue - 后台管理布局组件
 *
 * ⚠️ 注意：此组件不能使用 Tailwind CSS 类名
 *
 * 原因：
 * 1. 此组件使用了 Ant Design 的 Layout 组件 (a-layout-sider, a-menu 等)
 * 2. Tailwind 的 preflight (CSS reset) 会重置所有元素的默认样式
 * 3. Ant Design 组件依赖特定的默认样式来正常显示
 * 4. 混用会导致布局错乱、样式冲突
 *
 * 解决方案：
 * - 使用 Less 编写样式，避免与 Tailwind 冲突
 * - 其他页面组件可以正常使用 Tailwind（只要不混用在 Ant Design 组件上）
 */
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

<style lang="less" scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sider {
  background: #001529 !important;
  overflow: auto;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}

.admin-logo {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-img {
  height: 32px;
  width: auto;
}

.logo-text {
  margin-left: 12px;
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
}

.admin-menu {
  background: #001529 !important;
}

.admin-content {
  flex: 1;
  background: #f0f2f5;
  margin-left: 200px;
}

.admin-content-inner {
  padding: 24px;
}
</style>
