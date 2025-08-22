<template>
    <teleport to="body">
        <van-popup v-model:show="show" position="right">
            <div class="menu">Popup Content</div>
        </van-popup>
    </teleport>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue'

const props = defineProps({
    show: {
        type: Boolean,
        default: false,
    }
})

const { show } = toRefs(props)

</script>

<style lang="scss" scoped>
.menu {
    min-width: 100vw;
    height: 100vh;
    position: relative;
    background-color: var(--van-popup-background);
}
</style>
