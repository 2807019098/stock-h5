<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import routes from '@/router/routes'
import { useBaseStore } from '@/store/app'
import AppProvider from '@/components/AppProvider'

const route = useRoute()
const transitionName = ref<string>('go')
const store = useBaseStore()
const title = computed(() => (typeof route.meta.title === 'string' ? route.meta.title : '股市一筋'))

const onClickLeft = () => {
  history.back()
}

watch(route, (to, from) => {
  const toDepth = routes.findIndex((v) => v.path === to.path)
  const fromDepth = routes.findIndex((v) => v.path === from.path)
  transitionName.value = toDepth > fromDepth ? 'go' : 'back'
  if (to.name === 'home') {
    // alert()
    store.updateExcludeNames({ type: 'remove', value: 'home' });
  } else {
    store.updateExcludeNames({ type: 'add', value: 'home' });
  }
})

// 获取所有需要 keep-alive 的路由名
const keepAliveRoutes = computed(() => {
  const routeMeta = route.meta.keepAlive;
  return routeMeta ? [String(route.name)] : []; // 如果当前路由的 meta 配置了 keepAlive，则启用 keep-alive
});

onMounted(() => {
  console.log('Mounted:', store.excludeNames);
})
</script>
<template>
  <AppProvider>
    <router-view v-slot="{ Component, route }">
      <Transition :name="transitionName" appear>
        <main>
          <template v-if="route.meta.navType === 'default'">
            <div class="header">
              <van-nav-bar :title="title" left-arrow @click-left="onClickLeft" />
            </div>
          </template>
          <!-- <keep-alive :exclude="[...store.excludeNames]">
            <component :is="Component" />
          </keep-alive> -->
          <keep-alive :include="keepAliveRoutes">
            <component :is="Component" />
          </keep-alive>
          <!-- <keep-alive>
            <component v-if="route.meta.keepAlive" :is="Component" :key="route.path" />
          </keep-alive> -->
        </main>
      </Transition>
    </router-view>
  </AppProvider>
  <!-- <router-view v-slot="{ Component }">
    <keep-alive>
      <component v-if="$route.meta.keepAlive" :is="Component" :key="$route.path" />
    </keep-alive>
    <component :is="Component" v-if="!$route.meta.keepAlive" />
  </router-view> -->
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
}

.back-enter-to,
.back-enter-from,
.go-enter-to,
.go-leave-from {
  transform: translate3d(0, 0, 0);
}

.go-leave-to {
  transform: translate3d(-100%, 0, 0);
}

.go-enter-active,
.go-leave-active,
.back-enter-active,
.back-leave-active {
  transition: all 0.3s;
}

.back-enter-from {
  transform: translate3d(-100%, 0, 0);
}

.back-leave-to {
  transform: translate3d(100%, 0, 0);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
