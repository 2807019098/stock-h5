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
      <van-pull-refresh style="position: relative; flex: 100% 1 1" v-model="isLoading" success-text="刷新成功"
        @refresh="onRefresh">
        <DynamicScroller class="ranking-list-tbody" :items="list" :min-item-size="50" :buffer="300" :emit-update="true"
          :prerender="20" :v-loading="loading" keyField="stockCode" @update="update" @scroll="scroll"
          @scroll-end="scrollEnd" v-if="list.length">
          <template #default="{ item, index, active }">
            <DynamicScrollerItem :item="item" :active="active" :data-index="index" :data-active="active"
              @click="handleClick">
              <div class="ranking-list-row" style="height: 50px">
                <div class="ranking-list-col">{{ item.stockCode }}</div>
                <div class="ranking-list-col">{{ item.stockName }}</div>
                <div class="ranking-list-col">{{ item.endPrice.toFixed(2) }}</div>
                <div class="ranking-list-col">{{ item.day1Price.toFixed(2) }}</div>
                <div class="ranking-list-col">{{ item.day2Price.toFixed(2) }}</div>
                <div class="ranking-list-col">{{ item.dayxPrice.toFixed(2) }}</div>
              </div>
            </DynamicScrollerItem>
          </template>
          <template #after>
            <div v-if="loading" class="loading">
              <van-loading type="spinner" color="var(--color-primary)" vertical>
                加载中...
              </van-loading>
            </div>
            <div v-if="!hasMore && !loading" class="no-more">没有更多数据</div>
          </template>
        </DynamicScroller>
      </van-pull-refresh>
    </div>
    <van-back-top v-if="list.length > 0" scrollableY target=".ranking-list-tbody"
      right="var(--van-cell-horizontal-padding)" bottom="10vh" />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, computed, nextTick, onActivated } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/store/user';
import { GetStockList } from '@/api/list';

defineOptions({
  name: 'home'
});

const route = useRoute();
const userStore = useUserStore();
const offset = ref(0);
const limit = ref(50);
const list = ref<any[]>([]);
const isLoading = ref(false);
const loading = ref(false);
const hasMore = ref(true);

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
  await userStore.login(payload);
}

const getStockList = async () => {
  if (!hasMore.value || loading.value) return;
  loading.value = true;
  try {
    const payload = {
      businesS_PARAMETERS: {
        offset: offset.value,
        limit: limit.value,
        sortField: 'day1Dif',
        sortAsc: '1',
        keyword: '',
        ismy: '',
        yili: '1',
        dax: '',
        xianzhi: '20'
      },
      systeM_PARAMETERS: {
        appid: '',
        accesS_TOKEN: '',
        timestamp: '',
        sign: 'zhikaisoft'
      }
    }
    const response = await GetStockList(payload);
    if (response.data.message.messagE_CODE === '1') {
      let { sList, page } = response.data.result;
      let { nextOffset, hasMore: newHasMore } = page;
      if (sList.length > 0) {
        const uniqueStockList = new Map(list.value.map((item) => [item.stockCode, item]));
        sList.forEach((item: any) => uniqueStockList.set(item.stockCode, item));
        list.value = Array.from(uniqueStockList.values());
      }
      offset.value = nextOffset;
      hasMore.value = newHasMore;
    }
  } catch (error) {
    console.error('获取数据失败:', error);
  } finally {
    loading.value = false;
  }
}

const handleClick = (item: any) => {
  console.log('Item clicked:', item);
}

const update = async (start: any, end: any) => {
  if (end === list.value.length) {
    await getStockList();
  }
}

const scrollEnd = async () => {

}

const scroll = async (e: any) => {
  const threshold = 200; // 距离底部的阈值
  const containerHeight = 50 * list.value.length; // 计算容器的总高度
  const scrollHeight = e.target.scrollTop + containerHeight;
  // console.log(e.target.scrollTop)
}

const onRefresh = async () => {
  isLoading.value = true;
  offset.value = 0;
  hasMore.value = true;
  list.value = [];
  try {
    await getStockList();
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
}

onBeforeUnmount(() => { })

onMounted(async () => {

});

onActivated(async () => {
  await login();
  await getStockList();
});
</script>
<style scoped lang="scss">
.container {
  padding: 0 12px;
  overflow: hidden;
  height: 100%;

  .ranking-list-li {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;

    .ranking-list-thead {
      display: flex;
      font-size: 14px;
      font-weight: 400;
      padding: 0 5px;
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--color-bg-2);

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
      overflow-y: auto;
      height: 100%;

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

.loading {
  text-align: center;
  font-size: 14px;
  // position: absolute;
  // z-index: 2;
  // top: 50%;
  // left: 50%;
  // transform: translate(-50%, -50%);
  height: 90px;
  color: var(--color-primary);
}

.no-more {
  text-align: center;
  color: var(--color-text-3);
  height: 90px;
  font-size: 14px;
}
</style>
