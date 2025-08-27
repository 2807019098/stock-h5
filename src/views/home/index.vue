<template>
  <div class="container">
    <div class="stock-table">
      <!-- 表头 -->
      <div class="table-header">
        <!-- 固定列表头 -->
        <div class="fixed-header">
          <div class="header-cell">股票代码</div>
        </div>
        <!-- 可滑动列表头 -->
        <div class="scrollable-header-wrapper">
          <div class="scrollable-header" ref="scrollableHeader">
            <div class="header-cell">股票名称</div>
            <div class="header-cell">现价</div>
            <div class="header-cell">1日</div>
            <div class="header-cell">2日</div>
            <div class="header-cell">X日</div>
            <div class="header-cell">逻辑</div>
            <div class="header-cell">持仓</div>
            <div class="header-cell">最后价</div>
            <div class="header-cell">买入</div>
            <div class="header-cell">卖出</div>
            <div class="header-cell">市值</div>
            <div class="header-cell">市盈</div>
          </div>
        </div>
      </div>

      <!-- 表格内容 -->
      <van-pull-refresh style="position: relative; flex: 100% 1 1" v-model="isLoading" success-text="刷新成功"
        @refresh="onRefresh">
        <DynamicScroller ref="tableBodyRef" class="table-body" :items="list" :min-item-size="50" :buffer="300"
          :emit-update="true" :prerender="20" :v-loading="loading" keyField="stockCode" @update="update"
          @scroll="scroll" @scroll-end="scrollEnd" v-if="list.length">
          <template #default="{ item, index, active }">
            <DynamicScrollerItem :item="item" :active="active" :data-index="index" :data-active="active"
              @click="handleClick">
              <div class="table-row">
                <!-- 固定列 -->
                <div class="fixed-column">
                  <div class="cell">{{ item.stockCode }}</div>
                </div>
                <!-- 可滑动列 -->
                <div class="scrollable-column-wrapper">
                  <div class="scrollable-column" :ref="el => setScrollableColumnRef(el, index)">
                    <div class="cell">{{ item.stockName }}</div>
                    <div class="cell">{{ item.endPrice.toFixed(2) }}</div>
                    <div class="cell">{{ item.day1Price.toFixed(2) }}</div>
                    <div class="cell">{{ item.day2Price.toFixed(2) }}</div>
                    <div class="cell">{{ item.dayxPrice.toFixed(2) }}</div>
                    <div class="cell editable" @click="editField(item, 'logic')">{{ item.logic || '-' }}</div>
                    <div class="cell editable" @click="editField(item, 'storeNum')">{{ item.storeNum || '-' }}</div>
                    <div class="cell editable" @click="editField(item, 'lastPrice')">{{
                      item.lastPrice?.toFixed(2) || '-' }}</div>
                    <div class="cell editable" @click="editField(item, 'buyPrice')">{{
                      item.buyPrice?.toFixed(2) || '-' }}</div>
                    <div class="cell editable" @click="editField(item, 'sellPrice')">{{
                      item.sellPrice?.toFixed(2) || '-' }}</div>
                    <div class="cell">{{ formatMarketValue(item.marketValue) }}</div>
                    <div class="cell">{{ item.dynPE?.toFixed(2) || '-' }}</div>
                  </div>
                </div>
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

    <!-- 自定义回到顶部按钮 -->
    <div v-if="showBackTop" class="custom-back-top" @click="scrollToTop">
      <van-icon name="arrow-up" />
    </div>

    <!-- 编辑弹窗 -->
    <van-popup v-model:show="showEditPopup" position="center" :style="{ width: '80%', maxWidth: '300px' }">
      <div class="edit-popup">
        <div class="edit-header">
          <h3>编辑{{ editFieldLabel }}</h3>
          <van-icon name="cross" @click="showEditPopup = false" />
        </div>
        <div class="edit-content">
          <van-field v-model="editValue" :label="editFieldLabel" :type="editFieldType" placeholder="请输入"
            @keyup.enter="saveEdit" />
        </div>
        <div class="edit-actions">
          <van-button type="default" @click="showEditPopup = false">取消</van-button>
          <van-button type="primary" @click="saveEdit">保存</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, computed, nextTick, onActivated } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/store/user';
import { GetStockList } from '@/api/list';
import { LoginType } from '@/enum';
import { showToast } from 'vant';
import { smoothScrollTo } from '@/utils';

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

// 编辑相关状态
const showEditPopup = ref(false);
const editValue = ref('');
const editFieldName = ref('');
const editFieldLabel = ref('');
const editFieldType = ref<'text' | 'number'>('text');
const currentEditItem = ref<any>(null);

// 滑动相关引用
const scrollableHeader = ref<HTMLElement>();
const scrollableColumns = ref<HTMLElement[]>([]);
const tableBodyRef = ref<HTMLElement>();
const showBackTop = ref(false);

