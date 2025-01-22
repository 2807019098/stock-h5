import { defineStore } from 'pinia'
import axios from 'axios'
import storage from 'good-storage'
import { FastRegisterLogin } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: storage.get('token'),
    tokenExpiry: storage.get('tokenExpiry')
  }),
  getters: {
    getToken: (state): string => state.token,
    isTokenValid: (state): boolean => {
      // 检查 token 是否有效
      return state.token && state.tokenExpiry && Date.now() < state.tokenExpiry
    }
  },
  actions: {
    async login(payload: Recordable = {}) {
      if (this.isTokenValid) {
        this.token = storage.get('token')
        this.tokenExpiry = storage.get('tokenExpiry')
        return
      }
      try {
        const { message, result } = await FastRegisterLogin(payload)
        if (message.messagE_CODE === '1') {
          const expiryTime = Date.now() + result.expires_in * 1000
          storage.set('tokenExpiry', expiryTime)
          storage.set('token', result.access_token)
          this.token = result.access_token
          this.tokenExpiry = expiryTime
          console.log(result)
        }
      } catch (error) {
        console.error('Login error:', error)
      }
    },
    logout() {
      this.token = ''
      this.tokenExpiry = null
      storage.set('token', '')
      storage.set('tokenExpiry', null)
    },
    refreshToken() {
      axios
        .get('/api/refresh')
        .then(({ data }) => {
          storage.set('token', data.result.access_token)
          this.token = data.result.access_token
        })
        .catch(() => {})
    }
  }
})
