import { computed, defineComponent, unref } from 'vue'
import type { ConfigProviderThemeVars } from 'vant'
import { useBaseStore } from '@/store/app'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'AppProvider',
  setup(_, { slots }) {
    const appStore = useBaseStore()
    const route = useRoute()
    const theme = computed(() => appStore.getTheme)

    const themeVars = computed<ConfigProviderThemeVars>(() => {
      return {
        ActionBarButtonWarningColor: unref(theme).colors.vice,
        actionBarButtonDangerColor: unref(theme).colors.primary,
        cellFontSize: '14px'
      }
    })

    return () => {
      return (
        <van-config-provider
          theme={unref(theme).mode}
          themeVars={unref(themeVars)}
          theme-vars-scope="global"
        >
          {slots.default?.()}
        </van-config-provider>
      )
    }
  }
})
