<template>
  <!-- <div class="container" @scroll="handleScroll">
    <div class="stock-list">
      <div v-for="(stock, index) in list" :key="index" class="stock-item">
        <div class="stock-code">{{ stock.stockCode }}</div>
        <div class="stock-name">{{ stock.stockName }}</div>
        <div class="stock-price">当前价格: {{ stock.day1Price }}</div>
      </div>
      <div v-if="loading" class="loading-indicator">加载中...</div>
      <div v-if="!hasMore" class="no-more">没有更多数据了</div>
    </div>
  </div> -->
  <div class="container">
    <use-virtual-list
      :data="list"
      :item-height="60"
      :buffer="5"
      :hasMore="hasMore"
      @scroll="handleScroll"
    >
      <template #default="{ item }">
        <div class="stock-item">
          <div class="stock-code">{{ item.stockCode }}</div>
          <div class="stock-name">{{ item.stockName }}</div>
          <div class="stock-price">当前价格: {{ item.day1Price }}</div>
        </div>
      </template>
    </use-virtual-list>
    <!-- <div v-if="!hasMore" class="no-more">没有更多数据了</div> -->
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, computed, nextTick, defineProps } from 'vue'
import { useUserStore } from '@/store/user'
import { GetStockList } from '@/api/list'
import { debounce } from '@/utils/lodash'
import useVirtualList from '@/components/Layout/VirtualList.vue'

const userStore = useUserStore()
const offset = ref(0)
const limit = ref(50)
const arrayHeight = ref(document.body.clientHeight - 100)
const list = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)

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
  if (loading.value) return
  loading.value = true
  try {
    const payload = {
      businesS_PARAMETERS: {
        offset: offset.value,
        limit: limit.value,
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
      let { sList, page } = data.result
      let { nextOffset, hasMore: newHasMore } = page
      if (sList.length > 0) {
        console.log(list?.value.length)
        const uniqueStockList = new Map(list.value.map((item) => [item.stockCode, item]))
        sList.forEach((item: any) => uniqueStockList.set(item.stockCode, item))
        list.value = Array.from(uniqueStockList.values())
      }
      offset.value = nextOffset
      hasMore.value = newHasMore
      console.log(hasMore.value)
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleScroll = debounce(() => {
  const container = document.querySelector('.container') as HTMLElement
  if (!hasMore.value || loading.value) return
  if (container) {
    const { scrollTop, scrollHeight } = container
    // 判断是否滚动到底部，可以根据实际需求调整阈值
    if (scrollTop + arrayHeight.value >= scrollHeight - 100) {
      getStockList()
    }
  }
}, 200)

onBeforeUnmount(() => {})

onMounted(async () => {
  await login()
  await getStockList()
})
</script>
<style scoped lang="scss">
.container {
  padding: 0 16px;
  height: calc(100vh - 50px);
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
