import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";

import LoginPage from "@/views/LoginPage.vue";
import HomePage from "@/views/HomePage.vue";
import SectionListPage from "@/views/SectionListPage.vue";
import PostListPage from "@/views/PostListPage.vue";
import PostDetailPage from "@/views/PostDetailPage.vue";
import CreatePostPage from "@/views/CreatePostPage.vue";
import UserProfilePage from "@/views/UserProfilePage.vue";
import MyPostsPage from "@/views/MyPostsPage.vue";
import EditPostPage from "@/views/EditPostPage.vue";
import AdminPage from "@/views/AdminPage.vue";
import NotFoundPage from "@/views/NotFoundPage.vue";
import test from "@/views/test.vue";

const routes = [
    {
        path: '/',
        component: HomePage,
        children: [
            {
                path: '',
                component: PostListPage
            },
            {
                path: 'sections',
                component: SectionListPage
            },
            {
                path: 'section/:sectionId',
                component: PostListPage
            },
            {
                path: 'posts',
                component: PostListPage
            },
            {
                path: 'post/:id',
                component: PostDetailPage
            },
            {
                path: 'post/create',
                component: CreatePostPage
            },
            {
                path: 'post/:id/edit',
                component: EditPostPage,
                meta: { requiresAuth: true }
            },
            {
                path: 'profile',
                component: UserProfilePage
            },
            {
                path: 'my-posts',
                component: MyPostsPage,
                meta: { requiresAuth: true }
            },
            {
                path: 'admin',
                component: AdminPage,
                meta: { requiresAdmin: true }
            }
        ]
    },
    {path: '/login', component: LoginPage},
    {path: '/test', component: test},
    {path: '/404', component: NotFoundPage},
    {path: '/:pathMatch(.*)*', redirect: '/404'}
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();

    // 如果有token但没有用户信息，尝试获取用户信息
    if (userStore.token && !userStore.user) {
        await userStore.initUser();
    }

    // 检查是否需要登录
    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
        // 未登录，跳转到首页
        next('/');
        return;
    }

    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin) {
        if (!userStore.isLoggedIn) {
            // 未登录，跳转到登录页
            next('/login');
            return;
        }

        if (!userStore.isAdmin) {
            // 不是管理员，跳转到首页
            next('/');
            return;
        }
    }

    next();
});

export default router;