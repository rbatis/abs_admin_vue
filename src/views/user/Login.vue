<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="login-bg">
      <div class="login-bg-circle login-bg-circle-1"></div>
      <div class="login-bg-circle login-bg-circle-2"></div>
      <div class="login-bg-circle login-bg-circle-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- Logo 和标题 -->
      <div class="login-header">
        <img src="@/assets/logo.png" alt="Logo" class="login-logo" />
        <h1 class="login-title">AbsAdmin</h1>
        <p class="login-subtitle">后台管理系统</p>
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
          class="login-alert"
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
              <UserOutlined class="login-icon" />
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
              <LockOutlined class="login-icon" />
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
                  <SafetyOutlined class="login-icon" />
                </template>
              </a-input>
            </a-col>
            <a-col :span="10">
              <div
                v-if="captchaUrl"
                class="login-captcha"
                @click="refreshCaptcha"
                title="点击刷新验证码"
              >
                <img :src="captchaUrl" class="login-captcha-img" alt="验证码" />
              </div>
            </a-col>
          </a-row>
        </a-form-item>

        <a-form-item class="login-form-item-last">
          <a-button
            size="large"
            type="primary"
            html-type="submit"
            class="login-btn"
            :loading="state.loginBtn"
          >
            {{ state.loginBtn ? '登录中...' : '登录' }}
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 底部版权 -->
      <div class="login-footer">
        <p class="login-copyright">© 2024 AbsAdmin. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { notification } from 'ant-design-vue'
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
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  return `${baseUrl}/admin/captcha?account=${formState.account}&t=${captchaTimestamp.value}`
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

<style lang="less" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.login-bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.login-bg-circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation: float 20s infinite ease-in-out;
}

.login-bg-circle-2 {
  width: 200px;
  height: 200px;
  top: 50%;
  right: -50px;
  animation: float 20s infinite ease-in-out;
  animation-delay: 5s;
}

.login-bg-circle-3 {
  width: 150px;
  height: 150px;
  bottom: -50px;
  left: 20%;
  animation: float 20s infinite ease-in-out;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  margin: 0 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.5s ease-out;
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

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
}

.login-title {
  font-size: 28px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #6b7280;
}

.login-alert {
  margin-bottom: 24px;
}

.login-icon {
  color: #9ca3af;
  font-size: 16px;
}

.login-captcha {
  width: 100%;
  height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: #f9fafb;
  transition: all 0.3s;
}

.login-captcha:hover {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.login-captcha-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-form-item-last {
  margin-bottom: 0;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-footer {
  margin-top: 32px;
  text-align: center;
}

.login-copyright {
  font-size: 12px;
  color: #6b7280;
}

/* Ant Design 组件样式覆盖 */
:deep(.ant-input-affix-wrapper) {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
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

:deep(.ant-form-item) {
  margin-bottom: 24px;
}

:deep(.ant-form-item-explain-error) {
  font-size: 12px;
}

/* 响应式 */
@media (max-width: 480px) {
  .login-card {
    margin: 16px;
    padding: 32px 24px;
  }
}
</style>
