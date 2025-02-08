import axios from 'axios'
import { showDialog } from 'vant'
import { useUserStore } from '@/store/user'

interface AxiosInstance {
  (config: any): Promise<any>
  [key: string]: any
}

interface AxiosRequestConfig extends AxiosInstance {
  requestId: number
  auth?: boolean
}

const requestQueue: AxiosInstance[] = []

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_HOST,
  timeout: 10000 * 6
})

axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const userStore = useUserStore()
    if (!config.auth) config.headers['Authorization'] = 'Bearer ' + userStore.getToken
    config.requestId = Date.now() + Math.random()
    requestQueue.push(config)
    return config
  },

  (error: any) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response: any) => {
    try {
      const config = requestQueue.find((item) => item.requestId === response.config.requestId)
      if (config) requestQueue.splice(requestQueue.indexOf(config), 1) // 移除已处理的请求
      sessionStorage.clear()
      if (response.status === 401) {
      }
      if (response.data.message.messagE_CODE === '401') {
        //跳转登录页
      }
      if (response.data.message.messagE_CODE !== '1') {
        showDialog({
          title: '股市一筋',
          message: response.data.message.messagE_TEXT,
          width: '80%',
          confirmButtonText: '点击重试',
          confirmButtonColor: 'var(--color-primary)',
          className: 'dialogClass',
          overlayStyle: {
            height: 'calc(100%)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 100000
          }
        }).then(() => {
          const userStore = useUserStore()
          userStore.refreshToken()
          checkNetworkStatus()
          localStorage.removeItem('tokenExpiry')
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
        })
      }
    } catch (error) {}
    return Promise.resolve(response.data)
  },

  (error: { message: string; config: { requestId: number } }) => {
    const config = requestQueue.find((item) => item.requestId === error.config.requestId)
    if (config) requestQueue.splice(requestQueue.indexOf(config), 1) // 移除已处理的请求

    const userStore = useUserStore()
    userStore.refreshToken()
    checkNetworkStatus()
  }
)

function checkNetworkStatus() {
  if (navigator.onLine) {
    const MAX_RETRIES = 3 // 最大重试次数
    const RETRY_DELAY = 5000 // 重试延迟（毫秒）
    let retries = 0

    function retryRequests() {
      if (retries >= MAX_RETRIES) return
      // 网络已恢复，发送队列中的请求
      while (requestQueue.length > 0) {
        const config = requestQueue.shift()
        axiosInstance(config)
          .then((_response: any) => {})
          .catch((_error: any) => {
            retries++
            setTimeout(retryRequests, RETRY_DELAY)
          })
      }
    }

    retryRequests()
  }
}

export default axiosInstance
