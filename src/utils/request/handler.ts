import { showDialog } from 'vant'
import { useUserStore } from '@/store/user'
import { useRoute } from 'vue-router'

interface RequestConfig extends RequestInit {
  retries?: number
}

const fetchWrapper = async (url: string, config: RequestConfig = {}): Promise<Response> => {
  const userStore = useUserStore()
  const defaultHeaders = {
    Authorization: 'Bearer ' + userStore.getToken,
    'Content-Type': 'application/json'
  }
  const headers = {
    ...defaultHeaders,
    ...config.headers
  }
  const finalConfig: RequestConfig = {
    ...config,
    headers
  }
  let attempts = 0
  const maxRetries = config.retries ?? 3
  while (attempts < maxRetries) {
    try {
      const response = await fetch(url, finalConfig)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response
    } catch (error) {
      attempts++
      if (attempts >= maxRetries) {
        throw new Error(`Request failed after ${maxRetries} attempts: ${error}`)
      }
    }
  }
  throw new Error('Request failed')
  // const response = await fetch(url, config)
  // return response
}

export default fetchWrapper
