import request from './request'

export const adminApi = {
  // 设置帖子精华
  setPostFeatured(id, isFeatured) {
    return request({
      url: `/admin/posts/${id}/feature`,
      method: 'PUT',
      data: {
        isFeatured: isFeatured ? 1 : 0
      }
    })
  },

  // 设置帖子置顶
  setPostPinned(id, isPinned) {
    return request({
      url: `/admin/posts/${id}/pin`,
      method: 'PUT',
      data: {
        isPinned: isPinned ? 1 : 0
      }
    })
  },

  // 更新用户积分
  updateUserPoints(id, points) {
    return request({
      url: `/admin/users/${id}/points`,
      method: 'PUT',
      data: {
        points: points
      }
    })
  }
}
