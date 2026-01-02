import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import i18n from './locales'
import 'ant-design-vue/dist/reset.css'
import './assets/global.less'

const app = createApp(App)
app.use(router)
app.use(Antd)
app.use(i18n)
app.mount('#app')