// 回到顶部功能
const scrollToTop = () => {
  // 尝试使用 DynamicScroller 组件的方法
  // if (tableBodyRef.value && (tableBodyRef.value as any).scrollToItem) {
  //   (tableBodyRef.value as any).scrollToItem(0);
  //   return;
  // }

  // 备用方案：直接操作滚动容器
  const allScrollers = document.querySelectorAll('.vue-recycle-scroller');
  if (allScrollers.length > 0) {
    smoothScrollTo(allScrollers[0] as HTMLElement, 0, 300);
    return;
  }

};

// 设置可滑动列的ref
const setScrollableColumnRef = (el: any, index: number) => {
  if (el && el.scrollLeft !== undefined) {
    scrollableColumns.value[index] = el;
  }
};

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

// 格式化市值显示
const formatMarketValue = (value: number) => {
  if (!value) return '-';
  if (value >= 100000000) {
    return (value / 100000000).toFixed(2) + '亿';
  } else if (value >= 10000) {
    return (value / 10000).toFixed(2) + '万';
  }
  return value.toFixed(2);
}

// 编辑字段
const editField = (item: any, field: string) => {
  currentEditItem.value = item;
  editFieldName.value = field;

  // 设置字段标签和类型
  const fieldConfig = {
    logic: { label: '逻辑', type: 'text' as const },
    storeNum: { label: '持仓', type: 'number' as const },
    lastPrice: { label: '最后价', type: 'number' as const },
    buyPrice: { label: '买入价', type: 'number' as const },
    sellPrice: { label: '卖出价', type: 'number' as const }
  };

  const config = fieldConfig[field as keyof typeof fieldConfig];
  editFieldLabel.value = config.label;
  editFieldType.value = config.type;

  // 设置当前值
  editValue.value = item[field]?.toString() || '';

  showEditPopup.value = true;
}

// 保存编辑
const saveEdit = async () => {
  if (!currentEditItem.value || !editFieldName.value) return;

  try {
    // 这里应该调用API更新数据
    // const response = await UpdateStockField({
    //   stockCode: currentEditItem.value.stockCode,
    //   field: editFieldName.value,
    //   value: editValue.value
    // });

    // 临时更新本地数据
    currentEditItem.value[editFieldName.value] = editFieldType.value === 'number'
      ? parseFloat(editValue.value)
      : editValue.value;

    showEditPopup.value = false;
    showToast('保存成功');
  } catch (error) {
    console.error('保存失败:', error);
    showToast('保存失败');
  }
}

// 处理水平滑动同步
const handleHorizontalScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  const scrollLeft = target.scrollLeft;

  // 同步表头滚动
  if (scrollableHeader.value) {
    scrollableHeader.value.scrollLeft = scrollLeft;
  }

  // 同步所有行的滚动
  scrollableColumns.value.forEach(column => {
    if (column && column !== target) {
      column.scrollLeft = scrollLeft;
    }
  });
}

// 初始化横向滚动同步
const initHorizontalScrollSync = () => {
  nextTick(() => {
    // 移除之前的事件监听器
    if (scrollableHeader.value) {
      scrollableHeader.value.removeEventListener('scroll', handleHorizontalScroll);
      scrollableHeader.value.addEventListener('scroll', handleHorizontalScroll);
    }

    // 为每一行的可滑动列添加滚动监听
    scrollableColumns.value.forEach(column => {
      if (column) {
        column.removeEventListener('scroll', handleHorizontalScroll);
        column.addEventListener('scroll', handleHorizontalScroll);
      }
    });
  });
}

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
  // 数据更新后重新初始化横向滚动同步
  initHorizontalScrollSync();
}

const scrollEnd = async () => {

}

