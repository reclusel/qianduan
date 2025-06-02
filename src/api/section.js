import request from './request'

export const sectionApi = {
  // 获取所有版块
  getSections() {
    return request({
      url: '/sections',
      method: 'GET'
    })
  },

  // 创建版块
  createSection(data) {
    return request({
      url: '/sections',
      method: 'POST',
      data
    })
  },

  // 获取单个版块信息
  getSection(id) {
    return request({
      url: `/sections/${id}`,
      method: 'GET'
    })
  },

  // 更新版块信息
  updateSection(id, data) {
    return request({
      url: `/sections/${id}`,
      method: 'PUT',
      data
    })
  },

  // 删除版块
  deleteSection(id) {
    return request({
      url: `/sections/${id}`,
      method: 'DELETE'
    })
  }
}
