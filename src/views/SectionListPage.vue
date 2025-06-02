<template>
  <div class="section-list-page">
    <div class="page-header">
      <h1>版块列表</h1>
      <el-button 
        v-if="userStore.isAdmin" 
        type="primary" 
        @click="showCreateDialog = true"
      >
        创建版块
      </el-button>
    </div>

    <div class="section-grid" v-loading="sectionStore.loading">
      <div 
        v-for="section in sectionStore.sections" 
        :key="section.id"
        class="section-card"
        @click="goToSection(section.id)"
      >
        <div class="section-header">
          <h3>{{ section.name }}</h3>
          <div v-if="userStore.isAdmin" class="admin-actions">
            <el-button 
              size="small" 
              type="text" 
              @click.stop="editSection(section)"
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="text" 
              @click.stop="deleteSection(section.id)"
            >
              删除
            </el-button>
          </div>
        </div>
        <p class="section-description">{{ section.description || '暂无描述' }}</p>
        <div class="section-meta">
          <span>创建时间：{{ formatTime(section.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- 创建版块对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建版块" width="500px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="版块名称" required>
          <el-input v-model="createForm.name" placeholder="请输入版块名称" />
        </el-form-item>
        <el-form-item label="版块描述">
          <el-input 
            v-model="createForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入版块描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreate">
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑版块对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑版块" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="版块名称" required>
          <el-input v-model="editForm.name" placeholder="请输入版块名称" />
        </el-form-item>
        <el-form-item label="版块描述">
          <el-input 
            v-model="editForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入版块描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="editing" @click="handleEdit">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSectionStore } from '@/stores/section'
import { useUserStore } from '@/stores/user'
import { formatTime } from '@/utils'

const router = useRouter()
const sectionStore = useSectionStore()
const userStore = useUserStore()

// 对话框状态
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const creating = ref(false)
const editing = ref(false)

// 表单数据
const createForm = reactive({
  name: '',
  description: ''
})

const editForm = reactive({
  id: null,
  name: '',
  description: ''
})

// 获取版块列表
const fetchSections = async () => {
  const result = await sectionStore.fetchSections()
  if (!result.success) {
    ElMessage.error(result.message)
  }
}

// 跳转到版块详情
const goToSection = (sectionId) => {
  router.push(`/section/${sectionId}`)
}

// 创建版块
const handleCreate = async () => {
  if (!createForm.name) {
    ElMessage.error('请输入版块名称')
    return
  }

  creating.value = true
  try {
    const result = await sectionStore.createSection(createForm)
    if (result.success) {
      ElMessage.success('创建成功')
      showCreateDialog.value = false
      // 重置表单
      createForm.name = ''
      createForm.description = ''
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    creating.value = false
  }
}

// 编辑版块
const editSection = (section) => {
  editForm.id = section.id
  editForm.name = section.name
  editForm.description = section.description || ''
  showEditDialog.value = true
}

const handleEdit = async () => {
  if (!editForm.name) {
    ElMessage.error('请输入版块名称')
    return
  }

  editing.value = true
  try {
    const result = await sectionStore.updateSection(editForm.id, {
      name: editForm.name,
      description: editForm.description
    })
    if (result.success) {
      ElMessage.success('更新成功')
      showEditDialog.value = false
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

onMounted(() => {
  fetchSections()
})
</script>

<style scoped>
.section-list-page {
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

.section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.section-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fff;
}

.section-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.admin-actions {
  display: flex;
  gap: 8px;
}

.section-description {
  color: #666;
  margin: 10px 0;
  line-height: 1.5;
}

.section-meta {
  color: #999;
  font-size: 12px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}
</style>
