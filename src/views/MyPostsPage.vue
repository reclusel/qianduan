<template>
  <div class="my-posts-page">
    <div class="page-header">
      <h1>我的帖子</h1>
      <el-button type="primary" @click="goToCreatePost">
        发布新帖子
      </el-button>
    </div>

    <!-- 帖子列表 -->
    <div class="post-list" v-loading="loading">
      <div 
        v-for="post in posts" 
        :key="post.id"
        class="post-item"
      >
        <div class="post-content" @click="goToPost(post.id)">
          <div class="post-header">
            <h3 class="post-title">
              <el-tag v-if="post.isPinned" type="danger" size="small">置顶</el-tag>
              <el-tag v-if="post.isFeatured" type="warning" size="small">精华</el-tag>
              <el-tag v-if="post.isHelp" type="success" size="small">
                求助{{ post.helpPoints ? `(${post.helpPoints}积分)` : '' }}
              </el-tag>
              {{ post.title }}
            </h3>
            <div class="post-meta">
              <span class="post-author">作者：{{ post.userName || post.authorName || `用户${post.userId}` }}</span>
              <span>{{ formatTime(post.createdAt) }}</span>
              <span>浏览 {{ formatNumber(post.viewCount) }}</span>
              <span>评论 {{ formatNumber(post.commentCount) }}</span>
              <span>点赞 {{ formatNumber(post.likeCount) }}</span>
            </div>
          </div>
          <p class="post-excerpt">{{ truncateText(post.content, 150) }}</p>
        </div>
        
        <!-- 操作按钮 -->
        <div class="post-actions">
          <el-button size="small" type="text" @click="editPost(post)">
            编辑
          </el-button>
          <el-button size="small" type="text" @click="deletePost(post.id)">
            删除
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && posts.length === 0" class="empty-state">
        <p>您还没有发布任何帖子</p>
        <el-button type="primary" @click="goToCreatePost">
          发布第一个帖子
        </el-button>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="pagination.total > 0">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePostStore } from '@/stores/post'
import { useUserStore } from '@/stores/user'
import { formatTime, formatNumber, truncateText } from '@/utils'

const router = useRouter()
const postStore = usePostStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const posts = ref([])

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 获取我的帖子列表
const fetchMyPosts = async () => {
  if (!userStore.user?.id) {
    ElMessage.error('请先登录')
    router.push('/')
    return
  }

  loading.value = true
  try {
    const result = await postStore.fetchUserPosts(userStore.user.id, {
      page: pagination.current,
      size: pagination.size
    })
    
    if (result.success) {
      posts.value = result.data.records || []
      pagination.total = result.data.total || 0
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    loading.value = false
  }
}

// 跳转到帖子详情
const goToPost = (postId) => {
  router.push(`/post/${postId}`)
}

// 跳转到发布帖子页面
const goToCreatePost = () => {
  router.push('/post/create')
}

// 编辑帖子
const editPost = (post) => {
  router.push(`/post/${post.id}/edit`)
}

// 删除帖子
const deletePost = async (postId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个帖子吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const result = await postStore.deletePost(postId)
    if (result.success) {
      ElMessage.success('删除成功')
      fetchMyPosts() // 重新获取列表
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    // 用户取消删除
  }
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  fetchMyPosts()
}

const handleCurrentChange = (current) => {
  pagination.current = current
  fetchMyPosts()
}

onMounted(() => {
  fetchMyPosts()
})
</script>

<style scoped>
.my-posts-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0;
  color: #333;
}

.post-list {
  min-height: 400px;
}

.post-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 15px;
  background: #fff;
  transition: all 0.3s;
}

.post-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.post-content {
  flex: 1;
  cursor: pointer;
}

.post-header {
  margin-bottom: 10px;
}

.post-title {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-meta {
  display: flex;
  gap: 15px;
  color: #999;
  font-size: 12px;
}

.post-author {
  color: #409eff !important;
  font-weight: 500;
}

.post-excerpt {
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.post-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style>
