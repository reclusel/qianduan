<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>管理后台</h1>
    </div>

    <el-tabs v-model="activeTab" type="card">
      <!-- 版块管理 -->
      <el-tab-pane label="版块管理" name="sections">
        <div class="section-management">
          <div class="actions-bar">
            <el-button type="primary" @click="showCreateSectionDialog = true">
              创建版块
            </el-button>
          </div>
          
          <el-table :data="sectionStore.sections" v-loading="sectionStore.loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="版块名称" />
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="createdAt" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="editSection(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteSection(row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 帖子管理 -->
      <el-tab-pane label="帖子管理" name="posts">
        <div class="post-management">
          <el-table :data="posts" v-loading="postsLoading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="标题" min-width="200" />
            <el-table-column label="类型" width="120">
              <template #default="{ row }">
                <el-tag v-if="row.isPinned" type="danger" size="small">置顶</el-tag>
                <el-tag v-if="row.isFeatured" type="warning" size="small">精华</el-tag>
                <el-tag v-if="row.isHelp" type="success" size="small">求助</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="viewCount" label="浏览" width="80" />
            <el-table-column prop="commentCount" label="评论" width="80" />
            <el-table-column prop="likeCount" label="点赞" width="80" />
            <el-table-column prop="createdAt" label="发布时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button 
                  size="small" 
                  :type="row.isPinned ? 'danger' : 'default'"
                  @click="togglePostPin(row)"
                >
                  {{ row.isPinned ? '取消置顶' : '置顶' }}
                </el-button>
                <el-button 
                  size="small" 
                  :type="row.isFeatured ? 'warning' : 'default'"
                  @click="togglePostFeature(row)"
                >
                  {{ row.isFeatured ? '取消精华' : '精华' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="postPagination.current"
              v-model:page-size="postPagination.size"
              :total="postPagination.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handlePostSizeChange"
              @current-change="handlePostCurrentChange"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- 用户管理 -->
      <el-tab-pane label="用户管理" name="users">
        <div class="user-management">
          <p>用户管理功能待实现</p>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 创建版块对话框 -->
    <el-dialog v-model="showCreateSectionDialog" title="创建版块" width="500px">
      <el-form :model="sectionForm" label-width="80px">
        <el-form-item label="版块名称" required>
          <el-input v-model="sectionForm.name" placeholder="请输入版块名称" />
        </el-form-item>
        <el-form-item label="版块描述">
          <el-input 
            v-model="sectionForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入版块描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateSectionDialog = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreateSection">
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑版块对话框 -->
    <el-dialog v-model="showEditSectionDialog" title="编辑版块" width="500px">
      <el-form :model="editSectionForm" label-width="80px">
        <el-form-item label="版块名称" required>
          <el-input v-model="editSectionForm.name" placeholder="请输入版块名称" />
        </el-form-item>
        <el-form-item label="版块描述">
          <el-input 
            v-model="editSectionForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入版块描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditSectionDialog = false">取消</el-button>
        <el-button type="primary" :loading="editing" @click="handleEditSection">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSectionStore } from '@/stores/section'
import { usePostStore } from '@/stores/post'
import { adminApi } from '@/api/admin'
import { formatTime } from '@/utils'

const sectionStore = useSectionStore()
const postStore = usePostStore()

// 状态
const activeTab = ref('sections')
const showCreateSectionDialog = ref(false)
const showEditSectionDialog = ref(false)
const creating = ref(false)
const editing = ref(false)
const postsLoading = ref(false)
const posts = ref([])

// 分页
const postPagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 表单
const sectionForm = reactive({
  name: '',
  description: ''
})

const editSectionForm = reactive({
  id: null,
  name: '',
  description: ''
})

// 获取帖子列表
const fetchPosts = async () => {
  postsLoading.value = true
  try {
    const result = await postStore.fetchPosts({
      page: postPagination.current,
      size: postPagination.size
    })
    if (result.success) {
      posts.value = postStore.posts
      postPagination.total = postStore.pagination.total
    }
  } finally {
    postsLoading.value = false
  }
}

// 创建版块
const handleCreateSection = async () => {
  if (!sectionForm.name) {
    ElMessage.error('请输入版块名称')
    return
  }

  creating.value = true
  try {
    const result = await sectionStore.createSection(sectionForm)
    if (result.success) {
      ElMessage.success('创建成功')
      showCreateSectionDialog.value = false
      sectionForm.name = ''
      sectionForm.description = ''
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    creating.value = false
  }
}

// 编辑版块
const editSection = (section) => {
  editSectionForm.id = section.id
  editSectionForm.name = section.name
  editSectionForm.description = section.description || ''
  showEditSectionDialog.value = true
}

const handleEditSection = async () => {
  if (!editSectionForm.name) {
    ElMessage.error('请输入版块名称')
    return
  }

  editing.value = true
  try {
    const result = await sectionStore.updateSection(editSectionForm.id, {
      name: editSectionForm.name,
      description: editSectionForm.description
    })
    if (result.success) {
      ElMessage.success('更新成功')
      showEditSectionDialog.value = false
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    editing.value = false
  }
}

// 删除版块
const deleteSection = async (sectionId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个版块吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const result = await sectionStore.deleteSection(sectionId)
    if (result.success) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    // 用户取消删除
  }
}

// 切换帖子置顶状态
const togglePostPin = async (post) => {
  try {
    const newStatus = !post.isPinned
    const response = await adminApi.setPostPinned(post.id, newStatus)
    if (response.code === 200) {
      post.isPinned = newStatus ? 1 : 0
      ElMessage.success(newStatus ? '置顶成功' : '取消置顶成功')
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 切换帖子精华状态
const togglePostFeature = async (post) => {
  try {
    const newStatus = !post.isFeatured
    const response = await adminApi.setPostFeatured(post.id, newStatus)
    if (response.code === 200) {
      post.isFeatured = newStatus ? 1 : 0
      ElMessage.success(newStatus ? '设为精华成功' : '取消精华成功')
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 分页处理
const handlePostSizeChange = (size) => {
  postPagination.size = size
  postPagination.current = 1
  fetchPosts()
}

const handlePostCurrentChange = (current) => {
  postPagination.current = current
  fetchPosts()
}

onMounted(async () => {
  await sectionStore.fetchSections()
  await fetchPosts()
})
</script>

<style scoped>
.admin-page {
  padding: 20px;
}

.page-header h1 {
  margin: 0 0 30px 0;
  color: #333;
}

.actions-bar {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.user-management {
  padding: 40px;
  text-align: center;
  color: #999;
}
</style>
