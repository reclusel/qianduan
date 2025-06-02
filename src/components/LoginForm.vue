<template>
    <div class="login-container">
      <!-- 关闭按钮 -->
      <el-icon class="close-btn" @click="emit('close')"><Close /></el-icon>

      <!-- 主标题 -->
      <h1 class="login-title">登录</h1>

      <el-form :model="form" class="login-form">
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

        <!-- 操作区域 -->
        <div class="action-area">
          <el-checkbox v-model="form.remember">记住我</el-checkbox>
          <el-link type="primary" class="forgot-link">忘记密码？</el-link>
        </div>

        <!-- 登录按钮 -->
        <el-button
          type="primary"
          class="submit-btn"
          :loading="loading"
          @click="handleSubmit"
        >
          登录
        </el-button>

        <!-- 注册链接 -->
        <div class="register-link">
          <span>没有账号？</span>
          <el-link type="primary" @click="switchToRegister">立即注册</el-link>
        </div>
      </el-form>
    </div>
  </template>

  <script setup>
  import { reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Close, Message, Lock, View, Hide } from '@element-plus/icons-vue'
  import { useUserStore } from '@/stores/user'
  import { validateEmail, validatePassword } from '@/utils'

  const emit = defineEmits(['close', 'switch-register'])
  const userStore = useUserStore()

  // 表单数据
  const form = reactive({
    email: '',
    password: '',
    remember: false
  })

  // 密码可见状态
  const showPassword = ref(false)
  const loading = ref(false)

  const handleSubmit = async () => {
    // 表单验证
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

    loading.value = true

    try {
      const result = await userStore.login({
        email: form.email,
        password: form.password
      })

      if (result.success) {
        ElMessage.success('登录成功')
        emit('close')
        // 可以在这里添加跳转逻辑
      } else {
        ElMessage.error(result.message)
      }
    } catch (error) {
      ElMessage.error('登录失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }

  const switchToRegister = () => {
    emit('switch-register')
    emit('close')
  }
  </script>

  <style scoped>
  .login-container {
    position: relative;
    width: 400px;
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

  .login-title {
    margin: 0 0 30px;
    font-size: 24px;
    color: #333;
    text-align: left;
  }

  .login-form {
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

  .action-area {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 15px 0 30px;
  }

  .forgot-link {
    font-size: 14px;
  }

  .submit-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    border-radius: 6px;
  }

  .register-link {
    margin-top: 25px;
    text-align: center;
    font-size: 14px;

    .el-link {
      margin-left: 8px;
      vertical-align: baseline;
    }
  }
  </style>