<template>
  <AdminLayout>
    <div class="home-page">
      <h1>欢迎使用 AbsAdmin 后台管理系统</h1>

      <a-divider />

      <!-- 单图上传示例 -->
      <a-card title="单图上传" style="margin-bottom: 24px;">
        <ImageUpload
          v-model="singleImage"
          :max-count="1"
        />
        <div v-if="singleImage" style="margin-top: 16px;">
          <a-alert message="已上传" type="success">
            <template #description>
              {{ singleImage }}
            </template>
          </a-alert>
        </div>
      </a-card>

      <!-- 多图上传示例 -->
      <a-card title="多图上传（最多5张）">
        <ImageUpload
          v-model="multipleImages"
          :max-count="5"
        />
        <div v-if="multipleImages.length > 0" style="margin-top: 16px;">
          <a-alert :message="`已上传 ${multipleImages.length} 张图片`" type="success">
            <template #description>
              <div v-for="(url, index) in multipleImages" :key="index" style="margin-top: 4px;">
                {{ index + 1 }}. {{ url }}
              </div>
            </template>
          </a-alert>
        </div>
      </a-card>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from '@/components/AdminLayout.vue'
import ImageUpload from '@/components/ImageUpload.vue'

// 单图
const singleImage = ref<string>('')

// 多图
const multipleImages = ref<string[]>([])
</script>

<style scoped>
.home-page {
  padding: 24px;
}
</style>
