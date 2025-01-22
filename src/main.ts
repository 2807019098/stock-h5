import './styles/index.scss'
import { createApp } from 'vue'
import { setupStore } from './store'
import 'amfe-flexible'
import App from '@/App.vue'
import router from './router'
import { ConfigProvider, NavBar, Dialog, Toast, List } from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)

setupStore(app)
app.use(router)
app.use(ConfigProvider)
app.use(NavBar)
app.use(Dialog)
app.use(Toast)
app.use(List)
app.mount('#app')
