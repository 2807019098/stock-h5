<script lang="ts" setup>
import { computed, unref } from 'vue'
import type { ConfigProviderThemeVars } from 'vant'

const themeVars = computed<ConfigProviderThemeVars>(() => {
  return {
    cellTextColor: 'var(--color-text-1)'
  }
})
</script>
<template>
  <van-config-provider :themeVars="themeVars" theme-vars-scope="global"></van-config-provider>
  <div class="container">
    <van-cell-group :border="false">
      <van-cell title="主题切换" to="/theme" />
    </van-cell-group>
  </div>
</template>
<style lang="scss" scoped></style>
