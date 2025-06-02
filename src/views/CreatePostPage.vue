<template>
  <div class="create-post-page">
    <div class="page-header">
      <h1>发布帖子</h1>
      <el-button @click="goBack">返回</el-button>
    </div>

    <div class="post-form">
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

        <!-- 求助帖子的积分设置 -->
        <el-form-item v-if="form.isHelp === 1" label="悬赏积分">
          <el-input-number
            v-model="form.helpPoints"
            :min="0"
            :max="userStore.user?.userPoint || 0"
            placeholder="设置悬赏积分"
            style="width: 200px"
          />
          <span class="help-text">
            （当前积分：{{ userStore.user?.userPoint || 0 }}）
          </span>
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
          <el-button 
            type="primary" 
            :loading="submitting"
            @click="handleSubmit"
          >
            发布帖子
          </el-button>
          <el-button @click="handleReset">重置</el-button>
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

// 表单数据
const form = reactive({
  sectionId: parseInt(route.query.sectionId) || null,
  title: '',
  content: '',
  isHelp: 0,
  helpPoints: 0
})

const submitting = ref(false)

// 提交表单
const handleSubmit = async () => {
  // 验证登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }

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
    const postData = {
      sectionId: form.sectionId,
      title: form.title.trim(),
      content: form.content.trim(),
      isHelp: form.isHelp
    }

    // 如果是求助帖子，添加悬赏积分
    if (form.isHelp === 1 && form.helpPoints > 0) {
      postData.helpPoints = form.helpPoints
    }

    const result = await postStore.createPost(postData)

    if (result.success) {
      ElMessage.success('发布成功')
      // 跳转到帖子详情页
      if (result.data && result.data.id) {
        router.push(`/post/${result.data.id}`)
      } else {
        // 如果没有返回帖子ID，跳转到版块页面
        router.push(`/section/${form.sectionId}`)
      }
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  form.title = ''
  form.content = ''
  form.isHelp = 0
  form.helpPoints = 0
  // 保留版块选择
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

onMounted(async () => {
  // 获取版块列表
  await sectionStore.fetchSections()
})
</script>

<style scoped>
.create-post-page {
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
  color: #999;
  font-size: 12px;
  margin-left: 10px;
}
</style>
