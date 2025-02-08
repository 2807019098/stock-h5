import { defineStore } from 'pinia'
import axios from 'axios'
import storage from 'good-storage'
import { FastRegisterLogin, GetRefreshToken } from '@/api/user'

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
          storage.set('refreshToken', result.refresh_token)
          this.token = result.access_token
          this.tokenExpiry = expiryTime
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
    async refreshToken() {
      try {
        const payload = {
          businesS_PARAMETERS: {
            refreshToken: storage.get('refreshToken')
          },
          systeM_PARAMETERS: {
            appid: '',
            accesS_TOKEN: '',
            timestamp: '',
            sign: 'zhikaisoft'
          }
        }
        const { message, result } = await GetRefreshToken(payload)
        if (message.messagE_CODE === '1') {
          const expiryTime = Date.now() + result.expires_in * 1000
          storage.set('tokenExpiry', expiryTime)
          storage.set('token', result.access_token)
          this.token = result.access_token
          this.tokenExpiry = expiryTime
        }
      } catch (error) {}
    }
  }
})