const scroll = async (e: any) => {
  const threshold = 200; // 距离底部的阈值
  const containerHeight = 50 * list.value.length; // 计算容器的总高度
  const scrollHeight = e.target.scrollTop + containerHeight;

  // 控制回到顶部按钮的显示
  showBackTop.value = e.target.scrollTop > 300;
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

  // 初始化横向滚动同步
  initHorizontalScrollSync();
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
  padding: 0;
  overflow: hidden;
  height: 100%;



  .stock-table {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;

    .table-header {
      display: flex;
      font-size: 14px;
      font-weight: 400;
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--color-bg-2);
      height: 40px;

      .fixed-header {
        flex-shrink: 0;
        width: 80px;
        background: var(--color-bg-2);
        border-right: 1px solid var(--color-border-1);
        display: flex;
        align-items: center;
        justify-content: center;
        position: sticky;
        left: 0;
        z-index: 10;

        .header-cell {
          padding: 0 8px;
          font-weight: bold;
        }
      }

      .scrollable-header-wrapper {
        flex: 1;
        overflow: hidden;
        position: relative;
      }

      .scrollable-header {
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
        height: 100%;

        // 兼容性优化：隐藏滚动条
        scrollbar-width: none;
        /* Firefox */
        -ms-overflow-style: none;
        /* IE and Edge */

        &::-webkit-scrollbar {
          display: none;
          /* Chrome, Safari, Opera */
        }

        // iOS Safari 兼容性优化
        -webkit-overflow-scrolling: touch;

        // 防止iOS回弹效果
        overscroll-behavior-x: none;
        -webkit-overscroll-behavior-x: none;
      }

      .header-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40px;
        flex-shrink: 0;
        font-weight: bold;
        padding: 0 8px;
        min-width: 70px;

        &:nth-child(1) {
          width: 80px;
          justify-content: flex-start;
        }

        &:nth-child(2) {
          width: 70px;
          justify-content: flex-end;
        }

        &:nth-child(3),
        &:nth-child(4),
        &:nth-child(5),
        &:nth-child(6) {
          width: 70px;
          justify-content: flex-end;
        }

        &:nth-child(7),
        &:nth-child(8),
        &:nth-child(9),
        &:nth-child(10),
        &:nth-child(11) {
          width: 80px;
          justify-content: center;
        }

        &:nth-child(12),
        &:nth-child(13) {
          width: 80px;
          justify-content: flex-end;
        }
      }
    }

    .table-body {
      overflow-y: auto;
      height: 100%;

      :deep(.table-row) {
        display: flex;
        font-size: 14px;
        font-weight: 400;
        height: 50px;

        .fixed-column {
          flex-shrink: 0;
          width: 80px;
          background: var(--color-bg-2);
          border-right: 1px solid var(--color-border-1);
          display: flex;
          align-items: center;
          justify-content: center;
          position: sticky;
          left: 0;
          z-index: 10;

          .cell {
            padding: 0 8px;
            font-weight: bold;
          }
        }

        .scrollable-column-wrapper {
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        .scrollable-column {
          display: flex;
          overflow-x: auto;
          overflow-y: hidden;
          height: 100%;

          // 兼容性优化：隐藏滚动条
          scrollbar-width: none;
          /* Firefox */
          -ms-overflow-style: none;
          /* IE and Edge */

          &::-webkit-scrollbar {
            display: none;
            /* Chrome, Safari, Opera */
          }

          // iOS Safari 兼容性优化
          -webkit-overflow-scrolling: touch;

          // 防止iOS回弹效果
          overscroll-behavior-x: none;
          -webkit-overscroll-behavior-x: none;
        }

        .scrollable-column {
          display: flex;
        }

        .cell {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 50px;
          flex-shrink: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-weight: bold;
          padding: 0 8px;
          min-width: 70px;

          &.editable {
            cursor: pointer;
            position: relative;

            &:hover {
              background-color: var(--color-primary-light);
            }

            &::after {
              content: '✏️';
              position: absolute;
              right: 2px;
              top: 2px;
              font-size: 10px;
              opacity: 0.6;
            }
          }

          &:nth-child(1) {
            width: 80px;
            justify-content: flex-start;
          }

          &:nth-child(2) {
            width: 70px;
            justify-content: flex-end;
          }

          &:nth-child(3),
          &:nth-child(4),
          &:nth-child(5),
          &:nth-child(6) {
            width: 70px;
            justify-content: flex-end;
          }

          &:nth-child(7),
          &:nth-child(8),
          &:nth-child(9),
          &:nth-child(10),
          &:nth-child(11) {
            width: 80px;
            justify-content: center;
          }

          &:nth-child(12),
          &:nth-child(13) {
            width: 80px;
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
  height: 90px;
  color: var(--color-primary);
}

.no-more {
  text-align: center;
  color: var(--color-text-3);
  height: 90px;
  font-size: 14px;
}

// 自定义回到顶部按钮样式
.custom-back-top {
  position: fixed;
  right: 16px;
  bottom: 10vh;
  width: 40px;
  height: 40px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:hover {
    background: var(--color-primary-dark);
    transform: translateY(-2px);
  }

  .van-icon {
    font-size: 18px;
  }
}

// 编辑弹窗样式
.edit-popup {
  background: var(--color-bg-2);
  border-radius: 8px;
  overflow: hidden;

  .edit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--color-border-1);
    background: var(--color-bg-3);

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-1);
    }

    .van-icon {
      font-size: 18px;
      color: var(--color-text-2);
      cursor: pointer;

      &:hover {
        color: var(--color-primary);
      }
    }
  }

  .edit-content {
    padding: 16px;
  }

  .edit-actions {
    display: flex;
    gap: 12px;
    padding: 16px;
    border-top: 1px solid var(--color-border-1);
    background: var(--color-bg-2);

    .van-button {
      flex: 1;
    }
  }
}
</style>
