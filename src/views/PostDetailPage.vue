<template>
  <div class="post-detail-page" v-loading="loading">
    <div v-if="post" class="post-detail">
      <!-- 帖子内容 -->
      <div class="post-content">
        <div class="post-header">
          <h1 class="post-title">
            <el-tag v-if="post.isPinned" type="danger" size="small">置顶</el-tag>
            <el-tag v-if="post.isFeatured" type="warning" size="small">精华</el-tag>
            <el-tag v-if="post.isHelp" type="success" size="small">
              求助{{ post.helpPoints ? `(${post.helpPoints}积分)` : '' }}
            </el-tag>
            {{ post.title }}
          </h1>
          <div class="post-meta">
            <span class="post-author">作者：{{ post.userName || post.authorName || `用户${post.userId}` }}</span>
            <span>发布时间：{{ formatTime(post.createdAt) }}</span>
            <span v-if="post.updatedAt !== post.createdAt">
              更新时间：{{ formatTime(post.updatedAt) }}
            </span>
            <span>浏览 {{ formatNumber(post.viewCount) }}</span>
            <span>评论 {{ formatNumber(post.commentCount) }}</span>
          </div>
        </div>
        
        <div class="post-body">
          <div class="post-text">{{ post.content }}</div>
        </div>

        <div class="post-actions">
          <el-button 
            :type="liked ? 'primary' : 'default'"
            :icon="liked ? 'StarFilled' : 'Star'"
            @click="handleLike"
          >
            点赞 ({{ post.likeCount || 0 }})
          </el-button>
          
          <div class="admin-actions" v-if="userStore.isAdmin">
            <el-button 
              :type="post.isPinned ? 'danger' : 'default'"
              size="small"
              @click="togglePin"
            >
              {{ post.isPinned ? '取消置顶' : '置顶' }}
            </el-button>
            <el-button 
              :type="post.isFeatured ? 'warning' : 'default'"
              size="small"
              @click="toggleFeature"
            >
              {{ post.isFeatured ? '取消精华' : '设为精华' }}
            </el-button>
          </div>

          <div class="author-actions" v-if="userStore.user && userStore.user.id === post.userId">
            <el-button size="small" @click="editPost">编辑</el-button>
            <el-button size="small" type="danger" @click="deletePost">删除</el-button>
          </div>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="comments-section">
        <div class="comments-header">
          <h3>评论 ({{ post?.commentCount || 0 }})</h3>
        </div>

        <!-- 发表评论 -->
        <div v-if="userStore.isLoggedIn" class="comment-form">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
            maxlength="500"
            show-word-limit
          />
          <div class="comment-actions">
            <el-button 
              type="primary" 
              :loading="commenting"
              @click="submitComment"
            >
              发表评论
            </el-button>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comments-list">
          <comment-item
            v-for="comment in comments"
            :key="comment.commentId"
            :comment="comment"
            :post-id="route.params.id"
            @reply="handleCommentReply"
            @delete="handleCommentDelete"
            @like="handleCommentLike"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePostStore } from '@/stores/post'
import { useUserStore } from '@/stores/user'
import { commentApi } from '@/api/comment'
import { adminApi } from '@/api/admin'
import { formatTime, formatNumber } from '@/utils'
import CommentItem from '@/components/CommentItem.vue'

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const comments = ref([])
const newComment = ref('')
const commenting = ref(false)
const liked = ref(false)

// 直接使用postStore中的currentPost
const post = computed(() => postStore.currentPost)

// 获取帖子详情
const fetchPost = async () => {
  loading.value = true
  try {
    const result = await postStore.fetchPost(route.params.id)
    if (!result.success) {
      ElMessage.error(result.message)
      router.push('/404')
    }
  } finally {
    loading.value = false
  }
}

// 获取评论列表（只获取顶级评论）
const fetchComments = async () => {
  try {
    const response = await commentApi.getPostComments(route.params.id)
    if (response.code === 200) {
      // 只显示顶级评论（没有父评论的评论）
      const allComments = response.data || []
      comments.value = allComments.filter(comment => !comment.parentCommentId)
    }
  } catch (error) {
    console.error('Fetch comments error:', error)
  }
}

// 点赞帖子
const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const result = await postStore.likePost(post.value.id)
    if (result.success) {
      liked.value = true
      // 不需要手动更新点赞数，postStore.likePost已经处理了
      ElMessage.success('点赞成功')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('点赞失败')
  }
}

// 发表评论
const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.error('请输入评论内容')
    return
  }

  commenting.value = true
  try {
    const response = await commentApi.createComment({
      postId: parseInt(route.params.id),
      content: newComment.value.trim()
    })
    
    if (response.code === 200) {
      ElMessage.success('评论成功')
      newComment.value = ''
      fetchComments() // 重新获取评论列表
      // 更新帖子评论数
      if (post.value) {
        post.value.commentCount = (post.value.commentCount || 0) + 1
      }
    } else {
      ElMessage.error(response.message || '评论失败')
    }
  } catch (error) {
    ElMessage.error('评论失败')
  } finally {
    commenting.value = false
  }
}

// 处理评论回复
const handleCommentReply = () => {
  // 重新获取评论列表以显示新回复
  fetchComments()
  // 更新帖子评论数
  if (post.value) {
    post.value.commentCount = (post.value.commentCount || 0) + 1
  }
}

// 处理评论删除
const handleCommentDelete = (commentId) => {
  // 从评论列表中移除已删除的评论
  const index = comments.value.findIndex(c => c.commentId === commentId)
  if (index !== -1) {
    comments.value.splice(index, 1)
    // 更新帖子评论数
    if (post.value) {
      post.value.commentCount = Math.max(0, (post.value.commentCount || 0) - 1)
    }
  }
}

// 处理评论点赞
const handleCommentLike = (commentId) => {
  // 评论组件内部已处理点赞逻辑，这里可以做额外处理
  console.log('评论点赞:', commentId)
}

// 编辑帖子
const editPost = () => {
  router.push(`/post/${post.value.id}/edit`)
}

// 删除帖子
const deletePost = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个帖子吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const result = await postStore.deletePost(post.value.id)
    if (result.success) {
      ElMessage.success('删除成功')
      router.push('/')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    // 用户取消删除
  }
}

// 置顶/取消置顶
const togglePin = async () => {
  try {
    const newPinnedStatus = !post.value.isPinned
    const response = await adminApi.setPostPinned(post.value.id, newPinnedStatus)

    if (response.code === 200) {
      post.value.isPinned = newPinnedStatus ? 1 : 0
      ElMessage.success(newPinnedStatus ? '置顶成功' : '取消置顶成功')
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 精华/取消精华
const toggleFeature = async () => {
  try {
    const newFeaturedStatus = !post.value.isFeatured
    const response = await adminApi.setPostFeatured(post.value.id, newFeaturedStatus)

    if (response.code === 200) {
      post.value.isFeatured = newFeaturedStatus ? 1 : 0
      ElMessage.success(newFeaturedStatus ? '设为精华成功' : '取消精华成功')
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(async () => {
  await fetchPost()
  await fetchComments()
})
</script>

<style scoped>
.post-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.post-content {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.post-header {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.post-title {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-meta {
  display: flex;
  gap: 20px;
  color: #999;
  font-size: 14px;
}

.post-author {
  color: #409eff !important;
  font-weight: 500;
}

.post-body {
  margin-bottom: 30px;
}

.post-text {
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
}

.post-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.admin-actions,
.author-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.comments-section {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.comments-header h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.comment-form {
  margin-bottom: 30px;
}

.comment-actions {
  margin-top: 10px;
  text-align: right;
}


</style>
