<template>
  <div class="edit-post-page">
    <div class="page-header">
      <h1>编辑帖子</h1>
      <el-button @click="goBack">返回</el-button>
    </div>

    <div class="post-form" v-loading="loading">
      <el-form :model="form" label-width="100px" size="large">
        <el-form-item label="版块" required>
          <el-select 
            v-model="form.sectionId" 
            placeholder="请选择版块"
            style="width: 100%"
          >
            <el-option 
              v-for="section in sectionStore.sections" 
              :key="section.id"
              :label="section.name" 
              :value="section.id" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="帖子类型">
          <el-radio-group v-model="form.isHelp">
            <el-radio :label="0">普通帖子</el-radio>
            <el-radio :label="1">求助帖子</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="form.isHelp" label="悬赏积分">
          <el-input-number 
            v-model="form.helpPoints" 
            :min="0" 
            :max="userStore.user?.userPoint || 0"
            placeholder="设置悬赏积分"
          />
          <span class="help-text">（当前积分：{{ userStore.user?.userPoint || 0 }}）</span>
        </el-form-item>

        <el-form-item label="标题" required>
          <el-input 
            v-model="form.title" 
            placeholder="请输入帖子标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="内容" required>
          <el-input 
            v-model="form.content" 
            type="textarea" 
            :rows="10"
            placeholder="请输入帖子内容"
            maxlength="5000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            保存修改
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePostStore } from '@/stores/post'
import { useSectionStore } from '@/stores/section'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()
const sectionStore = useSectionStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const submitting = ref(false)

// 表单数据
const form = reactive({
  sectionId: '',
  title: '',
  content: '',
  isHelp: 0,
  helpPoints: 0
})

// 获取帖子详情
const fetchPost = async () => {
  loading.value = true
  try {
    const result = await postStore.fetchPost(route.params.id)
    if (result.success) {
      const post = result.data
      // 检查是否是当前用户的帖子
      if (post.userId !== userStore.user?.id && !userStore.isAdmin) {
        ElMessage.error('您没有权限编辑此帖子')
        router.push('/')
        return
      }
      
      // 填充表单
      form.sectionId = post.sectionId
      form.title = post.title
      form.content = post.content
      form.isHelp = post.isHelp || 0
      form.helpPoints = post.helpPoints || 0
    } else {
      ElMessage.error(result.message)
      router.push('/404')
    }
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  // 表单验证
  if (!form.sectionId) {
    ElMessage.error('请选择版块')
    return
  }
  if (!form.title.trim()) {
    ElMessage.error('请输入标题')
    return
  }
  if (!form.content.trim()) {
    ElMessage.error('请输入内容')
    return
  }

  submitting.value = true
  try {
    const result = await postStore.updatePost(route.params.id, {
      sectionId: form.sectionId,
      title: form.title.trim(),
      content: form.content.trim(),
      isHelp: form.isHelp,
      helpPoints: form.isHelp ? form.helpPoints : 0
    })

    if (result.success) {
      ElMessage.success('修改成功')
      router.push(`/post/${route.params.id}`)
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    submitting.value = false
  }
}

// 返回
const goBack = () => {
  router.go(-1)
}

onMounted(async () => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.error('请先登录')
    router.push('/')
    return
  }

  // 获取版块列表
  await sectionStore.fetchSections()
  // 获取帖子详情
  await fetchPost()
})
</script>

<style scoped>
.edit-post-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
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

.post-form {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.help-text {
  margin-left: 10px;
  color: #999;
  font-size: 12px;
}
</style>
