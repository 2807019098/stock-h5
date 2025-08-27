import './styles/index.scss'
import { createApp } from 'vue'
import { setupStore } from './store'
import 'amfe-flexible'
import App from '@/App.vue'
import router from './router'
import { ConfigProvider, NavBar, Dialog, Toast, List, BackTop, Loading, PullRefresh, Popup, Checkbox, CheckboxGroup, Radio, RadioGroup as VanRadioGroup, Slider, Button, Icon } from 'vant'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vant/lib/index.css'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const app = createApp(App)

setupStore(app)
app.use(router)
app.use(ConfigProvider)
app.use(NavBar)
app.use(Dialog)
app.use(Toast)
app.use(List)
app.use(BackTop)
app.use(Loading)
app.use(VueVirtualScroller)
app.use(PullRefresh)
app.use(Popup)
app.use(Checkbox)
app.use(CheckboxGroup)
app.use(Radio)
app.use(VanRadioGroup)
app.use(Slider)
app.use(Button)
app.use(Icon)
app.mount('#app')
