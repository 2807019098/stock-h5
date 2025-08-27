<template>
    <teleport to="body">
        <van-popup v-model:show="show" position="right" @click-overlay="closeFilter" :style="{
            width: '80%',
            maxWidth: '400px',
            position: 'fixed',
            top: '0',
            right: '0',
            bottom: '0',
            left: 'auto',
            height: '100vh',
            transform: show ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease-out'
        }" class="filter-popup">
            <div class="filter-panel">
                <!-- 头部 -->
                <div class="filter-header">
                    <h3>筛选</h3>
                    <div class="filter-status">
                        <span v-if="hasActiveFiltersComputed" class="active-indicator">已应用筛选</span>
                    </div>
                    <van-icon name="cross" @click="closeFilter" />
                </div>



                <!-- 中间滚动区域 -->
                <div class="filter-content">
                    <!-- 筛选条件 -->
                    <div class="filter-section">

                        <!-- 盈利筛选 -->
                        <div class="filter-item">
                            <div class="filter-label">盈利</div>
                            <RadioGroup v-model="localFilterData.profit" :options="[
                                { name: 'profit_1', label: '盈利', value: '1' },
                                { name: 'profit_empty', label: '不限', value: '' }
                            ]" direction="horizontal" />
                        </div>

                        <!-- 大X日筛选 -->
                        <div class="filter-item">
                            <div class="filter-label">大X日</div>
                            <RadioGroup v-model="localFilterData.bigDays" :options="[
                                { name: 'bigdays_1', label: '大X日', value: '1' },
                                { name: 'bigdays_empty', label: '不限', value: '' }
                            ]" direction="horizontal" />
                        </div>

                        <!-- 涨跌筛选 -->
                        <div class="filter-item">
                            <div class="filter-label">涨跌幅度</div>
                            <div class="slider-container">
                                <van-slider v-model="localFilterData.changeRange" :button-size="12" :min="0" :max="30"
                                    :step="10" :show-tooltip="true" active-color="var(--color-primary)" />
                                <div class="slider-labels">
                                    <span>0%</span>
                                    <span>10%</span>
                                    <span>20%</span>
                                    <span>30%</span>
                                </div>
                            </div>
                        </div>

                        <div class="filter-item">
                            <div class="filter-label">涨跌方式</div>
                            <RadioGroup v-model="localFilterData.sortType" :options="[
                                { name: 'sorttype_fronterror', label: '前误差', value: 'fronterror' },
                                { name: 'sorttype_1day', label: '1日涨跌', value: '1day' },
                                { name: 'sorttype_2day', label: '2日涨跌', value: '2day' },
                                { name: 'sorttype_xday', label: 'X日涨跌', value: 'xday' }
                            ]" direction="horizontal" />
                        </div>

                        <div class="filter-item">
                            <div class="filter-label">排序方向</div>
                            <RadioGroup v-model="localFilterData.sortOrder" :options="[
                                { name: 'sortorder_asc', label: '升序', value: 'asc' },
                                { name: 'sortorder_desc', label: '降序', value: 'desc' },
                                { name: 'sortorder_empty', label: '不限', value: '' }
                            ]" direction="horizontal" />
                        </div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="filter-actions">
                    <van-button type="default" size="large" @click="resetFilter" class="reset-btn"
                        :disabled="!hasActiveFiltersComputed">
                        重置
                    </van-button>
                    <van-button type="primary" size="large" @click="applyFilter" class="apply-btn">
                        应用筛选
                    </van-button>
                </div>
            </div>
        </van-popup>
    </teleport>
</template>

<script setup lang="ts">
import { toRefs, watch, computed, ref } from 'vue'
import { useFilterStore } from '@/store/filter'
import { showToast } from 'vant'

const props = defineProps({
    show: {
        type: Boolean,
        default: false,
    }
})

const emit = defineEmits<{
    'update:show': [value: boolean]
    'filter-change': [data: any]
}>()

const { show } = toRefs(props)

// 使用Pinia状态管理
const filterStore = useFilterStore()

// 创建本地筛选数据，用于表单绑定和实时状态跟踪
const localFilterData = ref({
    profit: '',
    bigDays: '',
    changeRange: 0,
    sortType: 'fronterror',
    sortOrder: ''
})

