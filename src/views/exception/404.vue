<template>
  <a-result status="404" title="404" sub-title="抱歉，您访问的页面不存在。">
    <template #extra>
      <a-button type="primary" @click="toHome">返回首页</a-button>
    </template>
  </a-result>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function toHome() {
  router.push({ path: '/' })
}
</script>
