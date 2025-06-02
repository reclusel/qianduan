<template>
    <el-header>
        <!-- 左侧logo和导航 -->
        <div class="left-section">
            <div class="gradient-logo">Easybbs</div>
            <el-menu mode="horizontal" 
            router :active-text-color="'#409EFF'" text-color="#333">
                <el-menu-item index="/">首页</el-menu-item>
                <el-menu-item index="/dev">Easybbs开发</el-menu-item>
                <el-menu-item index="/programmer">程序猿</el-menu-item>
                <el-menu-item index="/frontend">前端</el-menu-item>
                <el-menu-item index="/backend">后端</el-menu-item>
                <el-menu-item index="/community">社区管理</el-menu-item>
                <el-menu-item index="/source">论坛源码</el-menu-item>
            </el-menu>
        </div>

        <!-- 右侧操作区 -->
        <div class="right-actions">
            <el-button type="primary" plain round>发帖 +</el-button>
            <el-icon color="#409EFF" :size="20" class="search-icon">
                <Search />
            </el-icon>
            <el-button type="text" class="text-btn">登录</el-button>
            <el-button type="text" class="text-btn">注册</el-button>
        </div>
    </el-header>

    <el-main>
        <!-- 预留内容区域 -->
    </el-main>
</template>

<script setup>
import { ElHeader, ElMain, ElMenu, ElMenuItem, ElButton, ElIcon } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
</script>

<style scoped>
.el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px;
    height: 60px;
    border-bottom: 1px solid #eee;
}

.left-section {
    display: flex;
    align-items: center;
    gap: 40px;
}

.gradient-logo {
    font-size: 24px;
    font-weight: 800;
    background: linear-gradient(45deg, #409EFF, #67C23A, #E6A23C);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.el-menu {
    border: none;
    height: 60px;
}

.el-menu--horizontal {
    --el-menu-hover-bg-color: transparent;
}

:deep(.el-menu-item) {
    font-size: 16px;
    padding: 0 15px !important;
    height: 60px !important;
    line-height: 60px !important;
}

.right-actions {
    display: flex;
    align-items: center;
    gap: 25px;
}

.text-btn {
    color: #333 !important;
    font-size: 16px;
    padding: 8px 10px;
}

.search-icon {
    cursor: pointer;
    margin: 0 5px;
}

.el-button--primary.is-plain {
    padding: 8px 20px;
}
</style>