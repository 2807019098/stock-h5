<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({
  name: 'SidebarMenu'
})

const route = useRoute()
const show = ref<boolean>(false)
const filter = ref<boolean>(false)
const iconOpacity = ref<number>(0)

const handleMenu = () => {
  show.value = true
}

const openFilter = () => {
  console.log('点击筛选按钮')
  filter.value = true
  console.log('filter值已设置为:', filter.value)
}

const emit = defineEmits<{
  'filter-change': [data: any]
}>()

const handleFilterChange = (filterData: any) => {
  console.log('筛选条件变化:', filterData)
  // 触发全局事件，让home页面能够接收到
  window.dispatchEvent(new CustomEvent('stock-filter-change', {
    detail: filterData
  }))
  emit('filter-change', filterData)
}

watch(show, (newValue: boolean) => {
  iconOpacity.value = newValue ? 1 : 0
})
</script>
<template>
  <div class="header">
    <div class="bar" @click="handleMenu">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="search"></div>
    <div class="filter" @click="openFilter">
      <van-icon name="filter-o" size="30px" color="var(--color-primary)" />
    </div>
  </div>
  <teleport to="body">
    <van-popup v-model:show="show" position="left">
      <div class="menu">
        <h2 class="title">
          <span>股市一筋</span>
          <van-icon name="cross" class="close" @click="show = false" size="25px" :style="{ opacity: iconOpacity }" />
        </h2>
        <van-cell-group :border="false">
          <van-cell style="padding: 12px" title="股市前瞻" to="/" @click="show = false" />
          <van-cell style="padding: 12px" title="前沿资讯" to="/message" @click="show = false" />
          <van-cell style="padding: 12px" title="我的自选" to="/mystock" @click="show = false" />
          <van-cell style="padding: 12px" title="个人中心" to="/mine" @click="show = false" />
          <van-cell style="padding: 12px" title="帮助中心" to="/help" @click="show = false" />
        </van-cell-group>
        <div class="footer">
          <div class="menuLi" @click="(show = false), $router.push('/mysetting')">
            <van-icon name="setting-o" size="28px" color="var(--color-primary)" />
            <span>设置</span>
          </div>
          <div class="menuLi">
            <AppWindowBar />
          </div>
        </div>
      </div>
    </van-popup>
    <ScreenPannel v-model:show="filter" @filter-change="handleFilterChange" />
  </teleport>
</template>
<style lang="scss" scoped>
.header {
  height: 50px;
  position: sticky;
  top: 0;
  background-color: var(--color-text-8);

  .bar {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    left: 12px;

    span {
      width: 25px;
      height: 3px;
      border-radius: 2px;
      background-color: var(--color-primary);
      transform: translateY(-50%);
      margin-bottom: 6px;

      &:last-of-type {
        margin-bottom: 0;
      }
    }
  }

  .search {
    position: absolute;
    left: calc(2 * 12px + 25px);
    right: calc(2 * 12px + 25px);
    top: 50%;
    transform: translateY(-50%);
    height: 30px;
    background-color: #ffffff;
    border-radius: 30px;
  }

  .filter {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 25px;
    height: 25px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.menu {
  min-width: 100vw;
  height: 100vh;
  position: relative;
  background-color: var(--van-popup-background);

  .title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-primary);
    padding: 12px;
    margin-bottom: 10px;
    font-family: 'vant-icon';
    position: relative;

    .close {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 80px;
    font-weight: bold;
    display: flex;
    align-items: center;
    color: var(--color-primary);
    padding: 12px;

    .menuLi {
      display: flex;
      align-items: center;
      flex-direction: column;
      margin-right: 18px;
      font-size: 0;

      span {
        font-size: 14px;
        margin-top: 5px;
        display: block;
      }

      &:last-of-type {
        margin-right: 0;
      }
    }
  }
}

.dark .search {
  background-color: var(--color-text-8);
}
</style>
