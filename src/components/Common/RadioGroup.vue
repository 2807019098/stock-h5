<template>
    <div class="radio-group" :class="{ 'radio-group--horizontal': direction === 'horizontal' }">
        <div v-for="option in options" :key="option.name" class="radio-item" :class="{
            'radio-item--selected': isSelected(option.value),
            'radio-item--disabled': option.disabled
        }" @click="handleOptionClick(option)">
            <div class="radio-item__content">
                <span class="radio-item__label">{{ option.label }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface RadioOption {
    name: string
    label: string
    value: any
    disabled?: boolean
}

interface Props {
    options: RadioOption[]
    modelValue?: any
    direction?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<Props>(), {
    direction: 'horizontal'
})

const emit = defineEmits<{
    'update:modelValue': [value: any]
}>()

// 判断选项是否被选中
const isSelected = (value: any) => {
    return props.modelValue === value
}

// 处理选项点击
const handleOptionClick = (option: RadioOption) => {
    if (option.disabled) return
    emit('update:modelValue', option.value)
}
</script>

<style lang="scss" scoped>
.radio-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &--horizontal {
        flex-direction: row;
        flex-wrap: wrap;
    }
}

.radio-item {
    flex: 1;
    min-width: 0;
    padding: 8px 12px;
    border: 1px solid var(--color-border-2);
    border-radius: 6px;
    background-color: var(--color-bg-3);
    transition: all 0.2s ease;
    font-size: 12px;
    text-align: center;
    cursor: pointer;
    user-select: none;
    position: relative;
    z-index: 1;



    &--selected {
        border-color: var(--color-primary) !important;

        .radio-item__label {
            color: var(--color-primary) !important;
            font-weight: 600 !important;
        }
    }

    &--disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &__content {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &__label {
        color: var(--color-text-2);
        font-size: 12px;
        font-weight: 500;
        margin: 0;
    }
}

// 水平布局时的特殊处理
.radio-group--horizontal .radio-item {
    flex: 0 0 calc(calc(100% / 3) - 6px); // 每行最多3个
}

// 深色主题适配
.dark {
    .radio-item {
        background-color: var(--color-bg-3);
        border-color: var(--color-border-2);



        &--selected {
            background-color: var(--color-primary) !important;
            border-color: var(--color-primary) !important;
            box-shadow: 0 2px 8px rgba(27, 167, 132, 0.4) !important;
        }
    }
}
</style>