// 初始化本地数据
const initLocalData = () => {
    const currentData = filterStore.filterData
    localFilterData.value = {
        profit: currentData.profit,
        bigDays: currentData.bigDays,
        changeRange: currentData.changeRange,
        sortType: currentData.sortType,
        sortOrder: currentData.sortOrder
    }
}

// 检查是否有活跃的筛选条件（基于本地数据）
const hasActiveFiltersComputed = computed(() => {
    return localFilterData.value.profit !== '' ||
        localFilterData.value.bigDays !== '' ||
        localFilterData.value.changeRange > 0 ||
        localFilterData.value.sortType !== 'fronterror' ||
        localFilterData.value.sortOrder !== ''
})

// 关闭筛选面板
const closeFilter = () => {
    emit('update:show', false)
}

// 重置筛选条件
const resetFilter = () => {
    // 重置本地数据
    localFilterData.value = {
        profit: '',
        bigDays: '',
        changeRange: 0,
        sortType: 'fronterror',
        sortOrder: ''
    }

    // 更新Pinia store
    filterStore.resetFilter()

    // 触发全局重置事件
    window.dispatchEvent(new CustomEvent('stock-filter-reset'))

    // 显示重置成功提示
    showToast('筛选条件已重置')
}

// 应用筛选
const applyFilter = () => {
    console.log('=== ScreenPannel applyFilter 开始 ===')
    console.log('本地筛选数据:', localFilterData.value)

    // 更新Pinia store
    filterStore.updateFilter(localFilterData.value)

    console.log('更新后的store数据:', filterStore.filterData)

    // 触发全局事件
    window.dispatchEvent(new CustomEvent('stock-filter-change', {
        detail: localFilterData.value
    }))

    console.log('已触发全局事件 stock-filter-change')
    console.log('=== ScreenPannel applyFilter 结束 ===')

    emit('filter-change', localFilterData.value)
    closeFilter()
}

// 监听show变化，当面板打开时初始化本地数据
watch(() => props.show, (newVal) => {
    if (newVal) {
        initLocalData()
    }
})
</script>

<style lang="scss" scoped>
.filter-panel {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg-2);
    color: var(--color-text-1);
}



.filter-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--color-border-1);
    background-color: var(--color-bg-3);

    h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text-1);
    }

    .filter-status {
        font-size: 0;

        .active-indicator {
            font-size: 11px;
            color: var(--color-primary);
            background-color: var(--color-vice);
            padding: 2px 6px;
            border-radius: 10px;
            font-weight: 500;
        }
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

.filter-content {
    flex: 1;
    overflow-y: auto;
    padding: 0;
}

.filter-actions {
    flex-shrink: 0;
    margin-top: 0;
    padding: 16px;
    display: flex;
    gap: 12px;
    border-top: 1px solid var(--color-border-1);
    background-color: var(--color-bg-2);

    .reset-btn {
        flex: 1;
        border-color: var(--color-border-2);
        color: var(--color-text-2);
        font-size: 13px;

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }

    .apply-btn {
        flex: 1;
        background-color: var(--color-primary);
        border-color: var(--color-primary);
        font-size: 13px;
    }
}

.filter-section {
    padding: 16px;
}

.filter-item {
    margin-bottom: 16px;

    &:last-child {
        margin-bottom: 0;
    }

    .filter-label {
        margin-bottom: 15px;
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text-1);
    }
}

.slider-container {
    padding: 0 8px;

    .slider-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        font-size: 11px;
        color: var(--color-text-3);
    }
}

// 原有的Vant组件主题适配
:deep(.van-slider__button) {
    background-color: var(--color-primary);
}

:deep(.van-slider__active) {
    background-color: var(--color-primary);
}

// 深色主题适配
.dark {
    .filter-panel {
        background-color: var(--color-bg-2);
    }

    .filter-header {
        background-color: var(--color-bg-3);
        border-bottom-color: var(--color-border-1);
    }

    .filter-content {
        background-color: var(--color-bg-2);
    }

    .filter-section {
        border-bottom-color: var(--color-border-1);
    }

    .filter-actions {
        background-color: var(--color-bg-2);
        border-top-color: var(--color-border-1);
    }
}

// 确保筛选面板可见和可点击
:deep(.van-popup) {
    z-index: 9999 !important;
}

.filter-panel {
    position: relative;
    z-index: 10000;
}
</style>
