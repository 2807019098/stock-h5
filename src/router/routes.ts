import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/components/Layout/HeadMenu.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '股市前瞻',
          navType: 'main',
          keepAlive: true
        }
      },
      {
        path: 'message',
        name: 'message',
        component: () => import('@/views/message/index.vue'),
        meta: {
          title: '前沿资讯',
          navType: 'main',
          keepAlive: true
        }
      },
      {
        path: 'mystock',
        name: 'mystock',
        component: () => import('@/views/mystock/index.vue'),
        meta: {
          title: '我的自选',
          navType: 'main',
          keepAlive: true
        }
      },
      {
        path: 'mine',
        name: 'mine',
        component: () => import('@/views/mine/index.vue'),
        meta: {
          title: '个人中心',
          navType: 'main',
          keepAlive: true
        }
      },
      {
        path: 'help',
        name: 'help',
        component: () => import('@/views/help/index.vue'),
        meta: {
          title: '帮助中心',
          navType: 'main',
          keepAlive: true
        }
      }
    ]
  },
  {
    path: '/mysetting',
    name: 'mysetting',
    component: () => import('@/views/mysetting/index.vue'),
    meta: {
      title: '设置',
      navType: 'default',
      keepAlive: false
    }
  },
  {
    path: '/theme',
    name: 'theme',
    component: () => import('@/views/theme/index.vue'),
    meta: {
      title: '主题',
      navType: 'default',
      keepAlive: false
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      navType: 'default',
      keepAlive: false
    }
  },
  {
    path: '/:catchAll(.*)',
    name: 'error',
    meta: {
      title: '404',
      navType: 'default',
      keepAlive: false
    },
    component: () => import('@/views/error/404.vue')
  }
];

export default routes;
