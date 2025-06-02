import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.isAdmin === '1')

  // 设置token
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  // 设置用户信息
  const setUser = (userInfo) => {
    user.value = userInfo
  }

  // 登录
  const login = async (loginData) => {
    try {
      const response = await userApi.login(loginData)
      if (response.code === 200 && response.data) {
        // 假设登录成功后返回token，需要根据实际API调整
        const { token: userToken, ...userInfo } = response.data
        setToken(userToken)
        setUser(userInfo)
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '登录失败' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: error.message || '登录失败' }
    }
  }

  // 注册
  const register = async (registerData) => {
    try {
      const response = await userApi.register(registerData)
      if (response.code === 200) {
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '注册失败' }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, message: error.message || '注册失败' }
    }
  }

  // 获取用户信息
  const fetchUserProfile = async () => {
    try {
      const response = await userApi.getProfile()
      if (response.code === 200 && response.data) {
        setUser(response.data)
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '获取用户信息失败' }
      }
    } catch (error) {
      console.error('Fetch profile error:', error)
      return { success: false, message: error.message || '获取用户信息失败' }
    }
  }

  // 更新用户信息
  const updateProfile = async (profileData) => {
    try {
      const response = await userApi.updateProfile(profileData)
      if (response.code === 200) {
        // 更新成功后重新获取用户信息
        await fetchUserProfile()
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '更新失败' }
      }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, message: error.message || '更新失败' }
    }
  }

  // 签到
  const checkin = async () => {
    try {
      const response = await userApi.checkin()
      if (response.code === 200) {
        // 签到成功后重新获取用户信息以更新积分
        await fetchUserProfile()
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '签到失败' }
      }
    } catch (error) {
      console.error('Checkin error:', error)
      return { success: false, message: error.message || '签到失败' }
    }
  }

  // 登出
  const logout = () => {
    setToken('')
    setUser(null)
  }

  // 初始化用户信息（如果有token）
  const initUser = async () => {
    if (token.value) {
      await fetchUserProfile()
    }
  }

  return {
    // 状态
    user,
    token,
    isLoggedIn,
    isAdmin,

    // 方法
    login,
    register,
    logout,
    fetchUserProfile,
    updateProfile,
    checkin,
    initUser,
    setToken,
    setUser
  }
})