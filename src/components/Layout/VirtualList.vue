<template>
  <div class="virtual-list" ref="container" @scroll="handleScroll">
    <div
      v-for="(item, index) in visibleItems"
      :key="item.key"
      class="virtual-list-item"
      :style="{ transform: `translateY(${item.offset}px)` }"
    >
      <slot :item="item" :index="index"></slot>
    </div>
    <div v-if="loading" class="loading-indicator">加载中...</div>
    <div v-if="!hasMore" class="no-more">没有更多数据了</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, defineProps, watch } from 'vue'

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
    default: 5
  },
  hasMore: {
    type: Boolean,
    default: false
  }
})

const container = ref<HTMLElement | null>(null)
const visibleItems = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(props.hasMore)

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

const handleScroll = () => {
  if (loading.value || !hasMore.value) return
  calculateVisibleItems()
}

watch(() => props.data, calculateVisibleItems, { immediate: true })

onMounted(() => {
  calculateVisibleItems()
})
</script>

<style scoped>
.virtual-list {
  overflow-y: auto;
  position: relative;
  width: 100%;
  height: 100%;
}
.virtual-list-item {
  position: absolute;
  width: 100%;
  font-size: 14px;
}
.loading-indicator,
.no-more {
  text-align: center;
}
</style>
