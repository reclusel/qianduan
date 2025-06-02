import request from './request'

export const userApi = {
  // 用户登录
  login(data) {
    return request({
      url: '/users/login',
      method: 'POST',
      data
    })
  },

  // 用户注册
  register(data) {
    return request({
      url: '/users/register',
      method: 'POST',
      data
    })
  },

  // 获取用户资料
  getProfile() {
    return request({
      url: '/users/profile',
      method: 'GET'
    })
  },

  // 更新用户资料
  updateProfile(data) {
    return request({
      url: '/users/profile',
      method: 'PUT',
      data
    })
  },

  // 用户签到
  checkin() {
    return request({
      url: '/users/checkin',
      method: 'POST'
    })
  }
}
