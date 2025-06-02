<template>
  <div class="common-layout">
    <el-container class="home-page-el-container">
      <el-header class="home-page-header">
        <el-menu :default-active="activeIndex" :ellipsis="false" class="el-menu-demo" mode="horizontal"
          @select="handleMenuSelect" text-color="#333" active-text-color="#ffd04b" router>
          <el-menu-item index="/">
            <img style="height: 100px; width: auto; vertical-align: middle;" :src="logo" alt="校徽" />
          </el-menu-item>
          <!-- 板块菜单项，自然向右排列 -->
          <el-menu-item
            v-for="section in sectionStore.sections"
            :key="section.id"
            :index="`/section/${section.id}`"
          >
            {{ section.name }}
          </el-menu-item>
        </el-menu>

        <!-- 用户未登录时显示登录注册按钮 -->
        <div v-if="!userStore.isLoggedIn" class="header-actions">
          <el-button type="primary" @click="openLoginDialog">登录</el-button>
          <el-button type="primary" @click="openRegisterDialog">注册</el-button>
        </div>

        <!-- 用户已登录时显示用户信息和操作 -->
        <div v-else class="header-actions">
          <el-button type="success" @click="handleCheckin" :loading="checkinLoading">
            签到
          </el-button>
          <el-dropdown @command="handleUserCommand">
            <span class="user-info">
              <span>{{ userStore.user?.name || '用户' }}</span>
              <span class="user-points">({{ userStore.user?.userPoint || 0 }}积分)</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="my-posts">我的帖子</el-dropdown-item>
                <el-dropdown-item v-if="userStore.isAdmin" command="admin">管理后台</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="home-page-main">
        <router-view />
      </el-main>
    </el-container>
  </div>

  <!-- 登录对话框 -->
  <el-dialog v-model="loginDialogVisible" :show-close="false" width="500" >
  <LoginForm
    v-if="loginDialogVisible"
    @close="closeLoginDialog"
    @switch-register="handleSwitchToRegister"
  />
</el-dialog>

  <!-- 注册对话框 -->
  <el-dialog v-model="registerDialogVisible" :show-close="false" width="500px">
    <RegisterForm
      v-if="registerDialogVisible"
      @close="closeRegisterDialog"
      @switch-login="handleSwitchToLogin"
    />
  </el-dialog>
</template>

<script setup>
import logo from '@/assets/校徽.svg';
import LoginForm from '@/components/LoginForm.vue'; // 引入登录表单组件
import RegisterForm from '@/components/RegisterForm.vue'; // 引入注册表单组件
import { ArrowDown } from '@element-plus/icons-vue';

import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { useSectionStore } from '@/stores/section';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const sectionStore = useSectionStore();

// activeIndex 用于el-menu高亮当前路由对应的菜单项
const activeIndex = ref(route.path);

// 监听路由变化，确保菜单高亮状态与当前路由同步
watch(
  () => route.path,
  (newPath) => {
    activeIndex.value = newPath;
  }
);

// 控制登录对话框的显示状态
const loginDialogVisible = ref(false);
// 控制注册对话框的显示状态
const registerDialogVisible = ref(false);
// 签到加载状态
const checkinLoading = ref(false);

const openLoginDialog = () => {
  loginDialogVisible.value = true;
};

const closeLoginDialog = () => {
  loginDialogVisible.value = false;
};

const openRegisterDialog = () => {
  registerDialogVisible.value = true;
};

const closeRegisterDialog = () => {
  registerDialogVisible.value = false;
};

const handleSwitchToRegister = () => {
  closeLoginDialog()
  openRegisterDialog()
}

const handleSwitchToLogin = () => {
  closeRegisterDialog()
  openLoginDialog()
}

// 处理用户下拉菜单命令
const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      // 跳转到个人资料页面
      router.push('/profile')
      break
    case 'my-posts':
      // 跳转到我的帖子页面
      router.push('/my-posts')
      break
    case 'admin':
      // 跳转到管理后台
      router.push('/admin')
      break
    case 'logout':
      // 退出登录
      userStore.logout()
      ElMessage.success('已退出登录')
      break
  }
}

// 处理签到
const handleCheckin = async () => {
  checkinLoading.value = true
  try {
    const result = await userStore.checkin()
    if (result.success) {
      ElMessage.success('签到成功！')
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    checkinLoading.value = false
  }
}

// 初始化用户信息和版块数据
onMounted(async () => {
  if (userStore.token && !userStore.user) {
    await userStore.initUser()
  }
  // 获取版块列表用于导航栏显示
  await sectionStore.fetchSections()
})


</script>

<style scoped>
.common-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.home-page-el-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.home-page-header {
  padding: 0;
  /* 移除el-header的默认padding，让el-menu更好地填充 */
  min-height: 100px;
  /* 设置header最小高度为100px，允许自动扩展 */
  line-height: 100px;
  /* 确保内容在header中垂直居中 */
  background-color: #ffffff;
  /* 给Header一个背景色 */
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  /* 允许内容换行 */
}

.el-menu-demo {
  --el-menu-horizontal-height: 100px;
  /* 设置菜单项高度为100px */
  background-color: #ffffff;
  border-bottom: none;
  flex: 1;
  /* 让菜单占据剩余空间 */
  overflow-x: auto;
  /* 如果菜单项太多，允许水平滚动 */
  white-space: nowrap;
  /* 防止菜单项换行 */
}

.header-actions {
  margin-left: auto;
  margin-right: 20px; /* 与右边缘的间距 */
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-points {
  color: #409eff;
  font-size: 12px;
}
.home-page-main {
  padding: 20px;
  flex-grow: 1;
  /* 让main区域占据剩余空间 */
  overflow-y: auto;
  /* 如果内容超出，则显示滚动条 */
  background-color: #f5f7fa;
  /* 浅灰色背景 */
}

/* 菜单项样式优化 */
.el-menu-demo .el-menu-item {
  flex-shrink: 0;
  /* 防止菜单项被压缩 */
}

/* 滚动条样式优化 */
.el-menu-demo::-webkit-scrollbar {
  height: 4px;
}

.el-menu-demo::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.el-menu-demo::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.el-menu-demo::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}


</style>
