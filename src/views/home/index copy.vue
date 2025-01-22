<template>
  <div class="container" ref="containerRef" @scroll="handleScroll">
    <!-- 占位容器，设置整体高度 -->
    <div class="spacer" :style="{ height: totalHeight + 'px' }"></div>
    <ul class="item-list" :style="{ transform: `translateY(${startOffset}px)` }">
      <li v-for="(item, index) in visibleItems" :key="item.stockCode" class="item">
        {{ index }}--{{ item.stockCode }}--{{ item.stockName }}
      </li>
    </ul>
    <div ref="loadMoreRef" class="loading-indicator" v-show="hasMore">加载中...</div>
    <div v-show="!hasMore" class="no-more">没有更多数据了</div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, computed, nextTick } from 'vue'
import { useUserStore } from '@/store/user'
import { GetStockList } from '@/api/list'

const userStore = useUserStore()
const items = ref<any[]>([])
const visibleItems = ref<any[]>([])
const pageNo = ref(1)
const pageSize = ref(30)
const hasMore = ref(true)
const loadMoreRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const itemHeight = 40 // 每项高度
const visibleCount = ref(0) // 可见项数量
const startIndex = ref(0) // 当前可见起始索引
const endIndex = ref(0) // 当前可见结束索引
const totalHeight = ref(0) // 列表总高度
const startOffset = ref(0) // 当前起始偏移量

const login = async () => {
  const payload = {
    businesS_PARAMETERS: {
      openid: '',
      loginType: 3,
      mobile: '13345343544',
      headerUrl: '',
      userName: ''
    },
    systeM_PARAMETERS: {
      appid: '',
      accesS_TOKEN: '',
      timestamp: '',
      sign: 'zhikaisoft'
    }
  }
  await userStore.login(payload)
}

const getStockList = async () => {
  if (!hasMore.value) return

  try {
    const payload = {
      businesS_PARAMETERS: {
        pageNo: pageNo.value,
        pageSize: pageSize.value,
        sortField: 'day1Dif',
        sortAsc: '1',
        keyword: '',
        ismy: '',
        yili: '',
        dax: '',
        xianzhi: '30'
      },
      systeM_PARAMETERS: {
        appid: '',
        accesS_TOKEN: '',
        timestamp: '',
        sign: 'zhikaisoft'
      }
    }
    const data = await GetStockList(payload)
    if (data.message.messagE_CODE === '1') {
      const totalCount = data.result.page?.totalCount
      if (data.result?.sList.length > 0) {
        items.value = [...items.value, ...data.result.sList]
        pageNo.value++
      }
      if (totalCount && data.result.page.pageNo * pageSize.value >= totalCount) {
        hasMore.value = false
      }
      totalHeight.value = items.value.length * itemHeight
      updateVisibleItems()
      // console.log(data.result.sList)
    }
  } catch (error) {
  } finally {
  }
}

// 计算当前可见数据
const updateVisibleItems = () => {
  const container = containerRef.value
  if (!container) return

  const scrollTop = container.scrollTop
  startIndex.value = Math.floor(scrollTop / itemHeight)
  endIndex.value = Math.min(items.value.length - 1, startIndex.value + visibleCount.value - 1)

  visibleItems.value = items.value.slice(startIndex.value, endIndex.value + 1)
  startOffset.value = startIndex.value * itemHeight
}

// 处理滚动事件
const handleScroll = () => {
  updateVisibleItems()
  const container = containerRef.value
  if (container) {
    const bottom = container.scrollHeight - container.scrollTop - container.clientHeight
    if (bottom < 50 && hasMore.value) {
      getStockList()
    }
  }
}

onBeforeUnmount(() => {})

onMounted(async () => {
  const container = containerRef.value
  if (container) {
    visibleCount.value = Math.ceil(container.clientHeight / itemHeight) + 1
    totalHeight.value = items.value.length * itemHeight
  }
  await login()
  await getStockList()
})
</script>
<style scoped lang="scss">
.container {
  padding: 0 16px;
  max-height: calc(100vh - 50px);
  overflow-y: auto;
}

.item-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  position: relative;
}

.item {
  padding: 0 12px;
  height: 50px;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
}

.loading-indicator {
  text-align: center;
  padding: 10px;
  min-height: 20px;
}

.no-more {
  text-align: center;
  color: #888;
  margin-top: 16px;
}
</style>
