<template>
  <div
    class="virtual-list"
    ref="container"
    :style="{ transform: `translateY(${translateY}px)` }"
    @scroll="handleScroll"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div v-if="refreshing" class="refresh-indicator">
      <van-loading v-if="!props.loading" color="var(--color-primary)" vertical>
        下拉刷新...
      </van-loading>
    </div>
    <div
      v-for="(item, index) in visibleItems"
      :key="item.key"
      class="virtual-list-item"
      :style="{ transform: `translateY(${item.offset}px)` }"
    >
      <slot :item="item" :index="index"></slot>
    </div>
  </div>
  <div v-if="props.loading" class="loading">
    <van-loading type="spinner" color="var(--color-primary)" vertical> 加载中... </van-loading>
  </div>
  <div v-if="!props.hasMore" class="no-more">没有更多数据了</div>
  <van-back-top target=".virtual-list" right="var(--van-cell-horizontal-padding)" bottom="10vh" />
</template>

<script lang="ts" setup>
import { ref, onMounted, defineProps, watch, defineEmits, onUnmounted } from 'vue'
import { debounce } from '@/utils/lodash'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  itemHeight: {
    type: Number,
    default: 60
  },
  totalHeight: {
    type: Number,
    default: 0
  },
  buffer: {
    type: Number,
    default: 10
  },
  hasMore: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['loadMore', 'refresh'])
const container = ref<HTMLElement | null>(null)
const visibleItems = ref<any[]>([])
const refreshing = ref(false)
const translateY = ref(0)
const startY = ref(0)

const calculateVisibleItems = () => {
  if (!container.value) return

  const containerHeight = container.value.clientHeight
  const scrollTop = container.value.scrollTop

  // 计算能显示的最大数量
  const startIndex = Math.floor(scrollTop / props.itemHeight)
  const endIndex = Math.min(
    props.data.length - 1,
    Math.ceil((scrollTop + containerHeight) / props.itemHeight) + props.buffer
  )

  visibleItems.value = props.data.slice(startIndex, endIndex + 1).map((item: any, index) => ({
    ...item,
    offset: startIndex * props.itemHeight + index * props.itemHeight
  }))
}

const handleScroll = debounce(() => {
  if (props.loading || !props.hasMore) return
  calculateVisibleItems()
  const containerHeight = container.value!.clientHeight
  const scrollTop = container.value!.scrollTop
  const totalHeight = props.data.length * props.itemHeight
  if (containerHeight + scrollTop + props.buffer * props.itemHeight >= totalHeight) {
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
}, 100)

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

watch(() => props.data, calculateVisibleItems, { immediate: true })

onMounted(() => {
  calculateVisibleItems()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
.virtual-list {
  overflow-y: auto;
  position: relative;
  width: 100%;
  height: 100%;
}
.virtual-list-item {
  padding: 0 5px;
  position: absolute;
  width: 100%;
  font-size: 14px;
  &:nth-child(2n-1) {
    background-color: rgb(255, 255, 249);
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
