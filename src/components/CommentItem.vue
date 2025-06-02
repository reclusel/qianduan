<template>
  <div class="comment-item">
    <div class="comment-content">
      <div class="comment-meta">
        <span class="comment-author">
          {{ comment.userName || comment.authorName || `用户${comment.userId}` }}
          <span v-if="comment.parentCommentId && comment.replyToUserName" class="reply-to">
            回复 {{ comment.replyToUserName }}
          </span>
        </span>
        <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
      </div>
      <div class="comment-text">{{ comment.content }}</div>
      <div class="comment-actions">
        <el-button 
          size="small" 
          type="text"
          @click="handleLike"
        >
          <el-icon><Star /></el-icon>
          点赞 ({{ comment.upvotes || 0 }})
        </el-button>
        <el-button
          v-if="!isChild"
          size="small"
          type="text"
          @click="showReplyForm = !showReplyForm"
        >
          <el-icon><ChatDotRound /></el-icon>
          回复
        </el-button>
        <el-button 
          v-if="canDelete"
          size="small" 
          type="text"
          @click="handleDelete"
        >
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </div>
      
      <!-- 回复表单 -->
      <div v-if="showReplyForm" class="reply-form">
        <el-input
          v-model="replyContent"
          type="textarea"
          :rows="2"
          placeholder="写下你的回复..."
          maxlength="500"
          show-word-limit
        />
        <div class="reply-actions">
          <el-button size="small" @click="showReplyForm = false">取消</el-button>
          <el-button 
            size="small" 
            type="primary" 
            :loading="replying"
            @click="handleReply"
          >
            回复
          </el-button>
        </div>
      </div>
    </div>

    <!-- 子评论（楼中楼，平级显示） -->
    <div v-if="childComments.length > 0" class="child-comments">
      <comment-item
        v-for="childComment in childComments"
        :key="childComment.commentId"
        :comment="childComment"
        :post-id="postId"
        :is-child="true"
        @reply="$emit('reply', $event)"
        @delete="$emit('delete', $event)"
        @like="$emit('like', $event)"
      />
    </div>
    
    <!-- 加载更多子评论 -->
    <div v-if="!isChild && !childCommentsLoaded" class="load-more">
      <el-button
        size="small"
        type="text"
        :loading="loadingChildren"
        @click="loadChildComments"
      >
        查看回复
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star, ChatDotRound, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { commentApi } from '@/api/comment'
import { formatTime } from '@/utils'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  postId: {
    type: [Number, String],
    required: true
  },
  isChild: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['reply', 'delete', 'like'])

const userStore = useUserStore()

// 状态
const showReplyForm = ref(false)
const replyContent = ref('')
const replying = ref(false)
const childComments = ref([])
const childCommentsLoaded = ref(false)
const loadingChildren = ref(false)

// 计算属性
const canDelete = computed(() => {
  return userStore.isAdmin || (userStore.user && userStore.user.id === props.comment.userId)
})

// 点赞评论
const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const response = await commentApi.likeComment(props.comment.commentId)
    if (response.code === 200) {
      // 更新点赞数
      props.comment.upvotes = (props.comment.upvotes || 0) + 1
      ElMessage.success('点赞成功')
      emit('like', props.comment.commentId)
    } else {
      ElMessage.error(response.message || '点赞失败')
    }
  } catch (error) {
    ElMessage.error('点赞失败')
  }
}

// 回复评论
const handleReply = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  if (!replyContent.value.trim()) {
    ElMessage.error('请输入回复内容')
    return
  }

  replying.value = true
  try {
    const response = await commentApi.createComment({
      postId: parseInt(props.postId),
      content: replyContent.value.trim(),
      parentCommentId: props.comment.commentId
    })
    
    if (response.code === 200) {
      ElMessage.success('回复成功')
      replyContent.value = ''
      showReplyForm.value = false
      
      // 只有顶级评论重新加载子评论以显示新回复
      if (!props.isChild) {
        await loadChildComments(true) // 强制重新加载
      }

      emit('reply', response.data)
    } else {
      ElMessage.error(response.message || '回复失败')
    }
  } catch (error) {
    ElMessage.error('回复失败')
  } finally {
    replying.value = false
  }
}

// 删除评论
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await commentApi.deleteComment(props.comment.commentId)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      emit('delete', props.comment.commentId)
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    // 用户取消删除
  }
}

// 加载子评论（只有顶级评论才加载）
const loadChildComments = async (forceReload = false) => {
  // 只有顶级评论才加载子评论
  if (props.isChild) return

  // 如果已经加载过且不是强制重新加载，则跳过
  if (childCommentsLoaded.value && !forceReload) return

  loadingChildren.value = true
  try {
    const response = await commentApi.getChildComments(props.comment.commentId)
    if (response.code === 200) {
      childComments.value = response.data || []
      childCommentsLoaded.value = true
    }
  } catch (error) {
    console.error('加载子评论失败:', error)
  } finally {
    loadingChildren.value = false
  }
}

// 只有顶级评论自动加载子评论
onMounted(() => {
  if (!props.isChild) {
    loadChildComments()
  }
})
</script>

<style scoped>
.comment-item {
  margin-bottom: 15px;
}

.comment-content {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.comment-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 8px;
  color: #999;
  font-size: 12px;
}

.comment-author {
  font-weight: 500;
  color: #409eff;
}

.comment-text {
  color: #333;
  line-height: 1.6;
  margin-bottom: 10px;
  white-space: pre-wrap;
}

.comment-actions {
  display: flex;
  gap: 15px;
}

.reply-form {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}

.reply-actions {
  margin-top: 10px;
  text-align: right;
}

.child-comments {
  margin-left: 40px;
  margin-top: 15px;
  border-left: 3px solid #409eff;
  padding-left: 20px;
  background: rgba(64, 158, 255, 0.05);
  border-radius: 0 8px 8px 0;
}

.child-comments .comment-content {
  background: #fff;
  border: 1px solid #e4e7ed;
}

.reply-to {
  color: #409eff;
  font-weight: normal;
  margin-left: 5px;
}

.load-more {
  margin-left: 30px;
  margin-top: 10px;
}
</style>
