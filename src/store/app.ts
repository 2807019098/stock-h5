import type { ITheme } from '@/common/app/type';
import { getClientInfo } from '@/utils';
import { deepClone, fromCamelCase } from '@/utils/lodash';
import { appendStyle } from '@/utils/web';
import { store } from '@/store';
import { theme } from '@/common/app';
import { defineStore } from 'pinia';
import storage from 'good-storage';

export interface BaseStore {
  theme: NonNullable<ITheme>;
  bodyHeight: number;
  bodyWidth: number;
  excludeNames: Set<string>;
}

interface ExcludeNameAction {
  type: 'add' | 'remove';
  value: string;
}

export const useBaseStore = defineStore('app', {
  state: (): BaseStore => {
    return {
      theme: getLocalTheme(),
      bodyHeight: document.body.clientHeight,
      bodyWidth: document.body.clientWidth,
      excludeNames: new Set<string>()
    };
  },
  getters: {
    getTheme: (state) => state.theme,
    getBodyHeight: (state) => state.bodyHeight,
    getBodyWidth: (state) => state.bodyWidth,
    getExcludeNames: (state) => Array.from(state.excludeNames)
  },
  actions: {
    async updateTheme(payload: Recordable = {}) {
      const myTheme: ITheme = { ...deepClone(this.theme), ...payload };
      // 切换主题深/浅
      if (payload.mode === 'system') {
        myTheme.mode = getClientInfo().theme;
      }
      if (myTheme.mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // 生成主题变量
      const colorVarList = Object.keys(myTheme.colors).map(
        (key) => `--color-${fromCamelCase(key, '-')}: ${myTheme.colors[key]};`
      );
      const vanVarList = Object.keys(myTheme.vanThemeOverrides).map(
        (key) =>
          `--van-${fromCamelCase(key, '-')}: ${
            myTheme.colors[myTheme.vanThemeOverrides[key]] ?? myTheme.vanThemeOverrides[key]
          };`
      );
      const cssText = `:root { ${[...colorVarList, ...vanVarList].join('\n')} }`;
      appendStyle(cssText, 'theme');

      this.theme = myTheme;
      storage.set('theme', myTheme);
    },

    /**
     * 切换暗黑模式
     */
    toggleThemeMode() {
      this.updateTheme({
        mode: this.theme.mode === 'dark' ? 'light' : 'dark'
      });
    },

    async updateExcludeNames(val: ExcludeNameAction) {
      if (val.type === 'add') {
        this.excludeNames.add(val.value);
      } else {
        this.excludeNames.delete(val.value);
      }
    }
  }
});

export function useAppStoreWithOut() {
  return useBaseStore(store);
}

function getLocalTheme() {
  const result = storage.get('theme', theme);
  if (result.version === theme.version) {
    return result;
  } else {
    storage.remove('theme'); // 清理旧的存储
    return theme;
  }
}
