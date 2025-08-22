import { defineAsyncComponent } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import type { Router } from 'vue-router';
import routes from './routes';
import { useAppStoreWithOut, useBaseStore } from '@/store/app';

let appLoadedFlag: boolean;

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach(async (to, from, next) => {
  console.log('[route]', from.path, to.path);

  const title = to.meta?.title as string | undefined;
  if (title) {
    document.title = title;
  }

  if (!appLoadedFlag) {
    appLoadedFlag = true;
    console.info('app onLaunch');
    console.info('app version', __APP_INFO__.version);
    console.info('app URL', window.location.href);
    // 更新主题
    const appStore = useAppStoreWithOut();
    await appStore.updateTheme();
  }

  const baseStore = useBaseStore();
  const toDepth = routes.findIndex((v) => v.path === to.path);
  const fromDepth = routes.findIndex((v) => v.path === from.path);
  if (toDepth > fromDepth) {
    if (to.matched && to.matched.length) {
      const toComponentName = to.matched[0].components?.default.name;
      if (toComponentName) {
        baseStore.updateExcludeNames({ type: 'remove', value: toComponentName });
      }
    }
  } else {
    if (from.matched && from.matched.length) {
      const fromComponentName = from.matched[0].components?.default.name;
      if (fromComponentName) {
        baseStore.updateExcludeNames({ type: 'add', value: fromComponentName });
      }
    }
  }
  next();
  return true;
});

export default router;
