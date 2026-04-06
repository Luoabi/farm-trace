import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';
import { ElMessage } from 'element-plus';

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      requiresAuth: false,
      title: '登录'
    }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: {
          title: '驾驶舱',
          roles: ['超级管理员', '农户', '操作员'],
          icon: 'DataAnalysis'
        }
      },
      {
        path: 'batches',
        name: 'Batches',
        component: () => import('../views/BatchManagement.vue'),
        meta: {
          title: '批次管理',
          roles: ['超级管理员', '农户', '操作员'],
          icon: 'Box'
        }
      },
      {
        path: 'growth-records',
        name: 'GrowthRecords',
        component: () => import('../views/GrowthRecordManagement.vue'),
        meta: {
          title: '生长记录',
          roles: ['超级管理员', '农户', '操作员'],
          icon: 'Histogram'
        }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('../views/ProductManagement.vue'),
        meta: {
          title: '商品管理',
          roles: ['超级管理员', '农户', '操作员'],
          icon: 'ShoppingCart'
        }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/OrderManagement.vue'),
        meta: {
          title: '订单管理',
          roles: ['超级管理员', '农户', '操作员'],
          icon: 'Document'
        }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/UserManagement.vue'),
        meta: {
          title: '用户管理',
          roles: ['超级管理员', '农户'],
          icon: 'User'
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/UserProfile.vue'),
        meta: {
          title: '个人中心',
          roles: ['超级管理员', '农户', '操作员'],
          icon: 'UserFilled'
        }
      },
      {
        path: 'system',
        name: 'System',
        component: () => import('../views/SystemManagement.vue'),
        meta: {
          title: '系统管理',
          roles: ['超级管理员'],
          icon: 'Setting'
        }
      },
      {
        path: 'api-test',
        name: 'ApiTest',
        component: () => import('../views/ApiTest.vue'),
        meta: {
          title: 'API测试',
          roles: ['超级管理员'],
          icon: 'Connection',
          hidden: true,// 不在菜单中显示
          requiresAuth: true
        }
      }
    ]
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '页面未找到' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 白名单 - 不需要登录就能访问的页面
const whiteList = ['/login'];

// 路由守卫
router.beforeEach(async (to, from, next) => {
  console.log('=== 路由守卫触发 ===');
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 西昌农产品溯源系统` : '西昌农产品溯源系统';

  // 获取 token
  const token = store.state.token || localStorage.getItem('token');
  // console.log('Token 存在:', !!token);

  // 判断是否需要登录
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false);
  // console.log('需要认证:', requiresAuth);

  if (token) {
    // 已登录
    console.log('用户已登录');
    
    if (to.path === '/login') {
      // 如果已登录，访问登录页则跳转到首页
      // console.log('已登录用户访问登录页，重定向到首页');
      next({ path: '/' });
    } else {
      // 检查是否有用户信息
      const userInfo = store.state.user.info;
      // console.log('Store 中的用户信息:', userInfo);

      if (!userInfo.id) {
        // 如果没有用户信息，尝试从 localStorage 恢复
        const savedUserInfo = localStorage.getItem('userInfo');
        
        if (savedUserInfo) {
          try {
            const parsedUserInfo = JSON.parse(savedUserInfo);
            store.commit('user/SET_USER', parsedUserInfo);

            // 验证权限后继续
            checkPermissionAndNext(to, next, parsedUserInfo);
          } catch (error) {
            // 清除无效数据，跳转登录
            handleLogout(next);
          }
        } else {
          // 没有用户信息，跳转登录
          handleLogout(next);
        }
      } else {
        // 有用户信息，验证权限
        checkPermissionAndNext(to, next, userInfo);
      }
    }
  } else {
    // 未登录
    console.log('用户未登录');
    if (whiteList.includes(to.path)) {
      // 在白名单中，直接放行
      next();
    } else {
      // 不在白名单中，跳转登录
      ElMessage.warning('请先登录');
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 保存目标路由，登录后跳转
      });
    }
  }
});

// 检查权限并决定是否放行
function checkPermissionAndNext(to, next, userInfo) {
  // 检查路由是否配置了角色要求
  if (to.meta.roles && to.meta.roles.length > 0) {
    // 检查用户角色是否有权限访问
    const hasPermission = to.meta.roles.includes(userInfo.role);
    
    if (hasPermission) {
      next();
    } else {
      // 无权限
      ElMessage.error('您没有权限访问该页面');
      next({ path: '/' });
    }
  } else {
    // 没有配置角色要求，所有登录用户都可以访问
    console.log('✓ 路由未配置角色限制，允许访问');
    next();
  }
}

// 处理登出
function handleLogout(next) {
  store.dispatch('user/logout');
  next({
    path: '/login',
    replace: true
  });
}

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error);
  ElMessage.error('页面加载失败，请刷新重试');
});

export default router;