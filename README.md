# BBS论坛前端项目

这是一个基于Vue 3 + Element Plus的BBS论坛前端项目，实现了完整的论坛功能。

## 功能特性

### 用户功能
- ✅ 用户注册/登录
- ✅ 用户资料管理
- ✅ 用户签到系统
- ✅ 积分系统

### 版块功能
- ✅ 版块列表展示
- ✅ 版块创建/编辑/删除（管理员）
- ✅ 按版块浏览帖子

### 帖子功能
- ✅ 帖子列表展示
- ✅ 帖子详情查看
- ✅ 发布帖子
- ✅ 编辑/删除帖子
- ✅ 帖子点赞
- ✅ 帖子置顶/精华（管理员）
- ✅ 求助帖子标记

### 评论功能
- ✅ 评论发表
- ✅ 评论点赞
- ✅ 评论删除
- ✅ 楼中楼回复（二级回复）
- ✅ 回复关系显示

### 管理功能
- ✅ 帖子管理（置顶/精华）
- ✅ 用户积分管理
- ✅ 版块管理

### 个人中心
- ✅ 我的帖子管理
- ✅ 帖子编辑/删除
- ✅ 个人资料编辑
- ✅ 每日签到

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **HTTP客户端**: Axios
- **构建工具**: Vite
- **开发语言**: JavaScript

## 项目结构

```
src/
├── api/                    # API接口封装
│   ├── request.js         # Axios配置和拦截器
│   ├── user.js            # 用户相关API
│   ├── section.js         # 版块相关API
│   ├── post.js            # 帖子相关API
│   ├── comment.js         # 评论相关API
│   ├── admin.js           # 管理员相关API
│   └── index.js           # API统一导出
├── components/             # 公共组件
│   ├── LoginForm.vue      # 登录表单组件
│   ├── RegisterForm.vue   # 注册表单组件
│   └── CommentItem.vue    # 评论项组件（支持楼中楼）
├── config/                # 配置文件
│   └── index.js           # 应用配置（API地址、超时等）
├── stores/                # Pinia状态管理
│   ├── user.js            # 用户状态管理
│   ├── section.js         # 版块状态管理
│   └── post.js            # 帖子状态管理
├── utils/                 # 工具函数
│   └── index.js           # 通用工具函数（时间格式化、数字格式化等）
├── views/                 # 页面组件
│   ├── HomePage.vue       # 主页布局（导航栏+内容区）
│   ├── LoginPage.vue      # 登录页面
│   ├── SectionListPage.vue # 版块列表页面
│   ├── PostListPage.vue   # 帖子列表页面
│   ├── PostDetailPage.vue # 帖子详情页面
│   ├── CreatePostPage.vue # 发布帖子页面
│   ├── EditPostPage.vue   # 编辑帖子页面
│   ├── MyPostsPage.vue    # 我的帖子页面
│   ├── UserProfilePage.vue # 用户个人中心
│   ├── AdminPage.vue      # 管理后台
│   ├── NotFoundPage.vue   # 404页面
│   └── test.vue           # 测试页面
├── router/                # 路由配置
│   └── index.js           # 路由定义和守卫
├── assets/                # 静态资源
│   ├── i1.png            # 图片资源
│   ├── xhxx_i1.png       # 图片资源
│   └── 校徽.svg           # 校徽图标
├── App.vue                # 根组件
└── main.js                # 应用入口文件
```
