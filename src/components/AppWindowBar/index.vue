<script setup lang="ts">
import { useBaseStore } from '@/store/app'

const appStore = useBaseStore()

function onDarkToggle() {
  appStore.updateTheme({
    mode: appStore.theme.mode === 'dark' ? 'light' : 'dark'
  })
}
</script>

<template>
  <div class="app-window-bar">
    <!-- 暗黑主题 -->
    <!-- <teleport to="body"> </teleport> -->
    <div class="app-window-bar__theme" @click="onDarkToggle">
      <IconDark class="app-window-bar__theme-icon" v-if="appStore.theme.mode === 'dark'" />
      <IconLight class="app-window-bar__theme-icon" v-else />
    </div>
    <span>{{ appStore.theme.mode === 'dark' ? '夜间' : '日间' }}</span>
    <!-- 返回顶部 -->
    <!-- <van-back-top right="5vw" bottom="10vh" teleport="body" /> -->
  </div>
</template>

<style lang="scss">
.app-window-bar {
  &__theme {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--color-primary);
    background-color: var(--color-bg-2);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;

    &-icon {
      width: 20px;
      height: 20px;
    }
  }

  span {
    font-size: 14px;
    margin-top: 5px;
    display: block;
  }
}

.dark {
  .app-window-bar__theme {
    color: var(--color-text-1);
    background-color: var(--color-primary);
  }
}
</style>
