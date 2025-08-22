import { createPinia } from 'pinia';
import type { App } from 'vue';

export const store = createPinia();

/**
 * 配置状态管理
 */
export function setupStore(app: App): void {
  app.use(store);
}
