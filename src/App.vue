<template>
  <a-config-provider :locale="antdLocale">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import enUS from 'ant-design-vue/es/locale/en_US'

const { locale } = useI18n()

const antdLocales = {
  'zh-CN': zhCN,
  'en-US': enUS
}

const antdLocale = computed(() => antdLocales[locale.value] || zhCN)

// 监听语言变化，保存到 localStorage
watch(locale, (newLocale) => {
  localStorage.setItem('locale', newLocale)
})
</script>
