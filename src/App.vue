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
  console.log('Transition Name:', transitionName.value)
})

onMounted(() => {
  console.log(`${name} onMounted`)
})
</script>

<template>
  <AppProvider>
    <router-view v-slot="{ Component }">
      <Transition :name="transitionName" appear>
        <main>
          <template v-if="route.meta.navType === 'default'">
            <div class="header">
              <van-nav-bar :title="title" left-arrow @click-left="onClickLeft" />
            </div>
          </template>
          <keep-alive :exclude="store.excludeNames">
            <component :is="Component" />
          </keep-alive>
        </main>
      </Transition>
    </router-view>
  </AppProvider>
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
