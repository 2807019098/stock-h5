import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

export function useVirtualList<T>(props: {
  containerHeight: number; // 容器高度
  estimateRowHeight: number; // 估计每行高度
  bufferSize?: number; // 缓冲区大小（可选）
  data: T[]; // 数据源
}) {
  const { containerHeight, estimateRowHeight, data, bufferSize = 5 } = props;

  const totalHeight = ref<number | any>(0); // 总高度
  const startOffset = ref<number | any>(0); // 起始偏移量
  const visibleData = ref<T[]>([]); // 可视区数据
  const startIndex = ref(0); // 起始索引
  const endIndex = ref(0); // 结束索引
  const itemHeights = new Map<number, number>(); // 每个 item 的实际高度

  const containerRef = ref<HTMLElement | null>(null);

  const calculateRange = () => {
    if (!containerRef.value) return;

    const scrollTop = containerRef.value.scrollTop;

    // 计算起始索引
    let offset = 0;
    let start = 0;
    for (let i = 0; i < data.length; i++) {
      const height = itemHeights.get(i) || estimateRowHeight;
      if (offset + height > scrollTop) {
        start = i;
        break;
      }
      offset += height;
    }

    // 可视区域加缓冲区
    const visibleHeight = containerHeight + bufferSize * estimateRowHeight;
    let end = start;
    let totalHeight = 0;
    for (let i = start; i < data.length; i++) {
      totalHeight += itemHeights.get(i) || estimateRowHeight;
      if (totalHeight > visibleHeight) {
        end = i;
        break;
      }
    }

    startIndex.value = Math.max(0, start - bufferSize);
    endIndex.value = Math.min(data.length, end + bufferSize);

    startOffset.value = Array.from({ length: startIndex.value }).reduce(
      (acc: any, _, index) => acc + (itemHeights.get(index) || estimateRowHeight),
      0
    );

    visibleData.value = data.slice(startIndex.value, endIndex.value);
  };

  const onScroll = () => calculateRange();

  const setItemHeight = (index: number, height: number) => {
    if (itemHeights.get(index) !== height) {
      itemHeights.set(index, height);
      totalHeight.value = Array.from({ length: data.length }).reduce(
        (acc: any, _, i) => acc + (itemHeights.get(i) || estimateRowHeight),
        0
      );
      calculateRange();
    }
  };

  onMounted(() => {
    // 等待 DOM 渲染完成后再执行
    nextTick(() => {
      if (containerRef.value) {
        // 这里是 DOM 元素已渲染且 containerRef 已正确绑定的情况
        calculateRange();
        containerRef.value.addEventListener('scroll', onScroll);
      }
    });
  });
  onBeforeUnmount(() => containerRef.value?.removeEventListener('scroll', onScroll));

  watch(() => data, calculateRange, { deep: true });

  return { containerRef, visibleData, startOffset, totalHeight, setItemHeight };
}
