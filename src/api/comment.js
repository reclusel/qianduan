import request from './request'

export const commentApi = {
  // 创建评论
  createComment(data) {
    return request({
      url: '/comments',
      method: 'POST',
      data
    })
  },

  // 获取帖子的评论
  getPostComments(postId) {
    return request({
      url: `/comments/post/${postId}`,
      method: 'GET'
    })
  },

  // 获取父评论的子评论
  getChildComments(parentCommentId) {
    return request({
      url: `/comments/parent/${parentCommentId}`,
      method: 'GET'
    })
  },

  // 删除评论
  deleteComment(id) {
    return request({
      url: `/comments/${id}`,
      method: 'DELETE'
    })
  },

  // 点赞评论
  likeComment(id) {
    return request({
      url: `/comments/${id}/like`,
      method: 'POST'
    })
  }
}
