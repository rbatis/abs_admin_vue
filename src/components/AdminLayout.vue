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
          <template #icon><HomeOutlined /></template>
          首页
        </a-menu-item>

        <!-- 设置子菜单 -->
        <a-sub-menu key="setting">
          <template #icon><SettingOutlined /></template>
          <template #title>设置</template>
          <a-menu-item key="user" @click="$router.push('/setting/user')">
            <template #icon><UserOutlined /></template>
            账号管理
          </a-menu-item>
          <a-menu-item key="role" @click="$router.push('/setting/role')">
            <template #icon><TeamOutlined /></template>
            角色管理
          </a-menu-item>
          <a-menu-item key="res" @click="$router.push('/setting/res')">
            <template #icon><SafetyOutlined /></template>
            权限管理
          </a-menu-item>
          <a-menu-item key="dict" @click="$router.push('/setting/dict')">
            <template #icon><BookOutlined /></template>
            字典管理
          </a-menu-item>
        </a-sub-menu>

        <!-- 用户信息 -->
        <div class="user-info">
          <div class="user-name">{{ currentUserName }}</div>
          <a-menu-item key="logout" @click="handleLogout" class="logout-menu-item">
            <template #icon><LogoutOutlined /></template>
            退出
          </a-menu-item>
        </div>
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
import { ref, watch, onMounted, h, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Modal } from 'ant-design-vue'
import {
  HomeOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  BookOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

const selectedKeys = ref(['home'])
const openKeys = ref(['setting'])

// 获取当前登录用户名
const currentUserName = computed(() => {
  try {
    const userInfo = localStorage.getItem('user_info')
    if (userInfo) {
      const data = JSON.parse(userInfo)
      // 尝试常见的用户名字段
      return data.username || data.name || data.nickname || data.account || data.user_name || '用户'
    }
  } catch (e) {
    console.error('解析用户信息失败', e)
  }
  return '用户'
})

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
  Modal.confirm({
    title: '确认退出',
    icon: () => h(ExclamationCircleOutlined),
    content: '确定要退出登录吗？',
    okText: '确定',
    cancelText: '取消',
    onOk() {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_info')
      router.push('/user/login')
    }
  })
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

.user-info {
  padding: 8px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-name {
  padding: 8px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-menu-item {
  margin-top: 0 !important;
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
