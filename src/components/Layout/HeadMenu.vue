<script lang="ts" setup>
import SidebarMenu from './SidebarMenu.vue'
defineOptions({
  name: 'HeadMenu'
})
</script>
<template>
  <sidebar-menu />
  <router-view />
</template>
