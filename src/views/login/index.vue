<script lang="ts" setup>
import VirtualList from '@/components/Layout/VirtualList.vue'
import { ref } from 'vue'

defineOptions({
  name: 'login'
});

const arrayHeight = ref('400px')
const itemHeight = ref(60)

const randomColor = () => {
  return Math.floor(Math.random() * 255)
}
const fullyData: any = Array.from({ length: 100000 }, (_, index) => ({
  value: index,
  backColor: `rgb(${randomColor()}, ${randomColor()}, ${randomColor()})`
}))
</script>
<template>
  <div class="container">
    <!-- <VirtualList :fullyData="fullyData" :arrayHeight="arrayHeight">
      <template #item="{ item }">
        <div
          class="list-view-item"
          :style="{ height: itemHeight + 'px', backgroundColor: item.backColor }"
        >
          {{ item.value }}
        </div>
      </template>
</VirtualList> -->
  </div>
</template>
<style lang="scss" scoped></style>
