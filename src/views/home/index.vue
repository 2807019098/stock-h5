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
import { LoginType } from '@/enum';
import { showToast } from 'vant';

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
    loginType: Number(LoginType.手机号登录),
    mobile: '13345343544',
    smsCode: '123456',
    // userName: '',
    // passWord: '',
    // wechatOpenId: '',
  }
  await userStore.login(payload);
}

import { useFilterStore } from '@/store/filter'

// 使用Pinia状态管理
const filterStore = useFilterStore()

const getStockList = async () => {
  if (!hasMore.value || loading.value) return;
  loading.value = true;
  try {
    // 构建筛选参数
    const { profit, bigDays, changeRange, sortType, sortOrder } = filterStore.filterData

    console.log('=== getStockList 开始 ===')
    console.log('当前筛选条件:', { profit, bigDays, changeRange, sortType, sortOrder })

    // 映射排序字段
    const sortFieldMap: Record<string, string> = {
      'fronterror': 'day1Dif',
      '1day': 'day1_2',
      '2day': 'day2_1',
      'xday': 'xdayb'
    }

    const payload = {
      offset: offset.value,
      limit: limit.value,
      sortField: sortFieldMap[sortType] || 'day1Dif',
      sortAsc: sortOrder === 'asc' ? '1' : sortOrder === 'desc' ? '0' : '',
      keyword: '',
      ismy: '',
      yili: profit === '1' ? '1' : '',
      dax: bigDays === '1' ? '1' : '',
      xianzhi: changeRange > 0 ? changeRange.toString() : ''
    }

    console.log('API请求参数:', payload)
    console.log('=== getStockList 结束 ===')

    const response = await GetStockList(payload);
    const result = response.data;
    if (result.code === 1) {
      let { sList, page } = result.data;
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

// 测试筛选功能
const testFilter = async () => {
  console.log('=== 测试筛选功能 ===')

  // 测试1: 直接更新store
  const testData = {
    profit: '1',
    bigDays: '1',
    changeRange: 20,
    sortType: '1day',
    sortOrder: 'asc'
  }

  console.log('测试数据:', testData)
  filterStore.updateFilter(testData)
  console.log('更新后的store数据:', filterStore.filterData)

  // 测试2: 重置列表并重新加载
  offset.value = 0
  hasMore.value = true
  list.value = []

  // 测试3: 调用API
  await getStockList()

  console.log('=== 测试完成 ===')
}

// 处理筛选条件变化
const handleFilterChange = (filterData: any) => {
  // 更新Pinia状态
  filterStore.updateFilter(filterData)
  // 重置列表并重新加载
  offset.value = 0
  hasMore.value = true
  list.value = []
  getStockList()
}

// 处理重置筛选条件
const handleResetFilter = () => {
  // 重置列表并重新加载
  offset.value = 0
  hasMore.value = true
  list.value = []
  getStockList()
  showToast('数据已重新加载')
}



onBeforeUnmount(() => { })

onMounted(async () => {
  // 监听全局筛选事件
  window.addEventListener('stock-filter-change', (event: any) => {
    handleFilterChange(event.detail)
  })

  // 监听重置事件
  window.addEventListener('stock-filter-reset', () => {
    handleResetFilter()
  })
});

onActivated(async () => {
  await login();
  await getStockList();
});

onBeforeUnmount(() => {
  // 移除事件监听器
})
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
