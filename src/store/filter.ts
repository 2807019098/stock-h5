import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface FilterData {
    profit: string
    bigDays: string
    changeRange: number
    sortType: string
    sortOrder: string
}

export const useFilterStore = defineStore('filter', () => {
    // 筛选数据
    const filterData = ref<FilterData>({
        profit: '',
        bigDays: '',
        changeRange: 0,
        sortType: 'fronterror',
        sortOrder: ''
    })

    // 更新筛选条件
    const updateFilter = (data: Partial<FilterData>) => {
        filterData.value = { ...filterData.value, ...data }
    }

    // 重置筛选条件
    const resetFilter = () => {
        filterData.value = {
            profit: '',
            bigDays: '',
            changeRange: 0,
            sortType: 'fronterror',
            sortOrder: ''
        }
    }

    // 获取当前筛选条件
    const getFilterData = () => {
        return filterData.value
    }

    // 检查是否有活跃的筛选条件
    const hasActiveFilters = () => {
        return filterData.value.profit !== '' ||
            filterData.value.bigDays !== '' ||
            filterData.value.changeRange > 0 ||
            filterData.value.sortType !== 'fronterror' ||
            filterData.value.sortOrder !== ''
    }

    // 获取筛选条件摘要
    const getFilterSummary = () => {
        const summary = []
        if (filterData.value.profit !== '') {
            summary.push(`盈利: ${filterData.value.profit}`)
        }
        if (filterData.value.bigDays !== '') {
            summary.push(`大X日: ${filterData.value.bigDays}`)
        }
        if (filterData.value.changeRange > 0) {
            summary.push(`涨跌: ${filterData.value.changeRange}%`)
        }
        if (filterData.value.sortType !== 'fronterror') {
            const sortTypeMap: Record<string, string> = {
                'fronterror': '前误差',
                '1day': '1日涨跌',
                '2day': '2日涨跌',
                'xday': 'X日涨跌'
            }
            summary.push(`排序: ${sortTypeMap[filterData.value.sortType] || filterData.value.sortType}`)
        }
        if (filterData.value.sortOrder !== '') {
            const sortOrderMap: Record<string, string> = {
                'asc': '升序',
                'desc': '降序'
            }
            summary.push(`方向: ${sortOrderMap[filterData.value.sortOrder] || filterData.value.sortOrder}`)
        }
        return summary
    }

    return {
        filterData,
        updateFilter,
        resetFilter,
        getFilterData,
        hasActiveFilters,
        getFilterSummary
    }
})
