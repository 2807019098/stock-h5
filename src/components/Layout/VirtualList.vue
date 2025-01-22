<template>
  <div class="virtual-list" ref="container" @scroll="handleScroll">
    <div class="spacer" :style="{ height: totalHeight + 'px' }"></div>
    <div class="item-list">
      <div
        v-for="(item, index) in visibleItems"
        :key="index"
        class="item"
        :style="{ transform: `translateY(${itemOffset[index]}px)` }"
      >
        <slot :item="item"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  itemHeight: {
    type: Number,
    default: 50
  },
  visibleCount: {
    type: Number,
    default: 10
  }
})

const container = ref<HTMLElement | null>(null)
const visibleItems = ref<any[]>([])
const itemOffset = ref<number[]>([])
const totalHeight = ref(0)

const calculateVisibleItems = () => {
  if (!container.value) return
  const scrollTop = container.value.scrollTop
  const startIndex = Math.floor(scrollTop / props.itemHeight)
  const endIndex = Math.min(startIndex + props.visibleCount, props.items.length)

  visibleItems.value = props.items.slice(startIndex, endIndex)
  itemOffset.value = Array.from(
    { length: endIndex - startIndex },
    (_, i) => (startIndex + i) * props.itemHeight
  )
  totalHeight.value = props.items.length * props.itemHeight
}

const handleScroll = () => {
  calculateVisibleItems()
}

onMounted(() => {
  calculateVisibleItems()
  window.addEventListener('resize', calculateVisibleItems)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', calculateVisibleItems)
})

watch(
  () => props.items,
  () => {
    calculateVisibleItems()
  }
)
</script>

<style scoped lang="scss">
.virtual-list {
  position: relative;
  overflow-y: auto;
  max-height: 100%;
}

.spacer {
  width: 100%;
}

.item-list {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.item {
  height: 50px; /* 默认高度 */
  display: flex;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}
</style>
