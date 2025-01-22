<template>
  <div class="container" ref="containerRef">
    <ul class="item-list">
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
let observer: IntersectionObserver | null = null

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
      // console.log(data.result.sList)
    }
  } catch (error) {
  } finally {
  }
}

// 计算当前可见的列表项
const calculateVisibleItems = () => {
  const container = containerRef.value
  const itemHeight = 50 // 每个列表项的高度
  if (!container) return

  const containerHeight = container.clientHeight
  const scrollTop = container.scrollTop
  const start = Math.floor(scrollTop / itemHeight)
  const end = Math.min(
    items.value.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight)
  )

  // 更新可见项
  visibleItems.value = items.value.slice(start, end + 1)
}

const observeLoadMore = () => {
  if (!loadMoreRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      console.log('IntersectionObserver entries:', entries)
      if (entries[0].isIntersecting && hasMore.value) {
        getStockList()
      }
    },
    {
      root: document.querySelector('.container'),
      rootMargin: '50px',
      threshold: 0.1
    }
  )

  observer.observe(loadMoreRef.value)
}

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

onMounted(async () => {
  await login()
  await getStockList()
  await nextTick(() => {
    calculateVisibleItems()
    observeLoadMore()
  })
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
