<template>
  <div class="register-container">
    <!-- 关闭按钮 -->
    <el-icon class="close-btn" @click="emit('close')"><Close /></el-icon>

    <!-- 主标题 -->
    <h1 class="register-title">注册</h1>

    <el-form :model="form" class="register-form">
      <!-- 用户名输入 -->
      <el-form-item>
        <el-input
          v-model="form.name"
          placeholder="请输入用户名"
          clearable
        >
          <template #prefix>
            <el-icon class="input-icon"><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 邮箱输入 -->
      <el-form-item>
        <el-input
          v-model="form.email"
          placeholder="请输入邮箱"
          clearable
        >
          <template #prefix>
            <el-icon class="input-icon"><Message /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 密码输入 -->
      <el-form-item>
        <el-input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入密码"
        >
          <template #prefix>
            <el-icon class="input-icon"><Lock /></el-icon>
          </template>
          <template #suffix>
            <el-icon
              class="password-eye"
              @click="showPassword = !showPassword"
            >
              <View v-if="showPassword" />
              <Hide v-else />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 确认密码输入 -->
      <el-form-item>
        <el-input
          v-model="form.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="请再次输入密码"
        >
          <template #prefix>
            <el-icon class="input-icon"><Lock /></el-icon>
          </template>
          <template #suffix>
            <el-icon
              class="password-eye"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <View v-if="showConfirmPassword" />
              <Hide v-else />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 注册按钮 -->
      <el-button
        type="primary"
        class="submit-btn"
        :loading="loading"
        @click="handleSubmit"
      >
        注册
      </el-button>

      <!-- 登录链接 -->
      <div class="login-link">
        <span>已有账号？</span>
        <el-link type="primary" @click="switchToLogin">立即登录</el-link>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, User, Message, Lock, View, Hide } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { validateEmail, validatePassword } from '@/utils'

const emit = defineEmits(['close', 'switch-login'])
const userStore = useUserStore()

// 表单数据
const form = reactive({
  name: '', // 根据API文档，注册接口使用name字段
  email: '',
  password: '',
  confirmPassword: ''
})

// 密码可见状态
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)

const handleSubmit = async () => {
  // 表单验证
  if (!form.name) {
    ElMessage.error('请输入用户名')
    return
  }

  if (!form.email) {
    ElMessage.error('请输入邮箱')
    return
  }

  if (!validateEmail(form.email)) {
    ElMessage.error('请输入有效的邮箱地址')
    return
  }

  if (!form.password) {
    ElMessage.error('请输入密码')
    return
  }

  if (!validatePassword(form.password)) {
    ElMessage.error('密码至少6位')
    return
  }

  if (form.password !== form.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }

  loading.value = true

  try {
    const result = await userStore.register({
      name: form.name,
      email: form.email,
      password: form.password
    })

    if (result.success) {
      ElMessage.success('注册成功，请登录')
      emit('switch-login')
      emit('close')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const switchToLogin = () => {
  emit('switch-login')
  emit('close')
}
</script>

<style scoped>
.register-container {
  position: relative;
  width: 400px; /* 与LoginForm内容宽度一致 */
  padding: 40px;
  background: #fff;
  border-radius: 8px;
}

.close-btn {
  position: absolute;
  right: 20px;
  top: 20px;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #666;
}

.register-title {
  margin: 0 0 30px;
  font-size: 24px;
  color: #333;
  text-align: left;
}

.register-form {
  :deep(.el-input__wrapper) {
    height: 48px;
    padding: 0 15px;
    border-radius: 6px;
  }

  :deep(.el-input__prefix) {
    left: 12px;
    font-size: 18px;
  }

  :deep(.el-input__suffix) {
    right: 12px;
    cursor: pointer;
  }
}

.input-icon {
  color: #c0c4cc;
}

.password-eye {
  font-size: 18px;
  color: #999;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 6px;
  margin-top: 10px; /* 调整与上方表单项的间距 */
}

.login-link {
  margin-top: 25px;
  text-align: center;
  font-size: 14px;

  .el-link {
    margin-left: 8px;
    vertical-align: baseline;
  }
}
</style>
