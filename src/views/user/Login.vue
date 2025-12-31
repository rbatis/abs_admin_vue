<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2]">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute w-[300px] h-[300px] rounded-full bg-white/10 top-[-100px] left-[-100px] animate-float"></div>
      <div class="absolute w-[200px] h-[200px] rounded-full bg-white/10 top-1/2 right-[-50px] animate-float-delay-1"></div>
      <div class="absolute w-[150px] h-[150px] rounded-full bg-white/10 bottom-[-50px] left-[20%] animate-float-delay-2"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="relative w-full max-w-[420px] mx-6 bg-white/95 backdrop-blur-md rounded-2xl p-10 shadow-2xl animate-slide-up">
      <!-- Logo 和标题 -->
      <div class="text-center mb-10">
        <img src="@/assets/logo.png" alt="Logo" class="w-16 h-16 mx-auto mb-4" />
        <h1 class="text-3xl font-bold text-gray-900 mb-2">AbsAdmin</h1>
        <p class="text-sm text-gray-500">后台管理系统</p>
      </div>

      <!-- 登录表单 -->
      <a-form
        :model="formState"
        :rules="rules"
        @finish="handleSubmit"
      >
        <a-alert
          v-if="isLoginError"
          type="error"
          show-icon
          message="账号或密码错误"
          class="mb-6"
        />

        <a-form-item name="account">
          <a-input
            size="large"
            v-model:value="formState.account"
            placeholder="请输入账号"
            :maxLength="11"
            @change="handleAccountChange"
          >
            <template #prefix>
              <UserOutlined class="text-gray-400 text-base" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="password">
          <a-input-password
            size="large"
            v-model:value="formState.password"
            placeholder="请输入密码"
          >
            <template #prefix>
              <LockOutlined class="text-gray-400 text-base" />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item name="vcode">
          <a-row :gutter="12">
            <a-col :span="14">
              <a-input
                size="large"
                v-model:value="formState.vcode"
                placeholder="请输入验证码"
              >
                <template #prefix>
                  <SafetyOutlined class="text-gray-400 text-base" />
                </template>
              </a-input>
            </a-col>
            <a-col :span="10">
              <div
                v-if="captchaUrl"
                class="w-full h-10 border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-[#667eea] hover:shadow-[0_0_0_2px_rgba(102,126,234,0.1)] transition-all bg-gray-50"
                @click="refreshCaptcha"
                title="点击刷新验证码"
              >
                <img :src="captchaUrl" class="w-full h-full object-cover" alt="验证码" />
              </div>
            </a-col>
          </a-row>
        </a-form-item>

        <a-form-item class="mb-0">
          <a-button
            size="large"
            type="primary"
            html-type="submit"
            class="w-full h-12 text-base font-semibold rounded-lg"
            :loading="state.loginBtn"
          >
            {{ state.loginBtn ? '登录中...' : '登录' }}
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 底部版权 -->
      <div class="mt-8 text-center">
        <p class="text-xs text-gray-500">© 2024 AbsAdmin. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message, notification } from 'ant-design-vue'
import md5 from 'md5'
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons-vue'
import { login } from '@/api/login'

const router = useRouter()

const isLoginError = ref(false)
const captchaTimestamp = ref(0)

const formState = reactive({
  account: '',
  password: '',
  vcode: ''
})

const state = reactive({
  loginBtn: false
})

const rules = {
  account: [{ required: true, message: '请输入账号' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  vcode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const captchaUrl = computed(() => {
  if (!formState.account) return ''
  return `/admin/captcha?account=${formState.account}&t=${captchaTimestamp.value}`
})

function handleAccountChange() {
  refreshCaptcha()
}

function refreshCaptcha() {
  captchaTimestamp.value = Date.now()
}

async function handleSubmit(values) {
  state.loginBtn = true
  try {
    const loginParams = {
      account: values.account,
      password: md5(values.password),
      vcode: values.vcode || ''
    }

    const res = await login(loginParams)
    if (res && res.data && res.data.access_token) {
      localStorage.setItem('access_token', res.data.access_token)
    }
    notification.success({
      message: '欢迎',
      description: '登录成功'
    })
    isLoginError.value = false
    router.push('/')
  } catch (err) {
    isLoginError.value = true
    notification.error({
      message: '登录失败',
      description: ((err.response || {}).data || {}).msg || '请求出现错误，请稍后再试',
      duration: 4
    })
    refreshCaptcha()
  } finally {
    state.loginBtn = false
  }
}
</script>

<style scoped>
/* 动画定义 */
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-float {
  animation: float 20s infinite ease-in-out;
}

.animate-float-delay-1 {
  animation: float 20s infinite ease-in-out;
  animation-delay: 5s;
}

.animate-float-delay-2 {
  animation: float 20s infinite ease-in-out;
  animation-delay: 10s;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out;
}

/* Ant Design 组件样式覆盖 - 使用 :deep */
:deep(.ant-input-affix-wrapper) {
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  padding: 12px 16px;
  transition: all 0.3s;
}

:deep(.ant-input-affix-wrapper:hover) {
  border-color: #667eea;
}

:deep(.ant-input-affix-wrapper-focused) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

:deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s;
}

:deep(.ant-btn-primary:hover:not(:disabled)) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

:deep(.ant-btn-primary:active:not(:disabled)) {
  transform: translateY(0);
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
}

:deep(.ant-form-item-explain-error) {
  font-size: 12px;
}

/* 响应式 */
@media (max-width: 480px) {
  .relative.w-full.max-w-\[420px\] {
    margin: 16px;
    padding: 32px 24px;
  }
}
</style>
