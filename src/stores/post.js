import { defineStore } from 'pinia'
import { ref } from 'vue'
import { postApi } from '@/api/post'

export const usePostStore = defineStore('post', () => {
  // 状态
  const posts = ref([])
  const currentPost = ref(null)
  const loading = ref(false)
  const pagination = ref({
    current: 1,
    size: 10,
    total: 0,
    pages: 0
  })

  // 获取帖子列表
  const fetchPosts = async (params = {}) => {
    loading.value = true
    try {
      const response = await postApi.getPosts(params)
      if (response.code === 200 && response.data) {
        posts.value = response.data.records || []
        pagination.value = {
          current: response.data.current || 1,
          size: response.data.size || 10,
          total: response.data.total || 0,
          pages: response.data.pages || 0
        }
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '获取帖子列表失败' }
      }
    } catch (error) {
      console.error('Fetch posts error:', error)
      return { success: false, message: error.message || '获取帖子列表失败' }
    } finally {
      loading.value = false
    }
  }

  // 获取单个帖子
  const fetchPost = async (id) => {
    loading.value = true
    try {
      const response = await postApi.getPost(id)
      if (response.code === 200 && response.data) {
        currentPost.value = response.data
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '获取帖子详情失败' }
      }
    } catch (error) {
      console.error('Fetch post error:', error)
      return { success: false, message: error.message || '获取帖子详情失败' }
    } finally {
      loading.value = false
    }
  }

  // 创建帖子
  const createPost = async (postData) => {
    try {
      const response = await postApi.createPost(postData)
      if (response.code === 200) {
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '发布帖子失败' }
      }
    } catch (error) {
      console.error('Create post error:', error)
      return { success: false, message: error.message || '发布帖子失败' }
    }
  }

  // 更新帖子
  const updatePost = async (id, postData) => {
    try {
      const response = await postApi.updatePost(id, postData)
      if (response.code === 200) {
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '更新帖子失败' }
      }
    } catch (error) {
      console.error('Update post error:', error)
      return { success: false, message: error.message || '更新帖子失败' }
    }
  }

  // 删除帖子
  const deletePost = async (id) => {
    try {
      const response = await postApi.deletePost(id)
      if (response.code === 200) {
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '删除帖子失败' }
      }
    } catch (error) {
      console.error('Delete post error:', error)
      return { success: false, message: error.message || '删除帖子失败' }
    }
  }

  // 点赞帖子
  const likePost = async (id) => {
    try {
      const response = await postApi.likePost(id)
      if (response.code === 200) {
        // 更新当前帖子的点赞数
        if (currentPost.value && currentPost.value.id === id) {
          currentPost.value.likeCount = (currentPost.value.likeCount || 0) + 1
        }
        // 更新列表中的帖子点赞数
        const postIndex = posts.value.findIndex(post => post.id === id)
        if (postIndex !== -1) {
          posts.value[postIndex].likeCount = (posts.value[postIndex].likeCount || 0) + 1
        }
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '点赞失败' }
      }
    } catch (error) {
      console.error('Like post error:', error)
      return { success: false, message: error.message || '点赞失败' }
    }
  }

  // 获取用户帖子
  const fetchUserPosts = async (userId, params = {}) => {
    loading.value = true
    try {
      const response = await postApi.getUserPosts(userId, params)
      if (response.code === 200 && response.data) {
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '获取用户帖子失败' }
      }
    } catch (error) {
      console.error('Fetch user posts error:', error)
      return { success: false, message: error.message || '获取用户帖子失败' }
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    posts,
    currentPost,
    loading,
    pagination,
    
    // 方法
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    likePost,
    fetchUserPosts
  }
})
