import axios from 'axios'
import { showToast, showDialog } from 'vant'
import type { ApiResponse } from '../utils/request/type'

type AxiosInstance = any

const requestQueue: any[] = []

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000 * 6
})

axiosInstance.interceptors.request.use(
  (config: any) => {
    config.baseURL = import.meta.env.VITE_BASE_URL

    requestQueue.push(config)

    return config
  },

  (error: any) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response: ApiResponse<any>) => {
    try {
      switch (response.data.code) {
        case 100001:
          sessionStorage.clear()

          showDialog({
            title: '股市一筋',
            message: response.data.msg,
            confirmButtonText: '点击重试',
            confirmButtonColor: '#2B3B51',
            className: 'dialogClass',
            overlayStyle: {
              height: 'calc(100%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 100000
            }
          }).then(() => {
            checkNetworkStatus()
          })

          break

        case 0:
          showToast({
            message: response.data.msg
          })

          break

        default:
          break
      }
    } catch (error) { }
    return Promise.resolve(response.data)
  },

  (error: { message: string }) => {
    // 未连接到服务器
    if (error.message == 'Network Error') {
      showDialog({
        message: '网络错误，请检查服务端，请【点击重试】！',
        confirmButtonText: '点击重试',
        confirmButtonColor: '#2B3B51',
        className: 'dialogClass',
        overlayStyle: {
          height: 'calc(100%)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 100000
        }
      }).then(() => {
        checkNetworkStatus()
      })
    } else if (error.message == 'timeout of 60000ms exceeded') {
      // 请求超时
      showDialog({
        title: '股市一筋',
        message: '网络连接超时，请【点击重试】！',
        confirmButtonText: '点击重试',
        confirmButtonColor: '#2B3B51',
        className: 'dialogClass',
        overlayStyle: {
          height: 'calc(100%)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 100000
        }
      }).then(() => {
        checkNetworkStatus()
      })
    } else {
      showDialog({
        title: '股市一筋',
        message: error.message,
        confirmButtonText: '点击重试',
        confirmButtonColor: '#2B3B51',
        className: 'dialogClass',
        overlayStyle: {
          height: 'calc(100%)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 100000
        }
      }).then(() => {
        checkNetworkStatus()
      })
    }
  }
)

function checkNetworkStatus() {
  if (navigator.onLine) {
    // 网络已恢复，发送队列中的请求
    while (requestQueue.length > 0) {
      const config = requestQueue.shift()
      axiosInstance(config)
        .then((_response: any) => { })
        .catch((_error: any) => { })
    }
  }
}

export default axiosInstance
