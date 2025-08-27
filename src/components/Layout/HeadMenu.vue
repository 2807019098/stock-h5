<script lang="ts" setup>
import SidebarMenu from './SidebarMenu.vue'

defineOptions({
  name: 'HeadMenu'
})

// 处理筛选变化
const handleFilterChange = (data: any) => {
  // 触发全局筛选事件
  window.dispatchEvent(new CustomEvent('stock-filter-change', { detail: data }))
}
</script>

<template>
  <sidebar-menu @filter-change="handleFilterChange" />
  <keep-alive>
    <router-view />
  </keep-alive>
</template>
