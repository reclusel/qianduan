import request from './request'

export const postApi = {
  // 获取帖子列表
  getPosts(params = {}) {
    return request({
      url: '/posts',
      method: 'GET',
      params
    })
  },
  // 创建帖子
  createPost(data) {
    return request({
      url: '/posts',
      method: 'POST',
      data
    })
  },

  // 获取单个帖子详情
  getPost(id) {
    return request({
      url: `/posts/${id}`,
      method: 'GET'
    })
  },

  // 更新帖子
  updatePost(id, data) {
    return request({
      url: `/posts/${id}`,
      method: 'PUT',
      data
    })
  },

  // 删除帖子
  deletePost(id) {
    return request({
      url: `/posts/${id}`,
      method: 'DELETE'
    })
  },

  // 点赞帖子
  likePost(id) {
    return request({
      url: `/posts/${id}/like`,
      method: 'POST'
    })
  },

  // 获取用户的帖子
  getUserPosts(userId, params = {}) {
    return request({
      url: `/posts/user/${userId}`,
      method: 'GET',
      params
    })
  }
}
