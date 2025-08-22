<template>
  <div class="virtual-list" ref="container" :style="{ transform: `translateY(${translateY}px)` }" @scroll="handleScroll"
    @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <div v-if="refreshing" class="refresh-indicator">
      <van-loading v-if="!props.loading" color="var(--color-primary)" vertical>
        下拉刷新...
      </van-loading>
    </div>
    <div v-for="(item, index) in visibleItems" :key="item.key" class="virtual-list-item"
      :style="{ transform: `translateY(${item.offset}px)` }">
      <slot :item="item" :index="index"></slot>
    </div>
  </div>
  <div v-if="props.loading" class="loading">
    <van-loading type="spinner" color="var(--color-primary)" vertical> 加载中... </van-loading>
  </div>
  <div v-if="!props.hasMore" class="no-more">没有更多数据了</div>
  <van-back-top target=".virtual-list" right="var(--van-cell-horizontal-padding)" bottom="10vh" @click="goback" />
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, defineEmits, onUnmounted, computed } from 'vue'
import { debounce } from '@/utils/lodash'

interface VirtualListItem {
  key: string | number;
  offset: number;
  [key: string]: any;
}

const props = defineProps<{
  data: any[];
  itemHeight?: number;
  buffer?: number;
  hasMore?: boolean;
  loading?: boolean;
}>()

const emit = defineEmits<{
  loadMore: [];
  refresh: [];
}>()

const container = ref<HTMLElement | null>(null)
const visibleItems = ref<VirtualListItem[]>([])
const refreshing = ref(false)
const translateY = ref(0)
const startY = ref(0)
const lastScrollTop = ref<number>(0)

const itemHeight = computed(() => props.itemHeight || 50)
const buffer = computed(() => props.buffer || 10)
const hasMore = computed(() => props.hasMore || false)
const loading = computed(() => props.loading || false)

const calculateVisibleItems = (dynamicBuffer: number) => {
  if (!container.value) return

  const containerHeight = container.value.clientHeight
  const scrollTop = container.value.scrollTop

  // 计算起始索引
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight.value))

  // 计算可见项的数量
  const visibleCount = Math.ceil(containerHeight / itemHeight.value) + dynamicBuffer

  // 计算结束索引
  let endIndex = Math.min(startIndex + visibleCount - 1, props.data.length - 1)

  // 确保 endIndex 不会超出数据长度
  endIndex = Math.min(endIndex, props.data.length - 1)

  // 确保即使最后一页不满一整页也能显示
  if (scrollTop + containerHeight >= props.data.length * itemHeight.value) {
    endIndex = props.data.length - 1
  }

  visibleItems.value = props.data.slice(startIndex, endIndex + 1).map((item: any, index) => ({
    ...item,
    key: item.id || item.key || `${startIndex}-${index}`,
    offset: startIndex * itemHeight.value + index * itemHeight.value
  }))
  console.log(visibleCount)
  console.log('endIndex:', endIndex)
}

const handleScroll = debounce(() => {
  if (loading.value || !hasMore.value) return

  const containerHeight = container.value!.clientHeight
  const scrollTop = container.value!.scrollTop

  // 根据滚动速度动态调整 buffer 值
  const speed = Math.abs(Number(lastScrollTop.value) - scrollTop) // 计算滚动速度
  const dynamicBuffer = speed > 50 ? 20 : 5 // 快速滚动时增加 buffer

  // 更新可见项
  calculateVisibleItems(dynamicBuffer)

  const totalListHeight = props.data.length * itemHeight.value

  if (containerHeight + scrollTop + buffer.value * itemHeight.value >= totalListHeight) {
    emit('loadMore')
  }

  if (scrollTop <= -50) {
    if (!refreshing.value) {
      refreshing.value = true
      translateY.value = Math.min(-50, -scrollTop)
      emit('refresh')
    } else {
      refreshing.value = false
      translateY.value = 0
    }
  }
}, 10)

// 使用 requestAnimationFrame 来优化滚动处理
let isScrolling = false

const debouncedHandleScroll = () => {
  if (isScrolling) return

  isScrolling = true
  requestAnimationFrame(() => {
    handleScroll()
    isScrolling = false
  })
}

const handleTouchStart = (event: TouchEvent) => {
  startY.value = event.touches[0].clientY // 记录触摸开始的位置
}

const handleTouchMove = (event: TouchEvent) => {
  const currentY = event.touches[0].clientY
  const distance = currentY - startY.value // 计算下拉的距离

  // 只有在顶部时才允许下拉刷新
  const scrollTop = container.value?.scrollTop || 0
  if (scrollTop === 0 && distance > 0) {
    // 确保在顶部且下拉
    translateY.value = Math.min(distance, 50) // 限制最大下拉距离
    refreshing.value = true // 设置为正在刷新
    event.preventDefault() // 阻止默认的触摸事件
  }
}

const handleTouchEnd = () => {
  if (translateY.value >= 50) {
    // 如果下拉距离超过阈值
    emit('refresh') // 发出下拉刷新事件
  }
  // 重置状态
  refreshing.value = false
  translateY.value = 0
}

const goback = () => {
  if (container.value) {
    container.value.scrollTop = 0 // 滚动到顶部
    translateY.value = 0 // 重置 translateY
    calculateVisibleItems(buffer.value) // 重新计算可见项
  }
}

watch(
  () => props.data,
  () => calculateVisibleItems(buffer.value),
  { immediate: true }
)

onMounted(() => {
  calculateVisibleItems(buffer.value)
  container.value?.addEventListener('scroll', debouncedHandleScroll)
})

onUnmounted(() => {
  container.value?.removeEventListener('scroll', debouncedHandleScroll)
})
</script>

<style scoped lang="scss">
.virtual-list {
  overflow-y: auto;
  position: relative;
  width: 100%;
  height: 100%;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}

.virtual-list-item {
  padding: 0 5px;
  position: absolute;
  width: 100%;
  font-size: 14px;

  &:nth-child(2n-1) {
    background-color: rgb(255, 255, 240);
  }

  &:nth-child(2n) {
    background-color: rgb(255, 255, 255);
  }
}

.van-theme-dark {
  .virtual-list-item {
    &:nth-child(2n-1) {
      background-color: rgb(58, 58, 58);
    }

    &:nth-child(2n) {
      background-color: rgb(44, 44, 44);
    }
  }
}

.refresh-indicator {
  font-size: 14px;
  text-align: center;
  transition: transform 0.3s ease;
  color: var(--color-primary);
}

.no-more {
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
}

.loading {
  text-align: center;
  font-size: 14px;
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-primary);
}
</style>
