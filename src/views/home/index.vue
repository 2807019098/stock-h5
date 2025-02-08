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
          :item-height="50"
          :buffer="10"
          :hasMore="hasMore"
          :loading="loading"
          @loadMore="getStockList"
          @refresh="refreshStockList"
        >
          <template #default="{ item }">
            <div class="ranking-list-row" style="height: 50px">
              <div class="ranking-list-col">{{ item.stockCode }}</div>
              <div class="ranking-list-col">{{ item.stockName }}</div>
              <div class="ranking-list-col">{{ item.endPrice.toFixed(2) }}</div>
              <div class="ranking-list-col">{{ item.day1Price.toFixed(2) }}</div>
              <div class="ranking-list-col">{{ item.day2Price.toFixed(2) }}</div>
              <div class="ranking-list-col">{{ item.dayxPrice.toFixed(2) }}</div>
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
    const response = await GetStockList(payload)
    if (response.message.messagE_CODE === '1') {
      let { sList, page } = response.result
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
      font-size: 14px;
      font-weight: 400;

      .ranking-list-col {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40px;
        flex: 1;
        font-weight: bold;

        .tips {
          width: 20px;
          margin-left: 5px;
        }

        &:nth-child(6n-5) {
          justify-content: flex-start;
          flex: 1.2;
        }

        &:nth-child(6n-4) {
          justify-content: center;
          flex: 1.2;
        }

        &:nth-child(6n-3) {
          justify-content: flex-end;
        }

        &:nth-child(6n-2) {
          justify-content: flex-end;
        }

        &:nth-child(6n-1) {
          justify-content: flex-end;
        }

        &:nth-child(6n) {
          justify-content: flex-end;
        }
      }
    }

    .ranking-list-tbody {
      height: calc(100vh - 90px);

      :deep(.ranking-list-row) {
        display: flex;
        font-size: 14px;
        // line-height: 50px;
        font-weight: 400;
        // height: 50px;

        .ranking-list-col {
          display: flex;
          align-items: center;
          justify-content: center;
          // height: 50px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          flex: 1;
          font-weight: bold;

          .ranking-list-span {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            text-align: left;
          }

          &:nth-child(6n-5) {
            justify-content: flex-start;
            flex: 1.2;
          }

          &:nth-child(6n-4) {
            justify-content: center;
            flex: 1.2;
          }

          &:nth-child(6n-3) {
            justify-content: flex-end;
          }

          &:nth-child(6n-2) {
            justify-content: flex-end;
          }

          &:nth-child(6n-1) {
            justify-content: flex-end;
          }

          &:nth-child(6n) {
            justify-content: flex-end;
          }
        }
      }
    }
  }
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
