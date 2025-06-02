<template>
  <div class="post-list-page">
    <!-- 只在特定板块页面显示页面标题 -->
    <div v-if="currentSection" class="page-header">
      <div class="header-left">
        <h1>{{ currentSection.name }}</h1>
        <p class="section-description">
          {{ currentSection.description }}
        </p>
      </div>
      <div class="header-actions">
        <el-button
          v-if="userStore.isLoggedIn"
          type="primary"
          @click="goToCreatePost"
        >
          发布帖子
        </el-button>
      </div>
    </div>

    <!-- 在首页时只显示发布帖子按钮 -->
    <div v-else class="home-header-actions">
      <el-button
        v-if="userStore.isLoggedIn"
        type="primary"
        @click="goToCreatePost"
      >
        发布帖子
      </el-button>
    </div>

    <!-- 帖子列表 -->
    <div class="post-list" v-loading="postStore.loading">
      <div 
        v-for="post in postStore.posts" 
        :key="post.id"
        class="post-item"
        @click="goToPost(post.id)"
      >
        <div class="post-content">
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
        <div class="post-actions" v-if="userStore.isAdmin || (userStore.user && userStore.user.id === post.userId)">
          <el-button size="small" type="text" @click.stop="editPost(post)">编辑</el-button>
          <el-button size="small" type="text" @click.stop="deletePost(post.id)">删除</el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!postStore.loading && postStore.posts.length === 0" class="empty-state">
        <p>暂无帖子</p>
        <el-button v-if="userStore.isLoggedIn" type="primary" @click="goToCreatePost">
          发布第一个帖子
        </el-button>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="postStore.pagination.total > 0">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="postStore.pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePostStore } from '@/stores/post'
import { useSectionStore } from '@/stores/section'
import { useUserStore } from '@/stores/user'
import { formatTime, formatNumber, truncateText } from '@/utils'

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()
const sectionStore = useSectionStore()
const userStore = useUserStore()

// 当前版块
const currentSection = ref(null)

// 筛选器
const filters = reactive({
  sectionId: route.params.sectionId || ''
})

// 分页
const pagination = reactive({
  current: 1,
  size: 10
})

// 获取帖子列表
const fetchPosts = async () => {
  const params = {
    page: pagination.current,
    size: pagination.size
  }
  
  if (filters.sectionId) {
    params.sectionId = filters.sectionId
  }

  const result = await postStore.fetchPosts(params)
  if (!result.success) {
    ElMessage.error(result.message)
  }
}

// 获取版块信息
const fetchSectionInfo = async () => {
  if (route.params.sectionId) {
    const result = await sectionStore.fetchSection(route.params.sectionId)
    if (result.success) {
      currentSection.value = result.data
    }
  } else {
    // 在首页时清空当前版块信息
    currentSection.value = null
  }
}

// 跳转到帖子详情
const goToPost = (postId) => {
  router.push(`/post/${postId}`)
}

// 跳转到发布帖子页面
const goToCreatePost = () => {
  const query = filters.sectionId ? { sectionId: filters.sectionId } : {}
  router.push({ path: '/post/create', query })
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
      fetchPosts() // 重新获取列表
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    // 用户取消删除
  }
}

// 筛选器变化（已移除筛选器，保留函数以防其他地方调用）
const handleFilterChange = () => {
  pagination.current = 1
  fetchPosts()
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  fetchPosts()
}

const handleCurrentChange = (current) => {
  pagination.current = current
  fetchPosts()
}

// 监听路由变化
watch(() => route.params.sectionId, (newSectionId) => {
  filters.sectionId = newSectionId || ''
  pagination.current = 1
  fetchSectionInfo()
  fetchPosts()
})

onMounted(async () => {
  // 获取当前版块信息（如果在特定版块页面）
  await fetchSectionInfo()
  // 获取帖子列表
  await fetchPosts()
})
</script>

<style scoped>
.post-list-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-left h1 {
  margin: 0 0 10px 0;
  color: #333;
}

.section-description {
  color: #666;
  margin: 0;
}

.home-header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
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
  cursor: pointer;
  transition: all 0.3s;
  background: #fff;
}

.post-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.post-content {
  flex: 1;
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
