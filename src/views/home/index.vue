<template>
  <div class="container">
    <div class="ranking-list-li">
      <div class="ranking-list-thead">
        <div class="ranking-list-col">股票代码</div>
        <div class="ranking-list-col">股票名称</div>
        <div class="ranking-list-col">现价</div>
        <div class="ranking-list-col">1日</div>
        <div class="ranking-list-col">2日</div>
        <div class="ranking-list-col">X日</div>
      </div>
      <div class="ranking-list-tbody">
        <use-virtual-list
          :data="list"
          :item-height="60"
          :buffer="10"
          :hasMore="hasMore"
          :loading="loading"
          @loadMore="getStockList"
          @refresh="refreshStockList"
        >
          <template #default="{ item }">
            <div class="ranking-list-row">
              <div class="ranking-list-col">{{ item.stockCode }}</div>
              <div class="ranking-list-col">{{ item.stockName }}</div>
              <div class="ranking-list-col">{{ item.endPrice }}</div>
              <div class="ranking-list-col">{{ item.day1Price }}</div>
              <div class="ranking-list-col">{{ item.day2Price }}</div>
              <div class="ranking-list-col">{{ item.dayxPrice }}</div>
            </div>
          </template>
        </use-virtual-list>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, computed, nextTick, defineProps } from 'vue'
import { useUserStore } from '@/store/user'
import { GetStockList } from '@/api/list'
import useVirtualList from '@/components/Layout/VirtualList.vue'

const userStore = useUserStore()
const offset = ref(0)
const limit = ref(50)
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
  if (!hasMore.value || loading.value) return
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
        xianzhi: ''
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
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshStockList = async () => {
  offset.value = 0
  await getStockList()
}

onBeforeUnmount(() => {})

onMounted(async () => {
  await login()
  await getStockList()
})
</script>
<style scoped lang="scss">
.container {
  padding: 0 16px;

  .ranking-list-li {
    overflow: hidden;

    .ranking-list-thead {
      display: flex;
      color: rgba(26, 26, 27, 0.4);
      font-size: 12px;
      background-color: #fff;
      font-weight: 400;
      // padding: 0 20px;

      .ranking-list-col {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40px;
        flex: 1;

        .tips {
          width: 20px;
          margin-left: 5px;
        }

        // &:nth-child(5n-3) {
        //   flex: 3;
        //   justify-content: flex-start;
        // }
        // &:nth-child(5n-2) {
        //   flex: 2;
        //   justify-content: flex-start;
        // }
        // &:nth-child(5n-1) {
        //   flex: 2;
        //   justify-content: center;
        // }
        // &:nth-child(5n) {
        //   flex: 2;
        //   justify-content: flex-end;
        // }
      }
    }

    .ranking-list-tbody {
      height: calc(100vh - 90px);

      :deep(.ranking-list-row) {
        display: flex;
        color: #1a1a1b;
        font-size: 12px;
        line-height: 80px;
        font-weight: 400;
        height: 80px;
        // padding: 0 20px;

        .ranking-list-col {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 80px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          flex: 1;

          .ranking-list-span {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            text-align: left;
          }

          // &:nth-child(4n-3) {
          //   flex: 3;
          //   justify-content: flex-start;
          // }
          // &:nth-child(4n-2) {
          //   flex: 2;
          //   justify-content: flex-start;
          // }
          // &:nth-child(4n-1) {
          //   flex: 2;
          //   justify-content: center;
          // }
          // &:nth-child(4n) {
          //   flex: 2;
          //   justify-content: flex-end;
          // }
        }
      }
    }
  }
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
