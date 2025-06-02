<template>
  <div class="user-profile-page">
    <div class="profile-header">
      <h1>个人中心</h1>
    </div>

    <div class="profile-content">
      <!-- 用户信息卡片 -->
      <div class="user-info-card">
        <h2>基本信息</h2>
        <div class="user-info">
          <div class="info-item">
            <label>用户名：</label>
            <span>{{ userStore.user?.name || '未设置' }}</span>
          </div>
          <div class="info-item">
            <label>邮箱：</label>
            <span>{{ userStore.user?.email || '未设置' }}</span>
          </div>
          <div class="info-item">
            <label>联系方式：</label>
            <span>{{ userStore.user?.contact || '未设置' }}</span>
          </div>
          <div class="info-item">
            <label>职业类型：</label>
            <span>{{ userStore.user?.jobType || '未设置' }}</span>
          </div>
          <div class="info-item">
            <label>工作地点：</label>
            <span>{{ userStore.user?.jobLocation || '未设置' }}</span>
          </div>
          <div class="info-item">
            <label>当前积分：</label>
            <span class="points">{{ userStore.user?.userPoint || 0 }}</span>
          </div>
          <div class="info-item">
            <label>注册时间：</label>
            <span>{{ formatTime(userStore.user?.createdAt) }}</span>
          </div>
          <div class="info-item">
            <label>最后签到：</label>
            <span>{{ userStore.user?.lastCheckInDate || '未签到' }}</span>
          </div>
        </div>
        <div class="actions">
          <el-button type="primary" @click="showEditDialog = true">编辑资料</el-button>
          <el-button type="success" @click="handleCheckin" :loading="checkinLoading">
            每日签到
          </el-button>
        </div>
      </div>

      <!-- 我的帖子 -->
      <div class="my-posts-card">
        <h2>我的帖子</h2>
        <div v-loading="postsLoading" class="posts-list">
          <div 
            v-for="post in myPosts" 
            :key="post.id"
            class="post-item"
            @click="goToPost(post.id)"
          >
            <div class="post-title">
              <el-tag v-if="post.isPinned" type="danger" size="small">置顶</el-tag>
              <el-tag v-if="post.isFeatured" type="warning" size="small">精华</el-tag>
              <el-tag v-if="post.isHelp" type="success" size="small">
                求助{{ post.helpPoints ? `(${post.helpPoints}积分)` : '' }}
              </el-tag>
              {{ post.title }}
            </div>
            <div class="post-meta">
              <span>{{ formatTime(post.createdAt) }}</span>
              <span>浏览 {{ post.viewCount || 0 }}</span>
              <span>评论 {{ post.commentCount || 0 }}</span>
              <span>点赞 {{ post.likeCount || 0 }}</span>
            </div>
          </div>
          
          <div v-if="!postsLoading && myPosts.length === 0" class="empty-state">
            <p>还没有发布过帖子</p>
            <el-button type="primary" @click="goToCreatePost">发布第一个帖子</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑资料" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.name" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input v-model="editForm.contact" placeholder="请输入联系方式" />
        </el-form-item>
        <el-form-item label="职业类型">
          <el-input v-model="editForm.jobType" placeholder="请输入职业类型" />
        </el-form-item>
        <el-form-item label="工作地点">
          <el-input v-model="editForm.jobLocation" placeholder="请输入工作地点" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="updating" @click="handleUpdateProfile">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { postApi } from '@/api/post'
import { formatTime } from '@/utils'

const router = useRouter()
const userStore = useUserStore()

// 状态
const showEditDialog = ref(false)
const checkinLoading = ref(false)
const updating = ref(false)
const postsLoading = ref(false)
const myPosts = ref([])

// 编辑表单
const editForm = reactive({
  name: '',
  contact: '',
  jobType: '',
  jobLocation: ''
})

// 获取我的帖子
const fetchMyPosts = async () => {
  if (!userStore.user?.id) return
  
  postsLoading.value = true
  try {
    const response = await postApi.getUserPosts(userStore.user.id, { page: 1, size: 10 })
    if (response.code === 200 && response.data) {
      myPosts.value = response.data.records || []
    }
  } catch (error) {
    console.error('获取我的帖子失败:', error)
  } finally {
    postsLoading.value = false
  }
}

// 签到
const handleCheckin = async () => {
  checkinLoading.value = true
  try {
    const result = await userStore.checkin()
    if (result.success) {
      ElMessage.success('签到成功！获得积分奖励')
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    checkinLoading.value = false
  }
}

// 编辑资料
const handleUpdateProfile = async () => {
  updating.value = true
  try {
    const result = await userStore.updateProfile(editForm)
    if (result.success) {
      ElMessage.success('更新成功')
      showEditDialog.value = false
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    updating.value = false
  }
}

// 跳转到帖子详情
const goToPost = (postId) => {
  router.push(`/post/${postId}`)
}

// 跳转到发布帖子
const goToCreatePost = () => {
  router.push('/post/create')
}

// 初始化编辑表单
const initEditForm = () => {
  if (userStore.user) {
    editForm.name = userStore.user.name || ''
    editForm.contact = userStore.user.contact || ''
    editForm.jobType = userStore.user.jobType || ''
    editForm.jobLocation = userStore.user.jobLocation || ''
  }
}

onMounted(async () => {
  // 确保用户信息已加载
  if (!userStore.user) {
    await userStore.fetchUserProfile()
  }
  initEditForm()
  await fetchMyPosts()
})
</script>

<style scoped>
.user-profile-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header h1 {
  margin: 0 0 30px 0;
  color: #333;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.user-info-card,
.my-posts-card {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.user-info-card h2,
.my-posts-card h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}

.info-item {
  display: flex;
  margin-bottom: 15px;
  align-items: center;
}

.info-item label {
  width: 100px;
  color: #666;
  font-weight: 500;
}

.info-item span {
  color: #333;
}

.points {
  color: #409eff;
  font-weight: bold;
}

.actions {
  margin-top: 30px;
  display: flex;
  gap: 15px;
}

.posts-list {
  min-height: 200px;
}

.post-item {
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.post-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
}

.post-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
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

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
}
</style>
